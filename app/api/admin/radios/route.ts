// File: /app/api/admin/radios/route.ts

import { NextResponse } from 'next/server';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { Radio } from '@/types/types'; // Import the shared Radio type
import { addLogEntry } from '@/lib/api'; // Use the utility function for logging operations

// Define the path for the radios database file
const radiosFilePath = path.join(process.cwd(), 'data', 'radios.json');
const radiosAdapter = new JSONFile<Radio[]>(radiosFilePath);
const radiosDB = new Low(radiosAdapter, []); // Initialize with default data (empty array for radios)

// Initialize the radios database with an empty array if necessary
async function initRadiosDB() {
    await radiosDB.read();
    radiosDB.data = radiosDB.data || []; // Ensure the radios array is present
    await radiosDB.write();
}

// Get the list of radios, optionally filtered by radioID or userID (but not both)
export async function GET(request: Request) {
    await initRadiosDB();

    const { searchParams } = new URL(request.url);
    const radioID = searchParams.get('radioID');
    const userID = searchParams.get('userID');

    // Ensure that only one of radioID or userID is provided, not both
    if (radioID && userID) {
        return NextResponse.json({ error: 'Specify either radioID or userID, not both.' }, { status: 400 });
    }

    // Filter radios by radioID or userID
    let filteredRadios = radiosDB.data;
    if (radioID) {
        filteredRadios = filteredRadios.filter((radio) => radio.ID === radioID);
    } else if (userID) {
        filteredRadios = filteredRadios.filter((radio) => radio.checked_out_user === userID);
    }

    return NextResponse.json(filteredRadios);
}

// Add or update a radio
export async function POST(request: Request) {
    const { ID, Name, checked_out_user, checkout_date, Comments, Nonfunctional, PartiallyDamaged } =
        await request.json();

    if (!ID) {
        return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
    }
    console.log(request);
    await initRadiosDB();

    // Check if the radio exists
    let radio = radiosDB.data.find((r: Radio) => r.ID === ID);

    if (!radio) {
        // Add a new radio
        radio = {
            ID,
            Name,
            checked_out_user: null,
            checkout_date: null,
            Comments: '',
            Nonfunctional: false,
            PartiallyDamaged: false,
        };
        radiosDB.data.push(radio);
    }

    // Determine if this is a check-in operation (checked_out_user set to null)
    const isCheckIn = checked_out_user === null && radio.checked_out_user !== null;

    // Log the checkout or check-in using the utility function
    if (checked_out_user && checked_out_user !== radio.checked_out_user) {
        console.log(`Checking out radio ${ID} to user ${checked_out_user}`);
        await addLogEntry(ID, checked_out_user, 'check-out');
    } else if (isCheckIn) {
        console.log(`Checking in radio ${ID} from user ${radio.checked_out_user}`);
        await addLogEntry(ID, radio.checked_out_user as string, 'check-in');
    }

    // Update fields
    if (Comments !== undefined) radio.Comments = Comments;
    if (Nonfunctional !== undefined) {
        radio.Nonfunctional = Nonfunctional;
        if (Nonfunctional) {
            radio.PartiallyDamaged = false;
        }
    }
    if (!radio.Nonfunctional && PartiallyDamaged !== undefined) {
        radio.PartiallyDamaged = PartiallyDamaged;
    }
    if (checked_out_user !== undefined) radio.checked_out_user = checked_out_user;
    if (checkout_date !== undefined) radio.checkout_date = checkout_date;

    await radiosDB.write();

    console.log(`Radio ${ID} successfully updated. Checked out to user: ${checked_out_user || 'N/A'}`);

    return NextResponse.json({ message: 'Radio updated successfully' });
}

// Remove a radio
export async function DELETE(request: Request) {
    const { ID } = await request.json();

    if (!ID) {
        return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
    }

    await initRadiosDB();

    // Find and remove the radio by ID
    const index = radiosDB.data.findIndex((r: Radio) => r.ID === ID);
    if (index === -1) {
        return NextResponse.json({ error: 'Radio not found.' }, { status: 404 });
    }

    radiosDB.data.splice(index, 1);
    await radiosDB.write();

    return NextResponse.json({ message: 'Radio deleted successfully' });
}
