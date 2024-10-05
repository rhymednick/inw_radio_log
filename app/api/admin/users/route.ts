import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { Low } from 'lowdb';
import path from 'path';
import fs from 'fs';
import { JSONFile } from 'lowdb/node';
import { User } from '@/types/types';
import { saveUserProfilePhoto } from '@/lib/api'; // Use the new utility

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
const usersAdapter = new JSONFile<User[]>(usersFilePath);
const usersDB = new Low(usersAdapter, []);

// Initialize the users database
async function initUsersDB() {
    await usersDB.read();
    usersDB.data = usersDB.data || [];
    await usersDB.write();
}

// POST request handler to create or update a user
export async function POST(request: Request) {
    const { id, name, profilePhoto } = await request.json();
    if (!name) {
        return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }

    await initUsersDB();

    const duplicateUser = usersDB.data.find(
        (user: User) => user.name.toLowerCase() === name.toLowerCase() && user.id !== id
    );
    if (duplicateUser) {
        return NextResponse.json({ error: `User with the name "${name}" already exists.` }, { status: 400 });
    }

    let savedImageUrl = null;
    if (profilePhoto) {
        savedImageUrl = await saveUserProfilePhoto(name, profilePhoto);
    }

    if (!id) {
        const newUser: User = {
            id: uuidv4(),
            name,
            profilePhoto: savedImageUrl || '',
            lastUpdated: new Date().toISOString(),
        };
        usersDB.data.push(newUser);
    } else {
        const existingUser = usersDB.data.find((user: User) => user.id === id);
        if (!existingUser) {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }

        existingUser.name = name;
        if (savedImageUrl) {
            existingUser.profilePhoto = savedImageUrl;
        }
        existingUser.lastUpdated = new Date().toISOString();
    }

    await usersDB.write();

    const message = savedImageUrl ? 'User successfully saved/updated' : 'User saved, but profile photo upload failed';
    return NextResponse.json({ message });
}

// Function to fetch all users or a single user by userID (GET request)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userID = searchParams.get('userID');

    // Initialize the users database
    await initUsersDB();

    // If userID is provided, fetch a specific user
    if (userID) {
        const user = usersDB.data.find((u: User) => u.id === userID);
        if (user) {
            return NextResponse.json({ user });
        } else {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }
    }

    // If no userID is provided, return all users
    const users = usersDB.data || [];
    return NextResponse.json({ users });
}

// DELETE request handler to delete a user by ID
export async function DELETE(request: Request) {
    const { id } = await request.json();
    if (!id) {
        return NextResponse.json({ error: 'User ID is required for deletion.' }, { status: 400 });
    }

    await initUsersDB();

    const userIndex = usersDB.data.findIndex((user: User) => user.id === id);
    if (userIndex === -1) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    usersDB.data.splice(userIndex, 1);
    await usersDB.write();

    return NextResponse.json({ message: 'User deleted successfully' });
}
