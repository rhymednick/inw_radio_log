'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'; // Modal components
import UsersGrid from '@/components/users-grid';
import UserCard from '@/components/user-card'; // Assuming you already have this component for rendering a single user
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // ShadCN UI components
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'; // ShadCN Avatar components
import { CircleUserRound } from 'lucide-react'; // Lucide React icon for user fallback

interface UserSelectorProps {
    users: User[];
    onSelect: (user: User) => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({ users, onSelect }) => {
    const [query, setQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter users as query updates
    useEffect(() => {
        setFilteredUsers(users.filter((user) => user.name.toLowerCase().includes(query.toLowerCase())));
    }, [query, users]);

    // When a user is selected from the list
    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
        onSelect(user); // Raise the user selection event
        setIsModalOpen(false); // Close modal when a user is selected
    };

    // Clear the search query
    const handleClearSearch = () => {
        setQuery(''); // Reset search query
    };

    // Function to open the modal without resetting the selected user
    const openModalForUserSelection = () => {
        setQuery(''); // Clear the query to show all users
        setIsModalOpen(true); // Open the modal
    };

    return (
        <div className="user-selector">
            {/* Show selected user if there is one */}
            {selectedUser ? (
                <div className="selected-user-card">
                    <UserCard
                        user={selectedUser}
                        onClick={openModalForUserSelection}
                    />
                </div>
            ) : (
                <div>
                    <Card className="max-w-40">
                        <CardHeader>
                            <div className="flex justify-center">
                                <Avatar className="w-24 h-24 relative">
                                    <AvatarFallback className="absolute inset-0 flex items-center justify-center">
                                        <CircleUserRound className="text-gray-300 w-full h-full" />
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </CardHeader>
                        <CardContent className="text-center">
                            <CardTitle className="text-md font-semibold">
                                <Button onClick={openModalForUserSelection}>Select User</Button>
                            </CardTitle>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modal dialog for user selection */}
            <Dialog
                open={isModalOpen}
                onOpenChange={(open) => {
                    // Close the modal without resetting the user if no new selection is made
                    if (!open) {
                        setIsModalOpen(false);
                    }
                }}
            >
                <DialogTrigger asChild>
                    {/* Invisible trigger because we are manually handling the modal */}
                    <span />
                </DialogTrigger>
                <DialogContent className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-[80%]">
                    <DialogHeader>
                        <DialogTitle>Select a User</DialogTitle>
                    </DialogHeader>

                    <div className="flex items-center space-x-2 mb-4">
                        <Input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Type your name..."
                            className="w-full"
                        />
                        <Button onClick={handleClearSearch}>Clear search</Button>
                    </div>

                    <div className="overflow-y-auto max-h-[50vh]">
                        {/* Scrollable users grid */}
                        <UsersGrid
                            users={filteredUsers}
                            onUserClick={handleUserSelect}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserSelector;
