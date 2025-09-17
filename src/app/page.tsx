'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { Camera, Languages, HardDrive } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/hooks/use-translation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DigitalCard from '@/components/DigitalCard';
import Header from '@/components/Header';


const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.426,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

function LoggedInView() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <div className="space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-headline font-bold">{t('yourDigitalCard')}</h1>
              <p className="text-muted-foreground">
                {t('digitalCardDescription')}
              </p>
            </div>
          </div>
          <DigitalCard />
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-sm mx-auto">
              <Button asChild variant="outline">
                <Link href="/dashboard/saved-cards">
                  <HardDrive className="mr-2" />
                  {t('savedCards')}
                </Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/scan">
                  <Camera className="mr-2" />
                  {t('scanNewCard')}
                </Link>
              </Button>
            </div>
        </div>
      </main>
    </div>
  )
}


function LoggedOutView() {
  const { signInWithGoogle } = useAuth();
  const { t, setLanguage, language } = useTranslation();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in failed", error);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-8 bg-background">
       <div className="absolute top-4 right-4 md:top-8 md:right-8">
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Languages className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
               <DropdownMenuItem onClick={() => setLanguage('en')}>
                  English {language === 'en' && <span className="ml-auto">✔</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('zh')}>
                  繁體中文 {language === 'zh' && <span className="ml-auto">✔</span>}
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Logo />
            </div>
            <CardTitle className="font-headline text-3xl">BizCard Portfolio</CardTitle>
            <CardDescription>{t('appDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-muted-foreground">
                {t('appSubDescription')}
              </p>
               <Button onClick={handleLogin} className="w-full text-lg py-6" size="lg" variant="outline">
                  <GoogleIcon className="mr-2 h-6 w-6" />
                  {t('signInWithGoogle')}
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


export default function Home() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  
  if (loading) {
    return (
       <div className="flex min-h-screen flex-col items-center justify-center">
         <p>{t('loading')}...</p>
      </div>
    );
  }

  return user ? <LoggedInView /> : <LoggedOutView />;
}
