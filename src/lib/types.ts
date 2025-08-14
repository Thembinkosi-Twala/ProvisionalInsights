import { type ExtractDocumentMetadataOutput } from "@/ai/flows/extract-document-metadata";

export interface Document extends ExtractDocumentMetadataOutput {
  id: string;
  fileName: string;
}
