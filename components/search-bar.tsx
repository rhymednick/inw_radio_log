// @/components/search-bar.tsx
// This component allows users to search through the list by typing a name.

import React from 'react';
import { Input } from '@/components/ui/input'; // Using shadcn's input component

interface SearchBarProps {
    searchTerm: string;
    onSearchChange: (term: string) => void; // Callback to handle input changes
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => {
    return (
        <div className="w-full mb-4">
            <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)} // Pass the input value to the parent
                className="w-full"
            />
        </div>
    );
};

export default SearchBar;
