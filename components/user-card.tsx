import React from 'react';
import { User } from '@/types/types'; // Import User type
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // ShadCN UI components
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'; // ShadCN Avatar components
import { CircleUserRound } from 'lucide-react'; // Lucide React icon for user fallback

// Function to get initials, skipping propositions
const getInitials = (name: string): string => {
    const propositions = ['of', 'the', 'in', 'on', 'with', 'for', 'and']; // Add more if needed
    return name
        .split(' ')
        .filter((word) => !propositions.includes(word.toLowerCase()))
        .map((word) => word.charAt(0).toUpperCase())
        .join('');
};

interface UserCardProps {
    user: User;
    onClick: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onClick }) => (
    <Card
        className="cursor-pointer max-w-40"
        onClick={onClick}
    >
        {/* Use flexbox utilities to center the avatar */}
        <CardHeader>
            <div className="flex justify-center">
                <Avatar className="w-24 h-24 relative">
                    <AvatarImage
                        src={user.profilePhoto || '/images/default.jpg'}
                        alt={user.name}
                    />
                    {!user.profilePhoto && (
                        <AvatarFallback className="absolute inset-0 flex items-center justify-center">
                            <CircleUserRound className="text-gray-300 w-full h-full" />
                            <span className="absolute text-black text-2xl font-bold">{getInitials(user.name)}</span>
                        </AvatarFallback>
                    )}
                </Avatar>
            </div>
        </CardHeader>
        <CardContent className="text-center">
            <CardTitle className="text-md font-semibold">{user.name}</CardTitle>
        </CardContent>
    </Card>
);

export default UserCard;
