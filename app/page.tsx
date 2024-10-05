// File: /app/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import UserSelector from '@/components/user-selector';
import UserRadioCheckoutDetails from '@/components/user-radio-checkout-details';
import { User } from '@/types/types';

const Page: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
                    setSelectedUser(null); // Reset the selected user on error
                }
            } catch (error) {
                console.error('Error fetching users:', error);
                setUsers([]); // Fall back to an empty array on error
                setSelectedUser(null); // Reset the selected user on error
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className="container mx-auto p-4">
            {/* <h1 className="text-2xl font-bold mb-6">Radio Checkout System</h1> */}

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
                    <UserRadioCheckoutDetails selectedUser={selectedUser} />
                </div>
            </div>
        </div>
    );
};

export default Page;
