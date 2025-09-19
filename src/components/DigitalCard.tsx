
'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockUserDigitalCard } from '@/lib/mock-data';
import type { DigitalCardData } from '@/lib/types';
import { Phone, Mail, Globe, MapPin, Edit, Check, QrCode, Star, Download, Share2, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getFirebase } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/context/AuthContext';


function DigitalCardPreview({ cardData, onEdit }: { cardData: DigitalCardData, onEdit: () => void }) {
    const { t } = useTranslation();
    const [isQrCodeOpen, setIsQrCodeOpen] = useState(false);
    return (
      <div className="space-y-6">
        <div className="w-full max-w-sm mx-auto bg-card rounded-2xl shadow-2xl p-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsQrCodeOpen(true)}>
                    <QrCode className="mr-2"/>{t('showWebsiteQR')}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Star className="mr-2"/>{t('addToFavorites')}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2"/>{t('saveToDesktop')}
                  </DropdownMenuItem>
                   <DropdownMenuItem>
                    <Share2 className="mr-2"/>{t('shareThisPage')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button onClick={onEdit} variant="ghost" size="icon">
                <Edit className="h-5 w-5" />
              </Button>
            </div>
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/20 rounded-full"></div>
            <div className="absolute -bottom-24 -left-12 w-48 h-48 bg-accent/10 rounded-full"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative w-32 h-32 rounded-full border-4 border-primary p-1">
                    <Image
                        src={cardData.avatarUrl}
                        alt={cardData.name}
                        width={128}
                        height={128}
                        className="rounded-full object-cover"
                        data-ai-hint="portrait person"
                    />
                </div>

                <h2 className="font-headline text-3xl font-bold mt-4">{cardData.name}</h2>
                <p className="text-accent font-semibold">{cardData.title}</p>
                <p className="text-muted-foreground mt-1">{cardData.company}</p>

                <div className="w-full space-y-3 mt-8 text-left">
                    <a href={`tel:${cardData.phone}`} className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent/10 transition-colors">
                        <Phone className="w-5 h-5 text-primary" />
                        <span>{cardData.phone}</span>
                    </a>
                    <a href={`mailto:${cardData.email}`} className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent/10 transition-colors">
                        <Mail className="w-5 h-5 text-primary" />
                        <span>{cardData.email}</span>
                    </a>
                     <a href={cardData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent/10 transition-colors">
                        <Globe className="w-5 h-5 text-primary" />
                        <span>{cardData.website}</span>
                    </a>
                     <div className="flex items-center gap-4 p-2 rounded-lg">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span>{cardData.address}</span>
                    </div>
                </div>
            </div>
        </div>

        <Dialog open={isQrCodeOpen} onOpenChange={setIsQrCodeOpen}>
          <DialogContent className="sm:max-w-xs">
            <DialogHeader>
              <DialogTitle className="text-center font-headline">{t('showWebsiteQR')}</DialogTitle>
            </DialogHeader>
            <div className="p-4 bg-white rounded-lg flex items-center justify-center">
              <QRCode value={cardData.website} size={256} />
            </div>
            <p className="text-center text-muted-foreground text-sm">{cardData.website}</p>
          </DialogContent>
        </Dialog>
        
        <div className="w-full max-w-sm mx-auto space-y-4">
          <h3 className="text-center font-headline text-lg">{t('companyLocation')}</h3>
          <div className="aspect-video rounded-lg overflow-hidden border">
             <iframe
                width="100%"
                height="100%"
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(cardData.address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}>
              </iframe>
          </div>
        </div>
      </div>
    );
}


function DigitalCardForm({ cardData, onUpdate, onSave, onCancel, isSaving }: { cardData: DigitalCardData, onUpdate: (data: DigitalCardData) => void, onSave: () => void, onCancel: () => void, isSaving: boolean }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: t('fileTooLargeTitle'),
          description: t('fileTooLargeDescription'),
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onUpdate({ ...cardData, avatarUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-headline text-xl">{t('editYourDetails')}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="flex items-center gap-4">
            <div className="relative">
                <Image
                    src={cardData.avatarUrl}
                    alt="Avatar Preview"
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                />
            </div>
            <Button variant="outline" onClick={handleAvatarClick}>
                <Upload className="mr-2 h-4 w-4" />
                {t('changeAvatar')}
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleFileChange}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">{t('fullName')}</Label>
            <Input id="name" value={cardData.name} onChange={e => onUpdate({...cardData, name: e.target.value})} />
          </div>
          <div>
            <Label htmlFor="title">{t('jobTitle')}</Label>
            <Input id="title" value={cardData.title} onChange={e => onUpdate({...cardData, title: e.target.value})} />
          </div>
        </div>
        <div>
            <Label htmlFor="company">{t('company')}</Label>
            <Input id="company" value={cardData.company} onChange={e => onUpdate({...cardData, company: e.target.value})} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">{t('phone')}</Label>
            <Input id="phone" type="tel" value={cardData.phone} onChange={e => onUpdate({...cardData, phone: e.target.value})} />
          </div>
          <div>
            <Label htmlFor="email">{t('email')}</Label>
            <Input id="email" type="email" value={cardData.email} onChange={e => onUpdate({...cardData, email: e.target.value})} />
          </div>
        </div>
         <div>
            <Label htmlFor="website">{t('website')}</Label>
            <Input id="website" type="url" value={cardData.website} onChange={e => onUpdate({...cardData, website: e.target.value})} />
        </div>
        <div>
            <Label htmlFor="address">{t('address')}</Label>
            <Input id="address" value={cardData.address} onChange={e => onUpdate({...cardData, address: e.target.value})} />
        </div>
      </div>
      <DialogFooter>
          <Button variant="ghost" onClick={onCancel} disabled={isSaving}>{t('cancel')}</Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            {t('saveChanges')}
          </Button>
      </DialogFooter>
    </>
  )
}

export default function DigitalCard() {
  const [cardData, setCardData] = useState<DigitalCardData>(mockUserDigitalCard);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<DigitalCardData>(cardData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchCardData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      };
      
      setIsLoading(true);
      try {
        const { db } = await getFirebase();
        const cardDocRef = doc(db, 'digitalCards', user.uid);
        const docSnap = await getDoc(cardDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as DigitalCardData;
          setCardData(data);
          setEditData(data);
        } else {
          // If no data exists, it's a new user.
          // 1. Set local state to mock data so the UI displays something immediately.
          setCardData(mockUserDigitalCard);
          setEditData(mockUserDigitalCard);
          // 2. Silently try to save this mock data to Firestore for the new user.
          // We don't await this or handle errors with a toast because it's a background sync.
          // If it fails, the user can still edit and save, which will trigger the full save flow.
          setDoc(cardDocRef, mockUserDigitalCard).catch(console.error);
        }
      } catch (error) {
        console.error("Failed to fetch data from Firestore:", error);
        // Fallback to mock data on read error, but show a toast this time.
        setCardData(mockUserDigitalCard);
        setEditData(mockUserDigitalCard);
        toast({
            title: t('fetchDataErrorTitle'),
            description: t('fetchDataErrorDescription'),
            variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCardData();
  }, [user]);
  
  const handleSave = async () => {
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to save.", variant: "destructive" });
        return;
    }

    setIsSaving(true);
    let dataToSave = { ...editData };

    try {
      const { db, storage } = await getFirebase();

      // Step 1: Upload image only if it's a new one (a data URL)
      if (dataToSave.avatarUrl.startsWith('data:image')) {
        const storageRef = ref(storage, `avatars/${user.uid}/profile.png`);
        // Crucially, add 'data_url' to specify the format of the string.
        const snapshot = await uploadString(storageRef, dataToSave.avatarUrl, 'data_url');
        const uploadedUrl = await getDownloadURL(snapshot.ref);
        dataToSave.avatarUrl = uploadedUrl;
      }
      
      // Step 2: Save data to Firestore under the user's uid
      const cardDocRef = doc(db, 'digitalCards', user.uid);
      await setDoc(cardDocRef, dataToSave, { merge: true });
      
      setCardData(dataToSave);
      setIsEditing(false);
      toast({
          title: t('saveSuccessTitle'),
          description: t('saveSuccessDescription'),
      });

    } catch (error) {
        console.error("An unexpected error occurred during save:", error);
        toast({
            title: t('unknownErrorTitle'),
            description: t('unknownErrorDescription'),
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    setEditData(cardData); // Reset changes
    setIsEditing(false);
  }

  const handleEdit = () => {
    setEditData(cardData);
    setIsEditing(true);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4">{t('loadingDigitalCard')}...</p>
      </div>
    );
  }

  return (
    <Dialog open={isEditing} onOpenChange={(open) => { if (!isSaving) setIsEditing(open)}}>
      <div className="max-w-sm mx-auto">
          <DigitalCardPreview cardData={cardData} onEdit={handleEdit} />
      </div>
       <DialogContent className="sm:max-w-[625px]">
          <DigitalCardForm 
            cardData={editData} 
            onUpdate={setEditData} 
            onSave={handleSave} 
            onCancel={handleCancel}
            isSaving={isSaving}
          />
      </DialogContent>
    </Dialog>
  );
}
