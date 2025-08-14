'use server';

import { extractDocumentMetadata } from '@/ai/flows/extract-document-metadata';
import type { Document } from '@/lib/types';
import { randomUUID } from 'crypto';

export async function handleDocumentUpload(dataUri: string, fileName: string): Promise<{ data?: Document, error?: string }> {
  try {
    const metadata = await extractDocumentMetadata({ documentDataUri: dataUri });
    const document: Document = {
      ...metadata,
      id: randomUUID(),
      fileName,
    };
    return { data: document };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to extract metadata from the document.' };
  }
}
