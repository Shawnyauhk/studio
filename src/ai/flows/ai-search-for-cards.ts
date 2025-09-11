'use server';
/**
 * @fileOverview AI-powered business card search flow.
 *
 * This file defines a Genkit flow that allows users to search for business cards
 * using natural language queries. It supports searching by company name, person's
 * name, or content of notes associated with the cards.
 *
 * @file AISearchForCards - A function that searches for cards using AI.
 * @file SearchCardsInput - The input type for the AISearchForCards function.
 * @file SearchCardsOutput - The return type for the AISearchForCards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchCardsInputSchema = z.object({
  query: z.string().describe('The search query, which can be text or voice input.'),
  cardDetails: z.string().describe('Details of card, including name, company and notes'),
});
export type SearchCardsInput = z.infer<typeof SearchCardsInputSchema>;

const SearchCardsOutputSchema = z.object({
  results: z
    .string()
    .describe('The search results, displayed as a string of card details.'),
});
export type SearchCardsOutput = z.infer<typeof SearchCardsOutputSchema>;

export async function AISearchForCards(input: SearchCardsInput): Promise<SearchCardsOutput> {
  return searchCardsFlow(input);
}

const searchCardsPrompt = ai.definePrompt({
  name: 'searchCardsPrompt',
  input: {schema: SearchCardsInputSchema},
  output: {schema: SearchCardsOutputSchema},
  prompt: `You are a business card search assistant. Given the user's search query and available card details, find the relevant cards.

  Search Query: {{{query}}}
  Card Details: {{{cardDetails}}}

  Return the search results as a plain text string.  If no results were found, indicate that no results were found.
  `,
});

const searchCardsFlow = ai.defineFlow(
  {
    name: 'searchCardsFlow',
    inputSchema: SearchCardsInputSchema,
    outputSchema: SearchCardsOutputSchema,
  },
  async input => {
    const {output} = await searchCardsPrompt(input);
    return output!;
  }
);
