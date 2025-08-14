
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { handleDocumentUpload, archiveDocument } from './actions';
import { type Document } from '@/lib/types';
import DocumentUpload from '@/components/document-upload';
import DocumentList from '@/components/document-list';
import DocumentDetails from '@/components/document-details';
import DocumentAnalytics from '@/components/document-analytics';
import DocumentFilters, { type Filter } from '@/components/document-filters';
import { ProvincialInsightsIcon } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { signDocument } from './actions';
import DocumentPreview from '@/components/document-preview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TransactionDemo from '@/components/transaction-demo';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [processingDocumentId, setProcessingDocumentId] = useState<string | null>(null);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAuthenticated');
    const role = sessionStorage.getItem('userRole');
    if (authStatus !== 'true') {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, [router]);

  const onFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const dataUri = reader.result as string;
        const result = await handleDocumentUpload(dataUri, file.name);

        if (result.error) {
          toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: `Could not process the document. ${result.error}`,
          });
          setIsLoading(false);
          return;
        }

        if (result.data) {
          setDocuments(prev => [result.data!, ...prev]);
          setSelectedDocumentId(result.data!.id);
        }
        setIsLoading(false);
      };
      reader.onerror = (error) => {
        throw error;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: `Could not process the document. ${errorMessage}`,
      });
      setIsLoading(false);
    }
  };

    const handleShareDocument = (documentId: string) => {
        setProcessingDocumentId(documentId);
        setDocuments(prev =>
            prev.map(doc =>
                doc.id === documentId ? { ...doc, isSharedForSignature: true } : doc
            )
        );
        toast({
            title: 'Document Shared',
            description: 'The document has been sent for signature.',
        });
        setProcessingDocumentId(null);
    };

  const handleSignDocument = async (documentId: string, signatureDataUrl: string) => {
    const originalDocument = documents.find(doc => doc.id === documentId);
    if (!originalDocument || !userRole) return;

    setIsLoading(true);
    setProcessingDocumentId(documentId);
    try {
      const result = await signDocument(originalDocument.documentDataUri, signatureDataUrl);
      if (result.error) {
        throw new Error(result.error);
      }
      if (result.signedDocumentUri) {
        const signedDoc = { ...originalDocument, documentDataUri: result.signedDocumentUri!, isSigned: true };
        
        setDocuments(prev =>
          prev.map(doc =>
            doc.id === documentId ? signedDoc : doc
          )
        );

        toast({
            title: 'Document Signed',
            description: 'The signature has been embedded into the document.',
        });

        const archiveResult = await archiveDocument(signedDoc, userRole);
        if (archiveResult.error) {
            toast({
                variant: 'destructive',
                title: 'Archiving Failed',
                description: `Could not archive the document. ${archiveResult.error}`,
            });
        } else {
            toast({
                title: 'Document Archived',
                description: 'The signed document has been sent for archiving.',
            });
        }
        return true;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        variant: 'destructive',
        title: 'Signing Failed',
        description: `Could not sign the document. ${errorMessage}`,
      });
    } finally {
        setIsLoading(false);
        setProcessingDocumentId(null);
    }
    return false;
  };

  const filteredDocuments = useMemo(() => {
    const baseList = userRole === 'Approver' 
      ? documents.filter(doc => doc.isSharedForSignature)
      : documents;

    if (filters.length === 0) {
      return baseList;
    }
    return baseList.filter(doc => {
      return filters.every(filter => {
        const { field, condition, value } = filter;
        const docValue = doc[field as keyof Document];
        const lowerCaseValue = String(value).toLowerCase();

        if (Array.isArray(docValue)) {
            const lowerCaseDocValue = docValue.map(v => String(v).toLowerCase());
            if (condition === 'contains') return lowerCaseDocValue.some(v => v.includes(lowerCaseValue));
            if (condition === 'not-contains') return !lowerCaseDocValue.some(v => v.includes(lowerCaseValue));
        } else {
            const lowerCaseDocValue = String(docValue).toLowerCase();
            if (condition === 'contains') return lowerCaseDocValue.includes(lowerCaseValue);
            if (condition === 'not-contains') return !lowerCaseDocValue.includes(lowerCaseValue);
            if (condition === 'equals') return lowerCaseDocValue === lowerCaseValue;
            if (condition === 'not-equals') return lowerCaseDocValue !== lowerCaseValue;
        }
        return false;
      });
    });
  }, [documents, filters, userRole]);


  const selectedDocument = useMemo(
    () => documents.find(doc => doc.id === selectedDocumentId),
    [documents, selectedDocumentId]
  );
  
  if (!isAuthenticated) {
    return null; // or a loading spinner
  }
  
  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <ProvincialInsightsIcon className="w-8 h-8" />
          <h1 className="text-2xl font-bold text-foreground font-headline">Provincial Insights</h1>
        </div>
        {userRole && (
          <div className="text-sm text-muted-foreground">
            Logged in as: <span className="font-semibold text-foreground">{userRole}</span>
          </div>
        )}
      </header>
      <main className="flex-1 overflow-hidden">
        <div className="grid md:grid-cols-12 h-full">
          <div className="md:col-span-4 lg:col-span-3 xl:col-span-3 p-4 border-r overflow-y-auto flex flex-col gap-4">
            {userRole === 'Uploader' && <DocumentUpload onFileUpload={onFileUpload} isLoading={isLoading} />}
            <DocumentFilters filters={filters} onFiltersChange={setFilters} />
            <DocumentList
              documents={filteredDocuments}
              selectedDocumentId={selectedDocumentId}
              onSelectDocument={setSelectedDocumentId}
              processingDocumentId={processingDocumentId}
              userRole={userRole}
            />
          </div>
          <div className="md:col-span-8 lg:col-span-9 xl:col-span-9 flex flex-col overflow-hidden">
             <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                <Tabs defaultValue="details" className="h-full flex flex-col">
                  <TabsList className="mb-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="preview" disabled={!selectedDocument}>Preview</TabsTrigger>
                    <TabsTrigger value="demo">Transaction Demo</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="flex-grow">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
                      <div className="xl:col-span-2">
                        <DocumentDetails 
                            document={selectedDocument} 
                            onShare={handleShareDocument} 
                            isLoading={processingDocumentId === selectedDocumentId}
                            userRole={userRole}
                        />
                      </div>
                      <div className="xl:col-span-1">
                        <DocumentAnalytics documents={documents} />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="preview" className="flex-grow bg-muted rounded-lg">
                    <DocumentPreview document={selectedDocument} />
                  </TabsContent>
                  <TabsContent value="demo" className="flex-grow">
                    <TransactionDemo 
                      document={selectedDocument}
                      onSignDocument={handleSignDocument}
                      onShareDocument={handleShareDocument}
                      userRole={userRole}
                      isLoading={processingDocumentId === selectedDocumentId}
                    />
                  </TabsContent>
                </Tabs>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
