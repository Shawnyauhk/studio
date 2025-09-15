
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { analyzeCardAndSearchCompanyInfo } from '@/ai/flows/analyze-card-and-search-company-info';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type AnalysisResult = {
  companyName: string;
  companyDescription: string;
};

export default function CardScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setHasCameraPermission(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasCameraPermission(false);
      toast({
        title: "Camera Error",
        description: "Could not access the camera. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const getCameraPermission = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };
    getCameraPermission();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

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
        setImageData(dataUrl);
        
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  };

  const retakeImage = () => {
    setImageData(null);
    setAnalysisResult(null);
    setNotes('');
    startCamera();
  };

  const handleAnalyze = async () => {
    if (!imageData) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeCardAndSearchCompanyInfo({ cardImageDataUri: imageData });
      setAnalysisResult(result);
    } catch (error) {
      console.error("AI analysis failed:", error);
      toast({
        title: "AI Analysis Failed",
        description: "Could not analyze the card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    // In a real app, this would save to Firebase Firestore and Storage
    toast({
      title: "Card Saved!",
      description: "The new business card has been added to your portfolio.",
    });
    // Maybe redirect to dashboard or clear state
    retakeImage();
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="aspect-[4/3] w-full bg-muted rounded-md overflow-hidden relative flex items-center justify-center">
          {imageData ? (
            <Image src={imageData} alt="Captured business card" layout="fill" objectFit="contain" />
          ) : (
             <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
          )}
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
        
        {hasCameraPermission === false && !imageData && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Camera Access Denied</AlertTitle>
            <AlertDescription>
              Please enable camera permissions in your browser settings to use this feature.
            </AlertDescription>
          </Alert>
        )}

        {!analysisResult && (
          <div className="flex justify-center gap-4 mt-4">
            {imageData ? (
              <>
                <Button variant="outline" onClick={retakeImage}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Retake
                </Button>
                <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Analyze with AI
                </Button>
              </>
            ) : (
              <Button onClick={captureImage} disabled={hasCameraPermission !== true}>
                <Camera className="mr-2 h-4 w-4" /> Capture Card
              </Button>
            )}
          </div>
        )}

        {analysisResult && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-headline font-semibold">AI Analysis Results</h3>
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" value={analysisResult.companyName} readOnly />
            </div>
            <div>
              <Label htmlFor="companyDescription">Company Information</Label>
              <Textarea id="companyDescription" value={analysisResult.companyDescription} readOnly rows={5} />
            </div>
             <div>
              <Label htmlFor="notes">Your Notes</Label>
              <Textarea id="notes" placeholder="Add personal notes here..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={retakeImage}>Start Over</Button>
                <Button onClick={handleSave}>
                  <Upload className="mr-2 h-4 w-4" /> Save Card
                </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
