// File: /app/api/admin/users/route.ts

import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { Low } from 'lowdb';
import path from 'path';
import fs from 'fs';
import { JSONFile } from 'lowdb/node';
import { User } from '@/types/types'; // Import the shared User type

// Define the path for the users database file
const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
const usersAdapter = new JSONFile<User[]>(usersFilePath);
const usersDB = new Low(usersAdapter, []); // Initialize with default data (empty array for users)

// Initialize the users database with an empty array if necessary
async function initUsersDB() {
    await usersDB.read();
    usersDB.data = usersDB.data || []; // Ensure the users array is present
    await usersDB.write();
}

// Function to save a base64 image as a file and return the relative URL
async function saveImage(base64Image: string, userName: string) {
    const matches = base64Image.match(/^data:image\/jpeg;base64,(.+)$/);
    if (matches && matches.length === 2) {
        const imageBuffer = Buffer.from(matches[1], 'base64');
        const imagePath = path.join(process.cwd(), 'public', 'images', `${userName}.jpg`);
        await fs.promises.writeFile(imagePath, imageBuffer);
        return `/images/${userName}.jpg`; // Return relative URL
    }
    return null;
}

// POST request handler to create or update a user
export async function POST(request: Request) {
    const { id, name, profilePhoto } = await request.json();
    if (!name) {
        return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }

    // Initialize the users database
    await initUsersDB();

    // Check for duplicate username in case of both add or update
    const duplicateUser = usersDB.data.find(
        (user: User) => user.name.toLowerCase() === name.toLowerCase() && user.id !== id
    );
    if (duplicateUser) {
        return NextResponse.json({ error: `User with the name "${name}" already exists.` }, { status: 400 });
    }

    // If a profile photo is provided, try to save it
    let savedImageUrl = null;
    if (profilePhoto) {
        savedImageUrl = await saveImage(profilePhoto, name);
        if (!savedImageUrl) {
            return NextResponse.json({ error: 'Failed to save profile photo.' }, { status: 500 });
        }
    }

    // If there's no ID, it's a new user
    if (!id) {
        const newUser: User = {
            id: uuidv4(),
            name,
            profilePhoto: savedImageUrl || '', // Allow empty profile photo if not provided
            lastUpdated: new Date().toISOString(),
        };
        usersDB.data.push(newUser); // Add new user
    } else {
        // If there's an ID, we are updating an existing user
        const existingUser = usersDB.data.find((user: User) => user.id === id);
        if (!existingUser) {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }

        // Update existing user
        existingUser.name = name;
        if (savedImageUrl) {
            existingUser.profilePhoto = savedImageUrl;
        }
        existingUser.lastUpdated = new Date().toISOString();
    }

    await usersDB.write();
    return NextResponse.json({ message: 'User successfully saved/updated' });
}

// Function to fetch all users (GET request)
export async function GET() {
    await initUsersDB();
    const users = usersDB.data || [];
    return NextResponse.json({ users });
}

// Function to delete a user by ID (DELETE request)
export async function DELETE(request: Request) {
    const { id } = await request.json();
    if (!id) {
        return NextResponse.json({ error: 'User ID is required for deletion.' }, { status: 400 });
    }

    // Initialize the users database
    await initUsersDB();

    // Find and remove the user by ID
    const userIndex = usersDB.data.findIndex((user: User) => user.id === id);
    if (userIndex === -1) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    usersDB.data.splice(userIndex, 1); // Remove the user from the array
    await usersDB.write();

    return NextResponse.json({ message: 'User deleted successfully' });
}
