// File: /app/api/admin/checkout-log/route.ts

import { NextResponse } from 'next/server';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { CheckoutLogEntry } from '@/types/types'; // Import the shared CheckoutLogEntry type

// Define the path for the checkout log file
const checkoutLogFilePath = path.join(process.cwd(), 'data', 'checkout-log.json');
const checkoutLogAdapter = new JSONFile<CheckoutLogEntry[]>(checkoutLogFilePath);
const checkoutLogDB = new Low(checkoutLogAdapter, []); // Initialize with an empty array by default

// Initialize the checkout log database
async function initCheckoutLogDB() {
    await checkoutLogDB.read();
    checkoutLogDB.data = checkoutLogDB.data || [];
    await checkoutLogDB.write();
}

// Get the checkout log entries, with optional filtering by radioID
export async function GET(request: Request) {
    await initCheckoutLogDB();

    const { searchParams } = new URL(request.url);
    const radioID = searchParams.get('radioID');

    // If a radioID is provided, filter the log entries by that radioID
    const filteredLog = radioID ? checkoutLogDB.data.filter((entry) => entry.radioID === radioID) : checkoutLogDB.data;

    return NextResponse.json(filteredLog);
}

// Add a new checkout log entry
export async function POST(request: Request) {
    const { radioID, userID, operation } = await request.json();
    if (!radioID || !userID || !operation) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newLogEntry: CheckoutLogEntry = {
        radioID,
        userID,
        operation,
        date: new Date().toISOString(),
    };

    await initCheckoutLogDB();
    checkoutLogDB.data.push(newLogEntry); // Add the new log entry
    await checkoutLogDB.write();

    return NextResponse.json({ message: 'Log entry added successfully' });
}
