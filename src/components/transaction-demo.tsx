'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Users, Shield, CheckCircle, AlertCircle, Clock, Lock, Eye, Download, RefreshCw, Search } from 'lucide-react';

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

const TransactionDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [documentSigned, setDocumentSigned] = useState(false);
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [mfaError, setMfaError] = useState(''); // Error Handling for MFA
  const [selectedRole, setSelectedRole] = useState(ROLES[0]); // User Role Selection
  const [searchTerm, setSearchTerm] = useState(''); // Audit Trail Filtering/Search

  const steps = [
    { id: 'upload', name: 'Document Upload', icon: FileText, status: 'completed' },
    { id: 'mfa', name: 'MFA Authentication', icon: Shield, status: currentStep >= 1 ? 'completed' : 'pending' },
    { id: 'approval', name: 'Approval Routing', icon: Users, status: currentStep >= 2 ? 'completed' : 'pending' },
    { id: 'signature', name: 'PKI Digital Signature', icon: Lock, status: currentStep >= 3 ? 'completed' : 'pending' },
    { id: 'storage', name: 'Secure Storage', icon: CheckCircle, status: currentStep >= 4 ? 'completed' : 'pending' }
  ];

  const addAuditEntry = (action: string, details: string) => {
    const timestamp = new Date().toLocaleString();
    setAuditTrail(prev => [...prev, {
      id: Date.now() + Math.random(),
      timestamp,
      action,
      details,
      user: `${selectedRole}`,
      ipAddress: '10.0.0.45',
      status: 'Success'
    }]);
  };

  const simulateMFA = () => {
    setIsProcessing(true);
    setMfaError('');
    setTimeout(() => {
      if (mfaCode === '123456') {
        setCurrentStep(1);
        addAuditEntry('MFA Authentication', 'SMS OTP verified successfully');
      } else {
        setMfaError('Incorrect MFA code. Please try again.');
        addAuditEntry('MFA Authentication', 'Failed MFA attempt');
      }
      setIsProcessing(false);
    }, 2000);
  };

  const simulateApproval = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setCurrentStep(2);
      addAuditEntry('Approval Routing', 'Document routed to CFO for approval');
      setTimeout(() => {
        setCurrentStep(3);
        addAuditEntry('Approval Decision', 'CFO approved document electronically');
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
    }, 2500);
  };

  // Step Reset/Restart Button
  const handleRestart = () => {
    setCurrentStep(0);
    setIsProcessing(false);
    setMfaCode('');
    setDocumentSigned(false);
    setAuditTrail([]);
    setMfaError('');
    setSearchTerm('');
    addAuditEntry('Document Upload', 'Budget Amendment Form uploaded - ID: BUD-2025-001');
  };

  // Download Signed Document (simulated)
  const handleDownload = () => {
    const blob = new Blob(['Signed Document Content'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SignedDocument.txt';
    a.click();
    URL.revokeObjectURL(url);
    addAuditEntry('Download', 'User downloaded the signed document');
  };

  // User Role Selection
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
  };

  // Audit Trail Filtering/Search
  const filteredAuditTrail = auditTrail.filter(entry =>
    entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    addAuditEntry('Document Upload', 'Budget Amendment Form uploaded - ID: BUD-2025-001');
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 -m-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Real-Time E-Signature Transaction Demo
          </h1>
          <p className="text-xl text-gray-600">
            Live demonstration of secure document workflow with MFA, PKI, and audit trails
          </p>
        </div>

        {/* User Role Selection */}
        <div className="mb-6 flex items-center gap-4">
          <label className="font-semibold text-gray-700">Select Role:</label>
          <select
            value={selectedRole}
            onChange={handleRoleChange}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            {ROLES.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Workflow Progress */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold flex items-center">
                <Clock className="mr-3 text-blue-600" />
                Workflow Progress
              </h2>
              {/* Step Reset/Restart Button */}
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                <RefreshCw size={18} />
                Restart
              </button>
            </div>
            
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div key={step.id} className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                    isActive ? 'border-blue-500 bg-blue-50' : 
                    isCompleted ? 'border-green-500 bg-green-50' : 
                    'border-gray-200 bg-gray-50'
                  }`}>
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full mr-4 ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isActive ? 'bg-blue-500 text-white' :
                      'bg-gray-300 text-gray-600'
                    }`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{step.name}</h3>
                      <p className="text-sm text-gray-600">
                        {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Pending'}
                      </p>
                    </div>
                    {isActive && !isProcessing && (
                      <div className="animate-pulse">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Interactive Controls */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Interactive Demo Controls</h3>
              
              {currentStep === 0 && (
                <div>
                  <p className="mb-4 text-gray-700">Enter MFA code to proceed with authentication:</p>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Enter 123456"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <button
                      onClick={simulateMFA}
                      disabled={isProcessing || !mfaCode}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isProcessing ? 'Verifying...' : 'Verify MFA'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Hint: Use code "123456"</p>
                  {/* Error Handling for MFA */}
                  {mfaError && (
                    <div className="mt-2 text-red-600 flex items-center gap-2">
                      <AlertCircle size={18} />
                      {mfaError}
                    </div>
                  )}
                </div>
              )}

              {(currentStep === 1 || currentStep === 2) && (
                <div>
                  <p className="mb-4 text-gray-700">Initiate approval workflow:</p>
                  <button
                    onClick={simulateApproval}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {isProcessing ? 'Routing...' : 'Send for Approval'}
                  </button>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <p className="mb-4 text-gray-700">Apply PKI digital signature:</p>
                  <button
                    onClick={simulatePKISigning}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    {isProcessing ? 'Signing...' : 'Apply Digital Signature'}
                  </button>
                </div>
              )}

              {currentStep === 4 && documentSigned && (
                <div className="text-center">
                  <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
                  <h3 className="text-xl font-semibold text-green-700 mb-2">
                    Document Successfully Processed!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    The document has been digitally signed and securely stored with full audit trail.
                  </p>
                  {/* Download Signed Document */}
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download size={20} />
                    Download Signed Document
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Live Audit Trail */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Eye className="mr-3 text-green-600" />
              Live Audit Trail
            </h2>
            {/* Audit Trail Filtering/Search */}
            <div className="mb-4 flex items-center gap-2">
              <Search size={18} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search by action or user..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredAuditTrail.map((entry) => (
                <div key={entry.id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{entry.action}</span>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      {entry.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{entry.details}</p>
                  <div className="text-xs text-gray-500">
                    <div>User: {entry.user}</div>
                    <div>Time: {entry.timestamp}</div>
                    <div>IP: {entry.ipAddress}</div>
                  </div>
                </div>
              ))}
              {filteredAuditTrail.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No audit entries found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Features Display */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Security & Compliance Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Shield className="mx-auto mb-3 text-blue-600" size={32} />
              <h3 className="font-semibold mb-2">Multi-Factor Authentication</h3>
              <p className="text-sm text-gray-600">SMS OTP, TOTP, and biometric verification</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Lock className="mx-auto mb-3 text-purple-600" size={32} />
              <h3 className="font-semibold mb-2">PKI Digital Signatures</h3>
              <p className="text-sm text-gray-600">Government-qualified certificates with timestamps</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Eye className="mx-auto mb-3 text-green-600" size={32} />
              <h3 className="font-semibold mb-2">Immutable Audit Trail</h3>
              <p className="text-sm text-gray-600">Complete transaction history with tamper-proof logging</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDemo;
