import DigitalCard from '@/components/DigitalCard';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Your Digital Card</h1>
          <p className="text-muted-foreground">
            Create and share your personal digital business card.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/scan">
            <Camera className="mr-2 h-4 w-4" />
            Scan New Card
          </Link>
        </Button>
      </div>
      <DigitalCard />
    </div>
  );
}
