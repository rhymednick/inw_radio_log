// components/radio-checkout.tsx

'use client'; // Client-side interactivity required

'use client'; // Client-side interactivity required

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { SquarePlus } from 'lucide-react'; // Lucide icon
import { Radio } from '@/types/types'; // Assuming we are importing Radio type
import { getRadios, getUserById } from '@/lib/api';

interface RadioCheckoutProps {
    onCheckout: (radioID: string) => void;
    resetTrigger: string;
}

const RadioCheckout: React.FC<RadioCheckoutProps> = ({ onCheckout, resetTrigger }) => {
    const [radioID, setRadioID] = useState('');
    const [radioInfo, setRadioInfo] = useState<{ name: string; checkedOutTo: string | null } | null>(null);
    const [checkedOutUser, setCheckedOutUser] = useState<string | null>(null); // User the radio is checked out to
    const [error, setError] = useState('');

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
            const radio = (await getRadios({ radioID: radioID })) as Radio;
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
            const user = await getUserById(userID);

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

        if (!isAlreadyCheckedOut(radioID)) {
            onCheckout(radioID);
            clearForm(); // Clear the form only if successful checkout
        }
    };

    const clearForm = () => {
        setRadioID('');
        setRadioInfo(null);
        setCheckedOutUser(null);
        setError('');
    };

    const isAlreadyCheckedOut = (radioID: string) => {
        return radioInfo && radioInfo.checkedOutTo;
    };

    return (
        <>
            <h3 className="text-lg font-bold mb-4">Check Out Radio</h3>
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
                            {checkedOutUser && <span className="ml-2"> - Checked out to {'\n' + checkedOutUser}</span>}
                        </span>
                    ) : (
                        <span className="text-gray-500">Enter radio ID</span>
                    )}
                </div>

                {/* Checkout Button with Icon */}
                <SquarePlus
                    className={`${
                        !radioInfo || isAlreadyCheckedOut(radioID)
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-green-500 cursor-pointer'
                    }`}
                    size={24}
                    onClick={!radioInfo || isAlreadyCheckedOut(radioID) ? undefined : handleCheckout} // Disable if radio is already checked out or no radio info
                />

                {/* Error Message */}
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
        </>
    );
};

export default RadioCheckout;
