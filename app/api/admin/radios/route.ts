// File: /app/api/admin/radios/route.ts

import { NextResponse } from 'next/server';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { Radio } from '@/types/types'; // Import the shared Radio type

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

// Helper function to log check-in and check-out operations via the checkout-log route
async function logCheckoutOperation(
    request: Request,
    radioID: string,
    userID: string,
    operation: 'check-out' | 'check-in'
) {
    const { protocol, host } = new URL(request.url); // Dynamically get protocol and host from the request
    const baseUrl = `${protocol}//${host}`; // Construct the full base URL

    console.log(`Logging operation: ${operation} for radioID: ${radioID} and userID: ${userID}`);

    await fetch(`${baseUrl}/api/admin/checkout-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            radioID,
            userID,
            operation,
        }),
    });
}

// Get the list of radios
export async function GET() {
    await initRadiosDB();
    return NextResponse.json(radiosDB.data || []);
}

// Add a new radio
export async function POST(request: Request) {
    const { ID, Name } = await request.json();

    if (!ID || !Name) {
        return NextResponse.json({ error: 'ID and Name are required.' }, { status: 400 });
    }

    await initRadiosDB();

    // Check if the radio with the same ID already exists
    const existingRadio = radiosDB.data.find((radio: Radio) => radio.ID === ID);
    if (existingRadio) {
        return NextResponse.json({ error: 'A radio with this ID already exists.' }, { status: 400 });
    }

    // Add the new radio (initialize `checked_out_user` and `checkout_date`)
    radiosDB.data.push({
        ID,
        Name,
        Comments: '',
        PartiallyDamaged: false,
        Nonfunctional: false,
        checked_out_user: null,
        checkout_date: null,
    });

    await radiosDB.write();

    return NextResponse.json({ message: 'Radio added successfully' });
}

// Update a radio's non-fixed fields (Comments, PartiallyDamaged, Nonfunctional, checked_out_user, checkout_date)
export async function PUT(request: Request) {
    const { ID, Comments, PartiallyDamaged, Nonfunctional, checked_out_user, checkout_date } = await request.json();

    if (!ID) {
        return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
    }

    await initRadiosDB();

    // Find the radio
    const radio = radiosDB.data.find((r: Radio) => r.ID === ID);
    if (!radio) {
        return NextResponse.json({ error: 'Radio not found.' }, { status: 404 });
    }

    console.log(`Processing radio ${ID} with user ${checked_out_user}`);

    // Check-in logic: if `checked_out_user` is set to null, this is a check-in
    const isCheckIn = checked_out_user === null && radio.checked_out_user !== null;

    // Log the checkout or check-in
    if (checked_out_user && checked_out_user !== radio.checked_out_user) {
        console.log(`Checking out radio ${ID} to user ${checked_out_user}`);
        await logCheckoutOperation(request, ID, checked_out_user, 'check-out'); // Pass `request` here
    } else if (isCheckIn) {
        console.log(`Checking in radio ${ID} from user ${radio.checked_out_user}`);
        await logCheckoutOperation(request, ID, radio.checked_out_user as string, 'check-in'); // Pass `request` here
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
