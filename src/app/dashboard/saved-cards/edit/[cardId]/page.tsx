
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import type { BusinessCard } from '@/lib/types';
import { getFirebase } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

// Helper to ensure bilingual fields are objects
const ensureBilingualObject = (field: any) => {
    if (typeof field === 'string') {
        return { en: field, zh: '' };
    }
    if (typeof field === 'object' && field !== null) {
        return { en: field.en || '', zh: field.zh || '' };
    }
    return { en: '', zh: '' };
};


export default function EditCardPage() {
    const { t } = useTranslation();
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const cardId = params.cardId as string;

    const [card, setCard] = useState<BusinessCard | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!cardId) return;

        const fetchCard = async () => {
            setIsLoading(true);
            try {
                const { db } = await getFirebase();
                const cardRef = doc(db, 'businessCards', cardId);
                const docSnap = await getDoc(cardRef);

                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() } as BusinessCard;
                    // Normalize data to ensure bilingual fields are objects
                    data.name = ensureBilingualObject(data.name);
                    data.title = ensureBilingualObject(data.title);
                    data.companyName = ensureBilingualObject(data.companyName);
                    data.address = ensureBilingualObject(data.address);
                    setCard(data);
                } else {
                    toast({
                        title: "Card not found",
                        description: "The requested business card does not exist.",
                        variant: "destructive",
                    });
                    router.push('/dashboard/saved-cards');
                }
            } catch (error) {
                console.error("Error fetching card:", error);
                toast({
                    title: "Error",
                    description: "Failed to load card data. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchCard();
    }, [cardId, router, toast]);
    
    const handleInputChange = (field: keyof BusinessCard, value: any) => {
        if (card) {
            setCard({ ...card, [field]: value });
        }
    };

    const handleBilingualChange = (field: 'name' | 'title' | 'companyName' | 'address', lang: 'en' | 'zh', value: string) => {
        if (card) {
            const currentBilingualValue = card[field] as { en: string; zh: string; };
            setCard({
                ...card,
                [field]: {
                    ...currentBilingualValue,
                    [lang]: value,
                },
            });
        }
    };

    const handleSaveChanges = async () => {
        if (!card) return;
        setIsSaving(true);
        try {
            const { db } = await getFirebase();
            const cardRef = doc(db, 'businessCards', cardId);
            // We only update the fields that are editable.
            await updateDoc(cardRef, {
                name: card.name,
                title: card.title,
                companyName: card.companyName,
                address: card.address,
                phone: card.phone,
                email: card.email,
                notes: card.notes,
            });
            toast({
                title: "Success",
                description: "Business card updated successfully.",
            });
            router.push('/dashboard/saved-cards');
        } catch (error) {
             console.error("Error updating card:", error);
             toast({
                title: "Update Failed",
                description: "Could not update the card. Please try again.",
                variant: "destructive",
             });
        } finally {
            setIsSaving(false);
        }
    };

    const renderBilingualTabs = (field: 'name' | 'title' | 'companyName' | 'address', label: string) => {
        if (!card) return null;
        const value = card[field] as { en: string; zh: string; };

        return (
             <div>
                <Label>{label}</Label>
                <Tabs defaultValue="en" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="en">English</TabsTrigger>
                        <TabsTrigger value="zh">繁體中文</TabsTrigger>
                    </TabsList>
                    <TabsContent value="en">
                        <Input 
                          value={value.en}
                          onChange={(e) => handleBilingualChange(field, 'en', e.target.value)}
                          placeholder={`${label} (English)`}
                        />
                    </TabsContent>
                    <TabsContent value="zh">
                        <Input 
                          value={value.zh}
                          onChange={(e) => handleBilingualChange(field, 'zh', e.target.value)}
                          placeholder={`${label} (繁體中文)`}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        )
    }

    const renderSkeleton = () => (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
             <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-20 w-full" />
            </div>
             <div className="flex justify-end gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/saved-cards">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Saved Cards
                </Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Edit Business Card</CardTitle>
                    <CardDescription>Update the details of the scanned business card below.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? renderSkeleton() : card && (
                        <div className="space-y-6">
                            {renderBilingualTabs('name', t('fullName'))}
                            {renderBilingualTabs('title', t('jobTitle'))}
                            {renderBilingualTabs('companyName', t('companyName'))}
                            {renderBilingualTabs('address', t('address'))}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="phone">{t('phone')}</Label>
                                    <Input id="phone" value={card.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="email">{t('email')}</Label>
                                    <Input id="email" type="email" value={card.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                                </div>
                            </div>
                            
                            <div>
                                <Label htmlFor="notes">{t('yourNotes')}</Label>
                                <Textarea id="notes" value={card.notes} onChange={(e) => handleInputChange('notes', e.target.value)} placeholder={t('notesPlaceholder')} />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => router.push('/dashboard/saved-cards')} disabled={isSaving}>
                                    {t('cancel')}
                                </Button>
                                <Button onClick={handleSaveChanges} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    {t('saveChanges')}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

    