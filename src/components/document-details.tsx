
'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Document } from '@/lib/types';
import { ShieldCheck, Info, Pencil, Download, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import SignatureUpload from './signature-pad';

interface DocumentDetailsProps {
  document: Document | undefined;
  onSign: (documentId: string, signatureDataUrl: string) => Promise<void>;
  isLoading: boolean;
}

export default function DocumentDetails({ document, onSign, isLoading }: DocumentDetailsProps) {
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

  const handleSaveSignature = async (signatureDataUrl: string) => {
    await onSign(document.id, signatureDataUrl);
    setIsSigning(false);
  }

  const handleDownload = () => {
    const link = window.document.createElement("a");
    link.href = document.documentDataUri;
    link.download = document.fileName;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
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
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Compliance & Status</h4>
           <div className="flex flex-wrap gap-2">
            <Badge variant={isCompliant ? "default" : "destructive"} className={isCompliant ? "bg-green-600 hover:bg-green-700 text-white" : ""}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                {isCompliant ? 'Compliant' : 'Non-Compliant'}
            </Badge>
            {document.isSigned && (
                 <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Signed
                 </Badge>
            )}
           </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
         <Dialog open={isSigning} onOpenChange={setIsSigning}>
            <DialogTrigger asChild>
                <Button disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pencil className="mr-2 h-4 w-4" />}
                    {document.isSigned ? 'Re-Sign Document' : 'Sign Document'}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload Signature</DialogTitle>
                </DialogHeader>
                <SignatureUpload onSave={handleSaveSignature} />
            </DialogContent>
        </Dialog>
        <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
        </Button>
      </CardFooter>
    </Card>
  );
}
