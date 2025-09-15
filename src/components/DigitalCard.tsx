
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockUserDigitalCard } from '@/lib/mock-data';
import type { DigitalCardData } from '@/lib/types';
import { Phone, Mail, Globe, MapPin, Edit, Check, QrCode, Star, Download, Share2 } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'digital-card-data';

function DigitalCardPreview({ cardData }: { cardData: DigitalCardData }) {
    return (
      <div className="space-y-6">
        <div className="w-full max-w-sm mx-auto bg-card rounded-2xl shadow-2xl p-6 relative overflow-hidden">
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


function DigitalCardForm({ cardData, onUpdate, onSave, onCancel }: { cardData: DigitalCardData, onUpdate: (data: DigitalCardData) => void, onSave: () => void, onCancel: () => void }) {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h3 className="font-headline text-xl">Edit Your Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={cardData.name} onChange={e => onUpdate({...cardData, name: e.target.value})} />
          </div>
          <div>
            <Label htmlFor="title">Title / Position</Label>
            <Input id="title" value={cardData.title} onChange={e => onUpdate({...cardData, title: e.target.value})} />
          </div>
        </div>
        <div>
            <Label htmlFor="company">Company</Label>
            <Input id="company" value={cardData.company} onChange={e => onUpdate({...cardData, company: e.target.value})} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" value={cardData.phone} onChange={e => onUpdate({...cardData, phone: e.target.value})} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={cardData.email} onChange={e => onUpdate({...cardData, email: e.target.value})} />
          </div>
        </div>
         <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" type="url" value={cardData.website} onChange={e => onUpdate({...cardData, website: e.target.value})} />
        </div>
        <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={cardData.address} onChange={e => onUpdate({...cardData, address: e.target.value})} />
        </div>
        <div>
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input id="avatarUrl" type="url" value={cardData.avatarUrl} onChange={e => onUpdate({...cardData, avatarUrl: e.target.value})} />
        </div>
        <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button onClick={onSave}><Check className="mr-2 h-4 w-4" /> Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DigitalCard() {
  const [cardData, setCardData] = useState<DigitalCardData>(mockUserDigitalCard);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<DigitalCardData>(cardData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      setCardData(JSON.parse(savedData));
      setEditData(JSON.parse(savedData));
    }
    setIsLoaded(true);
  }, []);
  
  const handleSave = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(editData));
    setCardData(editData);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditData(cardData);
    setIsEditing(false);
  }

  const handleEdit = () => {
    setEditData(cardData);
    setIsEditing(true);
  }

  if (!isLoaded) {
    return null; // or a loading spinner
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="lg:sticky top-24">
            <DigitalCardPreview cardData={cardData} />
        </div>
        <div className="space-y-4">
          {isEditing ? (
              <DigitalCardForm cardData={editData} onUpdate={setEditData} onSave={handleSave} onCancel={handleCancel}/>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-headline text-xl">Your Card Preview</h3>
                  <Button onClick={handleEdit} variant="outline"><Edit className="mr-2 h-4 w-4"/>Edit</Button>
                </div>
                <p className="text-muted-foreground mt-2">This is how your card appears to others. Click edit to make changes.</p>
              </CardContent>
            </Card>
          )}
        </div>
    </div>
  );
}
