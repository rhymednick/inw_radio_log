// File: compress-images.js
// This is used to shrink images that have come from a different source.
// You can run it from the command line with "node compress-images.js".

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Define the profile images path
const PROFILE_IMAGES_PATH = path.join(process.cwd(), 'data/profile-images');

// Maximum file size in bytes (4MB)
const MAX_FILE_SIZE = 4 * 1024 * 1024;

// Function to scan and compress images
async function compressImages() {
    try {
        const files = fs.readdirSync(PROFILE_IMAGES_PATH);

        for (const file of files) {
            const filePath = path.join(PROFILE_IMAGES_PATH, file);
            const stats = fs.statSync(filePath);

            // Check if the current file is larger than the maximum size
            if (stats.isFile() && stats.size > MAX_FILE_SIZE) {
                console.log(`Compressing: ${file} (Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

                // Compress the image with Sharp
                const outputFilePath = path.join(PROFILE_IMAGES_PATH, `compressed-${file}`);
                await sharp(filePath)
                    .jpeg({ quality: 80 }) // Adjust quality as needed to reduce file size
                    .toFile(outputFilePath);

                // Replace the original file with the compressed version
                fs.renameSync(outputFilePath, filePath);
                console.log(`Compressed ${file} successfully.`);
            }
        }
    } catch (error) {
        console.error('Error while compressing images:', error);
    }
}

// Execute the compression function
compressImages();
import { log } from 'console';
