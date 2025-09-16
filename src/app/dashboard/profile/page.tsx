'use client';
import DigitalCard from '@/components/DigitalCard';
import { useTranslation } from '@/hooks/use-translation';

export default function ProfilePage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-headline font-bold">{t('yourDigitalCard')}</h1>
        <p className="text-muted-foreground">
          {t('digitalCardDescription')}
        </p>
      </div>
      <DigitalCard />
    </div>
  );
}
