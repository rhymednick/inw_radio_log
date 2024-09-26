// File: /components/users-grid.tsx

import React from 'react';
import { User } from '@/types/types'; // Import User type
import UserCard from '@/components/user-card'; // Import the UserCard component

interface UsersGridProps {
    users: User[];
    onUserClick: (user: User) => void; // Prop for handling user clicks
    shouldSort?: boolean; // Optional prop to control sorting, defaults to true
}

const UsersGrid: React.FC<UsersGridProps> = ({ users, onUserClick, shouldSort = true }) => {
    // Conditionally sort users alphabetically by name if shouldSort is true
    const displayedUsers = shouldSort
        ? [...users].sort((a, b) => a.name.localeCompare(b.name)) // Spread to avoid mutating original array
        : users;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4 mb-4">
            {displayedUsers.map((user) => (
                <UserCard
                    key={user.id}
                    user={user}
                    onClick={() => onUserClick(user)}
                />
            ))}
        </div>
    );
};

export default UsersGrid;
