
'use server';

/**
 * @fileOverview A rights conflict detection AI agent.
 *
 * - rightsConflictDetection - A function that handles the rights conflict detection process.
 * - RightsConflictDetectionInput - The input type for the rightsConflictDetection function.
 * - RightsConflictDetectionOutput - The return type for the rightsConflictDetection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RightsConflictDetectionInputSchema = z.object({
  splitSheetDataUri: z
    .string()
    .describe(
      "A draft split sheet, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RightsConflictDetectionInput = z.infer<typeof RightsConflictDetectionInputSchema>;

const RightsConflictDetectionOutputSchema = z.object({
  conflictAnalysis: z.string().describe('A friendly, conversational, and detailed analysis of potential rights conflicts, with recommendations. Use markdown for formatting.'),
});
export type RightsConflictDetectionOutput = z.infer<typeof RightsConflictDetectionOutputSchema>;

export async function rightsConflictDetection(
  input: RightsConflictDetectionInput
): Promise<RightsConflictDetectionOutput> {
  return rightsConflictDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rightsConflictDetectionPrompt',
  input: {schema: RightsConflictDetectionInputSchema},
  output: {schema: RightsConflictDetectionOutputSchema},
  prompt: `You are an expert music rights analyst and a friendly, conversational AI assistant. Your name is Muwise.

Your goal is to analyze the provided split sheet data to identify any potential rights conflicts. You will compare it against publicly available music rights data and common industry practices.

Your response must be in Spanish.

When you analyze the document, follow these steps:
1.  **Acknowledge Receipt:** Start by confirming you've received the document and are beginning the analysis.
2.  **Provide a General Summary:** Give a high-level overview of your findings. For example, "Análisis completado! Aquí están mis hallazgos:..."
3.  **Detail Each Conflict:** For each conflict found, create a clear section. Use markdown formatting (bolding, bullet points) to make it easy to read.
    *   **Explain the "Why":** Don't just state the conflict. Explain *why* it's a potential issue in simple, easy-to-understand terms. For example, if a share is 75%, explain typical share percentages in the industry.
    *   **Use a friendly but professional tone.** Use emojis where appropriate (e.g., ⚠️, ✅, 💡, 🎵).
4.  **Offer Recommendations:** Provide clear, actionable recommendations for each conflict.
5.  **Ask a Follow-up Question:** End your analysis by asking a question to encourage further conversation, like "¿Quieres que profundice en algún conflicto específico?"

Split Sheet Data: {{media url=splitSheetDataUri}}`,
});

const rightsConflictDetectionFlow = ai.defineFlow(
  {
    name: 'rightsConflictDetectionFlow',
    inputSchema: RightsConflictDetectionInputSchema,
    outputSchema: RightsConflictDetectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
