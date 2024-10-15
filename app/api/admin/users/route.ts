// File: /app/api/admin/users/route.ts

import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { Low } from 'lowdb';
import path from 'path';
import fs from 'fs';
import { JSONFile } from 'lowdb/node';
import { User } from '@/types/types';
import { handleErrorResponse } from '@/lib/utils';
/**
 * API Route: /api/admin/users
 * Handles CRUD operations for managing users.
 * - GET: Fetch users or a specific user by userID
 * - POST: Add or update a user
 * - DELETE: Remove a user by ID
 */

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

// Function to save the profile photo to disk
async function saveUserProfilePhoto(
    userName: string,
    base64Image: string,
    overwriteFileName?: string
): Promise<string | null> {
    try {
        const lowerCaseFileName = userName.toLowerCase().replace(/\s+/g, '_'); // Ensure it's file-safe
        const fileName = overwriteFileName || `${lowerCaseFileName}.jpg`; // Use existing file name if overwriting
        const imagePath = path.join(process.cwd(), 'data', 'profile-images', fileName);
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
        const oldImagePath = path.join(process.cwd(), 'data', 'profile-images', oldFileName);
        const newImagePath = path.join(process.cwd(), 'data', 'profile-images', newFileName);

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
    try {
        const { id, name, profilePhoto } = await request.json();
        if (!name) {
            return handleErrorResponse('Name is required.', 400);
        }

        await initUsersDB();

        // Handle ADD operation
        if (!id) {
            // Check if a user with the same name exists (case-insensitive match)
            const duplicateUser = usersDB.data.find((user: User) => user.name.toLowerCase() === name.toLowerCase());
            if (duplicateUser) {
                return handleErrorResponse(`User with the name "${name}" already exists.`, 400);
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
            return handleErrorResponse('User not found.', 404);
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
    } catch (error) {
        return handleErrorResponse('Failed to add or update user.', 500, error);
    }
}

// Function to fetch all users or a single user by userID (GET request)
export async function GET(request: Request) {
    try {
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
                return handleErrorResponse('User not found.', 404);
            }
        }

        // If no userID is provided, return all users
        const users = usersDB.data || [];
        return NextResponse.json({ users });
    } catch (error) {
        return handleErrorResponse('Failed to fetch users.', 500, error);
    }
}

// DELETE request handler to delete a user by ID
export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        if (!id) {
            return handleErrorResponse('User ID is required for deletion.', 400);
        }

        await initUsersDB();

        const userIndex = usersDB.data.findIndex((user: User) => user.id === id);
        if (userIndex === -1) {
            return handleErrorResponse('User not found.', 404);
        }

        const userToDelete = usersDB.data[userIndex];
        const profileImageFileName = userToDelete.profilePhoto ? path.basename(userToDelete.profilePhoto) : null;
        if (profileImageFileName) {
            const profileImagePath = path.join(process.cwd(), 'data', 'profile-images', profileImageFileName);
            const archiveDir = path.join(process.cwd(), 'data', 'profile-images', 'archive');
            const archivePath = path.join(archiveDir, profileImageFileName);

            // Ensure the archive directory exists
            if (!fs.existsSync(archiveDir)) {
                await fs.promises.mkdir(archiveDir, { recursive: true });
            }

            // If the destination file already exists, rename it to avoid a conflict
            let finalArchivePath = archivePath;
            if (fs.existsSync(archivePath)) {
                const timestamp = Date.now();
                const ext = path.extname(profileImageFileName);
                const baseName = path.basename(profileImageFileName, ext);
                finalArchivePath = path.join(archiveDir, `${baseName}-${timestamp}${ext}`);
            }

            if (fs.existsSync(profileImagePath)) {
                // Move the profile image to the archive folder
                await fs.promises.rename(profileImagePath, finalArchivePath);
            }
        }

        usersDB.data.splice(userIndex, 1);
        await usersDB.write();

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        return handleErrorResponse('Failed to delete user.', 500, error);
    }
}
