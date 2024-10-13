// File: pages/api/images/[...slug].ts

import { NextApiRequest, NextApiResponse } from 'next';
import { join, extname } from 'path';
import { createReadStream, statSync } from 'fs';

// Define the base path to your profile images
const PROFILE_IMAGES_PATH = join(process.cwd(), 'data/profile-images');

// Function to determine the correct Content-Type based on the file extension
function getContentType(extension: string): string {
    switch (extension.toLowerCase()) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.gif':
            return 'image/gif';
        default:
            return 'application/octet-stream'; // Fallback for unknown types
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { slug } = req.query;

    // Ensure that slug is defined
    if (!slug) {
        return res.status(404).json({ error: 'Image not found' });
    }

    // Reconstruct the file path from the slug parameter
    const relativePath = Array.isArray(slug) ? slug.join('/') : slug;
    const filePath = join(PROFILE_IMAGES_PATH, relativePath);

    try {
        // Check if the file exists
        const stats = statSync(filePath);
        if (stats.isFile()) {
            // Get the file extension to determine the Content-Type
            const extension = extname(filePath);
            const contentType = getContentType(extension);

            // Set appropriate headers and stream the image
            res.setHeader('Content-Type', contentType);
            const fileStream = createReadStream(filePath);
            fileStream.pipe(res);
            return;
        }
    } catch (err) {
        // Handle the case where the file doesn't exist or other errors occur
        return res.status(404).json({ error: 'Image not found' });
    }
}
