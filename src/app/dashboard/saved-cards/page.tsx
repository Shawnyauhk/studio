'use client';
import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Building, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { mockBusinessCards } from '@/lib/mock-data';
import type { BusinessCard } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

// Helper function to group cards by company
const groupCardsByCompany = (cards: BusinessCard[]) => {
  return cards.reduce((acc, card) => {
    const company = card.company || 'Uncategorized';
    if (!acc[company]) {
      acc[company] = [];
    }
    acc[company].push(card);
    return acc;
  }, {} as Record<string, BusinessCard[]>);
};

export default function SavedCardsPage() {
  const { t } = useTranslation();
  const groupedCards = useMemo(() => groupCardsByCompany(mockBusinessCards), []);
  const companies = useMemo(() => Object.keys(groupedCards), [groupedCards]);

  if (mockBusinessCards.length === 0) {
    return (
        <div className="text-center py-12">
            <h3 className="text-xl font-semibold">{t('noCardsFound')}</h3>
            <p className="text-muted-foreground">{t('noCardsFoundDescription')}</p>
        </div>
    );
  }

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-headline font-bold">{t('savedCards')}</h1>
        <p className="text-muted-foreground">
          {t('savedCardsDescription')}
        </p>
      </div>
      <Accordion type="multiple" defaultValue={companies} className="w-full">
        {companies.map((company) => (
          <AccordionItem value={company} key={company}>
            <AccordionTrigger className="text-xl font-semibold">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                {company} ({groupedCards[company].length})
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {groupedCards[company].map((card) => (
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
                          <span className="font-semibold">{card.title}</span>
                        </p>
                        {card.notes && (
                          <p className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                            <span className="italic">"{card.notes}"</span>
                          </p>
                        )}
                      </div>
                      <div className="pt-2">
                        <h4 className="font-semibold text-foreground mb-2">{t('companyLocation')}</h4>
                        <div className="aspect-video rounded-md overflow-hidden border">
                          <iframe
                            width="100%"
                            height="100%"
                            loading="lazy"
                            allowFullScreen
                            src={`https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(card.address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}>
                          </iframe>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center text-xs text-muted-foreground bg-slate-50 p-3">
                       <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {t('added')} {formatDistanceToNow(card.createdAt, { addSuffix: true })}
                       </div>
                       <Button variant="link" size="sm" asChild className="p-0 h-auto">
                          <Link href="#">{t('viewDetails')}</Link>
                       </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
