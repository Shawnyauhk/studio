'use server';
/**
 * @fileOverview Analyzes a scanned business card, extracts company information, and searches for
 *  relevant public information about the company.
 *
 * - analyzeCardAndSearchCompanyInfo - A function that handles the card analysis and company information search process.
 * - AnalyzeCardAndSearchCompanyInfoInput - The input type for the analyzeCardAndSearchCompanyInfo function.
 * - AnalyzeCardAndSearchCompanyInfoOutput - The return type for the analyzeCardAndSearchCompanyInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCardAndSearchCompanyInfoInputSchema = z.object({
  cardImageDataUri: z
    .string()
    .describe(
      "A photo of a business card, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeCardAndSearchCompanyInfoInput = z.infer<
  typeof AnalyzeCardAndSearchCompanyInfoInputSchema
>;

const AnalyzeCardAndSearchCompanyInfoOutputSchema = z.object({
  companyName: z.string().describe('The name of the company on the card.'),
  companyDescription: z
    .string()
    .describe('A description of the company and its background.'),
});
export type AnalyzeCardAndSearchCompanyInfoOutput = z.infer<
  typeof AnalyzeCardAndSearchCompanyInfoOutputSchema
>;

export async function analyzeCardAndSearchCompanyInfo(
  input: AnalyzeCardAndSearchCompanyInfoInput
): Promise<AnalyzeCardAndSearchCompanyInfoOutput> {
  return analyzeCardAndSearchCompanyInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCardAndSearchCompanyInfoPrompt',
  input: {schema: AnalyzeCardAndSearchCompanyInfoInputSchema},
  output: {schema: AnalyzeCardAndSearchCompanyInfoOutputSchema},
  prompt: `You are an AI assistant that analyzes business cards and provides company information.\n  Given an image of a business card, extract the company name and search for public information about the company, including its background and mission.\n  Return the company name and a detailed description of the company.\n  Here is the business card image: {{media url=cardImageDataUri}}`,
});

const analyzeCardAndSearchCompanyInfoFlow = ai.defineFlow(
  {
    name: 'analyzeCardAndSearchCompanyInfoFlow',
    inputSchema: AnalyzeCardAndSearchCompanyInfoInputSchema,
    outputSchema: AnalyzeCardAndSearchCompanyInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
