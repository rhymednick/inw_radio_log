// app/profile-photo-test/page.tsx

'use client';

import { useState } from 'react';
import ProfilePhotoDialog from '@/components/profile-photo-dialog';

const ProfilePhotoTest: React.FC = () => {
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const handleImageCapture = (imageData: string | null) => {
        setProfileImage(imageData);
    };

    return (
        <div className="flex flex-col items-center mt-10">
            {profileImage && (
                <div className="mt-4">
                    <img
                        src={profileImage}
                        alt="Profile"
                        className="rounded-full w-32 h-32 object-cover"
                    />
                </div>
            )}

            <ProfilePhotoDialog onImageCapture={handleImageCapture} />
        </div>
    );
};

export default ProfilePhotoTest;
