// components/radio-list.tsx

'use client'; // Client-side interactivity required

import React from 'react';
import { Radio } from '@/types/types'; // Assuming we are importing Radio type
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'; // TooltipProvider and Tooltip from shadcn
import { SquareX } from 'lucide-react'; // SquareX icon from Lucide React
import { Button } from '@/components/ui/button';

interface RadioListProps {
    radios: Radio[];
    onCheckIn: (radio: Radio) => void;
    onCheckInAll: () => void;
}

export const columns = (onCheckIn: (radio: Radio) => void, onCheckInAll: () => void): ColumnDef<Radio>[] => [
    {
        header: 'ID',
        accessorKey: 'ID',
        cell: ({ row }) => {
            const radioId = row.original.ID;
            return <span className="font-bold text-center w-full block">{radioId}</span>; // Center ID
        },
        size: 100, // Fixed size for ID column
    },
    {
        header: 'Description',
        accessorKey: 'Name',
        cell: ({ row }) => {
            const description = row.original.Name;
            return <span>{description}</span>;
        },
        size: -1,
    },
    {
        header: 'Duration',
        accessorKey: 'checkout_date',
        cell: ({ row }) => {
            const checkoutDate = row.original.checkout_date ? new Date(row.original.checkout_date) : null;
            const currentTime = new Date();
            if (checkoutDate) {
                const hoursCheckedOut = (currentTime.getTime() - checkoutDate.getTime()) / (1000 * 60 * 60);
                return <span>{hoursCheckedOut.toFixed(1)} hrs</span>; // Show hours to one decimal place
            } else {
                return <span>Not Available</span>; // Fallback for undefined or null date
            }
        },
        size: 100, // Fixed size for the duration column
    },
    {
        header: () => (
            <div className="flex justify-center">
                <Button
                    onClick={onCheckInAll}
                    className="text-sm mt-1 mb-1 p-3 bg-slate-300"
                    variant="outline"
                >
                    Return All
                </Button>
            </div>
        ), // Button in the header
        id: 'actions',
        cell: ({ row }) => {
            const radio = row.original;
            return (
                <div className="flex justify-center">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <SquareX
                                    className="text-red-500 cursor-pointer"
                                    onClick={() => onCheckIn(radio)}
                                    size={24} // Set the size of the icon
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <span>Check in radio</span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            );
        },
        size: 100, // Fixed size for the actions column (icon column)
    },
];

const RadioList: React.FC<RadioListProps> = ({ radios, onCheckIn, onCheckInAll }) => {
    return (
        <div className="radio-list">
            {radios.length > 0 ? (
                <>
                    <h3 className="text-lg font-bold mb-4 mt-2">Radios Currently Checked Out</h3>
                    <DataTable
                        columns={columns(onCheckIn, onCheckInAll)} // Pass both onCheckIn and onCheckInAll
                        data={radios}
                    />
                </>
            ) : (
                <p>No radios currently checked out.</p>
            )}
        </div>
    );
};

export default RadioList;
