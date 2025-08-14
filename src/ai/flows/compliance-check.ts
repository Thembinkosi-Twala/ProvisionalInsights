'use server';
/**
 * @fileOverview A Genkit flow for checking document compliance.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ComplianceCheckInputSchema = z.object({
  title: z.string().describe('The title of the document.'),
  summary: z.string().describe('The summary of the document.'),
});
export type ComplianceCheckInput = z.infer<typeof ComplianceCheckInputSchema>;

const ComplianceCheckOutputSchema = z.object({
    status: z.enum(['Compliant', 'Non-Compliant']).describe('The compliance status of the document.'),
    report: z.string().describe('A brief report on the compliance check findings.'),
});
export type ComplianceCheckOutput = z.infer<typeof ComplianceCheckOutputSchema>;


export async function complianceCheck(input: ComplianceCheckInput): Promise<ComplianceCheckOutput> {
  return complianceCheckFlow(input);
}

const complianceCheckFlow = ai.defineFlow(
  {
    name: 'complianceCheckFlow',
    inputSchema: ComplianceCheckInputSchema,
    outputSchema: ComplianceCheckOutputSchema,
  },
  async ({ title, summary }) => {
    const isCompliant = !!title && !!summary;
    const report = isCompliant
        ? 'Document has a title and summary.'
        : 'Document is missing a title or summary.';
    
    return {
        status: isCompliant ? 'Compliant' : 'Non-Compliant',
        report,
    };
  }
);
