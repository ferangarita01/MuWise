/**
 * @fileOverview This file defines the Genkit flows and related Zod schemas.
 * It does NOT use the 'use server' directive, allowing for the export of objects and types.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { generateSigningLink } from "@/lib/actions";
import { sendSignatureEmail } from "@/lib/email";

// Input Schema for the flow
export const SendSignatureRequestFlowInputSchema = z.object({
  agreementId: z.string().describe("The ID of the agreement to be signed."),
  signerId: z.string().describe("The ID of the signer (composer)."),
  signerEmail: z.string().email().describe("The email address of the signer."),
});
export type SendSignatureRequestFlowInput = z.infer<typeof SendSignatureRequestFlowInputSchema>;

// Output Schema for the flow
export const SendSignatureRequestFlowOutputSchema = z.object({
  link: z.string().url().describe("The generated unique signing link."),
  status: z.enum(["success", "error"]),
  message: z.string(),
});
export type SendSignatureRequestFlowOutput = z.infer<typeof SendSignatureRequestFlowOutputSchema>;

// The Genkit flow definition
export const sendSignatureRequestFlow = ai.defineFlow(
  {
    name: 'sendSignatureRequestFlow',
    inputSchema: SendSignatureRequestFlowInputSchema,
    outputSchema: SendSignatureRequestFlowOutputSchema,
  },
  async ({ agreementId, signerId, signerEmail }) => {
    try {
        const link = await generateSigningLink(agreementId, signerId);
        
        // Only try to send email if Resend key is configured
        if (process.env.RESEND_API_KEY) {
            await sendSignatureEmail(signerEmail, link);
             return { 
                link, 
                status: "success",
                message: "Signature request sent successfully."
            };
        } else {
             console.warn("RESEND_API_KEY is not configured. Email not sent.");
             return { 
                link, 
                status: "success",
                message: "Signing link generated, but email could not be sent. API key is missing."
            };
        }
       
    } catch (error) {
        console.error("Error in sendSignatureRequestFlow:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        return {
            link: "",
            status: "error",
            message: `Failed to send request: ${message}`
        }
    }
  }
);
