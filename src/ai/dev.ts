import { config } from 'dotenv';
config();

import '@/ai/flows/extract-document-metadata.ts';
import '@/ai/flows/sign-document.ts';
import '@/ai/flows/compliance-check.ts';
import '@/ai/flows/archive-document-flow.ts';
import '@/ai/flows/generate-compliance-report.ts';
import '@/ai/prompts/compliance-check-prompt.ts';
