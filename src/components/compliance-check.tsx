
'use client';

import React from 'react';
import type { Document } from '@/lib/types';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ComplianceCheckProps {
  document: Document;
}

export default function ComplianceCheck({ document }: ComplianceCheckProps) {
  const isCompliant = document.complianceStatus === 'Compliant';

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-foreground">Compliance & Status</h4>
      <div className="flex flex-wrap gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant={isCompliant ? 'default' : 'destructive'}
                className={isCompliant ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
              >
                {isCompliant ? (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                ) : (
                  <ShieldAlert className="mr-2 h-4 w-4" />
                )}
                {document.complianceStatus}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{document.complianceReport}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {document.isSigned && (
          <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Signed
          </Badge>
        )}
      </div>
    </div>
  );
}
