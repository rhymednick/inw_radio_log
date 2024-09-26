// File: /components/checkout-log.tsx

'use client'; // Client-side interactivity required

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface LogEntry {
    operation: 'check-in' | 'check-out';
    radioID: string;
    userName: string;
    date: string;
}

interface CheckoutLogProps {
    initialLogs?: LogEntry[];
}

const CheckoutLog: React.FC<CheckoutLogProps> = ({ initialLogs = [] }) => {
    const [logs, setLogs] = useState<LogEntry[]>(initialLogs);

    const addLog = (operation: 'check-in' | 'check-out', radioID: string, userName: string) => {
        const newLog: LogEntry = {
            operation,
            radioID,
            userName,
            date: new Date().toISOString(),
        };
        setLogs((prevLogs) => [newLog, ...prevLogs]);
    };

    return (
        <div className="checkout-log mt-6">
            <h3 className="text-lg font-bold mb-4">Checkout Log</h3>
            {logs.length > 0 ? (
                <ul className="list-none space-y-3">
                    {logs.map((log, index) => (
                        <li
                            key={index}
                            className="log-entry border-b py-2"
                        >
                            <p>
                                <strong>{log.userName}</strong>{' '}
                                {log.operation === 'check-in' ? 'checked in' : 'checked out'} radio{' '}
                                <strong>{log.radioID}</strong> on {new Date(log.date).toLocaleString()}.
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No logs available.</p>
            )}
        </div>
    );
};

export default CheckoutLog;
