// File: /components/checked-out-radios.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { getRadios, getUserById } from '@/lib/api';
import { Radio, User } from '@/types/types';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CheckedOutRadiosProps {}

const CheckedOutRadios: React.FC<CheckedOutRadiosProps> = () => {
    const [checkedOutRadios, setCheckedOutRadios] = useState<Radio[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);
    const radiosPerPage = 10;

    useEffect(() => {
        const fetchCheckedOutRadios = async () => {
            try {
                const radios = await getRadios();
                if (radios && Array.isArray(radios)) {
                    const filteredRadios = radios.filter((radio) => radio.checked_out_user);
                    setCheckedOutRadios(filteredRadios);
                } else {
                    setCheckedOutRadios([]);
                }
            } catch (e) {
                setError('Failed to load radios. Please try again later.');
            }
        };
        fetchCheckedOutRadios();
    }, []);

    const columns: ColumnDef<Radio>[] = [
        {
            header: 'Radio',
            accessorKey: 'ID',
            cell: ({ row }) => {
                return `${row.original.ID} - ${row.original.Name}`;
            },
        },
        {
            header: 'Checked Out By',
            accessorKey: 'checked_out_user',
            cell: ({ row }) => {
                const [userName, setUserName] = useState<string>('Loading...');

                useEffect(() => {
                    const fetchUser = async () => {
                        const user = await getUserById(row.original.checked_out_user!);
                        setUserName(user ? user.name : 'Unknown User');
                    };
                    fetchUser();
                }, [row.original.checked_out_user]);

                return userName;
            },
        },
        {
            header: 'Date/Time',
            accessorKey: 'checkout_date',
            cell: ({ row }) => {
                const value = row.original.checkout_date;
                return value
                    ? new Date(value).toLocaleString('en-US', {
                          month: '2-digit',
                          day: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                      })
                    : 'N/A';
            },
        },
    ];

    // Pagination logic
    const indexOfLastRadio = currentPage * radiosPerPage;
    const indexOfFirstRadio = indexOfLastRadio - radiosPerPage;
    const currentRadios = checkedOutRadios.slice(indexOfFirstRadio, indexOfLastRadio);

    const totalPages = Math.ceil(checkedOutRadios.length / radiosPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="checked-out-radios mt-2">
            <h3 className="text-lg font-bold mb-4">Checked Out Radios ({checkedOutRadios.length})</h3>

            {error ? (
                <p className="text-red-500">{error}</p>
            ) : checkedOutRadios.length === 0 ? (
                <p>No radios checked out.</p>
            ) : (
                <>
                    <DataTable
                        columns={columns}
                        data={currentRadios}
                    />

                    {/* Pagination Controls */}
                    <div className="mt-4 flex justify-between items-center">
                        <Button
                            variant="ghost"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={20} /> {/* Previous  */}
                        </Button>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="ghost"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight size={20} /> {/* Next  */}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CheckedOutRadios;
