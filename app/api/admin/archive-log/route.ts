// File: /app/api/admin/archive-log/route.ts

import path from 'path';
import fs from 'fs';

const checkoutLogPath = path.join(process.cwd(), 'data', 'checkout-log.json');
const backupFolder = path.join(process.cwd(), 'data', 'checkout-log-archives');

export async function POST() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `checkout-log-${timestamp}.json`;

        // Ensure the backup folder exists
        if (!fs.existsSync(backupFolder)) {
            fs.mkdirSync(backupFolder);
        }

        // Copy the existing checkout log to the backup folder
        const destinationFile = path.join(backupFolder, backupFileName);
        fs.copyFileSync(checkoutLogPath, destinationFile);

        // Clear the checkout log
        fs.writeFileSync(checkoutLogPath, JSON.stringify([])); // Empty the log by writing an empty array

        return new Response(JSON.stringify({ message: 'Checkout log archived and cleared successfully.' }), {
            status: 200,
        });
    } catch (error) {
        console.error('Error archiving checkout log:', error);
        return new Response(JSON.stringify({ error: 'Failed to archive checkout log.' }), { status: 500 });
    }
}
