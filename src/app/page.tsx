import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { Camera } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="absolute top-4 right-4 md:top-8 md:right-8">
        <Link href="/dashboard/scan">
          <Button variant="default">
            <Camera className="mr-2 h-4 w-4" />
            Scan Card
          </Button>
        </Link>
      </div>
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Logo />
            </div>
            <CardTitle className="font-headline text-3xl">BizCard Portfolio</CardTitle>
            <CardDescription>Your AI-powered business card manager.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-muted-foreground">
                Scan, store, and search your business cards effortlessly.
              </p>
              <Link href="/dashboard" className="w-full">
                <Button className="w-full text-lg py-6" size="lg">Login to Your Workspace</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
