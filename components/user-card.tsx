// File: /components/user-card.tsx

import React, { useState } from 'react';
import { User } from '@/types/types'; // Import User type
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // ShadCN UI components
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'; // ShadCN Avatar components
import { CircleUserRound, SquareX } from 'lucide-react'; // Lucide React icons for user fallback and delete
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    onDelete?: () => void; // Make onDelete optional
}

const UserCard: React.FC<UserCardProps> = ({ user, onClick, onDelete }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <Card
            className="relative cursor-pointer max-w-40"
            onClick={onClick}
        >
            {onDelete && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="link"
                                className="absolute top-1 -right-1"
                                aria-label="Delete"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering onClick for the card
                                    setIsDialogOpen(true);
                                }}
                            >
                                <SquareX className="text-red-500" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Delete User {user.name}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}

            {/* Dialog for delete confirmation */}
            {onDelete && (
                <AlertDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                >
                    <AlertDialogContent className="bg-white">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete {user.name}? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <Button
                                variant="secondary"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering onClick for the card
                                    onDelete();
                                    setIsDialogOpen(false); // Close dialog after deletion
                                }}
                            >
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

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
};

export default UserCard;
