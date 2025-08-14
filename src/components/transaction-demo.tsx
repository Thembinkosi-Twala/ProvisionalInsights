
'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Users, Shield, CheckCircle, AlertCircle, Clock, Lock, Eye, Download, RefreshCw, Search, Info, Landmark } from 'lucide-react';
import type { Document } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';

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
}

const TransactionDemo = ({ document }: TransactionDemoProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [documentSigned, setDocumentSigned] = useState(false);
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [mfaError, setMfaError] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const steps = [
    { id: 'upload', name: 'Document Upload', icon: FileText },
    { id: 'mfa', name: 'MFA Authentication', icon: Shield },
    { id: 'approval', name: 'Approval Routing', icon: Users },
    { id: 'signature', name: 'PKI Digital Signature', icon: Lock },
    { id: 'storage', name: 'Secure Storage', icon: CheckCircle }
  ];

  const addAuditEntry = (action: string, details: string, status: 'Success' | 'Failure' = 'Success') => {
    const timestamp = new Date().toLocaleString();
    setAuditTrail(prev => [...prev, {
      id: Date.now() + Math.random(),
      timestamp,
      action,
      details,
      user: `${selectedRole}`,
      ipAddress: '10.0.0.45',
      status,
    }]);
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
  }, [document]);

  const simulateMFA = () => {
    setIsProcessing(true);
    setMfaError('');
    setTimeout(() => {
      if (mfaCode === '123456') {
        setCurrentStep(1);
        addAuditEntry('MFA Authentication', 'SMS OTP verified successfully');
      } else {
        setMfaError('Incorrect MFA code. Please try again.');
        addAuditEntry('MFA Authentication', 'Failed MFA attempt', 'Failure');
      }
      setIsProcessing(false);
    }, 1500);
  };

  const simulateApproval = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setCurrentStep(2);
      addAuditEntry('Approval Routing', 'Document routed to CFO for approval');
      setTimeout(() => {
        setCurrentStep(3);
        addAuditEntry('Approval Decision', 'CFO approved document electronically');
        setIsProcessing(false);
      }, 1500);
    }, 1000);
  };

  const simulatePKISigning = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setCurrentStep(4);
      setDocumentSigned(true);
      addAuditEntry('PKI Signature', 'Document signed with government-qualified certificate');
      addAuditEntry('Document Storage', 'Signed document archived in SharePoint with immutable hash');
      setIsProcessing(false);
    }, 2000);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsProcessing(false);
    setMfaCode('');
    setDocumentSigned(false);
    setMfaError('');
    setSearchTerm('');
    initializeAuditTrail();
  };

  const handleDownload = () => {
    const content = document ? `Signed content for ${document.fileName}` : 'Signed Document Content';
    const filename = document ? `signed_${document.fileName}.txt` : 'SignedDocument.txt';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    addAuditEntry('Download', 'User downloaded the signed document');
  };

  const filteredAuditTrail = auditTrail.filter(entry =>
    entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!document) {
    return (
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
                <RefreshCw className="mr-2"/>
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
                <CardContent className="space-y-4">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;
                    
                    return (
                    <div key={step.id} className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                        isActive ? 'border-primary bg-primary/10' : 
                        isCompleted ? 'border-green-500 bg-green-500/10' : 
                        'border-border bg-muted/50'
                    }`}>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full mr-4 ${
                        isCompleted ? 'bg-green-500 text-white' :
                        isActive ? 'bg-primary text-primary-foreground' :
                        'bg-muted-foreground/20 text-muted-foreground'
                        }`}>
                        <Icon size={20} />
                        </div>
                        <div className="flex-1">
                        <h3 className="font-semibold">{step.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Pending'}
                        </p>
                        </div>
                        {isActive && !isProcessing && (
                        <div className="animate-pulse">
                            <div className="w-3 h-3 bg-primary rounded-full"></div>
                        </div>
                        )}
                    </div>
                    );
                })}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Interactive Demo Controls</CardTitle>
                </CardHeader>
                <CardContent>
                {currentStep === 0 && (
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
                )}

                {(currentStep > 0 && currentStep < 3) && (
                    <div>
                    <p className="mb-4 text-muted-foreground">Initiate approval workflow:</p>
                    <Button
                        onClick={simulateApproval}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Routing...' : 'Send for Approval'}
                    </Button>
                    </div>
                )}

                {currentStep === 3 && (
                    <div>
                    <p className="mb-4 text-muted-foreground">Apply PKI digital signature:</p>
                    <Button
                        onClick={simulatePKISigning}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Signing...' : 'Apply Digital Signature'}
                    </Button>
                    </div>
                )}

                {currentStep === 4 && documentSigned && (
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
                        <Download className="mr-2" />
                        Download Signed Document
                    </Button>
                    </div>
                )}
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
