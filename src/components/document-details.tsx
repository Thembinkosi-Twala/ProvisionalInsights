
'use client';

import React from 'react';
import type { Document } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Share2, Loader2, ShieldCheck, Signature, History, Landmark, BarChart2, FileUp, Lock } from 'lucide-react';
import ComplianceCheck from './compliance-check';
import { Button } from './ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from '@/components/ui/dialog';
import ShareDocumentDialog from './share-document-dialog';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

interface DocumentDetailsProps {
  document: Document | undefined;
  onShare: (documentId: string) => void;
  isLoading: boolean;
  userRole: string | null;
}

export default function DocumentDetails({ document, onShare, isLoading, userRole }: DocumentDetailsProps) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = React.useState(false);

  if (!document) {
    return (
        <Card className="h-full flex flex-col items-center justify-center">
            <CardHeader className="text-center">
                <Info className="mx-auto h-12 w-12 text-muted-foreground" />
                <CardTitle>No Document Selected</CardTitle>
                <CardDescription>Upload or select a document to get started.</CardDescription>
            </CardHeader>
            <CardContent className="w-full max-w-md p-6">
                <h3 className="mb-4 text-lg font-medium text-center text-foreground">Key Features</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <span>MFA Authentication</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <Signature className="h-5 w-5 text-primary" />
                        <span>PKI Digital Signatures</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <History className="h-5 w-5 text-primary" />
                        <span>Immutable Audit Trail</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <Share2 className="h-5 w-5 text-primary" />
                        <span>SharePoint Integration</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <Landmark className="h-5 w-5 text-primary" />
                        <span>PFMA Compliance</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <BarChart2 className="h-5 w-5 text-primary" />
                        <span>Real-time Analytics</span>
                    </li>
                </ul>
            </CardContent>
        </Card>
    );
  }

  const handleDownload = () => {
    setIsDownloading(true);
    const link = window.document.createElement('a');
    link.href = document.documentDataUri;
    link.download = document.isSigned ? `${document.fileName.split('.')[0]}_signed.pdf` : document.fileName;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    setIsDownloading(false);
  }

  const handleShareSubmit = (recipients: string[], message: string) => {
    console.log('Sharing with:', recipients, 'Message:', message);
    if(document) {
        onShare(document.id);
    }
  }
  
  const renderAuditTrail = () => {
    const trail = [];
    if (document.createdAt) {
        trail.push({ icon: FileUp, text: 'Document Created by Uploader', timestamp: document.createdAt });
    }
    if (document.sharedAt) {
        trail.push({ icon: Share2, text: 'Shared for Signature by Uploader', timestamp: document.sharedAt });
    }
    if (document.signedAt) {
        trail.push({ icon: Lock, text: 'Digitally Signed by Approver', timestamp: document.signedAt });
    }

    return (
        <div className="space-y-4">
             <h4 className="font-semibold text-foreground">Audit Trail</h4>
            {trail.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <item.icon className="h-4 w-4" />
                        </div>
                        {index < trail.length - 1 && <div className="w-px h-6 bg-border" />}
                    </div>
                    <div>
                        <p className="font-medium text-sm text-foreground">{item.text}</p>
                        <p className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};


  const canShare = !document.isSigned && !document.isSharedForSignature;

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
        <ComplianceCheck document={document} />
        {document.isSigned && (
            <div>
                <Separator className="my-4" />
                {renderAuditTrail()}
            </div>
        )}
      </CardContent>
      <CardFooter className="flex-col sm:flex-row gap-2 items-center">
        <Button onClick={handleDownload} variant="outline" className="w-full sm:w-auto" disabled={isDownloading}>
            {isDownloading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Download
        </Button>
        {canShare && (
            <Dialog>
            <DialogTrigger asChild>
                <Button variant="default" className="w-full sm:w-auto" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Share2 className="mr-2 h-4 w-4" />
                Share for Signature
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share for Signature</DialogTitle>
                </DialogHeader>
                <ShareDocumentDialog onShare={handleShareSubmit} />
            </DialogContent>
            </Dialog>
        )}
        {document.isSharedForSignature && !document.isSigned && (
             <Button variant="outline" className="w-full sm:w-auto" disabled>
                <Share2 className="mr-2 h-4 w-4" />
                Shared for Signature
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}

    
