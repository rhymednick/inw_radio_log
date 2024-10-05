// File: /components/user-radio-checkout-details.tsx

import React, { useState, useEffect } from 'react';
import { User, Radio, CheckoutLogEntry } from '@/types/types'; // Assuming we are importing User and Radio types
import RadioList from '@/components/radio-list';
import RadioCheckout from '@/components/radio-checkout';
import CheckoutLog from '@/components/checkout-log';
import { checkInRadio, checkOutRadio, getRadios, getLogEntries } from '@/lib/api';

interface UserRadioCheckoutDetailsProps {
    selectedUser: User | null; // Nullable since no user might be selected
}

const UserRadioCheckoutDetails: React.FC<UserRadioCheckoutDetailsProps> = ({ selectedUser }) => {
    const [radiosCheckedOut, setRadiosCheckedOut] = useState<Radio[]>([]);
    const [fetchedLogs, setFetchedLogs] = useState<CheckoutLogEntry[]>([]);

    useEffect(() => {
        const fetchRadios = async () => {
            if (selectedUser) {
                // Fetch radios checked out to the selected user
                setRadiosCheckedOut((await getRadios({ userID: selectedUser.id })) as Radio[]);
                setFetchedLogs((await getLogEntries({ userID: selectedUser.id })) as CheckoutLogEntry[]);
            } else {
                // Reset the state when no user is selected
                setRadiosCheckedOut([]);
                setFetchedLogs([]);
            }
        };

        fetchRadios();
    }, [selectedUser]);

    // Handle check-in for a specific radio
    const handleCheckIn = async (radio: Radio) => {
        await checkInRadio(radio.ID); // Call the API to check in the radio

        if (selectedUser) {
            const updatedLogs = await getLogEntries({ userID: selectedUser.id });
            setFetchedLogs(updatedLogs as CheckoutLogEntry[]);

            const updatedRadios = await getRadios({ userID: selectedUser.id });
            setRadiosCheckedOut(updatedRadios as Radio[]);
        }
    };

    const handleCheckInAll = async () => {
        // Run all check-ins in parallel using Promise.all
        await Promise.all(
            radiosCheckedOut.map((radio) => checkInRadio(radio.ID)) // Call the API to check in the radio
        );

        if (selectedUser) {
            // Fetch logs once all radios are checked in
            const updatedLogs = await getLogEntries({ userID: selectedUser.id });
            setFetchedLogs(updatedLogs as CheckoutLogEntry[]);

            // Fetch updated radios checked out by the user to ensure the state is accurate
            const updatedRadios = await getRadios({ userID: selectedUser.id });
            setRadiosCheckedOut(updatedRadios as Radio[]);
        }
    };

    const handleCheckout = async (radioID: string) => {
        console.log('Checking out radio:', radioID);
        if (selectedUser) {
            const result = await checkOutRadio(radioID, selectedUser.id, true); // Call the API to check out the radio
            console.log('Checkout result:', result);
            // Update local state
            const updatedLogs = await getLogEntries({ userID: selectedUser.id });
            setFetchedLogs(updatedLogs as CheckoutLogEntry[]);

            const updatedRadios = await getRadios({ userID: selectedUser.id });
            setRadiosCheckedOut(updatedRadios as Radio[]);
        }
    };

    if (!selectedUser) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                {/* Radios checked out to the user */}
                <RadioList
                    radios={radiosCheckedOut}
                    onCheckIn={handleCheckIn}
                    onCheckInAll={handleCheckInAll}
                />

                {/* Checkout new radios */}
                <div className="mt-2">
                    <RadioCheckout
                        onCheckout={handleCheckout}
                        resetTrigger={selectedUser.id} // Pass user.id to reset RadioCheckout on user change
                    />
                </div>
            </div>

            <div>
                <CheckoutLog
                    user={selectedUser}
                    logs={fetchedLogs}
                />
            </div>
        </div>
    );
};

export default UserRadioCheckoutDetails;
