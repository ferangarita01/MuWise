import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {firebasePlugin} from '@genkit-ai/firebase';

export const ai = genkit({
  plugins: [firebasePlugin(), googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
