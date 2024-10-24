// File: /components/users-with-radios.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { getRadios, getUserById } from '@/lib/api';
import { Radio, User } from '@/types/types';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface UsersWithRadiosProps {}

interface UserWithRadios {
    user: User;
    radios: Radio[];
}

const UsersWithRadios: React.FC<UsersWithRadiosProps> = () => {
    const [usersWithRadios, setUsersWithRadios] = useState<UserWithRadios[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedUserRadios, setSelectedUserRadios] = useState<Radio[] | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);
    const usersPerPage = 5;

    useEffect(() => {
        const fetchUsersWithRadios = async () => {
            try {
                const radios = await getRadios();
                if (radios && Array.isArray(radios)) {
                    const filteredRadios = radios.filter((radio) => radio.checked_out_user);
                    const userRadioMap: { [userId: string]: Radio[] } = {};

                    for (const radio of filteredRadios) {
                        if (radio.checked_out_user) {
                            if (!userRadioMap[radio.checked_out_user]) {
                                userRadioMap[radio.checked_out_user] = [];
                            }
                            userRadioMap[radio.checked_out_user].push(radio);
                        }
                    }

                    const usersWithRadios: UserWithRadios[] = [];
                    for (const userId of Object.keys(userRadioMap)) {
                        const user = await getUserById(userId);
                        if (user) {
                            usersWithRadios.push({
                                user,
                                radios: userRadioMap[userId],
                            });
                        }
                    }

                    setUsersWithRadios(usersWithRadios);
                } else {
                    setUsersWithRadios([]);
                }
            } catch (e) {
                setError('Failed to load data. Please try again later.');
            }
        };
        fetchUsersWithRadios();
    }, []);

    const columns: ColumnDef<UserWithRadios>[] = [
        {
            header: 'User',
            accessorKey: 'user.name',
            cell: ({ row }) => row.original.user.name,
        },
        {
            header: () => <div className="text-center">Radio Count</div>,
            accessorKey: 'radios',
            cell: ({ row }) => <div className="text-center">{row.original.radios.length}</div>,
        },
        {
            header: '',
            accessorKey: 'viewRadios',
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setSelectedUser(row.original.user);
                            setSelectedUserRadios(row.original.radios);
                        }}
                    >
                        View Radios
                    </Button>
                </div>
            ),
        },
    ];

    // Pagination logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = usersWithRadios.slice(indexOfFirstUser, indexOfLastUser);

    const totalPages = Math.ceil(usersWithRadios.length / usersPerPage);

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
        <div className="users-with-radios mt-2">
            <h3 className="text-lg font-bold mb-4">Users with Radios Checked Out ({usersWithRadios.length})</h3>

            {error ? (
                <p className="text-red-500">{error}</p>
            ) : usersWithRadios.length === 0 ? (
                <p>No users with radios checked out.</p>
            ) : (
                <>
                    <DataTable
                        columns={columns}
                        data={currentUsers}
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

                    {/* Modal for Radios Checked Out */}
                    {selectedUserRadios && selectedUser && (
                        <Dialog
                            open={!!selectedUserRadios}
                            onOpenChange={() => setSelectedUserRadios(null)}
                        >
                            <DialogContent className="bg-white">
                                <DialogTitle>Radios checked out to {selectedUser.name}</DialogTitle>
                                <DataTable
                                    columns={[
                                        {
                                            header: 'Radio',
                                            accessorKey: 'radio',
                                            cell: ({ row }) => `${row.original.ID} - ${row.original.Name}`,
                                        },
                                        {
                                            header: 'Date',
                                            accessorKey: 'date',
                                            cell: ({ row }) =>
                                                row.original.checkout_date
                                                    ? new Date(row.original.checkout_date).toLocaleString('en-US', {
                                                          month: '2-digit',
                                                          day: '2-digit',
                                                          year: '2-digit',
                                                          hour: '2-digit',
                                                          minute: '2-digit',
                                                          hour12: false,
                                                      })
                                                    : 'N/A',
                                        },
                                    ]}
                                    data={selectedUserRadios}
                                />
                            </DialogContent>
                        </Dialog>
                    )}
                </>
            )}
        </div>
    );
};

export default UsersWithRadios;
