// File: /types/types.ts

// Define the Radio interface
export interface Radio {
    ID: string;
    Name: string;
    Comments?: string;
    PartiallyDamaged?: boolean; // New field for partial damage
    Nonfunctional?: boolean; // New field for nonfunctional radios
    checked_out_user?: string | null; // New field for the user ID of the person who checked it out
    checkout_date?: string | null; // New field for the date/time the radio was checked out (ISO string)
}

// Define the User interface
export interface User {
    id: string; // New field for the unique user ID
    name: string;
    profilePhoto: string; // The relative URL to the saved profile photo
    lastUpdated: string; // ISO string date of the last update
}

export interface CheckoutLogEntry {
    radioID: string;
    userID: string;
    operation: 'check-out' | 'check-in';
    date: string; // ISO string
}
