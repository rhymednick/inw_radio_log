// File: /app/admin/radios/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import RadioCard from '@/components/radio-card';
import AddRadioDialog from '@/components/add-radio-dialog';
import { Radio } from '@/types/types';

const defaultInventory = Array.from({ length: 64 }, (_, i) => ({
    ID: (i + 1).toString(),
    Name: 'ICOM',
    Comments: '',
    PartiallyDamaged: false,
    Nonfunctional: false,
}));

const RadiosPage: React.FC = () => {
    const [radios, setRadios] = useState<Radio[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [changedRadios, setChangedRadios] = useState<Set<string>>(new Set());

    // Fetch radios from the API
    useEffect(() => {
        const fetchRadios = async () => {
            setIsLoading(true);

            const radiosResponse = await fetch('/api/admin/radios');
            const radiosData = await radiosResponse.json();

            // Sort radios by ID (numerically if possible)
            const sortedRadios = radiosData.sort((a: Radio, b: Radio) => parseInt(a.ID) - parseInt(b.ID));

            setRadios(sortedRadios.length ? sortedRadios : []);
            setIsLoading(false);
        };

        fetchRadios();
    }, []);

    // Handle changes to radio fields and update the state
    const handleFieldChange = (ID: string, field: keyof Radio, value: any) => {
        const updatedRadios = radios.map((radio) =>
            radio.ID === ID
                ? {
                      ...radio,
                      [field]: value,
                      // If Nonfunctional is checked, ensure PartiallyDamaged is false
                      ...(field === 'Nonfunctional' && value ? { PartiallyDamaged: false } : {}),
                  }
                : radio
        );
        setRadios(updatedRadios);
        setChangedRadios((prev) => {
            const updated = new Set(prev);
            updated.add(ID);
            return updated;
        });
    };

    const handleSaveChanges = async (ID: string) => {
        const radio = radios.find((r) => r.ID === ID);
        if (!radio) return;

        await fetch('/api/admin/radios', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ID: radio.ID,
                Comments: radio.Comments,
                PartiallyDamaged: radio.PartiallyDamaged,
                Nonfunctional: radio.Nonfunctional,
                checked_out_user: radio.checked_out_user,
                checkout_date: radio.checkout_date,
            }),
        });

        setChangedRadios((prev) => {
            const updated = new Set(prev);
            updated.delete(ID);
            return updated;
        });
    };

    const handleDeleteRadio = async (ID: string) => {
        await fetch('/api/admin/radios', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ID }),
        });
        setRadios(radios.filter((radio) => radio.ID !== ID));
    };

    const handleAddNewRadio = async (ID: string, Name: string) => {
        await fetch('/api/admin/radios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ID, Name }),
        });

        // Add the new radio, then sort by ID
        const updatedRadios = [...radios, { ID, Name, Comments: '', PartiallyDamaged: false, Nonfunctional: false }];
        const sortedRadios = updatedRadios.sort((a: Radio, b: Radio) => parseInt(a.ID) - parseInt(b.ID));

        setRadios(sortedRadios);
    };

    // Initialize the radios with the default inventory
    const handleInitializeInventory = async () => {
        setRadios(defaultInventory);
        await Promise.all(
            defaultInventory.map((radio) =>
                fetch('/api/admin/radios', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(radio),
                })
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
                                key={radio.ID}
                                radio={radio}
                                onFieldChange={handleFieldChange}
                                onSave={handleSaveChanges}
                                onDelete={handleDeleteRadio}
                                isChanged={changedRadios.has(radio.ID)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default RadiosPage;
