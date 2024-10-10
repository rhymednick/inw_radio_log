// components/radio-card.tsx
import { useState, useEffect, useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { SquareX } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Radio, User } from '@/types/types';
import { checkOutRadio, checkInRadio, updateRadio } from '@/lib/api'; // Importing helper functions

interface RadioCardProps {
    radio: Radio;
    onDelete: (ID: string) => void;
    onRefresh: (ID: string) => void; // New callback for refreshing the parent component
    users: User[];
}

const RadioCard: React.FC<RadioCardProps> = ({ radio, onDelete, onRefresh, users }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [comment, setComment] = useState<string>(radio.Comments || '');
    const debouncingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Handle save for any radio field (except comments, which is handled separately)
    const handleFieldSave = async (field: keyof Radio, value: any) => {
        const updatedRadio = { ...radio, [field]: value };
        try {
            await updateRadio(updatedRadio);
            onRefresh(radio.ID); // Notify parent to refresh data
        } catch (error) {
            console.error(`Error updating radio field ${field}:`, error);
        }
    };

    // Handle checkbox logic to ensure mutual exclusivity
    const handlePartiallyDamagedChange = async (checked: boolean) => {
        if (checked) {
            await handleFieldSave('Nonfunctional', false); // Uncheck Nonfunctional if Partially Damaged is checked
        }
        await handleFieldSave('PartiallyDamaged', checked);
    };

    const handleNonfunctionalChange = async (checked: boolean) => {
        if (checked) {
            await handleFieldSave('PartiallyDamaged', false); // Uncheck Partially Damaged if Nonfunctional is checked
        }
        await handleFieldSave('Nonfunctional', checked);
    };

    // Handle check-out logic and immediately reflect changes by calling the helper functions
    const handleCheckOutChange = async (userId: string | null) => {
        try {
            if (userId) {
                await checkOutRadio(radio.ID, userId, true);
            } else {
                await checkInRadio(radio.ID);
            }
            onRefresh(radio.ID); // Notify parent to refresh data after check-out or check-in
        } catch (error) {
            console.error('Error checking out/in the radio:', error);
        }
    };

    // Handle debounced save for comments
    const handleCommentChange = (newComment: string) => {
        setComment(newComment);

        // Clear any existing timeout to reset the debounce timer
        if (debouncingTimeoutRef.current) {
            clearTimeout(debouncingTimeoutRef.current);
        }

        // Set a new timeout to save the comment after a delay (e.g., 2 seconds)
        debouncingTimeoutRef.current = setTimeout(async () => {
            try {
                await handleFieldSave('Comments', newComment);
            } catch (error) {
                console.error('Error saving comments:', error);
            }
        }, 2000); // Wait 2 seconds after the user stops typing
    };

    return (
        <Card
            key={radio.ID}
            className="relative"
        >
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="link"
                            className="absolute top-3 right-1"
                            aria-label="Delete"
                            onClick={() => setIsDialogOpen(true)} // Manually trigger dialog open
                        >
                            <SquareX className="text-red-500" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>
                            Delete Radio {radio.ID} - {radio.Name}
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {/* Dialog for delete confirmation */}
            <AlertDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen} // Control dialog open/close state
            >
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
                        value={comment}
                        onChange={(e) => handleCommentChange(e.target.value)}
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

                    <select
                        value={radio.checked_out_user || ''}
                        onChange={(e) => handleCheckOutChange(e.target.value || null)}
                        className="w-full px-2 py-1 border rounded"
                    >
                        <option value=""></option>
                        {users.map((user) => (
                            <option
                                key={user.id}
                                value={user.id}
                            >
                                {user.name}
                            </option>
                        ))}
                    </select>
                    {radio.checked_out_user && (
                        <p className="mt-2 text-sm text-slate-500">
                            Checked out to: {users.find((u) => u.id === radio.checked_out_user)?.name} on{' '}
                            {new Date(radio.checkout_date || '').toLocaleString()}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default RadioCard;
