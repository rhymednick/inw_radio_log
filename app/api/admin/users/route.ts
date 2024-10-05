// app/api/admin/users/route.ts

import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { Low } from 'lowdb';
import path from 'path';
import fs from 'fs';
import { JSONFile } from 'lowdb/node';
import { User } from '@/types/types';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
const usersAdapter = new JSONFile<User[]>(usersFilePath);
const usersDB = new Low(usersAdapter, []);

// Initialize the users database
async function initUsersDB() {
    await usersDB.read();
    usersDB.data = usersDB.data || [];
    await usersDB.write();
}

// Function to save the profile photo to disk
async function saveUserProfilePhoto(
    userName: string,
    base64Image: string,
    overwriteFileName?: string
): Promise<string | null> {
    try {
        const lowerCaseFileName = userName.toLowerCase().replace(/\s+/g, '_'); // Ensure it's file-safe
        const fileName = overwriteFileName || `${lowerCaseFileName}.jpg`; // Use existing file name if overwriting
        const imagePath = path.join(process.cwd(), 'public', 'images', fileName);
        const base64Data = base64Image.replace(/^data:image\/jpeg;base64,/, '');

        await fs.promises.writeFile(imagePath, base64Data, 'base64');
        return `/images/${fileName}`; // Return the relative URL for the profile image
    } catch (error) {
        console.error('Error saving image:', error);
        return null;
    }
}
// Function to rename the profile photo when the user name changes
async function renameProfilePhoto(oldName: string, newName: string): Promise<string | null> {
    try {
        const oldFileName = oldName.toLowerCase().replace(/\s+/g, '_') + '.jpg';
        const newFileName = newName.toLowerCase().replace(/\s+/g, '_') + '.jpg';
        const oldImagePath = path.join(process.cwd(), 'public', 'images', oldFileName);
        const newImagePath = path.join(process.cwd(), 'public', 'images', newFileName);

        if (fs.existsSync(oldImagePath)) {
            await fs.promises.rename(oldImagePath, newImagePath);
            return `/images/${newFileName}`;
        }
        return null;
    } catch (error) {
        console.error('Error renaming image:', error);
        return null;
    }
}
// POST request handler to create or update a user
export async function POST(request: Request) {
    const { id, name, profilePhoto } = await request.json();
    if (!name) {
        return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }

    await initUsersDB();

    // Handle ADD operation
    if (!id) {
        // Check if a user with the same name exists (case-insensitive match)
        const duplicateUser = usersDB.data.find((user: User) => user.name.toLowerCase() === name.toLowerCase());
        if (duplicateUser) {
            return NextResponse.json({ error: `User with the name "${name}" already exists.` }, { status: 400 });
        }

        // Save the profile image if provided
        let savedImageUrl = profilePhoto ? await saveUserProfilePhoto(name, profilePhoto) : '';
        savedImageUrl = savedImageUrl || ''; // Ensure it's always a string

        // Create new user
        const newUser: User = {
            id: uuidv4(),
            name,
            profilePhoto: savedImageUrl,
            lastUpdated: new Date().toISOString(),
        };
        usersDB.data.push(newUser);
        await usersDB.write();

        return NextResponse.json({ message: 'User successfully added', user: newUser }, { status: 201 });
    }

    // Handle UPDATE operation
    const existingUser = usersDB.data.find((user: User) => user.id === id);
    if (!existingUser) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Save the new profile image if provided
    let savedImageUrl = existingUser.profilePhoto;
    if (profilePhoto && profilePhoto.startsWith('data:image/jpeg;base64,')) {
        savedImageUrl =
            (await saveUserProfilePhoto(name, profilePhoto, path.basename(existingUser.profilePhoto))) ||
            existingUser.profilePhoto;
    }

    // If the user name changes, rename the profile image file if it exists
    if (name !== existingUser.name && existingUser.profilePhoto) {
        const newImageUrl = await renameProfilePhoto(existingUser.name, name);
        if (newImageUrl) {
            savedImageUrl = newImageUrl;
        }
    }

    // Update the user record
    existingUser.name = name;
    existingUser.profilePhoto = savedImageUrl || existingUser.profilePhoto;
    existingUser.lastUpdated = new Date().toISOString();

    await usersDB.write();

    return NextResponse.json({ message: 'User successfully updated', user: existingUser });
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
