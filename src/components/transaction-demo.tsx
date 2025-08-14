
'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Users, Shield, CheckCircle, AlertCircle, Clock, Lock, Eye, Download, RefreshCw, Search, Info, XCircle, ChevronRight, Send } from 'lucide-react';
import type { Document } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import SignatureUpload from './signature-pad';

const ROLES = [
  'Finance Manager',
  'CFO',
  'Auditor'
];

type AuditEntry = {
    id: number;
    timestamp: string;
    action: string;
    details: string;
    user: string;
    ipAddress: string;
    status: string;
}

interface TransactionDemoProps {
    document: Document | undefined;
    onSignDocument: (documentId: string, signature: string) => Promise<boolean | undefined>;
}

type StepStatus = 'pending' | 'in-progress' | 'completed' | 'error';

const TransactionDemo = ({ document, onSignDocument }: TransactionDemoProps) => {
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(['completed', 'pending', 'pending', 'pending', 'pending', 'pending']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);


  const steps = [
    { id: 'upload', name: 'Document Upload', icon: FileText },
    { id: 'mfa', name: 'MFA Authentication', icon: Shield },
    { id: 'approval', name: 'Approval Routing', icon: Users },
    { id: 'notify', name: 'Notify Approver', icon: Send },
    { id: 'signature', name: 'PKI Digital Signature', icon: Lock },
    { id: 'storage', name: 'Secure Storage', icon: CheckCircle }
  ];

  const addAuditEntry = (action: string, details: string, status: 'Success' | 'Failure' = 'Success') => {
    const timestamp = new Date().toLocaleString();
    setAuditTrail(prev => [{
      id: Date.now() + Math.random(),
      timestamp,
      action,
      details,
      user: `${selectedRole}`,
      ipAddress: '10.0.0.45',
      status,
    }, ...prev]);
  };

  const initializeAuditTrail = () => {
    setAuditTrail([]);
    const details = document 
        ? `${document.title} uploaded - ID: ${document.id.substring(0, 8)}`
        : 'Awaiting document selection.';
    addAuditEntry('Document Upload', details);
  }

  useEffect(() => {
    handleRestart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document?.id]);

  useEffect(() => {
    if (document?.isSharedForSignature && stepStatuses[1] === 'pending') {
        setStepStatuses(prev => {
            const newStatuses = [...prev];
            newStatuses[1] = 'in-progress';
            return newStatuses;
        });
        addAuditEntry('Document Shared', `Document routed for signature by Finance Manager`);
    }

    if (document?.isSigned) {
        setStepStatuses(prev => {
            const newStatuses = [...prev];
            if (newStatuses[4] === 'in-progress' || newStatuses[4] === 'completed') newStatuses[4] = 'completed';
            if (newStatuses[5] !== 'completed') newStatuses[5] = 'completed';
            return newStatuses;
        });
        if (!auditTrail.some(e => e.action === 'Document Storage')) {
            addAuditEntry('Document Storage', 'Signed document archived in SharePoint with immutable hash');
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document?.isSigned, document?.isSharedForSignature]);

  const simulateMFA = () => {
    setIsProcessing(true);
    setMfaError('');
    setStepStatuses(prev => {
        const newStatuses = [...prev];
        newStatuses[1] = 'in-progress';
        return newStatuses;
    });
    setTimeout(() => {
      if (mfaCode === '123456') {
        setStepStatuses(['completed', 'completed', 'in-progress', 'pending', 'pending', 'pending']);
        addAuditEntry('MFA Authentication', 'SMS OTP verified successfully');
      } else {
        setMfaError('Incorrect MFA code. Please try again.');
        addAuditEntry('MFA Authentication', 'Failed MFA attempt', 'Failure');
        setStepStatuses(prev => {
            const newStatuses = [...prev];
            newStatuses[1] = 'error';
            return newStatuses;
        });
      }
      setIsProcessing(false);
    }, 1500);
  };

  const simulateApproval = () => {
    setIsProcessing(true);
    setStepStatuses(['completed', 'completed', 'in-progress', 'pending', 'pending', 'pending']);
    setTimeout(() => {
      addAuditEntry('Approval Routing', 'Document routed to CFO for approval');
      setStepStatuses(['completed', 'completed', 'completed', 'in-progress', 'pending', 'pending']);
      setTimeout(() => {
        addAuditEntry('Notify Approver', 'Email notification sent to CFO');
        setStepStatuses(['completed', 'completed', 'completed', 'completed', 'in-progress', 'pending']);
        setIsProcessing(false);
      }, 1500);
    }, 1000);
  };

  const handlePKISigning = async (signature: string) => {
    if (!document) return;
    setIsSignDialogOpen(false);
    setIsProcessing(true);
    const success = await onSignDocument(document.id, signature);
    if (success) {
      addAuditEntry('PKI Signature', 'Document signed with government-qualified certificate');
    } else {
      addAuditEntry('PKI Signature', 'Failed to apply signature', 'Failure');
      setStepStatuses(prev => {
        const newStatuses = [...prev];
        newStatuses[4] = 'error';
        return newStatuses;
      });
    }
    setIsProcessing(false);
  };


  const handleRestart = () => {
    setIsProcessing(false);
    setMfaCode('');
    setMfaError('');
    setSearchTerm('');
    initializeAuditTrail();
    if(document?.isSigned) {
        setStepStatuses(['completed', 'completed', 'completed', 'completed', 'completed', 'completed']);
    } else if (document?.isSharedForSignature) {
        setStepStatuses(['completed', 'in-progress', 'pending', 'pending', 'pending', 'pending']);
    }
    else {
        setStepStatuses(['completed', 'pending', 'pending', 'pending', 'pending', 'pending']);
    }
  };

  const handleDownload = () => {
    if (!document) return;
    const link = window.document.createElement('a');
    link.href = document.documentDataUri;
    link.download = document.isSigned ? `${document.fileName.split('.')[0]}_signed.pdf` : document.fileName;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    addAuditEntry('Download', 'User downloaded the signed document');
  };

  const filteredAuditTrail = auditTrail.filter(entry =>
    entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    const currentStepIndex = stepStatuses.indexOf('in-progress');
    const allStepsCompleted = stepStatuses.every(s => s === 'completed');

    if (currentStepIndex === 1) { // MFA Authentication
        return (
            <div className="space-y-2">
            <p className="text-muted-foreground">Enter MFA code to proceed with authentication:</p>
            <div className="flex gap-2">
                <Input
                type="text"
                placeholder="Enter 123456"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                />
                <Button
                onClick={simulateMFA}
                disabled={isProcessing || !mfaCode}
                >
                {isProcessing ? 'Verifying...' : 'Verify MFA'}
                </Button>
            </div>
            {mfaError && (
                <p className="mt-2 text-sm text-destructive flex items-center gap-2">
                <AlertCircle size={16} />
                {mfaError}
                </p>
            )}
            </div>
        );
    }

    if (currentStepIndex === 2) { // Approval Routing
        return (
            <div>
            <p className="mb-4 text-muted-foreground">Initiate approval workflow:</p>
            <Button
                onClick={simulateApproval}
                disabled={isProcessing}
            >
                {isProcessing ? 'Routing...' : 'Send for Approval'}
            </Button>
            </div>
        );
    }
    
    if (currentStepIndex === 4) { // PKI Signature
        return (
            <Dialog open={isSignDialogOpen} onOpenChange={setIsSignDialogOpen}>
                <DialogTrigger asChild>
                     <Button
                        disabled={isProcessing || document?.isSigned}
                    >
                        {isProcessing ? 'Signing...' : document?.isSigned ? 'Document Signed' : 'Apply Digital Signature'}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Your Signature</DialogTitle>
                    </DialogHeader>
                    <SignatureUpload onSave={handlePKISigning} />
                </DialogContent>
            </Dialog>
        );
    }
    
    if (allStepsCompleted && document?.isSigned) {
        return (
            <div className="text-center space-y-4">
            <CheckCircle className="mx-auto text-green-500" size={48} />
            <h3 className="text-xl font-semibold text-foreground">
                Document Successfully Processed!
            </h3>
            <p className="text-muted-foreground">
                The document has been digitally signed and securely stored with full audit trail.
            </p>
            <Button
                onClick={handleDownload}
                variant="outline"
            >
                <Download />
                Download Signed Document
            </Button>
            </div>
        );
    }

    // Default state when no step is in-progress
    return (
        <div className="text-center text-muted-foreground p-4">
            <Info className="mx-auto mb-2" />
            <p>The workflow is awaiting the next action.</p>
            <p className="text-sm">This may be triggered from another part of the application (e.g. sharing a document).</p>
        </div>
    );
  };


  if (!document) {
    return renderNoDocumentState();
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="role-select" className="font-semibold text-foreground">Select Role:</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger id="role-select" className="w-[180px]">
                    <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                    {ROLES.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <Button
                onClick={handleRestart}
                variant="outline"
              >
                <RefreshCw />
                Restart Demo
              </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
                        const status = stepStatuses[index];
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

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Eye className="mr-3 text-primary" />
                    Live Audit Trail
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex items-center gap-2">
                <Search className="text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search trail..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-1"
                />
                </div>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredAuditTrail.map((entry) => (
                    <div key={entry.id} className="p-3 bg-muted/50 rounded-lg border-l-4 border-primary/50 text-sm">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-foreground">{entry.action}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            entry.status === 'Success' ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'
                        }`}>
                        {entry.status}
                        </span>
                    </div>
                    <p className="text-muted-foreground mb-1">{entry.details}</p>
                    <div className="text-xs text-muted-foreground/80 flex items-center justify-between">
                        <span>User: {entry.user}</span>
                        <span>{entry.timestamp}</span>
                    </div>
                    </div>
                ))}
                {filteredAuditTrail.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                    <Info className="mx-auto mb-2" />
                    No audit entries found.
                    </div>
                )}
                </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
};

export default TransactionDemo;
