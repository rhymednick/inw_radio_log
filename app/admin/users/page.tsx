// File: /app/users/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { UserProfileEditor } from '@/components/user-profile-editor';
import { Button } from '@/components/ui/button';
import { User } from '@/types/types'; // Import User type
import UsersGrid from '@/components/users-grid'; // Import the UsersGrid component
import { deleteUser } from '@/lib/api'; // Import deleteUser function

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null); // Track selected user for editing
    const [isEditorOpen, setIsEditorOpen] = useState(false); // Control editor open/close state

    // Fetch all users from the API
    useEffect(() => {
        const fetchUsers = async () => {
            const response = await fetch('/api/admin/users');
            const data = await response.json();
            setUsers(data.users);
        };

        fetchUsers();
    }, []);

    const handleUserClick = (user: User) => {
        setSelectedUser(user); // Set the clicked user as the selected one
        setIsEditorOpen(true); // Open the editor
    };

    const handleAddNewUser = () => {
        setSelectedUser(null); // Set null for a new user
        setIsEditorOpen(true); // Open the editor
    };

    const handleSave = () => {
        setIsEditorOpen(false); // Close editor after saving
        // Fetch users again to update the list
        fetch('/api/admin/users')
            .then((res) => res.json())
            .then((data) => {
                setUsers(data.users);
            });
    };

    const handleUserDelete = async (user: User) => {
        try {
            const result = await deleteUser(user.id);
            if (result) {
                // Remove the deleted user from the state
                setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
                console.log('User deleted successfully');
            } else {
                throw new Error('Deletion failed');
            }
        } catch (error: any) {
            console.error(
                'Failed to delete user:',
                error instanceof Error ? error.message : 'An unknown error occurred.'
            );
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">User Management</h1>

            <Button
                onClick={handleAddNewUser}
                className="mb-6"
            >
                Add New User
            </Button>

            {/* Use the UsersGrid component */}
            <UsersGrid
                users={users}
                onUserClick={handleUserClick}
                onUserDelete={handleUserDelete}
            />

            {isEditorOpen && (
                <UserProfileEditor
                    id={selectedUser?.id}
                    initialUsername={selectedUser?.name || ''}
                    initialProfilePhoto={selectedUser?.profilePhoto || ''}
                    open={isEditorOpen}
                    onOpenChange={setIsEditorOpen}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default UsersPage;
