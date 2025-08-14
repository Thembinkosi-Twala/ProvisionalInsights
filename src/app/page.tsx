'use client';

import React, { useState, useMemo } from 'react';
import { handleDocumentUpload } from './actions';
import { type Document } from '@/lib/types';
import DocumentUpload from '@/components/document-upload';
import DocumentList from '@/components/document-list';
import DocumentDetails from '@/components/document-details';
import DocumentAnalytics from '@/components/document-analytics';
import DocumentFilters, { type Filter } from '@/components/document-filters';
import { ProvincialInsightsIcon } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const dataUri = reader.result as string;
        const result = await handleDocumentUpload(dataUri, file.name);

        if (result.error) {
          throw new Error(result.error);
        }

        if (result.data) {
          setDocuments(prev => [result.data!, ...prev]);
          setSelectedDocumentId(result.data!.id);
        }
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignDocument = (documentId: string, signatureDataUrl: string) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === documentId ? { ...doc, signatureDataUrl } : doc
      )
    );
  };

  const filteredDocuments = useMemo(() => {
    if (filters.length === 0) {
      return documents;
    }
    return documents.filter(doc => {
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
  }, [documents, filters]);


  const selectedDocument = useMemo(
    () => documents.find(doc => doc.id === selectedDocumentId),
    [documents, selectedDocumentId]
  );
  
  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <ProvincialInsightsIcon className="w-8 h-8" />
          <h1 className="text-2xl font-bold text-foreground font-headline">Provincial Insights</h1>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <div className="grid md:grid-cols-12 h-full">
          <div className="md:col-span-4 lg:col-span-3 xl:col-span-3 p-4 border-r overflow-y-auto flex flex-col gap-4">
            <DocumentUpload onFileUpload={onFileUpload} isLoading={isLoading} />
            <DocumentFilters filters={filters} onFiltersChange={setFilters} />
            <DocumentList
              documents={filteredDocuments}
              selectedDocumentId={selectedDocumentId}
              onSelectDocument={setSelectedDocumentId}
            />
          </div>
          <div className="md:col-span-8 lg:col-span-9 xl:col-span-9 flex flex-col overflow-hidden">
            <div className="flex-1 p-4 md:p-6 overflow-y-auto grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                 <DocumentDetails document={selectedDocument} onSign={handleSignDocument} />
              </div>
              <div className="xl:col-span-1">
                <DocumentAnalytics documents={documents} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
