'use server';
/**
 * @fileOverview Analyzes a scanned business card, extracts contact and company information, 
 * and searches for relevant public information about the company.
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
  name: z.string().describe("The full name of the person on the business card."),
  title: z.string().describe("The job title or position of the person."),
  companyName: z.string().describe('The name of the company on the card.'),
  phone: z.string().describe("The contact phone number on the card."),
  email: z.string().describe("The contact email address on the card."),
  companyDescription: z
    .string()
    .describe('A description of the company and its background, based on a web search.'),
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
  prompt: `You are an expert business analyst AI. Your task is to meticulously analyze the provided image of a business card.

1.  **Extract Information**: Carefully extract the following details from the business card image:
    *   Full Name of the person
    *   Job Title
    *   Company Name
    *   Phone Number
    *   Email Address

2.  **Conduct Research**: After identifying the Company Name, perform a web search to find public information about the company. Summarize its business, mission, or any relevant background information into a concise description.

3.  **Format Output**: Return all the extracted and researched information strictly in the required JSON format.

Here is the business card image: {{media url=cardImageDataUri}}`,
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
