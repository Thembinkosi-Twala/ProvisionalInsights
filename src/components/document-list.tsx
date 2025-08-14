
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Document } from '@/lib/types';

interface DocumentListProps {
  documents: Document[];
  selectedDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  processingDocumentId?: string | null;
  userRole: string | null;
}

export default function DocumentList({
  documents,
  selectedDocumentId,
  onSelectDocument,
  processingDocumentId,
  userRole,
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
                      disabled={!!processingDocumentId}
                      className={cn(
                        'w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3',
                        selectedDocumentId === doc.id
                          ? 'bg-primary/10'
                          : 'hover:bg-muted/50',
                        'disabled:cursor-not-allowed disabled:opacity-70'
                      )}
                    >
                      {processingDocumentId === doc.id ? (
                          <Loader2 className="h-5 w-5 mt-1 text-primary flex-shrink-0 animate-spin" />
                      ) : (
                          <FileText className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                      )}

                      <div className="flex-1 overflow-hidden">
                        <p className="font-semibold truncate text-foreground flex items-center gap-2">
                            {doc.title || doc.fileName}
                            {doc.isSigned && <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{doc.author || 'Unknown Author'}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                    No documents uploaded yet.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
