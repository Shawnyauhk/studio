'use client';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, Search, Mic, FileText, Building, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { mockBusinessCards } from '@/lib/mock-data';
import type { BusinessCard } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

// Mock AI search function. In a real app, this would call the Genkit flow.
async function mockAiSearch(query: string, cards: BusinessCard[]): Promise<BusinessCard[]> {
  if (!query) return cards;
  const lowerCaseQuery = query.toLowerCase();
  return new Promise(resolve => {
    setTimeout(() => {
      const results = cards.filter(card => 
        card.name.toLowerCase().includes(lowerCaseQuery) ||
        card.company.toLowerCase().includes(lowerCaseQuery) ||
        card.notes.toLowerCase().includes(lowerCaseQuery)
      );
      resolve(results);
    }, 500);
  });
}


export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BusinessCard[]>(mockBusinessCards);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const results = await mockAiSearch(searchQuery, mockBusinessCards);
    setSearchResults(results);
    setIsLoading(false);
  };
  
  const allCards = useMemo(() => mockBusinessCards, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Your Card Portfolio</h1>
        <p className="text-muted-foreground">
          Search, view, and manage your scanned business cards.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearch} className="w-full md:max-w-md relative">
          <Input 
            placeholder="AI Search by name, company, or notes..." 
            className="pr-20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" aria-label="Search with voice">
              <Mic className="h-4 w-4" />
            </Button>
            <Button type="submit" size="sm" className="h-8" aria-label="Search">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </form>
        <Link href="/dashboard/scan">
          <Button className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Scan New Card
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center p-8">
            <p>Searching with AI...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((card) => (
            <Card key={card.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-lg">
                  <Image src={card.imageUrl} alt={`Card of ${card.name}`} fill className="object-cover" data-ai-hint="business card"/>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <CardTitle className="font-headline text-xl">{card.name}</CardTitle>
                <div className="text-muted-foreground space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-accent" />
                    <span>{card.title} at <strong>{card.company}</strong></span>
                  </p>
                  {card.notes && (
                    <p className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                      <span className="italic">"{card.notes}"</span>
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center text-xs text-muted-foreground bg-slate-50 p-3">
                 <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Added {formatDistanceToNow(card.createdAt, { addSuffix: true })}
                 </div>
                 <Button variant="link" size="sm" asChild className="p-0 h-auto">
                    <Link href="#">View Details</Link>
                 </Button>
              </CardFooter>
            </Card>
          ))}
          {searchResults.length === 0 && (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-semibold">No cards found</h3>
              <p className="text-muted-foreground">Try a different search or scan a new card.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
