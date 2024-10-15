export function getBaseUrl(req?: { headers: { host: string } }) {
    if (typeof window === 'undefined') {
        // Server-side: Use the request object if provided
        if (req) {
            const protocol = req.headers.host.includes('localhost') ? 'http' : 'https';
            return `${protocol}://${req.headers.host}`;
        }
        // Fallback for when req is not provided
        return 'http://localhost:3000';
    } else {
        // Client-side: use the browser's location
        return `${window.location.protocol}//${window.location.host}`;
    }
}
