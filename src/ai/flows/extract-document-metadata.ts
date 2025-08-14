'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting metadata from documents.
 *
 * It includes:
 * - `extractDocumentMetadata`: A function to extract metadata from a document.
 * - `ExtractDocumentMetadataInput`: The input type for the function, defining the document to be processed.
 * - `ExtractDocumentMetadataOutput`: The output type, containing the extracted metadata.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractDocumentMetadataInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The document to extract metadata from, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractDocumentMetadataInput = z.infer<
  typeof ExtractDocumentMetadataInputSchema
>;

const ExtractDocumentMetadataOutputSchema = z.object({
  title: z.string().describe('The title of the document.'),
  author: z.string().describe('The author of the document.'),
  dateCreated: z.string().describe('The date the document was created.'),
  keywords: z.array(z.string()).describe('Keywords associated with the document.'),
  summary: z.string().describe('A short summary of the document.'),
});
export type ExtractDocumentMetadataOutput = z.infer<
  typeof ExtractDocumentMetadataOutputSchema
>;

export async function extractDocumentMetadata(
  input: ExtractDocumentMetadataInput
): Promise<ExtractDocumentMetadataOutput> {
  return extractDocumentMetadataFlow(input);
}

const extractDocumentMetadataPrompt = ai.definePrompt({
  name: 'extractDocumentMetadataPrompt',
  input: {schema: ExtractDocumentMetadataInputSchema},
  output: {schema: ExtractDocumentMetadataOutputSchema},
  prompt: `You are an expert document analyst. Your task is to extract key metadata from the provided document.

  Analyze the following document and extract the following metadata:

  - Title: The title of the document.
  - Author: The author of the document.
  - Date Created: The date the document was created.
  - Keywords: Keywords associated with the document.
  - Summary: A short summary of the document.

  Document: {{media url=documentDataUri}}
  `,
});

const extractDocumentMetadataFlow = ai.defineFlow(
  {
    name: 'extractDocumentMetadataFlow',
    inputSchema: ExtractDocumentMetadataInputSchema,
    outputSchema: ExtractDocumentMetadataOutputSchema,
  },
  async input => {
    const {output} = await extractDocumentMetadataPrompt(input);
    return output!;
  }
);
