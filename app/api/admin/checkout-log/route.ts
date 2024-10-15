// File: /app/api/admin/checkout-log/route.ts

import { NextResponse } from 'next/server';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { CheckoutLogEntry } from '@/types/types'; // Import the shared CheckoutLogEntry type
import { handleErrorResponse } from '@/lib/utils';

/**
 * API Route: /api/admin/checkout-log
 * Handles CRUD operations for managing the checkout log.
 * - GET: Fetch checkout log entries, optionally filtered by radioID or userID.
 * - POST: Add a new checkout log entry.
 */

// Define the path for the checkout log file
const checkoutLogFilePath = path.join(process.cwd(), 'data', 'checkout-log.json');
const checkoutLogAdapter = new JSONFile<CheckoutLogEntry[]>(checkoutLogFilePath);
const checkoutLogDB = new Low(checkoutLogAdapter, []); // Initialize with an empty array by default

// Initialize the checkout log database with an empty array if necessary
async function initCheckoutLogDB() {
    await checkoutLogDB.read();
    checkoutLogDB.data = checkoutLogDB.data || []; // Ensure the checkout log array is present
    await checkoutLogDB.write();
}

// GET request handler to fetch checkout log entries
export async function GET(request: Request) {
    try {
        await initCheckoutLogDB();

        const { searchParams } = new URL(request.url);
        const radioID = searchParams.get('radioID');
        const userID = searchParams.get('userID');

        // Filter log entries by radioID or userID if provided
        const filteredLog = checkoutLogDB.data.filter((entry) => {
            return (!radioID || entry.radioID === radioID) && (!userID || entry.userID === userID);
        });

        return NextResponse.json(filteredLog);
    } catch (error) {
        return handleErrorResponse('Failed to fetch checkout log entries.', 500, error);
    }
}

// POST request handler to add a new checkout log entry
export async function POST(request: Request) {
    try {
        const { radioID, userID, operation } = await request.json();
        if (!radioID || !userID || !operation) {
            return handleErrorResponse('Missing required fields.', 400);
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
    } catch (error) {
        return handleErrorResponse('Failed to add checkout log entry.', 500, error);
    }
}
