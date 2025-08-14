'use server';
/**
 * @fileOverview A Genkit flow for archiving signed documents.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { archiveDocument as archiveDocumentService } from '@/services/archive';

const ArchiveDocumentInputSchema = z.object({
    documentId: z.string().describe('The unique identifier for the document.'),
    signedDocumentUri: z.string().describe('The signed document as a data URI.'),
    fileName: z.string().describe('The name of the document file.'),
    metadata: z.object({
        title: z.string(),
        author: z.string(),
        dateCreated: z.string(),
        keywords: z.array(z.string()),
        summary: z.string(),
    }).describe('The document metadata.'),
});
export type ArchiveDocumentInput = z.infer<typeof ArchiveDocumentInputSchema>;

const ArchiveDocumentOutputSchema = z.object({
    sharepointUrl: z.string().describe('The URL of the archived document in SharePoint.'),
    databaseLogId: z.string().describe('The ID of the audit log in the SQL database.'),
});
export type ArchiveDocumentOutput = z.infer<typeof ArchiveDocumentOutputSchema>;

export async function archiveDocument(input: ArchiveDocumentInput): Promise<ArchiveDocumentOutput> {
  return archiveDocumentFlow(input);
}

const archiveDocumentFlow = ai.defineFlow(
  {
    name: 'archiveDocumentFlow',
    inputSchema: ArchiveDocumentInputSchema,
    outputSchema: ArchiveDocumentOutputSchema,
  },
  async (input) => {
    
    const auditLog = {
      documentId: input.documentId,
      fileName: input.fileName,
      signedAt: new Date().toISOString(),
      user: 'system@provincial.gov', // Placeholder for actual user
      metadata: input.metadata,
    };

    const result = await archiveDocumentService(input.signedDocumentUri, auditLog);

    return result;
  }
);
