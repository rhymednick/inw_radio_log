import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';

const videoConstraints = {
    width: 300,
    height: 300,
    facingMode: 'user',
};

interface WebcamCaptureProps {
    onCapture: (imageSrc: string) => void;
}

export default function WebcamCapture({ onCapture }: WebcamCaptureProps) {
    const webcamRef = useRef<Webcam>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    const capture = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
            onCapture(imageSrc); // Pass the image to the parent component
        }
    };

    return (
        <div className="flex flex-col items-center">
            <Webcam
                audio={false}
                height={300}
                width={300}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
            />
            <button
                onClick={capture}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
                Capture Photo
            </button>
            {capturedImage && (
                <div className="mt-4">
                    <p>Captured Image:</p>
                    <img
                        src={capturedImage}
                        alt="Captured"
                        className="border-2 border-gray-300"
                    />
                </div>
            )}
        </div>
    );
}
