'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Document } from '@/lib/types';
import { ShieldCheck, Info } from 'lucide-react';

interface DocumentDetailsProps {
  document: Document | undefined;
}

export default function DocumentDetails({ document }: DocumentDetailsProps) {
  if (!document) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center p-6">
          <Info className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No Document Selected</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a new document or select one from the list to see its details.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isCompliant = !!document.title && !!document.summary;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="truncate">{document.title}</CardTitle>
        <CardDescription>By {document.author || 'Unknown Author'} on {document.dateCreated || 'Unknown Date'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold text-foreground mb-2">Summary</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{document.summary}</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {document.keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary">{keyword}</Badge>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">Compliance Check</h4>
           <Badge variant={isCompliant ? "default" : "destructive"} className="bg-green-600 hover:bg-green-700 text-white">
              <ShieldCheck className="mr-2 h-4 w-4" />
              {isCompliant ? 'Compliant' : 'Non-Compliant'}
            </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
