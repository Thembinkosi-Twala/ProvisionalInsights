
'use server';
/**
 * @fileOverview A Genkit flow for signing PDF documents.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const SignDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The PDF document to sign, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
  signatureDataUri: z
    .string()
    .describe(
      "The signature image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:image/png;base64,<encoded_data>'."
    ),
});
export type SignDocumentInput = z.infer<typeof SignDocumentInputSchema>;

const SignDocumentOutputSchema = z.object({
  signedDocumentUri: z
    .string()
    .describe('The signed PDF document as a data URI.'),
});
export type SignDocumentOutput = z.infer<typeof SignDocumentOutputSchema>;

export async function signDocument(input: SignDocumentInput): Promise<SignDocumentOutput> {
  return signDocumentFlow(input);
}

const signDocumentFlow = ai.defineFlow(
  {
    name: 'signDocumentFlow',
    inputSchema: SignDocumentInputSchema,
    outputSchema: SignDocumentOutputSchema,
  },
  async ({ documentDataUri, signatureDataUri }) => {
    try {
      const pdfBytes = Buffer.from(
        documentDataUri.substring(documentDataUri.indexOf(',') + 1),
        'base64'
      );
      const signatureBytes = Buffer.from(
        signatureDataUri.substring(signatureDataUri.indexOf(',') + 1),
        'base64'
      );

      const pdfDoc = await PDFDocument.load(pdfBytes);
      const signatureImage = await pdfDoc.embedPng(signatureBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      
      const { width, height } = firstPage.getSize();
      const imageWidth = 100; 
      const imageHeight = (imageWidth * signatureImage.height) / signatureImage.width;
      const padding = 50;
      
      firstPage.drawImage(signatureImage, {
        x: width - imageWidth - padding,
        y: padding + 20,
        width: imageWidth,
        height: imageHeight,
      });

      const timestamp = new Date().toUTCString();
      const verificationText = `Verified by Provincial Insights\n${timestamp}`;

      firstPage.drawText(verificationText, {
          x: width - imageWidth - padding - 2,
          y: padding,
          size: 8,
          font: helveticaFont,
          color: rgb(0.2, 0.2, 0.2),
          lineHeight: 12,
      });

      const signedPdfBytes = await pdfDoc.save();
      const signedPdfBase64 = Buffer.from(signedPdfBytes).toString('base64');
      
      return {
        signedDocumentUri: `data:application/pdf;base64,${signedPdfBase64}`,
      };
    } catch (error) {
      console.error('Error signing document:', error);
      throw new Error('Failed to embed signature in PDF.');
    }
  }
);
