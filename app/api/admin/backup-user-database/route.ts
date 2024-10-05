// File: /app/api/admin/backup-user-database/route.ts

import path from 'path';
import fs from 'fs';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { User } from '@/types/types';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
const backupFolder = path.join(process.cwd(), 'data', 'backups');

export async function POST() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `users-backup-${timestamp}.json`;

        // Ensure the backup folder exists
        if (!fs.existsSync(backupFolder)) {
            fs.mkdirSync(backupFolder);
        }

        // Copy the existing database file
        const sourceFile = usersFilePath;
        const destinationFile = path.join(backupFolder, backupFileName);
        fs.copyFileSync(sourceFile, destinationFile);

        return new Response(JSON.stringify({ message: 'Backup created successfully.' }), { status: 200 });
    } catch (error) {
        console.error('Error creating backup:', error);
        return new Response(JSON.stringify({ error: 'Failed to create backup.' }), { status: 500 });
    }
}
