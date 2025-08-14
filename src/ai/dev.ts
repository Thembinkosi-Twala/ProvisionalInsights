import { config } from 'dotenv';
config();

import '@/ai/flows/extract-document-metadata.ts';
import '@/ai/flows/sign-document.ts';
import '@/ai/flows/compliance-check.ts';
import '@/ai/flows/archive-document-flow.ts';
