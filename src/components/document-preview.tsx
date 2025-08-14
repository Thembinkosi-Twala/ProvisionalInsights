'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';
import type { Document } from '@/lib/types';

interface DocumentPreviewProps {
  document: Document | undefined;
}

export default function DocumentPreview({ document }: DocumentPreviewProps) {
  if (!document) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <Info className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No Document Selected</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a document to see its preview.
          </p>
        </div>
      </div>
    );
  }

  const isPdf = document.documentDataUri.startsWith('data:application/pdf');

  return (
    <div className="h-full w-full">
      {isPdf ? (
        <iframe
          src={document.documentDataUri}
          className="w-full h-full border-0"
          title={document.fileName}
        />
      ) : (
        <div className="h-full flex items-center justify-center p-6">
           <div className="text-center">
            <Info className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">Preview not available</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Preview is only available for PDF documents. You can still download the file.
            </p>
           </div>
        </div>
      )}
    </div>
  );
}
