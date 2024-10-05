// components/user-selector.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import UsersGrid from '@/components/users-grid';
import UserCard from '@/components/user-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CircleUserRound } from 'lucide-react';
import { UserProfileEditor } from '@/components/user-profile-editor';

interface UserSelectorProps {
    users: User[];
    onSelect: (user: User | null) => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({ users, onSelect }) => {
    const [query, setQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lastActivity, setLastActivity] = useState<number>(Date.now());
    const [isEditorOpen, setIsEditorOpen] = useState(false); // Control editor open/close state

    const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes

    // Filter users as query updates
    useEffect(() => {
        setFilteredUsers(users.filter((user) => user.name.toLowerCase().includes(query.toLowerCase())));
    }, [query, users]);

    // When a user is selected from the list
    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
        onSelect(user); // Raise the user selection event
        setIsModalOpen(false); // Close modal when a user is selected
        resetActivity(); // Reset activity timeout when a user is selected
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

    // Activity handler to reset inactivity timeout
    const resetActivity = () => {
        setLastActivity(Date.now());
    };

    // Effect to track inactivity and clear the selected user
    useEffect(() => {
        // Set a timer to clear the user after inactivity
        const timer = setInterval(() => {
            if (Date.now() - lastActivity >= INACTIVITY_TIMEOUT && selectedUser) {
                setSelectedUser(null); // Clear the selected user after inactivity
                onSelect(null); // Notify parent component
            }
        }, 1000); // Check every second

        // Clean up the interval on component unmount
        return () => clearInterval(timer);
    }, [lastActivity, selectedUser]);

    // Add event listeners for user activity (mousemove, keydown, etc.)
    useEffect(() => {
        const handleUserActivity = () => resetActivity();

        window.addEventListener('mousemove', handleUserActivity);
        window.addEventListener('keydown', handleUserActivity);

        // Clean up event listeners on unmount
        return () => {
            window.removeEventListener('mousemove', handleUserActivity);
            window.removeEventListener('keydown', handleUserActivity);
        };
    }, []);

    // Handle adding a new user (for now, just log a message)
    const handleAddNewUser = () => {
        console.log(`Adding new user with name "${query}"`); // Simple log for testing
        setIsEditorOpen(true); // Open the editor
    };

    const handleUserSaved = (user: User | undefined) => {
        setIsEditorOpen(false); // Close editor after saving
        if (user) {
            users.concat(user);
            handleUserSelect(user); // Select the saved user
        }
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
                    if (!open) {
                        setIsModalOpen(false);
                    }
                }}
            >
                <DialogTrigger asChild>
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
                        {filteredUsers.length === 0 && (
                            <Button
                                variant="outline"
                                onClick={handleAddNewUser}
                            >
                                Add New User
                            </Button>
                        )}
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

            {isEditorOpen && (
                <UserProfileEditor
                    initialUsername={query}
                    open={isEditorOpen}
                    onOpenChange={setIsEditorOpen}
                    onSave={handleUserSaved}
                />
            )}
        </div>
    );
};

export default UserSelector;
