'use client';

import { useState, useEffect } from 'react';
import WebcamCapture from '@/components/webcam-capture'; // Webcam component for image capture
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Pencil } from 'lucide-react'; // Pencil icon for edit mode

interface UserSheetProps {
    onUserAdded?: (user: any) => void; // Callback when user is added
    initialUser?: any; // Optional initial data for editing
    isOpen: boolean; // Control the visibility of the sheet
    setIsOpen: (open: boolean) => void; // Function to toggle the sheet visibility
}

export default function UserSheet({ onUserAdded, initialUser, isOpen, setIsOpen }: UserSheetProps) {
    const [userName, setUserName] = useState<string>('');
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState<boolean>(!initialUser); // Edit mode by default for new users

    useEffect(() => {
        if (initialUser) {
            setUserName(initialUser.name);
            setProfilePhoto(initialUser.profilePhoto);
        }
        setIsEditMode(!initialUser); // Set edit mode only for new users
    }, [initialUser]);

    // Handle image capture from the webcam
    const handleImageCapture = (imageSrc: string) => {
        setProfilePhoto(imageSrc);
    };

    // Handle saving the user (add/edit logic)
    const handleSaveUser = async () => {
        if (!userName || !profilePhoto) {
            alert('Please enter a name and capture a profile photo.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST', // Change this to PUT for edit functionality later
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: userName,
                    profilePhoto: profilePhoto,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('User saved successfully');
                if (onUserAdded) {
                    onUserAdded(data.user); // Trigger callback when user is saved
                }
                setIsEditMode(false); // Switch back to display mode after saving
            } else {
                setError(data.error || 'Failed to save user.');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Placeholder user avatar when no photo is provided
    const placeholderAvatar = '/images/placeholder-avatar.png'; // Use your placeholder image path here

    return (
        <Sheet
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
                if (open && initialUser) {
                    setIsEditMode(false); // Revert to display mode when the sheet is reopened for an existing user
                }
            }}
        >
            <SheetContent
                side="right"
                className="p-4 bg-white h-full overflow-y-auto"
            >
                <div className="flex justify-between items-center mt-8">
                    <h2 className="text-xl font-bold mb-4">User Info</h2>
                    {!isEditMode && initialUser && (
                        <Button
                            variant="ghost"
                            onClick={() => setIsEditMode(true)} // Switch to edit mode
                        >
                            <Pencil className="w-5 h-5" />
                        </Button>
                    )}
                </div>

                {/* User Profile Photo */}
                <div className="flex justify-center mb-4">
                    <img
                        src={profilePhoto || placeholderAvatar}
                        alt="User Profile"
                        className="w-64 h-64 rounded-full object-cover border-2 border-gray-300"
                    />
                </div>

                {/* Display user info or edit form */}
                {isEditMode ? (
                    <>
                        {/* Input for user's name */}
                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-2">User Name</label>
                            <Input
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Enter user's name"
                            />
                        </div>

                        {/* Webcam Capture Component */}
                        <WebcamCapture onCapture={handleImageCapture} />

                        {/* Display the captured image */}
                        {profilePhoto && (
                            <div className="mt-4">
                                <h3 className="text-lg">Captured Profile Photo:</h3>
                                <img
                                    src={profilePhoto}
                                    alt="Captured Profile"
                                    className="border-2 border-gray-300 mt-2 rounded-full object-cover w-64 h-64"
                                />
                            </div>
                        )}

                        {/* Save User Button */}
                        <div className="mt-4">
                            <Button
                                onClick={handleSaveUser}
                                className="bg-green-500 text-white"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save User'}
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Display user information */}
                        <div className="text-center">
                            <p className="text-xl font-bold">{userName}</p>
                            <p className="text-gray-500">
                                Last Updated: {new Date(initialUser?.lastUpdated).toLocaleString()}
                            </p>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
