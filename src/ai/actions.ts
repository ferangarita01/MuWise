'use server';
/**
 * @fileOverview This file contains the server-side actions that can be called from client components.
 * It follows the Next.js Server Actions pattern.
 */

import { sendSignatureRequestFlow } from './flows';
import type { SendSignatureRequestFlowInput, SendSignatureRequestFlowOutput } from './flows';


/**
 * A server action that wraps the sendSignatureRequestFlow.
 * This function can be directly invoked from client-side components.
 * @param input The input data for sending a signature request.
 * @returns The result of the flow execution.
 */
export async function sendSignatureRequest(input: SendSignatureRequestFlowInput): Promise<SendSignatureRequestFlowOutput> {
  // Here you could add extra server-side logic, e.g., user permission checks,
  // before invoking the flow.
  return sendSignatureRequestFlow(input);
}
