
'use client';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Building, Calendar, FileText, Loader2, Briefcase, MapPin, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { BusinessCard } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/context/AuthContext';
import { getFirebase } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const groupCardsByCompany = (cards: BusinessCard[]) => {
  return cards.reduce((acc, card) => {
    const company = card.companyName || 'Uncategorized';
    if (!acc[company]) {
      acc[company] = [];
    }
    acc[company].push(card);
    return acc;
  }, {} as Record<string, BusinessCard[]>);
};

export default function SavedCardsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      };

      try {
        const { db } = await getFirebase();
        const cardsCollection = collection(db, 'businessCards');
        // The query now only filters by userId, avoiding the need for a composite index.
        const q = query(cardsCollection, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedCards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessCard));
        
        // Sorting is now done on the client-side after fetching.
        fetchedCards.sort((a, b) => {
            const dateA = a.createdAt ? (a.createdAt as Timestamp).toDate().getTime() : 0;
            const dateB = b.createdAt ? (b.createdAt as Timestamp).toDate().getTime() : 0;
            return dateB - dateA; // Sort descending (newest first)
        });

        setCards(fetchedCards);
      } catch (error) {
        console.error("Error fetching cards: ", error);
        toast({
          title: "Error fetching cards",
          description: "Could not retrieve your saved cards. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, [user, toast]);

  const groupedCards = useMemo(() => groupCardsByCompany(cards), [cards]);
  const companies = useMemo(() => Object.keys(groupedCards), [groupedCards]);

  const formatDate = (timestamp: BusinessCard['createdAt']) => {
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (timestamp && 'seconds' in timestamp) {
      return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
    }
    return new Date();
  };

  if (isLoading) {
     return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4">Loading saved cards...</p>
      </div>
    );
  }

  if (cards.length === 0) {
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
                    <CardHeader className="relative p-0">
                      <div className="absolute top-2 right-2 z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>編輯</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>刪除</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="relative aspect-video w-full overflow-hidden">
                        <Image src={card.cardFrontImageUrl} alt={`Card of ${card.name}`} fill className="object-cover" data-ai-hint="business card"/>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-3 p-4">
                      <CardTitle className="font-headline text-xl">{card.name}</CardTitle>
                      <div className="text-muted-foreground space-y-2 text-sm">
                        <p className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-accent flex-shrink-0" />
                          <span className="font-semibold">{card.title} at {card.companyName}</span>
                        </p>
                         <p className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                          <span>{card.address}</span>
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
                          {t('added')} {formatDistanceToNow(formatDate(card.createdAt), { addSuffix: true })}
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
