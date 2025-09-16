
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Loader2, Wand2, User, Briefcase, Building, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { analyzeCardAndSearchCompanyInfo, AnalyzeCardAndSearchCompanyInfoOutput } from '@/ai/flows/analyze-card-and-search-company-info';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/context/AuthContext';
import { getFirebase } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';

type AnalysisResult = AnalyzeCardAndSearchCompanyInfoOutput;

type CaptureStage = 'front' | 'back' | 'done';

export default function CardScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [captureStage, setCaptureStage] = useState<CaptureStage>('front');
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();


  const isCameraActive = captureStage === 'front' || captureStage === 'back';

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    // Stop any existing streams first to prevent errors on some devices.
    stopCamera(); 
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasCameraPermission(false);
      toast({
        title: t('cameraErrorTitle'),
        description: t('cameraErrorDescription'),
        variant: "destructive",
      });
    }
  }, [stopCamera, toast, t]);

  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera(); // Cleanup on unmount
    };
  }, [isCameraActive, startCamera, stopCamera]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && videoRef.current.srcObject) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        
        if (captureStage === 'front') {
          setFrontImage(dataUrl);
          setCaptureStage('done'); // Temporarily set to done to stop camera via useEffect
        } else if (captureStage === 'back') {
          setBackImage(dataUrl);
          setCaptureStage('done');
        }
      }
    }
  };

  const retakeImage = () => {
    setFrontImage(null);
    setBackImage(null);
    setAnalysisResult(null);
    setNotes('');
    setCaptureStage('front');
  };
  
  const proceedToCaptureBack = async () => {
     setCaptureStage('back');
     await startCamera();
  }

  const handleAnalyze = async () => {
    if (!frontImage) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeCardAndSearchCompanyInfo({ 
        cardFrontImageDataUri: frontImage,
        cardBackImageDataUri: backImage,
       });
      setAnalysisResult(result);
    } catch (error) {
      console.error("AI analysis failed:", error);
      toast({
        title: t('aiAnalysisFailedTitle'),
        description: t('aiAnalysisFailedDescription'),
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!analysisResult || !user) {
        toast({
            title: "Cannot Save",
            description: "No analysis result or user not logged in.",
            variant: "destructive"
        });
        return;
    }

    setIsSaving(true);
    try {
        const { db, storage } = await getFirebase();
        const cardId = new Date().getTime().toString(); 

        // 1. Upload images to Storage
        const uploadImage = async (dataUrl: string | null, side: 'front' | 'back') => {
            if (!dataUrl) return undefined;
            const storageRef = ref(storage, `businessCards/${user.uid}/${cardId}_${side}.jpg`);
            const snapshot = await uploadString(storageRef, dataUrl, 'data_url');
            return getDownloadURL(snapshot.ref);
        };
        
        const cardFrontImageUrl = await uploadImage(frontImage, 'front');
        const cardBackImageUrl = await uploadImage(backImage, 'back');

        if (!cardFrontImageUrl) {
          throw new Error("Front image failed to upload.");
        }

        // 2. Prepare data for Firestore
        const cardData = {
            userId: user.uid,
            ...analysisResult,
            notes,
            cardFrontImageUrl,
            cardBackImageUrl: cardBackImageUrl || null,
            createdAt: serverTimestamp(),
        };

        // 3. Save data to Firestore
        await addDoc(collection(db, 'businessCards'), cardData);

        toast({
            title: t('cardSavedTitle'),
            description: t('cardSavedDescription'),
        });
        router.push('/dashboard/saved-cards');

    } catch (error) {
        console.error("Error saving card: ", error);
        toast({
            title: "Save Failed",
            description: "Could not save the card. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
    }
};
  
  const renderCaptureUI = () => {
    if (analysisResult) return null;

    if (!frontImage) {
      return (
        <div className="flex justify-center gap-4 mt-4">
          <Button onClick={captureImage} disabled={hasCameraPermission !== true}>
            <Camera className="mr-2 h-4 w-4" /> {t('captureFront')}
          </Button>
        </div>
      );
    }

    if (frontImage && !backImage && captureStage !== 'back') {
       return (
        <div className="flex justify-center gap-4 mt-4">
          <Button variant="outline" onClick={retakeImage}>
            <RefreshCw className="mr-2 h-4 w-4" /> {t('retake')}
          </Button>
          <Button onClick={proceedToCaptureBack}>
            <Camera className="mr-2 h-4 w-4" /> {t('captureBack')}
          </Button>
        </div>
      );
    }
    
    if (captureStage === 'back') {
      return (
        <div className="flex justify-center gap-4 mt-4">
          <Button onClick={captureImage} disabled={hasCameraPermission !== true}>
            <Camera className="mr-2 h-4 w-4" /> {t('captureBack')}
          </Button>
        </div>
      );
    }

    if ((frontImage && captureStage === 'done') || (frontImage && backImage)) {
       return (
        <div className="flex justify-center gap-4 mt-4">
          <Button variant="outline" onClick={retakeImage}>
            <RefreshCw className="mr-2 h-4 w-4" /> {t('retake')}
          </Button>
          <Button onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            {t('analyzeWithAI')}
          </Button>
        </div>
       )
    }
    
    return null;
  }
  
  const getLocalizedValue = (field?: { en: string; zh: string }) => {
    if (!field) return '';
    return field[language] || field.en || '';
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="aspect-video w-full bg-muted rounded-md overflow-hidden relative flex items-center justify-center">
          {isCameraActive && !analysisResult ? (
             <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
          ) : (
            <div className='flex items-center justify-center w-full h-full gap-4 p-4 bg-muted/50'>
              {frontImage && (
                <div className="flex-1 flex flex-col items-center gap-2">
                   <p className="font-semibold">{t('frontSide')}</p>
                   <Image src={frontImage} alt="Captured business card front" width={240} height={135} className="object-contain rounded-md border" />
                </div>
              )}
              {backImage && (
                 <div className="flex-1 flex flex-col items-center gap-2">
                   <p className="font-semibold">{t('backSide')}</p>
                   <Image src={backImage} alt="Captured business card back" width={240} height={135} className="object-contain rounded-md border" />
                </div>
              )}
               {!frontImage && !backImage && (
                 <div className="text-muted-foreground text-center">
                   <Camera className="mx-auto h-12 w-12" />
                   <p>{t('scanCardInstruction')}</p>
                 </div>
               )}
            </div>
          )}
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
        
        {hasCameraPermission === false && isCameraActive && !analysisResult && (
          <Alert variant="destructive">
            <AlertTitle>{t('cameraAccessDeniedTitle')}</AlertTitle>
            <AlertDescription>
              {t('cameraAccessDeniedDescription')}
            </AlertDescription>
          </Alert>
        )}

        {renderCaptureUI()}

        {analysisResult && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-headline font-semibold">{t('aiAnalysisResults')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name" className="flex items-center gap-2 text-muted-foreground"><User />{t('fullName')}</Label>
                <Input id="name" defaultValue={getLocalizedValue(analysisResult.name)} readOnly />
              </div>
              <div className="space-y-1">
                <Label htmlFor="title" className="flex items-center gap-2 text-muted-foreground"><Briefcase />{t('jobTitle')}</Label>
                <Input id="title" defaultValue={getLocalizedValue(analysisResult.title)} readOnly />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="companyName" className="flex items-center gap-2 text-muted-foreground"><Building />{t('companyName')}</Label>
              <Input id="companyName" defaultValue={getLocalizedValue(analysisResult.companyName)} readOnly />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-muted-foreground"><Phone />{t('phone')}</Label>
                  <Input id="phone" defaultValue={analysisResult.phone} readOnly />
              </div>
              <div className="space-y-1">
                  <Label htmlFor="email" className="flex items-center gap-2 text-muted-foreground"><Mail />{t('email')}</Label>
                  <Input id="email" defaultValue={analysisResult.email} readOnly />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="address" className="flex items-center gap-2 text-muted-foreground"><MapPin />{t('address')}</Label>
              <Input id="address" defaultValue={getLocalizedValue(analysisResult.address)} readOnly />
            </div>

            <div>
              <Label htmlFor="companyDescription">{t('companyInformation')}</Label>
              <Textarea id="companyDescription" defaultValue={analysisResult.companyDescription} readOnly rows={4} />
            </div>
             <div>
              <Label htmlFor="notes">{t('yourNotes')}</Label>
              <Textarea id="notes" placeholder={t('notesPlaceholder')} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={retakeImage} disabled={isSaving}>{t('startOver')}</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  {t('saveCard')}
                </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
