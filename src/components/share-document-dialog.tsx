
'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { X, PlusCircle } from 'lucide-react';
import { Label } from './ui/label';
import { DialogFooter, DialogClose } from './ui/dialog';


interface ShareDocumentDialogProps {
    onShare: (recipients: string[], message: string) => void;
}

export default function ShareDocumentDialog({ onShare }: ShareDocumentDialogProps) {
    const [recipients, setRecipients] = useState<string[]>(['']);
    const [message, setMessage] = useState('');

    const handleRecipientChange = (index: number, value: string) => {
        const newRecipients = [...recipients];
        newRecipients[index] = value;
        setRecipients(newRecipients);
    };

    const addRecipient = () => {
        setRecipients([...recipients, '']);
    };

    const removeRecipient = (index: number) => {
        if (recipients.length > 1) {
            setRecipients(recipients.filter((_, i) => i !== index));
        }
    };

    const handleShareClick = () => {
        const validRecipients = recipients.filter(r => r.trim() !== '');
        if (validRecipients.length > 0) {
            onShare(validRecipients, message);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="space-y-2">
                <Label htmlFor="recipients">Recipients</Label>
                <div className="space-y-2">
                    {recipients.map((recipient, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                type="email"
                                placeholder="recipient@example.com"
                                value={recipient}
                                onChange={(e) => handleRecipientChange(index, e.target.value)}
                            />
                            {recipients.length > 1 && (
                                <Button variant="ghost" size="icon" onClick={() => removeRecipient(index)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
                <Button variant="outline" size="sm" onClick={addRecipient}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Recipient
                </Button>
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                    id="message"
                    placeholder="Add a message for the recipients..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
            </div>
            
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button onClick={handleShareClick} disabled={recipients.every(r => r.trim() === '')}>Send</Button>
                </DialogClose>
            </DialogFooter>
        </div>
    );
}
