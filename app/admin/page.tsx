// File: /app/admin/page.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Assuming you're using shadcn for buttons

export default function AdminPage() {
    // Function to handle backup
    const handleBackupDatabase = async () => {
        const response = await fetch('/api/admin/backup-user-database', {
            method: 'POST',
        });
        if (response.ok) {
            alert('Backup created successfully.');
        } else {
            alert('Failed to create backup.');
        }
    };

    // Function to initialize the user database from Critical 2024 leads
    const handleInitializeDatabase = async () => {
        const response = await fetch('/api/admin/init-user-database', {
            method: 'POST',
        });
        if (response.ok) {
            alert('User database initialized successfully.');
        } else {
            alert('Failed to initialize user database.');
        }
    };

    // Function to archive checkout log
    const handleArchiveLog = async () => {
        const response = await fetch('/api/admin/archive-log', {
            method: 'POST',
        });
        if (response.ok) {
            alert('Checkout log archived successfully.');
        } else {
            alert('Failed to archive checkout log.');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Administrative Operations</h1>

            {/* Buttons for Users and Radios admin pages */}
            <div className="flex space-x-4 mb-6">
                <Button asChild>
                    <Link href="/admin/users">User Admin Tool</Link>
                </Button>
                <Button asChild>
                    <Link href="/admin/radios">Radio Admin Tool</Link>
                </Button>
            </div>

            <h2 className="text-lg font-bold mb-4">Database Operations Scripts</h2>
            <ul className="list-disc space-y-4 ml-8">
                <li>
                    <Link
                        href="#"
                        onClick={handleBackupDatabase}
                        className="text-blue-500 hover:underline"
                    >
                        Backup User Database (Nondestructive)
                    </Link>
                </li>
                <li>
                    <Link
                        href="#"
                        onClick={handleInitializeDatabase}
                        className="text-green-500 hover:underline"
                    >
                        Backup and Initialize User Database from Critical 2024 Leads (Destructive)
                    </Link>
                </li>
                <li>
                    <Link
                        href="#"
                        onClick={handleArchiveLog}
                        className="text-yellow-500 hover:underline"
                    >
                        Archive and Empty Checkout Log (Destructive)
                    </Link>
                </li>
            </ul>
        </div>
    );
}
