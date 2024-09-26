// File: /components/add-radio-dialog.tsx

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

interface AddRadioDialogProps {
    onAddRadio: (ID: string, Name: string) => void;
}

const AddRadioDialog: React.FC<AddRadioDialogProps> = ({ onAddRadio }) => {
    const [newRadio, setNewRadio] = useState({ ID: '', Name: '' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleAddNewRadio = () => {
        if (!newRadio.ID || !newRadio.Name) {
            alert('Both ID and Name are required to add a new radio.');
            return;
        }
        onAddRadio(newRadio.ID, newRadio.Name);
        setNewRadio({ ID: '', Name: '' });
        setIsDialogOpen(false); // Close the dialog
    };

    return (
        <Dialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
        >
            <DialogTrigger asChild>
                <Button className="mb-6">Add New Radio</Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
                <DialogHeader>
                    <DialogTitle>Add New Radio</DialogTitle>
                    <DialogDescription>Enter the ID and Name of the new radio.</DialogDescription>
                </DialogHeader>
                <Input
                    placeholder="ID"
                    value={newRadio.ID}
                    onChange={(e) => setNewRadio({ ...newRadio, ID: e.target.value })}
                    className="mb-4"
                />
                <Input
                    placeholder="Name"
                    value={newRadio.Name}
                    onChange={(e) => setNewRadio({ ...newRadio, Name: e.target.value })}
                />
                <DialogFooter>
                    <Button onClick={handleAddNewRadio}>Add Radio</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddRadioDialog;
