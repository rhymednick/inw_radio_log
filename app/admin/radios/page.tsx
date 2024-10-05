// app/admin/radios/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import RadioCard from '@/components/radio-card';
import AddRadioDialog from '@/components/add-radio-dialog';
import { Radio, User } from '@/types/types';
import { getRadios, updateRadio, deleteRadio, addRadio, getUsers } from '@/lib/api'; // Import getUsers helper function
import React from 'react';

const defaultInventory = Array.from({ length: 64 }, (_, i) => ({
    ID: (i + 1).toString(),
    Name: 'ICOM',
    Comments: '',
    PartiallyDamaged: false,
    Nonfunctional: false,
}));

const RadiosPage: React.FC = () => {
    const [radios, setRadios] = useState<Radio[]>([]);
    const [users, setUsers] = useState<User[]>([]); // State for users
    const [isLoading, setIsLoading] = useState(false);

    // Fetch radios and users using helper functions
    useEffect(() => {
        const fetchRadiosAndUsers = async () => {
            setIsLoading(true);

            // Fetch radios
            const radiosData = (await getRadios()) as Radio[];
            if (radiosData) {
                // Sort radios by ID (numerically if possible)
                const sortedRadios = radiosData.sort((a: Radio, b: Radio) => parseInt(a.ID) - parseInt(b.ID));
                setRadios(sortedRadios);
            }

            // Fetch users
            const usersData = await getUsers();
            if (usersData) {
                setUsers(usersData);
            }

            setIsLoading(false);
        };

        fetchRadiosAndUsers();
    }, []);

    useEffect(() => {
        console.log(
            'Current radios:',
            radios.map((radio) => radio.ID)
        );
    }, [radios]);

    // Callback to refresh a single radio's data
    const handleRefreshRadio = async (ID: string) => {
        const updatedRadio = (await getRadios({ radioID: ID })) as Radio;
        if (updatedRadio) {
            setRadios((prevRadios) => {
                return prevRadios.map((radio) => {
                    if (radio.ID === ID) {
                        return {
                            ...radio,
                            Comments: updatedRadio.Comments,
                            PartiallyDamaged: updatedRadio.PartiallyDamaged,
                            Nonfunctional: updatedRadio.Nonfunctional,
                            checked_out_user: updatedRadio.checked_out_user,
                            checkout_date: updatedRadio.checkout_date,
                        };
                    }
                    return radio;
                });
            });
        }
    };

    // Delete a radio using the deleteRadio helper function
    const handleDeleteRadio = async (ID: string) => {
        await deleteRadio(ID); // Using the deleteRadio helper
        setRadios(radios.filter((radio) => radio.ID !== ID));
    };

    // Add a new radio using the addRadio helper function
    const handleAddNewRadio = async (ID: string, Name: string) => {
        await addRadio(ID, Name); // Using the addRadio helper

        // Add the new radio, then sort by ID
        const updatedRadios = [...radios, { ID, Name, Comments: '', PartiallyDamaged: false, Nonfunctional: false }];
        const sortedRadios = updatedRadios.sort((a: Radio, b: Radio) => parseInt(a.ID) - parseInt(b.ID));

        setRadios(sortedRadios);
    };

    // Initialize the radios with the default inventory using the addRadio helper
    const handleInitializeInventory = async () => {
        setRadios(defaultInventory);
        await Promise.all(
            defaultInventory.map(
                (radio) => addRadio(radio.ID, radio.Name) // Using the addRadio helper
            )
        );
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Radio Management</h1>

            {isLoading ? (
                <p>Loading...</p>
            ) : radios.length === 0 ? (
                <div>
                    <p>No radios found.</p>
                    <Button onClick={handleInitializeInventory}>Initialize Default Inventory</Button>
                </div>
            ) : (
                <>
                    <AddRadioDialog onAddRadio={handleAddNewRadio} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {radios.map((radio) => (
                            <RadioCard
                                key={radio.ID} // Unique key based on the radio's ID
                                radio={radio}
                                users={users}
                                onDelete={handleDeleteRadio}
                                onRefresh={handleRefreshRadio}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default RadiosPage;
