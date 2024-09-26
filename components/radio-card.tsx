// File: /components/radio-card.tsx

import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { SquareX } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Radio, User } from '@/types/types';

interface RadioCardProps {
    radio: Radio;
    onFieldChange: (ID: string, field: keyof Radio, value: any) => void;
    onSave: (ID: string) => void;
    onDelete: (ID: string) => void;
    isChanged: boolean;
}

const RadioCard: React.FC<RadioCardProps> = ({ radio, onFieldChange, onSave, onDelete, isChanged }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]); // Initialize users as an empty array
    const [isLoadingUsers, setIsLoadingUsers] = useState(true); // Loading state for users

    // Fetch the list of users when the component mounts
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/admin/users');
                const data = await response.json();

                if (Array.isArray(data)) {
                    setUsers(data); // Ensure we set users only if the response is an array
                } else {
                    console.error('Expected an array of users but got:', data);
                }
            } catch (error) {
                console.error('Failed to fetch users', error);
            } finally {
                setIsLoadingUsers(false); // Set loading to false
            }
        };

        fetchUsers();
    }, []);

    // Get the user name for the checked out radio
    const checkedOutUser = radio.checked_out_user
        ? users.find((user) => user.id === radio.checked_out_user)?.name
        : null;

    // Handle checkbox logic to ensure mutual exclusivity
    const handlePartiallyDamagedChange = (checked: boolean) => {
        if (checked) {
            onFieldChange(radio.ID, 'Nonfunctional', false); // Uncheck Nonfunctional if Partially Damaged is checked
        }
        onFieldChange(radio.ID, 'PartiallyDamaged', checked);
    };

    const handleNonfunctionalChange = (checked: boolean) => {
        if (checked) {
            onFieldChange(radio.ID, 'PartiallyDamaged', false); // Uncheck Partially Damaged if Nonfunctional is checked
        }
        onFieldChange(radio.ID, 'Nonfunctional', checked);
    };

    const handleCheckOutChange = (userId: string | null) => {
        onFieldChange(radio.ID, 'checked_out_user', userId);
        onFieldChange(radio.ID, 'checkout_date', userId ? new Date().toISOString() : null); // Set the current date if checked out
    };

    return (
        <Card
            key={radio.ID}
            className="relative"
        >
            <AlertDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            >
                <AlertDialogTrigger asChild>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="link"
                                    className="absolute top-3 right-1"
                                    aria-label="Delete"
                                >
                                    <SquareX className="text-red-500" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Delete Radio {radio.ID}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Radio</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this radio? This action cannot be undone.
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
                            onClick={() => {
                                onDelete(radio.ID);
                                setIsDialogOpen(false); // Close dialog after deletion
                            }}
                        >
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <CardHeader>
                <CardTitle>
                    {radio.ID} - <span className="text-slate-500">{radio.Name}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Comments</label>
                    <Textarea
                        value={radio.Comments || ''}
                        onChange={(e) => onFieldChange(radio.ID, 'Comments', e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                        rows={3}
                    />
                </div>
                <div className="flex items-center space-x-4 mb-4">
                    <Checkbox
                        checked={radio.PartiallyDamaged || false}
                        onCheckedChange={handlePartiallyDamagedChange}
                    />
                    <label className="text-sm">Partially Damaged</label>
                </div>
                <div className="flex items-center space-x-4">
                    <Checkbox
                        checked={radio.Nonfunctional || false}
                        onCheckedChange={handleNonfunctionalChange}
                    />
                    <label className="text-sm">Nonfunctional</label>
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Checked Out To</label>
                    {isLoadingUsers ? (
                        <p>Loading users...</p>
                    ) : (
                        <select
                            value={radio.checked_out_user || ''}
                            onChange={(e) => handleCheckOutChange(e.target.value || null)}
                            className="w-full px-2 py-1 border rounded"
                        >
                            <option value="">-- Not Checked Out --</option>
                            {users.map((user) => (
                                <option
                                    key={user.id}
                                    value={user.id}
                                >
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    )}
                    {checkedOutUser && (
                        <p className="mt-2 text-sm text-slate-500">
                            Checked out to: {checkedOutUser} on {new Date(radio.checkout_date || '').toLocaleString()}
                        </p>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex justify-center">
                {/* Hide the save button when no changes have been made */}
                <Button
                    onClick={() => onSave(radio.ID)}
                    className={`${!isChanged ? 'hidden' : ''}`}
                >
                    Save
                </Button>
            </CardFooter>
        </Card>
    );
};

export default RadioCard;
