// app/layout.tsx
'use client';
import './globals.css';
import { ReactNode, useEffect, useState } from 'react';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link'; // Import Next.js Link component

export default function RootLayout({ children }: { children: ReactNode }) {
    // State to hold the current date and time
    const [currentTime, setCurrentTime] = useState<string>('');

    // Effect to update the time every second
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(format(now, 'EEE, MMM d, yyyy h:mm a')); // Example: "Mon, Jan 1, 2023 12:00 PM"
        };

        updateTime(); // Initial call
        const intervalId = setInterval(updateTime, 1000);

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, []);

    return (
        <html lang="en">
            <head>
                <title>Ignition Northwest Radio Log</title>
            </head>
            <body className="bg-gray-50 text-gray-900">
                <div className="flex flex-col min-h-screen">
                    {/* Site Header */}
                    <header className="w-full border-b bg-white shadow-sm">
                        <div className="max-w-4xl mx-auto flex items-center justify-between p-4 w-full">
                            {/* Logo and Title */}
                            <div className="flex items-center space-x-4">
                                {/* Logo with link to home page */}
                                <Link
                                    href="/"
                                    passHref
                                >
                                    <Image
                                        src="/logo.png"
                                        alt="Site logo"
                                        width={64}
                                        height={64}
                                        className="object-contain cursor-pointer" // Add cursor-pointer for hover effect
                                    />
                                </Link>
                                {/* Title with link to home page */}
                                <Link
                                    href="/"
                                    passHref
                                >
                                    <h1 className="text-2xl font-bold cursor-pointer">Ignition Northwest Radio Log</h1>
                                </Link>
                            </div>
                            {/* Current Date and Time */}
                            <div className="text-xl text-gray-700">{currentTime}</div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="w-full max-w-4xl mx-auto p-4 mt-8">{children}</main>
                </div>
            </body>
        </html>
    );
}
