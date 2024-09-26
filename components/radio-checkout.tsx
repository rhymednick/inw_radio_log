// components/radio-checkout.tsx

'use client'; // Client-side interactivity required

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { SquarePlus } from 'lucide-react'; // Lucide icon
import { Button } from '@/components/ui/button';
import { Radio } from '@/types/types'; // Assuming we are importing Radio type

interface RadioCheckoutProps {
    onCheckout: (radioID: string) => void;
    onCheckInThenCheckout: (radioID: string) => void;
    isAlreadyCheckedOut: (radioID: string) => boolean;
    resetTrigger: string;
}

const RadioCheckout: React.FC<RadioCheckoutProps> = ({
    onCheckout,
    onCheckInThenCheckout,
    isAlreadyCheckedOut,
    resetTrigger,
}) => {
    const [radioID, setRadioID] = useState('');
    const [radioInfo, setRadioInfo] = useState<{ name: string; checkedOutTo: string | null } | null>(null);
    const [checkedOutUser, setCheckedOutUser] = useState<string | null>(null); // User the radio is checked out to
    const [error, setError] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false); // State to handle custom dialog

    // Reset form when resetTrigger changes (i.e., when the selectedUser changes)
    useEffect(() => {
        clearForm();
    }, [resetTrigger]);

    // Fetch radio info as the radioID is typed/changed
    useEffect(() => {
        if (radioID) {
            fetchRadioInfo(radioID);
        } else {
            // Clear info when radioID is cleared or invalid
            setRadioInfo(null);
            setCheckedOutUser(null);
            setError('');
        }
    }, [radioID]);

    // Fetch radio info from the radios route
    const fetchRadioInfo = async (radioID: string) => {
        try {
            const response = await fetch(`/api/admin/radios`);
            const data: Radio[] = await response.json();

            const radio = data.find((radio) => radio.ID === radioID);
            if (radio) {
                setRadioInfo({
                    name: radio.Name,
                    checkedOutTo: radio.checked_out_user ? radio.checked_out_user : null,
                });
                if (radio.checked_out_user) {
                    // Fetch user info from the users route
                    await fetchUserName(radio.checked_out_user);
                } else {
                    setCheckedOutUser(null); // Clear user info if not checked out
                }
                setError('');
            } else {
                // No matching radio, clear previous info
                setRadioInfo(null);
                setCheckedOutUser(null);
                setError('Radio not found.');
            }
        } catch (error) {
            console.error('Error fetching radio info:', error);
            setError('Error fetching radio information.');
        }
    };

    // Fetch user info from the users route
    const fetchUserName = async (userID: string) => {
        try {
            const response = await fetch(`/api/admin/users`);
            const { users } = await response.json();
            const user = users.find((user: any) => user.id === userID);
            if (user) {
                setCheckedOutUser(user.name);
            } else {
                setCheckedOutUser(null);
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    const handleCheckout = () => {
        if (!radioID || !radioInfo) {
            setError('Please enter a valid radio ID.');
            return;
        }

        if (isAlreadyCheckedOut(radioID)) {
            setIsDialogOpen(true); // Open custom confirmation dialog
        } else {
            onCheckout(radioID);
            clearForm(); // Clear the form only if successful checkout
        }
    };

    const handleConfirmCheckIn = () => {
        onCheckInThenCheckout(radioID);
        clearForm(); // Clear the form after successful check-in/checkout
        setIsDialogOpen(false);
    };

    const clearForm = () => {
        setRadioID('');
        setRadioInfo(null);
        setCheckedOutUser(null);
        setError('');
    };

    return (
        <div className="radio-checkout flex items-center space-x-4">
            {/* Radio ID Input */}
            <Input
                type="text"
                value={radioID}
                onChange={(e) => setRadioID(e.target.value)}
                placeholder="ID"
                className="w-14" // Small text box
            />

            {/* Radio Info Label */}
            <div className="flex items-center space-x-2">
                {radioInfo ? (
                    <span className={`${checkedOutUser ? 'text-red-500' : 'text-black'} font-semibold`}>
                        {radioInfo.name}
                        {checkedOutUser && <span className="ml-2">(Already checked out to {checkedOutUser})</span>}
                    </span>
                ) : (
                    <span className="text-gray-500">Enter radio ID</span>
                )}
            </div>

            {/* Checkout Button with Icon */}
            <SquarePlus
                className={`${!radioInfo ? 'text-gray-400 cursor-not-allowed' : 'text-green-500 cursor-pointer'}`}
                size={24}
                onClick={radioInfo ? handleCheckout : undefined} // Disable if radioInfo is not available
            />

            {/* Error Message */}
            {error && <p className="text-red-500 mt-2">{error}</p>}

            {/* Confirmation Dialog */}
            <Dialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Check In and Check Out?</DialogTitle>
                    </DialogHeader>
                    <p>
                        Radio {radioID} is already checked out to {checkedOutUser}. Would you like to check it in for
                        them and then check it out for yourself?
                    </p>
                    <DialogFooter>
                        <Button
                            onClick={() => setIsDialogOpen(false)}
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmCheckIn}
                            variant="default"
                        >
                            Yes, Check In &amp; Check Out
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RadioCheckout;
