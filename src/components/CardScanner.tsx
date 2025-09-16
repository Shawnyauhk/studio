
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
import { analyzeCardAndSearchCompanyInfo } from '@/ai/flows/analyze-card-and-search-company-info';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from '@/hooks/use-translation';

type AnalysisResult = {
  name: string;
  title: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  companyDescription: string;
};

type CaptureStage = 'front' | 'back' | 'done';

export default function CardScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [captureStage, setCaptureStage] = useState<CaptureStage>('front');
  const { t } = useTranslation();

  const isCameraActive = !frontImage || (frontImage && !backImage && captureStage === 'back');

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera(); // Stop any existing streams first
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
          setCaptureStage('back');
          stopCamera();
        } else if (captureStage === 'back') {
          setBackImage(dataUrl);
          setCaptureStage('done');
          stopCamera();
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
  
  const proceedToCaptureBack = () => {
     setCaptureStage('back');
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

  const handleSave = () => {
    // In a real app, this would save to Firebase Firestore and Storage
    toast({
      title: t('cardSavedTitle'),
      description: t('cardSavedDescription'),
    });
    retakeImage();
  };

  const renderCaptureUI = () => {
    if (captureStage === 'done' || analysisResult) return null;

    if (!frontImage) {
      return (
        <div className="flex justify-center gap-4 mt-4">
          <Button onClick={captureImage} disabled={hasCameraPermission !== true}>
            <Camera className="mr-2 h-4 w-4" /> {t('captureFront')}
          </Button>
        </div>
      );
    }

    if (frontImage && !backImage) {
       return (
        <div className="flex justify-center gap-4 mt-4">
          <Button variant="outline" onClick={retakeImage}>
            <RefreshCw className="mr-2 h-4 w-4" /> {t('retake')}
          </Button>
          <Button onClick={proceedToCaptureBack} disabled={captureStage === 'back'}>
            <Camera className="mr-2 h-4 w-4" /> {t('captureBack')}
          </Button>
        </div>
      );
    }

    if (frontImage && backImage) {
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
  
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="aspect-video w-full bg-muted rounded-md overflow-hidden relative flex items-center justify-center">
          {isCameraActive ? (
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
            </div>
          )}
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
        
        {hasCameraPermission === false && isCameraActive && (
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
                <Input id="name" value={analysisResult.name} readOnly />
              </div>
              <div className="space-y-1">
                <Label htmlFor="title" className="flex items-center gap-2 text-muted-foreground"><Briefcase />{t('jobTitle')}</Label>
                <Input id="title" value={analysisResult.title} readOnly />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="companyName" className="flex items-center gap-2 text-muted-foreground"><Building />{t('companyName')}</Label>
              <Input id="companyName" value={analysisResult.companyName} readOnly />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-muted-foreground"><Phone />{t('phone')}</Label>
                  <Input id="phone" value={analysisResult.phone} readOnly />
              </div>
              <div className="space-y-1">
                  <Label htmlFor="email" className="flex items-center gap-2 text-muted-foreground"><Mail />{t('email')}</Label>
                  <Input id="email" value={analysisResult.email} readOnly />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="address" className="flex items-center gap-2 text-muted-foreground"><MapPin />{t('address')}</Label>
              <Input id="address" value={analysisResult.address} readOnly />
            </div>

            <div>
              <Label htmlFor="companyDescription">{t('companyInformation')}</Label>
              <Textarea id="companyDescription" value={analysisResult.companyDescription} readOnly rows={4} />
            </div>
             <div>
              <Label htmlFor="notes">{t('yourNotes')}</Label>
              <Textarea id="notes" placeholder={t('notesPlaceholder')} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={retakeImage}>{t('startOver')}</Button>
                <Button onClick={handleSave}>
                  <Upload className="mr-2 h-4 w-4" /> {t('saveCard')}
                </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
