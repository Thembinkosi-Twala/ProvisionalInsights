'use server';
/**
 * @fileOverview A Genkit flow for generating a compliance report.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Document } from '@/lib/types';


const DocumentSchema = z.object({
    id: z.string(),
    fileName: z.string(),
    documentDataUri: z.string(),
    isSigned: z.boolean(),
    isSharedForSignature: z.boolean().optional(),
    title: z.string(),
    author: z.string(),
    dateCreated: z.string(),
    keywords: z.array(z.string()),
    summary: z.string(),
    status: z.string(),
    report: z.string(),
});

const GenerateComplianceReportInputSchema = z.object({
  documents: z.array(DocumentSchema),
});
export type GenerateComplianceReportInput = z.infer<typeof GenerateComplianceReportInputSchema>;

const GenerateComplianceReportOutputSchema = z.object({
    report: z.string().describe('A comprehensive compliance report in Markdown format.'),
});
export type GenerateComplianceReportOutput = z.infer<typeof GenerateComplianceReportOutputSchema>;

export async function generateComplianceReport(input: GenerateComplianceReportInput): Promise<GenerateComplianceReportOutput> {
  return generateComplianceReportFlow(input);
}

const generateComplianceReportPrompt = ai.definePrompt({
    name: 'generateComplianceReportPrompt',
    input: { schema: GenerateComplianceReportInputSchema },
    output: { schema: GenerateComplianceReportOutputSchema },
    prompt: `You are an expert compliance officer for a government entity. Your task is to generate a high-level compliance report based on the provided list of documents. The report should be in Markdown format.

    The report must include:
    - A summary of the overall compliance status.
    - A section on PFMA (Public Finance Management Act) compliance, highlighting any potential issues based on document metadata (e.g., unsigned documents, missing summaries).
    - A table summarizing the compliance status of each document.
    
    Here is the list of documents:
    {{#each documents}}
    - **{{title}}** ({{fileName}}):
        - Author: {{author}}
        - Created: {{dateCreated}}
        - Summary: {{summary}}
        - Status: {{status}} ({{report}})
        - Signed: {{#if isSigned}}Yes{{else}}No{{/if}}
    {{/each}}
    `,
});


const generateComplianceReportFlow = ai.defineFlow(
  {
    name: 'generateComplianceReportFlow',
    inputSchema: GenerateComplianceReportInputSchema,
    outputSchema: GenerateComplianceReportOutputSchema,
  },
  async (input) => {
    if (input.documents.length === 0) {
        return { report: '## Compliance Report\n\nNo documents available to generate a report.' };
    }
    const { output } = await generateComplianceReportPrompt(input);
    return output!;
  }
);
