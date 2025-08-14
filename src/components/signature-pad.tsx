'use client';

import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from './ui/button';

interface SignaturePadProps {
    onSave: (signature: string) => void;
}

export default function SignaturePad({ onSave }: SignaturePadProps) {
    const sigCanvas = useRef<SignatureCanvas>(null);

    const clear = () => {
        sigCanvas.current?.clear();
    };

    const save = () => {
        if (sigCanvas.current) {
            const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
            onSave(dataUrl);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="border rounded-lg bg-background">
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{ className: 'w-full h-48 rounded-lg' }}
                />
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={clear}>Clear</Button>
                <Button onClick={save}>Save Signature</Button>
            </div>
        </div>
    );
}
