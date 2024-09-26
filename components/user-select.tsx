// @/components/user-select.tsx
// This component handles user selection with a dropdown list.

import React, { useState } from 'react';
import UserList from '@/components/user-list'; // Import the user list component
import SearchBar from '@/components/search-bar'; // Import the search bar component
import AddUserDialog from '@/components/add-user-dialog'; // Import the add user dialog component
import { User } from '@/types/types'; // Using the shared User type

interface UserSelectProps {
    users: User[]; // Array of user objects
}

const UserSelect: React.FC<UserSelectProps> = ({ users }) => {
    const [searchTerm, setSearchTerm] = useState(''); // State to manage search term
    const [selectedUser, setSelectedUser] = useState<User | null>(null); // State to manage the selected user
    const [isDropdownVisible, setDropdownVisible] = useState(false); // Manage dropdown visibility

    // Filter users based on the search term
    const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Callback for when a user is selected
    const handleUserSelect = (user: User) => {
        setSelectedUser(user); // Set the selected user
        setDropdownVisible(false); // Hide the dropdown after selection
    };

    // Show dropdown only when searchTerm has value
    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
        setDropdownVisible(term.length > 0); // Only show the dropdown when typing
    };

    return (
        <div className="w-full space-y-6">
            <SearchBar
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
            />

            {/* Show the selected user if one is chosen */}
            {selectedUser && (
                <div className="p-4 bg-gray-100 rounded-lg">
                    <p className="text-gray-800 font-medium">Selected User: {selectedUser.name}</p>
                </div>
            )}

            {/* Conditionally render dropdown list if there are matching users */}
            {isDropdownVisible && filteredUsers.length > 0 && (
                <div className="relative">
                    <div className="absolute z-10 bg-white border rounded-lg shadow-lg w-full">
                        <UserList
                            users={filteredUsers.map((user) => ({
                                ...user,
                                onSelect: () => handleUserSelect(user), // Attach the onSelect function
                            }))}
                        />
                    </div>
                </div>
            )}

            {/* If no matching users, show the Add User dialog */}
            {isDropdownVisible && filteredUsers.length === 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No users found.</p>
                    <AddUserDialog />
                </div>
            )}
        </div>
    );
};

export default UserSelect;
