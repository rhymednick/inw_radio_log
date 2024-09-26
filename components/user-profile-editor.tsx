// File: /components/user-profile-editor.tsx

'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import ProfilePhotoDialog from '@/components/profile-photo-dialog';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';

interface UserProfileEditorProps {
    id?: string; // Add an ID prop to support updates
    initialUsername?: string;
    initialProfilePhoto?: string; // Profile photo is now optional
    open: boolean; // Control whether the sheet is open
    onOpenChange: (open: boolean) => void; // Function to change open state
    onSave?: () => void;
}

export const UserProfileEditor: React.FC<UserProfileEditorProps> = ({
    id,
    initialUsername = '',
    initialProfilePhoto = '',
    open,
    onOpenChange,
    onSave,
}) => {
    const [username, setUsername] = useState(initialUsername);
    const [profilePhoto, setProfilePhoto] = useState(initialProfilePhoto); // Optional profile photo
    const [existingUserWarning, setExistingUserWarning] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (!initialUsername && username !== '') {
            checkIfUserExists(username);
        } else {
            setExistingUserWarning(false);
        }

        setHasChanges(username !== initialUsername || profilePhoto !== initialProfilePhoto);
    }, [username, profilePhoto, initialUsername, initialProfilePhoto]);

    const checkIfUserExists = async (name: string) => {
        const response = await fetch('/api/admin/users');
        const data = await response.json();

        const userExists = data.users.some(
            (user: { id: string; name: string }) => user.name.toLowerCase() === name.toLowerCase() && user.id !== id
        );

        setExistingUserWarning(userExists);
    };

    const handleSave = async () => {
        if (existingUserWarning) {
            return;
        }

        const payload: { id?: string; name: string; profilePhoto?: string } = {
            name: username,
        };

        if (profilePhoto) {
            payload.profilePhoto = profilePhoto;
        }

        if (id) {
            payload.id = id;
        }

        const response = await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            toast.success('User info saved!');
            onSave?.();
            onOpenChange(false); // Close the sheet after saving
        } else {
            const { error } = await response.json();
            toast.error(error || 'Failed to save user info');
        }
    };

    const handleImageCapture = (imageData: string | null) => {
        setProfilePhoto(imageData || ''); // If imageData is null, set an empty string
    };

    return (
        <>
            <Toaster position="top-right" />
            <Sheet
                open={open}
                onOpenChange={onOpenChange}
            >
                <SheetContent className="bg-white">
                    <SheetTitle>{id ? 'Edit User' : 'Add New User'}</SheetTitle>
                    <ProfilePhotoDialog
                        initialImage={profilePhoto}
                        onImageCapture={handleImageCapture} // Use the wrapper function here
                    />

                    <div className="mt-4">
                        <label htmlFor="username">User Name</label>
                        <div className="relative">
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                            />
                            {existingUserWarning && <p className="text-red-500">This username already exists</p>}
                        </div>
                    </div>

                    {hasChanges && (
                        <Button
                            onClick={handleSave}
                            className="mt-4"
                        >
                            Save Changes
                        </Button>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
};
