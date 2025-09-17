'use client';
import DigitalCard from '@/components/DigitalCard';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { Camera } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">{t('yourDigitalCard')}</h1>
          <p className="text-muted-foreground">
            {t('digitalCardDescription')}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/scan">
            <Camera className="mr-2 h-4 w-4" />
            {t('scanNewCard')}
          </Link>
        </Button>
      </div>
      <DigitalCard />
    </div>
  );
}
