'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ComplianceCheckInputSchema = z.object({
  title: z.string(),
  summary: z.string(),
});

const ComplianceCheckOutputSchema = z.object({
  status: z.enum(['Compliant', 'Non-Compliant', 'Review-Required']),
  report: z.string(),
});

export const complianceCheckPrompt = ai.definePrompt({
  name: 'complianceCheckPrompt',
  input: { schema: ComplianceCheckInputSchema },
  output: { schema: ComplianceCheckOutputSchema },
  prompt: `
    You are a compliance officer for a provincial government agency. Your task is to analyze the summary of a document to check for PFMA (Public Finance Management Act) compliance red flags.

    Analyze the following document summary:
    "{{summary}}"

    Check for the following:
    1.  Are there specific financial figures mentioned? If not, the document may need review.
    2.  Does the summary mention project codes? If so, are they from the approved list (e.g., "PFM-001", "GOV-23-FIN")? A summary with unapproved codes is Non-Compliant.
    3.  Is the summary clear and unambiguous? If it is vague, it may require further review.

    Based on your analysis, set the status to 'Compliant', 'Non-Compliant', or 'Review-Required' and provide a brief report explaining your decision. Assume approved codes are 'PFM-001' and 'GOV-23-FIN'.
    `,
});
