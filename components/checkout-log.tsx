// File: /components/checkout-log.tsx

'use client'; // Client-side interactivity required

import React, { useEffect, useState } from 'react';
import { getLogEntries, getUserById, getRadios } from '@/lib/api';
import { CheckoutLogEntry, User, Radio } from '@/types/types';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { CornerUpRight, Undo2, ChevronLeft, ChevronRight, SquareChevronLeft, SquareChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button'; // shadcn/ui Button

interface CheckoutLogProps {
    user?: User;
    radio?: Radio;
    logs: CheckoutLogEntry[];
}

export const columnsByUser = (): ColumnDef<CheckoutLogEntry>[] => [
    {
        header: '',
        accessorKey: 'operation',
        cell: ({ row }) => {
            if (row.original.operation === 'check-in') {
                return <Undo2 size={16} />;
            } else {
                return <CornerUpRight size={16} />;
            }
        },
    },
    {
        header: 'Date',
        accessorKey: 'date',
        cell: ({ row }) => {
            const value = row.original.date;
            return new Date(value).toLocaleString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
        },
    },
    {
        header: 'Radio',
        accessorKey: 'radioID',
        cell: ({ row }) => {
            const [radioName, setRadioName] = useState<string>(row.original.radioID);

            useEffect(() => {
                const fetchRadio = async () => {
                    const radio = (await getRadios({ radioID: row.original.radioID })) as Radio;
                    setRadioName(radio ? +radio.ID + ' - ' + radio.Name : 'Unknown');
                };
                fetchRadio();
            }, [row.original.radioID]);

            return radioName;
        },
    },
];

export const columnsByRadio = (): ColumnDef<CheckoutLogEntry>[] => [
    {
        header: '',
        accessorKey: 'operation',
        cell: ({ row }) => {
            if (row.original.operation === 'check-in') {
                return <Undo2 size={16} />;
            } else {
                return <CornerUpRight size={16} />;
            }
        },
    },
    {
        header: 'Date',
        accessorKey: 'date',
        cell: ({ row }) => {
            const value = row.original.date;
            return new Date(value).toLocaleString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
        },
    },
    {
        header: 'User',
        accessorKey: 'userID',
        cell: ({ row }) => {
            const [userName, setUserName] = useState<string>(row.original.userID);

            useEffect(() => {
                const fetchUser = async () => {
                    const user = await getUserById(row.original.userID);
                    setUserName(user ? user.name : 'Unknown User');
                };
                fetchUser();
            }, [row.original.userID]);

            return userName;
        },
    },
];

const CheckoutLog: React.FC<CheckoutLogProps> = ({ user, radio, logs }) => {
    const [sortedLogs, setSortedLogs] = useState<CheckoutLogEntry[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const logsPerPage = 10; // Number of logs per page
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState<string>('');

    useEffect(() => {
        if (!logs || logs.length === 0) {
            setError('No logs available.');
            setSortedLogs([]);
        } else {
            setError(null);
            setSortedLogs(logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
        if (radio) {
            setTitle(`History for ${radio.Name} [${radio.ID}]`);
        } else if (user) {
            setTitle(`History for ${user.name}`);
        }
    }, [logs, radio, user]);

    if (!user && !radio) {
        return null;
    }

    const columns = user ? columnsByUser() : columnsByRadio();

    // Pagination logic
    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = sortedLogs.slice(indexOfFirstLog, indexOfLastLog);

    // Total number of pages
    const totalPages = Math.ceil(sortedLogs.length / logsPerPage);

    // Handle next page
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Handle previous page
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="checkout-log mt-2">
            <h3 className="text-lg font-bold mb-4">{title}</h3>

            {error ? (
                <p className="text-red-500">{error}</p>
            ) : currentLogs.length > 0 ? (
                <>
                    <DataTable
                        columns={columns}
                        data={currentLogs}
                    />

                    {/* Pagination Controls */}
                    <div className="mt-4 flex justify-between items-center">
                        <Button
                            variant="ghost"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                        >
                            <SquareChevronLeft size={20} /> {/* Previous  */}
                        </Button>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="ghost"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            <SquareChevronRight size={20} /> {/* Next  */}
                        </Button>
                    </div>
                </>
            ) : (
                <p>No logs available.</p>
            )}
        </div>
    );
};

export default CheckoutLog;
