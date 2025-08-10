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
  conflictAnalysis: z.string().describe('An analysis of potential rights conflicts.'),
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
  prompt: `You are an expert music rights analyst.

You will analyze the provided split sheet data to identify any potential rights conflicts by comparing it against publicly available music rights data.

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
