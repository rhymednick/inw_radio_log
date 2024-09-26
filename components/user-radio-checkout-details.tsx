// File: /components/user-radio-checkout-details.tsx

import React, { useState, useEffect } from 'react';
import { User, Radio } from '@/types/types'; // Assuming we are importing User and Radio types
import RadioList from '@/components/radio-list';
import RadioCheckout from '@/components/radio-checkout';
import CheckoutLog from '@/components/checkout-log';

interface UserRadioCheckoutDetailsProps {
    selectedUser: User | null; // Nullable since no user might be selected
    radios: Radio[]; // Full list of radios (both checked-out and available)
}

const UserRadioCheckoutDetails: React.FC<UserRadioCheckoutDetailsProps> = ({ selectedUser, radios }) => {
    const [radiosCheckedOut, setRadiosCheckedOut] = useState<Radio[]>([]);
    const [availableRadios, setAvailableRadios] = useState<Radio[]>([]);
    const [checkoutLog, setCheckoutLog] = useState<any[]>([]);

    useEffect(() => {
        if (selectedUser) {
            // Fetch radios checked out to the selected user
            const userRadios = radios.filter((radio) => radio.checked_out_user === selectedUser.id);
            setRadiosCheckedOut(userRadios);

            // Set available radios (not checked out)
            setAvailableRadios(radios.filter((radio) => !radio.checked_out_user));
        } else {
            // Reset the state when no user is selected
            setRadiosCheckedOut([]);
            setAvailableRadios([]);
        }
    }, [selectedUser, radios]);

    // Handle check-in for a specific radio
    const handleCheckIn = async (radio: Radio) => {
        setRadiosCheckedOut((prevRadios) => prevRadios.filter((r) => r.ID !== radio.ID));
        setCheckoutLog((prevLog) => [
            ...prevLog,
            { operation: 'check-in', radioID: radio.ID, userName: selectedUser?.name, date: new Date().toISOString() },
        ]);

        // Update backend and local state
        await fetch('/api/admin/radios', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ID: radio.ID,
                checked_out_user: null,
                checkout_date: null,
            }),
        });

        // Add radio back to available list after check-in
        setAvailableRadios((prevRadios) => [...prevRadios, { ...radio, checked_out_user: null, checkout_date: null }]);
    };

    const handleCheckInAll = () => {
        setRadiosCheckedOut([]);
        setCheckoutLog((prevLog) => [
            ...prevLog,
            ...radiosCheckedOut.map((radio) => ({
                operation: 'check-in',
                radioID: radio.ID,
                userName: selectedUser?.name,
                date: new Date().toISOString(),
            })),
        ]);
    };

    const handleCheckout = async (radioID: string) => {
        const newRadio = availableRadios.find((radio) => radio.ID === radioID);
        if (newRadio && selectedUser) {
            // Update local state
            setRadiosCheckedOut((prevRadios) => [...prevRadios, newRadio]);
            setCheckoutLog((prevLog) => [
                ...prevLog,
                {
                    operation: 'check-out',
                    radioID: newRadio.ID,
                    userName: selectedUser.name,
                    date: new Date().toISOString(),
                },
            ]);

            // Update backend
            await fetch('/api/admin/radios', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ID: radioID,
                    checked_out_user: selectedUser.id,
                    checkout_date: new Date().toISOString(),
                }),
            });

            // Remove radio from available radios after checkout
            setAvailableRadios((prevRadios) => prevRadios.filter((radio) => radio.ID !== radioID));
        }
    };

    const handleCheckInThenCheckout = async (radioID: string) => {
        const radio = radiosCheckedOut.find((r) => r.ID === radioID);
        if (radio) {
            await handleCheckIn(radio); // Check the radio back in
            await handleCheckout(radioID); // Check it out to the same or new user
        }
    };

    const isAlreadyCheckedOut = (radioID: string) => {
        return radiosCheckedOut.some((radio) => radio.ID === radioID);
    };

    if (!selectedUser) {
        return <p>{/*No user selected*/}</p>;
    }

    return (
        <div>
            <h2 className="text-xl font-semibold">Welcome, {selectedUser.name}!</h2>

            {/* Radios checked out to the user */}
            <RadioList
                radios={radiosCheckedOut}
                onCheckIn={handleCheckIn}
                onCheckInAll={handleCheckInAll}
            />

            {/* Checkout new radios */}
            <div className="mt-6">
                <RadioCheckout
                    onCheckout={handleCheckout}
                    onCheckInThenCheckout={handleCheckInThenCheckout}
                    isAlreadyCheckedOut={isAlreadyCheckedOut}
                    resetTrigger={selectedUser.id} // Pass user.id to reset RadioCheckout on user change
                />
            </div>

            {/* Checkout Log */}
            <div className="mt-6">
                <CheckoutLog initialLogs={checkoutLog} />
            </div>
        </div>
    );
};

export default UserRadioCheckoutDetails;
