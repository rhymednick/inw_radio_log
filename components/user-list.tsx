// @/components/user-list.tsx
// This component displays a list of users in alphabetical order using shadcn components.

import React from 'react';
import { Button } from '@/components/ui/button'; // Using shadcn's button
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Using shadcn's avatar components

// Define the structure of the user object
interface User {
    id: string;
    name: string;
    profilePhoto?: string;
    onSelect: (user: User) => void; // Callback when a user is selected
}

interface UserListProps {
    users: User[]; // Array of user objects
}

const UserList: React.FC<UserListProps> = ({ users }) => {
    // Sort the users alphabetically by name
    const sortedUsers = [...users].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="space-y-4">
            {sortedUsers.map((user) => (
                <Button
                    key={user.id}
                    variant="outline"
                    className="flex items-center space-x-4 w-full" // Using shadcn button styling
                    onClick={() => user.onSelect(user)}
                >
                    <Avatar className="w-10 h-10">
                        <AvatarImage
                            src={user.profilePhoto}
                            alt={user.name}
                        />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-gray-800 text-sm font-medium">{user.name}</span>
                </Button>
            ))}
        </div>
    );
};

export default UserList;
