'use server';

import { complianceCheck } from '@/ai/flows/compliance-check';
import { extractDocumentMetadata } from '@/ai/flows/extract-document-metadata';
import { signDocument as signDocumentFlow } from '@/ai/flows/sign-document';
import { archiveDocument as archiveDocumentFlow } from '@/ai/flows/archive-document-flow';
import { generateComplianceReport as generateComplianceReportFlow } from '@/ai/flows/generate-compliance-report';
import type { Document } from '@/lib/types';
import { randomUUID } from 'crypto';

export async function handleDocumentUpload(dataUri: string, fileName: string): Promise<{ data?: Document, error?: string }> {
  try {
    const metadata = await extractDocumentMetadata({ documentDataUri: dataUri });
    const compliance = await complianceCheck({
      title: metadata.title,
      summary: metadata.summary,
    });
    
    const document: Document = {
      ...metadata,
      id: randomUUID(),
      fileName,
      documentDataUri: dataUri,
      isSigned: false,
      status: compliance.status,
      report: compliance.report,
    };
    return { data: document };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to extract metadata from the document.' };
  }
}

export async function signDocument(documentDataUri: string, signatureDataUri: string): Promise<{ signedDocumentUri?: string, error?: string }> {
    try {
        const result = await signDocumentFlow({ documentDataUri, signatureDataUri });
        return { signedDocumentUri: result.signedDocumentUri };
    } catch (e) {
        console.error(e);
        return { error: 'Failed to sign the document.' };
    }
}

export async function archiveDocument(document: Document, user: string): Promise<{ error?: string }> {
    try {
        await archiveDocumentFlow({ 
            documentId: document.id,
            signedDocumentUri: document.documentDataUri,
            fileName: document.fileName,
            metadata: {
                title: document.title,
                author: document.author,
                dateCreated: document.dateCreated,
                keywords: document.keywords,
                summary: document.summary,
            },
            user,
        });
        return {};
    } catch (e) {
        console.error(e);
        return { error: 'Failed to archive the document.' };
    }
}

export async function generateComplianceReport(documents: Document[]): Promise<{ report?: string, error?: string }> {
    try {
        const result = await generateComplianceReportFlow({ documents });
        return { report: result.report };
    } catch (e) {
        console.error(e);
        return { error: 'Failed to generate compliance report.' };
    }
}
