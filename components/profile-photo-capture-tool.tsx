// components/profile-photo-capture-tool.tsx

'use client';

import { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';

interface ProfilePhotoCaptureToolProps {
    onImageCapture: (imageData: string | null) => void;
}

const ProfilePhotoCaptureTool: React.FC<ProfilePhotoCaptureToolProps> = ({ onImageCapture }) => {
    const webcamRef = useRef<Webcam>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    const handleCapture = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
            onImageCapture(imageSrc); // Pass the captured image up to the parent
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        onImageCapture(null); // Reset the image in the parent
    };

    return (
        <div className="flex flex-col items-center">
            {capturedImage ? (
                <div className="relative w-64 h-64">
                    <img
                        src={capturedImage}
                        alt="Captured"
                        className="rounded-full w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className="relative w-64 h-64">
                    <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover"
                        videoConstraints={{
                            facingMode: 'user',
                        }}
                    />
                    {/* Darkened overlay with solid-edged transparent circle that goes to the edges */}
                    <div
                        className="absolute inset-0 bg-black opacity-50"
                        style={{
                            maskImage: 'radial-gradient(circle 128px at center, transparent 127px, black 128px)',
                            WebkitMaskImage: 'radial-gradient(circle 128px at center, transparent 127px, black 128px)', // For Safari support
                        }}
                    ></div>
                </div>
            )}

            {/* Buttons */}
            {capturedImage ? (
                <Button
                    variant="secondary"
                    onClick={handleRetake}
                    className="mt-4"
                >
                    Retake
                </Button>
            ) : (
                <Button
                    variant="outline"
                    onClick={handleCapture}
                    className="mt-4"
                >
                    Capture
                </Button>
            )}
        </div>
    );
};

export default ProfilePhotoCaptureTool;
