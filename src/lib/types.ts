import { type ComplianceCheckOutput } from "@/ai/flows/compliance-check";
import { type ExtractDocumentMetadataOutput } from "@/ai/flows/extract-document-metadata";

export interface Document extends ExtractDocumentMetadataOutput, ComplianceCheckOutput {
  id: string;
  fileName: string;
  documentDataUri: string;
  isSigned: boolean;
}
