// File: /app/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import UserSelector from '@/components/user-selector';
import UserRadioCheckoutDetails from '@/components/user-radio-checkout-details';
import { User, Radio } from '@/types/types'; // Assuming we are importing User and Radio types

const Page: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [radios, setRadios] = useState<Radio[]>([]); // Store all radios (checked out and available)

    // Fetch the real users from the API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/admin/users');
                const data = await response.json();
                if (Array.isArray(data.users)) {
                    setUsers(data.users);
                } else {
                    console.error('Users data is not an array:', data);
                    setUsers([]);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
                setUsers([]); // Fall back to an empty array on error
            }
        };

        fetchUsers();
    }, []);

    // Fetch the real radios from the API
    useEffect(() => {
        const fetchRadios = async () => {
            try {
                const response = await fetch('/api/admin/radios');
                const data = await response.json();
                setRadios(data); // Store all radios (available and checked out)
            } catch (error) {
                console.error('Error fetching radios:', error);
            }
        };

        fetchRadios();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Radio Checkout System</h1>

            <div className="flex space-x-8">
                {/* User Selection */}
                <div className="max-w-60">
                    <UserSelector
                        users={users}
                        onSelect={setSelectedUser}
                    />
                </div>

                {/* User Radio Checkout Details */}
                <div>
                    <UserRadioCheckoutDetails
                        selectedUser={selectedUser}
                        radios={radios}
                    />
                </div>
            </div>
        </div>
    );
};

export default Page;
