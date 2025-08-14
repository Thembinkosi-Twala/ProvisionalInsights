
'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Users, Shield, CheckCircle, AlertCircle, Clock, Lock, Eye, Download, RefreshCw, Search, Info, XCircle, ChevronRight, Send, Loader2, History, FileUp, Share2 } from 'lucide-react';
import type { Document } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import SignatureUpload from './signature-pad';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

type Step = {
    id: string;
    name: string;
    icon: React.ElementType;
    getStatus: (doc: Document) => StepStatus;
}

type StepStatus = 'pending' | 'in-progress' | 'completed' | 'error';

interface TransactionDemoProps {
    document: Document | undefined;
    onSignDocument: (documentId: string, signature: string) => Promise<boolean | undefined>;
    onShareDocument: (documentId: string) => void;
    userRole: string | null;
    isLoading: boolean;
}

const TransactionDemo = ({ document, onSignDocument, onShareDocument, userRole, isLoading }: TransactionDemoProps) => {
    const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);
    const { toast } = useToast();

    const steps: Step[] = [
        { id: 'upload', name: 'Document Upload', icon: FileText, getStatus: (doc) => doc ? 'completed' : 'pending' },
        { id: 'routing', name: 'Approval Routing', icon: Users, getStatus: (doc) => doc.isSharedForSignature ? 'completed' : doc ? 'in-progress' : 'pending' },
        { id: 'signature', name: 'PKI Digital Signature', icon: Lock, getStatus: (doc) => doc.isSigned ? 'completed' : doc.isSharedForSignature ? 'in-progress' : 'pending' },
        { id: 'storage', name: 'Secure Storage', icon: CheckCircle, getStatus: (doc) => doc.isSigned ? 'completed' : 'pending' },
        { id: 'audit', name: 'Immutable Audit Trail', icon: History, getStatus: (doc) => doc.isSigned ? 'completed' : 'pending' }
    ];

    const handlePKISigning = async (signature: string) => {
        if (!document) return;
        setIsSignDialogOpen(false);
        const success = await onSignDocument(document.id, signature);
        if (success) {
            toast({
                title: 'Signature Successful',
                description: 'Document has been signed and archived.',
            });
        }
    };

    const handleShare = () => {
        if (document) {
            onShareDocument(document.id);
        }
    }

    const handleDownload = () => {
        if (!document) return;
        const link = window.document.createElement('a');
        link.href = document.documentDataUri;
        link.download = document.isSigned ? `${document.fileName.split('.')[0]}_signed.pdf` : document.fileName;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        toast({
            title: 'Download Started',
            description: 'Your file is downloading.',
        })
    };

    const renderNoDocumentState = () => (
        <Card className="h-full flex flex-col items-center justify-center text-center">
            <Info className="h-12 w-12 text-muted-foreground" />
            <CardHeader>
                <CardTitle>No Document Selected for Demo</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Please select a document from the list to start the transaction demo.</p>
            </CardContent>
        </Card>
    );

    const renderControls = () => {
        if (!document) return null;

        const allStepsCompleted = steps.every(step => step.getStatus(document!) === 'completed');

        if (allStepsCompleted) {
            return (
                <div className="text-center space-y-4">
                    <CheckCircle className="mx-auto text-green-500" size={48} />
                    <h3 className="text-xl font-semibold text-foreground">
                        Document Successfully Processed!
                    </h3>
                    <p className="text-muted-foreground">
                        The document has been digitally signed and securely stored.
                    </p>
                    <Button
                        onClick={handleDownload}
                        variant="outline"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Download Signed Document
                    </Button>
                </div>
            );
        }

        const canShare = userRole === 'Uploader' && !document.isSharedForSignature;
        if (canShare) {
            return (
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">The document is ready to be sent for approval.</p>
                     <Button
                        onClick={handleShare}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Share for Signature
                    </Button>
                </div>
            )
        }
        
        const canSign = userRole === 'Approver' && document.isSharedForSignature && !document.isSigned;
        if (canSign) {
            return (
                 <div className="text-center">
                    <p className="text-muted-foreground mb-4">The document is awaiting your signature.</p>
                    <Dialog open={isSignDialogOpen} onOpenChange={setIsSignDialogOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                                Apply Digital Signature
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Your Signature</DialogTitle>
                            </DialogHeader>
                            <SignatureUpload onSave={handlePKISigning} />
                        </DialogContent>
                    </Dialog>
                </div>
            );
        }

        return (
            <div className="text-center text-muted-foreground p-4 bg-muted/50 rounded-lg">
                <Info className="mx-auto mb-2" />
                <p>The workflow is awaiting the next action.</p>
                <p className="text-sm">
                    {userRole === 'Uploader' && 'Waiting for the approver to sign.'}
                    {userRole === 'Approver' && 'This document is not yet ready for your action.'}
                </p>
            </div>
        );
    };

     const renderAuditTrail = () => {
        if (!document) return null;

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
                {trail.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <item.icon className="h-4 w-4" />
                            </div>
                            {index < trail.length - 1 && <div className="w-px h-8 bg-border" />}
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{item.text}</p>
                            <p className="text-sm text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (!document) {
        return renderNoDocumentState();
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Clock className="mr-3 text-primary" />
                            Workflow Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto pb-4">
                        <div className="flex items-center gap-2">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const status = step.getStatus(document);
                                const statusStyles = {
                                    'pending': { border: 'border-border', bg: 'bg-muted/50', iconBg: 'bg-muted-foreground/20', iconText: 'text-muted-foreground' },
                                    'in-progress': { border: 'border-primary', bg: 'bg-primary/10', iconBg: 'bg-primary', iconText: 'text-primary-foreground' },
                                    'completed': { border: 'border-green-500', bg: 'bg-green-500/10', iconBg: 'bg-green-500', iconText: 'text-white' },
                                    'error': { border: 'border-destructive', bg: 'bg-destructive/10', iconBg: 'bg-destructive', iconText: 'text-destructive-foreground' },
                                };

                                return (
                                    <React.Fragment key={step.id}>
                                        <div className={`flex items-center p-3 rounded-lg border-2 transition-all w-48 flex-shrink-0 ${statusStyles[status].border} ${statusStyles[status].bg}`}>
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 flex-shrink-0 ${statusStyles[status].iconBg} ${statusStyles[status].iconText}`}>
                                                {status === 'error' ? <XCircle size={18} /> : <Icon size={18} />}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <h3 className="font-semibold text-sm truncate">{step.name}</h3>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {status.replace('-', ' ')}
                                                </p>
                                            </div>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <ChevronRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Interactive Demo Controls</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {renderControls()}
                    </CardContent>
                </Card>
            </div>
            <div className="xl:col-span-1">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History />
                            Immutable Audit Trail
                        </CardTitle>
                        <CardDescription>
                            A permanent, secure log of all actions taken on this document.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {renderAuditTrail()}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TransactionDemo;

    