'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Document } from '@/lib/types';

interface DocumentListProps {
  documents: Document[];
  selectedDocumentId: string | null;
  onSelectDocument: (id: string) => void;
}

export default function DocumentList({
  documents,
  selectedDocumentId,
  onSelectDocument,
}: DocumentListProps) {

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 pt-0">
            {documents.length > 0 ? (
              <ul className="space-y-2">
                {documents.map(doc => (
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
                <p className="text-muted-foreground">No documents match the current filters.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
