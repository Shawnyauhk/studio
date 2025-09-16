
'use client';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building, Calendar, FileText, Loader2, Briefcase, MapPin, MoreVertical, Pencil, Trash2, Camera, Search, ArrowUpDown, Globe } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { BusinessCard } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/context/AuthContext';
import { getFirebase } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


type SortOption = 'createdAt_desc' | 'createdAt_asc' | 'companyName_asc';

const groupCardsByCompany = (cards: BusinessCard[], language: 'en' | 'zh') => {
  return cards.reduce((acc, card) => {
    const companyName = typeof card.companyName === 'object' ? card.companyName[language] || card.companyName['en'] : card.companyName;
    const company = companyName || 'Uncategorized';
    if (!acc[company]) {
      acc[company] = [];
    }
    acc[company].push(card);
    return acc;
  }, {} as Record<string, BusinessCard[]>);
};

const hongKongDistricts = {
  "港島": [ "中西區", "東區", "南區", "灣仔區" ],
  "九龍": [ "九龍城區", "觀塘區", "深水埗區", "黃大仙區", "油尖旺區" ],
  "新界": [ "離島區", "葵青區", "北區", "西貢區", "沙田區", "大埔區", "荃灣區", "屯門區", "元朗區" ]
};


export default function SavedCardsPage() {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cardToDelete, setCardToDelete] = useState<BusinessCard | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('createdAt_desc');
  const [regionFilter, setRegionFilter] = useState<string>('all');

  useEffect(() => {
    const fetchCards = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      };

      try {
        const { db } = await getFirebase();
        const cardsCollection = collection(db, 'businessCards');
        const q = query(cardsCollection, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedCards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessCard));
        
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

  const handleDelete = async () => {
    if (!cardToDelete) return;
    setIsDeleting(true);
    try {
      const { db } = await getFirebase();
      await deleteDoc(doc(db, "businessCards", cardToDelete.id));
      setCards(cards.filter(card => card.id !== cardToDelete.id));
      toast({
        title: t('cardDeletedTitle'),
        description: t('cardDeletedDescription'),
      });
    } catch (error) {
       console.error("Error deleting card: ", error);
       toast({
        title: "Deletion Failed",
        description: "Could not delete the card. Please try again.",
        variant: "destructive",
       });
    } finally {
      setIsDeleting(false);
      setCardToDelete(null);
    }
  };

  
  const formatDate = (timestamp: BusinessCard['createdAt']) => {
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (timestamp && 'seconds' in timestamp) {
      return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
    }
    return new Date();
  };
  
  const getLocalizedValue = (field: BusinessCard['name'] | BusinessCard['title'] | BusinessCard['companyName'] | BusinessCard['address']) => {
      if (typeof field === 'object' && field !== null) {
          return field[language] || field.en || field.zh || '';
      }
      return field || '';
  }

  const filteredAndSortedCards = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    
    let filtered = cards.filter(card => {
      const name = getLocalizedValue(card.name).toLowerCase();
      const title = getLocalizedValue(card.title).toLowerCase();
      const company = getLocalizedValue(card.companyName).toLowerCase();
      const notes = (card.notes || '').toLowerCase();
      
      return name.includes(lowercasedFilter) ||
             title.includes(lowercasedFilter) ||
             company.includes(lowercasedFilter) ||
             notes.includes(lowercasedFilter);
    });

    if (regionFilter !== 'all') {
        filtered = filtered.filter(card => {
            const addressEn = ((typeof card.address === 'object' ? card.address?.en : card.address) || '').toLowerCase();
            const addressZh = (typeof card.address === 'object' ? card.address?.zh : '') || '';
            return addressEn.includes(regionFilter.toLowerCase()) || addressZh.includes(regionFilter);
        });
    }

    return filtered.sort((a, b) => {
        switch (sortOption) {
            case 'createdAt_asc':
                return formatDate(a.createdAt).getTime() - formatDate(b.createdAt).getTime();
            case 'createdAt_desc':
                return formatDate(b.createdAt).getTime() - formatDate(a.createdAt).getTime();
            case 'companyName_asc':
                return getLocalizedValue(a.companyName).localeCompare(getLocalizedValue(b.companyName));
            default:
                return 0;
        }
    });
  }, [cards, searchTerm, sortOption, language, regionFilter]);
  
  const availableDistricts = useMemo(() => {
    const available: { [key: string]: string[] } = {};
    const foundDistrictsSet = new Set<string>();

    cards.forEach(card => {
        const addressEn = ((typeof card.address === 'object' ? card.address?.en : card.address) || '').toLowerCase();
        const addressZh = (typeof card.address === 'object' ? card.address?.zh : '') || '';

        Object.values(hongKongDistricts).flat().forEach(district => {
            if (addressEn.includes(district.toLowerCase()) || addressZh.includes(district)) {
                foundDistrictsSet.add(district);
            }
        });
    });

    Object.entries(hongKongDistricts).forEach(([groupName, districts]) => {
        const foundInGroup = districts.filter(d => foundDistrictsSet.has(d));
        if (foundInGroup.length > 0) {
            available[groupName] = foundInGroup;
        }
    });

    return available;
  }, [cards]);


  const groupedCards = useMemo(() => groupCardsByCompany(filteredAndSortedCards, language), [filteredAndSortedCards, language]);
  const companies = useMemo(() => Object.keys(groupedCards).sort(), [groupedCards]);


  if (isLoading) {
     return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4">{t('loadingSavedCards')}</p>
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
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder={t('searchPlaceholder')}
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-[180px]">
                <Globe className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t('filterByRegion')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allRegions')}</SelectItem>
              {Object.entries(availableDistricts).map(([groupName, districts]) => (
                <SelectGroup key={groupName}>
                  <SelectLabel>{groupName}</SelectLabel>
                  {districts.map(district => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue placeholder={t('sortBy')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt_desc">{t('dateAddedNewest')}</SelectItem>
              <SelectItem value="createdAt_asc">{t('dateAddedOldest')}</SelectItem>
              <SelectItem value="companyName_asc">{t('companyNameAZ')}</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href="/dashboard/scan">
              <Camera className="mr-2 h-4 w-4" />
              {t('scanNewCard')}
            </Link>
          </Button>
        </div>
      </div>

      {filteredAndSortedCards.length === 0 ? (
         <div className="text-center py-12">
            <h3 className="text-xl font-semibold">{t('noCardsFound')}</h3>
            <p className="text-muted-foreground">{searchTerm ? t('noSearchResults') : t('noCardsFoundDescription')}</p>
        </div>
      ) : (
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
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/saved-cards/edit/${card.id}`)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>{t('edit')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => setCardToDelete(card)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>{t('delete')}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="relative aspect-video w-full overflow-hidden">
                        <Image src={card.cardFrontImageUrl} alt={`Card of ${getLocalizedValue(card.name)}`} fill className="object-cover" data-ai-hint="business card"/>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-3 p-4">
                      <CardTitle className="font-headline text-xl">{getLocalizedValue(card.name)}</CardTitle>
                      <div className="text-muted-foreground space-y-2 text-sm">
                        <p className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-accent flex-shrink-0" />
                          <span className="font-semibold">{getLocalizedValue(card.title)} at {getLocalizedValue(card.companyName)}</span>
                        </p>
                         <p className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                          <span>{getLocalizedValue(card.address)}</span>
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
                            src={`https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(getLocalizedValue(card.address))}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}>
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
      )}

      <AlertDialog open={!!cardToDelete} onOpenChange={(open) => !open && setCardToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteCardTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteCardDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
