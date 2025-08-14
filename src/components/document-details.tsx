'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Document } from '@/lib/types';
import { ShieldCheck, Info, Pencil } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import SignaturePad from './signature-pad';

interface DocumentDetailsProps {
  document: Document | undefined;
  onSign: (documentId: string, signatureDataUrl: string) => void;
}

export default function DocumentDetails({ document, onSign }: DocumentDetailsProps) {
  const [isSigning, setIsSigning] = useState(false);

  if (!document) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center p-6">
          <Info className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No Document Selected</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a new document or select one from the list to see its details.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSaveSignature = (signatureDataUrl: string) => {
    onSign(document.id, signatureDataUrl);
    setIsSigning(false);
  }

  const isCompliant = !!document.title && !!document.summary;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="truncate">{document.title}</CardTitle>
        <CardDescription>By {document.author || 'Unknown Author'} on {document.dateCreated || 'Unknown Date'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex-1">
        <div>
          <h4 className="font-semibold text-foreground mb-2">Summary</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{document.summary}</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {document.keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary">{keyword}</Badge>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">Compliance Check</h4>
           <Badge variant={isCompliant ? "default" : "destructive"} className="bg-green-600 hover:bg-green-700 text-white">
              <ShieldCheck className="mr-2 h-4 w-4" />
              {isCompliant ? 'Compliant' : 'Non-Compliant'}
            </Badge>
        </div>
        {document.signatureDataUrl && (
          <div>
            <h4 className="font-semibold text-foreground mb-2">Signature</h4>
            <div className="border rounded-md p-2 bg-muted/50 max-w-sm">
              <img src={document.signatureDataUrl} alt="Signature" className="w-full h-auto" />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
         <Dialog open={isSigning} onOpenChange={setIsSigning}>
            <DialogTrigger asChild>
                <Button>
                    <Pencil className="mr-2 h-4 w-4" />
                    {document.signatureDataUrl ? 'Re-Sign Document' : 'Sign Document'}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sign Document</DialogTitle>
                </DialogHeader>
                <SignaturePad onSave={handleSaveSignature} />
            </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
