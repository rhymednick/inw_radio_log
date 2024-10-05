// File: /app/api/admin/init-user-database/route.ts

import path from 'path';
import fs from 'fs';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@/types/types';

// User database file path
const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
const crit2024Path = path.join(process.cwd(), 'crit2024'); // Path to the Critical 2024 leads folder
const publicImagesPath = path.join(process.cwd(), 'public', 'images'); // Path to the public images folder

export async function POST() {
    try {
        // Backup the existing database
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `users-backup-${timestamp}.json`;
        const backupFolder = path.join(process.cwd(), 'data', 'backups');

        if (!fs.existsSync(backupFolder)) {
            fs.mkdirSync(backupFolder);
        }

        const sourceFile = usersFilePath;
        const destinationFile = path.join(backupFolder, backupFileName);
        fs.copyFileSync(sourceFile, destinationFile);

        // Ensure the public images folder exists
        if (!fs.existsSync(publicImagesPath)) {
            fs.mkdirSync(publicImagesPath);
        }

        // Initialize new users data based on crit2024 images
        const users = fs
            .readdirSync(crit2024Path)
            .filter((fileName) => /\.(jpg|jpeg|png|gif)$/i.test(fileName)) // Filter for image files only
            .map((fileName) => {
                const name = fileName.replace(/\.(jpg|jpeg|png|gif)$/i, '').replace('_', ' ');
                const formattedName = name
                    .split(' ')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                // Move image to /public/images
                const oldImagePath = path.join(crit2024Path, fileName);
                const newImagePath = path.join(publicImagesPath, fileName);
                fs.copyFileSync(oldImagePath, newImagePath); // Move the image to the public folder

                return {
                    id: uuidv4(),
                    name: formattedName,
                    profilePhoto: `/images/${fileName}`,
                    lastUpdated: new Date().toISOString(),
                };
            });

        // Save the new users data to the database
        const adapter = new JSONFile<User[]>(usersFilePath);
        const db = new Low(adapter, []);
        db.data = users;
        await db.write();

        return new Response(JSON.stringify({ message: 'User database initialized successfully.' }), { status: 200 });
    } catch (error) {
        console.error('Error initializing user database:', error);
        return new Response(JSON.stringify({ error: 'Failed to initialize user database.' }), { status: 500 });
    }
}
