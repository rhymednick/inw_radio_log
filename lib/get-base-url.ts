export function getBaseUrl() {
    // Check if running on the server or client
    if (typeof window === 'undefined') {
        // On the server
        return process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}` // Vercel environment
            : 'http://localhost:3000'; // Local development environment
    } else {
        // On the client
        return '';
    }
}
