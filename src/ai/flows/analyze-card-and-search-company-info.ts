'use server';
/**
 * @fileOverview Analyzes a scanned business card (front and back), extracts contact and company information, 
 * and searches for relevant public information about the company. It supports bilingual (English and Chinese) data extraction.
 *
 * - analyzeCardAndSearchCompanyInfo - A function that handles the card analysis and company information search process.
 * - AnalyzeCardAndSearchCompanyInfoInput - The input type for the analyzeCardAndSearchCompanyInfo function.
 * - AnalyzeCardAndSearchCompanyInfoOutput - The return type for the analyzeCardAndSearchCompanyInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BilingualStringSchema = z.object({
  en: z.string().describe("The value in English."),
  zh: z.string().describe("The value in Traditional Chinese."),
});

const AnalyzeCardAndSearchCompanyInfoInputSchema = z.object({
  cardFrontImageDataUri: z
    .string()
    .describe(
      "A photo of the front of a business card, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
    cardBackImageDataUri: z
    .string().optional()
    .describe(
      "An optional photo of the back of a business card, in the same data URI format."
    ),
});
export type AnalyzeCardAndSearchCompanyInfoInput = z.infer<
  typeof AnalyzeCardAndSearchCompanyInfoInputSchema
>;

const AnalyzeCardAndSearchCompanyInfoOutputSchema = z.object({
  name: BilingualStringSchema.describe("The full name of the person on the business card, in both English and Chinese if available."),
  title: BilingualStringSchema.describe("The job title or position of the person, in both English and Chinese if available."),
  companyName: BilingualStringSchema.describe('The name of the company on the card, in both English and Chinese if available.'),
  phone: z.string().describe("The contact phone number on the card. This is typically language-independent."),
  email: z.string().describe("The contact email address on the card. This is typically language-independent."),
  address: BilingualStringSchema.describe("The full address found on the card, in both English and Chinese if available."),
  companyDescription: z
    .string()
    .describe('A description of the company and its background, based on a web search. Provide this in English.'),
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
  prompt: `You are an expert business analyst AI. Your task is to meticulously analyze the provided images of a business card (front and back).

1.  **Analyze Both Sides**: Carefully examine both the front and back images of the business card. One side is likely in English and the other in Traditional Chinese. Synthesize information from both sides to get the complete picture.

2.  **Extract Bilingual Information**: For each of the following fields, extract both the English and Traditional Chinese versions. If a version is not available on the card, leave the corresponding field as an empty string.
    *   Full Name (name)
    *   Job Title (title)
    *   Company Name (companyName)
    *   Address (address)

3.  **Extract General Information**: Extract the following details which are usually language-independent:
    *   Phone Number (phone)
    *   Email Address (email)

4.  **Conduct Research**: After identifying the Company Name, perform a web search to find public information about the company. Summarize its business, mission, or any relevant background information into a concise description in English.

5.  **Format Output**: Return all the extracted and researched information strictly in the required JSON format, ensuring to populate both 'en' and 'zh' fields in the nested objects.

Here are the business card images:
Front: {{media url=cardFrontImageDataUri}}
{{#if cardBackImageDataUri}}
Back: {{media url=cardBackImageDataUri}}
{{/if}}
`,
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
