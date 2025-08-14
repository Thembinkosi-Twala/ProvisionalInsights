'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Document } from '@/lib/types';

interface DocumentListProps {
  documents: Document[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDocumentId: string | null;
  onSelectDocument: (id: string) => void;
}

export default function DocumentList({
  documents,
  searchQuery,
  setSearchQuery,
  selectedDocumentId,
  onSelectDocument,
}: DocumentListProps) {
  const filteredDocuments = documents.filter(doc =>
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 pt-0">
            {filteredDocuments.length > 0 ? (
              <ul className="space-y-2">
                {filteredDocuments.map(doc => (
                  <li key={doc.id}>
                    <button
                      onClick={() => onSelectDocument(doc.id)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3',
                        selectedDocumentId === doc.id
                          ? 'bg-primary/10 text-primary-foreground'
                          : 'hover:bg-muted/50'
                      )}
                    >
                      <FileText className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                      <div className="flex-1 overflow-hidden">
                        <p className="font-semibold truncate text-foreground">{doc.title || doc.fileName}</p>
                        <p className="text-sm text-muted-foreground truncate">{doc.author || 'Unknown Author'}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No documents found.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
