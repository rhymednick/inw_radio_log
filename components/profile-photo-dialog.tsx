// components/profile-photo-dialog.tsx

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { CircleUserRound, Camera } from 'lucide-react'; // Placeholder and camera icon
import ProfilePhotoCaptureTool from '@/components/profile-photo-capture-tool';

interface ProfilePhotoDialogProps {
    initialImage?: string; // Optional initial profile photo
    onImageCapture: (imageData: string | null) => void;
}

const ProfilePhotoDialog: React.FC<ProfilePhotoDialogProps> = ({ initialImage, onImageCapture }) => {
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [open, setOpen] = useState(false); // Dialog open state

    const handleImageCapture = (imageData: string | null) => {
        setCapturedImage(imageData);
    };

    const handleConfirm = () => {
        onImageCapture(capturedImage);
        setOpen(false); // Close the dialog after confirmation
    };

    const displayedImage = capturedImage || initialImage; // Either captured or initial image

    return (
        <div className="flex flex-col items-center space-y-1 m-2">
            {/* Display profile photo or placeholder */}
            {displayedImage ? (
                <img
                    src={displayedImage}
                    alt="Profile"
                    className="rounded-full w-64 h-64 object-cover border border-slate-700"
                />
            ) : (
                <CircleUserRound className="w-64 h-64 text-slate-200" /> // Placeholder if no image
            )}

            {/* Camera icon for triggering dialog */}
            <Dialog
                open={open}
                onOpenChange={setOpen}
            >
                <DialogTrigger asChild>
                    <Button variant="ghost">
                        <Camera className="w-8 h-8 text-slate-600" /> {/* Camera icon */}
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>Capture Profile Photo</DialogTitle>
                    </DialogHeader>
                    <ProfilePhotoCaptureTool onImageCapture={handleImageCapture} />
                    <DialogFooter>
                        <Button
                            variant="default"
                            onClick={handleConfirm}
                            disabled={!capturedImage}
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProfilePhotoDialog;
