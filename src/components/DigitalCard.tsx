
'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
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
} from "@/components/ui/dialog"
import { getFirebase } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';


const USER_ID = 'user-123'; // Using a mock user ID for now

function DigitalCardPreview({ cardData, onEdit }: { cardData: DigitalCardData, onEdit: () => void }) {
    return (
      <div className="space-y-6">
        <div className="w-full max-w-sm mx-auto bg-card rounded-2xl shadow-2xl p-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 z-20">
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
        
        <div className="w-full max-w-sm mx-auto space-y-2">
            <Button className="w-full justify-start" variant="outline"><QrCode className="mr-2"/> Show Website QR</Button>
            <Button className="w-full justify-start" variant="outline"><Star className="mr-2"/> Add to Favorites</Button>
            <Button className="w-full justify-start" variant="outline"><Download className="mr-2"/> Save to Desktop</Button>
            <Button className="w-full justify-start" variant="outline"><Share2 className="mr-2"/> Share This Page</Button>
        </div>

        <div className="w-full max-w-sm mx-auto space-y-4">
          <h3 className="text-center font-headline text-lg">Company Location</h3>
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "檔案太大",
          description: "請選擇小於 2MB 的圖片。",
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
        <DialogTitle className="font-headline text-xl">編輯您的詳細資料</DialogTitle>
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
                更換頭像
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
            <Label htmlFor="name">全名</Label>
            <Input id="name" value={cardData.name} onChange={e => onUpdate({...cardData, name: e.target.value})} />
          </div>
          <div>
            <Label htmlFor="title">職稱 / 職位</Label>
            <Input id="title" value={cardData.title} onChange={e => onUpdate({...cardData, title: e.target.value})} />
          </div>
        </div>
        <div>
            <Label htmlFor="company">公司</Label>
            <Input id="company" value={cardData.company} onChange={e => onUpdate({...cardData, company: e.target.value})} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">電話</Label>
            <Input id="phone" type="tel" value={cardData.phone} onChange={e => onUpdate({...cardData, phone: e.target.value})} />
          </div>
          <div>
            <Label htmlFor="email">電子郵件</Label>
            <Input id="email" type="email" value={cardData.email} onChange={e => onUpdate({...cardData, email: e.target.value})} />
          </div>
        </div>
         <div>
            <Label htmlFor="website">網站</Label>
            <Input id="website" type="url" value={cardData.website} onChange={e => onUpdate({...cardData, website: e.target.value})} />
        </div>
        <div>
            <Label htmlFor="address">地址</Label>
            <Input id="address" value={cardData.address} onChange={e => onUpdate({...cardData, address: e.target.value})} />
        </div>
      </div>
      <DialogFooter>
          <Button variant="ghost" onClick={onCancel} disabled={isSaving}>取消</Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            儲存變更
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
  
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchCardData = async () => {
      setIsLoading(true);
      try {
        const { db } = await getFirebase();
        const cardDocRef = doc(db, 'digitalCards', USER_ID);
        const docSnap = await getDoc(cardDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as DigitalCardData;
          setCardData(data);
          setEditData(data);
        } else {
          // If no data in Firestore, set the mock data and save it.
          await setDoc(cardDocRef, mockUserDigitalCard);
          setCardData(mockUserDigitalCard);
          setEditData(mockUserDigitalCard);
        }
      } catch (error) {
        console.error("Failed to fetch or set data in Firestore:", error);
        toast({
            title: "讀取資料失敗",
            description: "無法從後端讀取您的名片資料。將使用預設資料。",
            variant: "destructive",
        });
        // Fallback to mock data on error
        setCardData(mockUserDigitalCard);
        setEditData(mockUserDigitalCard);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCardData();
  }, [toast]);
  
  const handleSave = async () => {
    setIsSaving(true);
    let dataToSave = { ...editData };

    try {
      const { db, storage } = await getFirebase();

      // Step 1: Upload image only if it's a new one (a data URL)
      if (dataToSave.avatarUrl.startsWith('data:image')) {
        const storageRef = ref(storage, `avatars/${USER_ID}/profile.png`);
        // Crucially, add 'data_url' to specify the format of the string.
        const snapshot = await uploadString(storageRef, dataToSave.avatarUrl, 'data_url');
        const uploadedUrl = await getDownloadURL(snapshot.ref);
        dataToSave.avatarUrl = uploadedUrl;
      }
      
      // Step 2: Save data to Firestore
      const cardDocRef = doc(db, 'digitalCards', USER_ID);
      await setDoc(cardDocRef, dataToSave, { merge: true });
      
      setCardData(dataToSave);
      setIsEditing(false);
      toast({
          title: "儲存成功",
          description: "您的數位名片已成功更新。",
      });

    } catch (error) {
        console.error("An unexpected error occurred during save:", error);
        toast({
            title: "發生未知錯誤",
            description: "儲存過程中發生預期之外的錯誤。請檢查您的 Firebase 安全規則是否已部署。",
            variant: "destructive",
        });
    } finally {
        // This block is guaranteed to run, ensuring the loading state is always reset.
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
        <p className="ml-4">讀取您的數位名片...</p>
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

    