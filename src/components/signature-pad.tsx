
'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { Upload, XCircle, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface SignatureUploadProps {
    onSave: (signature: string) => void;
}

export default function SignatureUpload({ onSave }: SignatureUploadProps) {
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setSignatureFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setSignaturePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/png': ['.png'],
        },
        multiple: false,
    });

    const handleSave = () => {
        if (signaturePreview) {
            onSave(signaturePreview);
        }
    };

    const handleClear = () => {
        setSignatureFile(null);
        setSignaturePreview(null);
    }

    return (
        <div className="flex flex-col gap-4">
            {signaturePreview ? (
                 <div className="relative border rounded-lg p-4 flex justify-center items-center h-48 bg-muted/50">
                    <Image src={signaturePreview} alt="Signature preview" layout="fill" objectFit="contain" />
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={handleClear}>
                        <XCircle className="h-5 w-5" />
                    </Button>
                </div>
            ) : (
                <div
                    {...getRootProps()}
                    className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors h-48 ${
                        isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}
                >
                    <input {...getInputProps()} />
                     <div className="text-center">
                        <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                            {isDragActive ? 'Drop the file here...' : "Drag 'n' drop signature file, or click to select"}
                        </p>
                        <p className="text-xs text-muted-foreground/80">PNG file only</p>
                    </div>
                </div>
            )}
           
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClear} disabled={!signatureFile}>Clear</Button>
                <Button onClick={handleSave} disabled={!signatureFile}>Save Signature</Button>
            </div>
        </div>
    );
}
