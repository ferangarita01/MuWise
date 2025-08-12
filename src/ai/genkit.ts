import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';

// Activa métricas, logs y trazas en Firebase/Cloud
enableFirebaseTelemetry();

export const ai = genkit({
  plugins: [
    googleAI(), // tu plugin de Google AI
  ],
  model: 'googleai/gemini-2.0-flash',
});
