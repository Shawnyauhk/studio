'use client';
import CardScanner from '@/components/CardScanner';
import { useTranslation } from '@/hooks/use-translation';

export default function ScanPage() {
  const { t } = useTranslation();
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-headline font-bold">{t('scanBusinessCard')}</h1>
        <p className="text-muted-foreground">
          {t('scanCardInstruction')}
        </p>
      </div>
      <CardScanner />
    </div>
  );
}
