import { clsx, type ClassValue } from 'clsx';
import { NextResponse } from 'next/server';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Utility function for consistent error responses
export function handleErrorResponse(message: string, status: number, error?: any) {
    console.error(message, error);
    return NextResponse.json({ error: message }, { status });
}
