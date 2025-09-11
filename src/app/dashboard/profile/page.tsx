import DigitalCard from '@/components/DigitalCard';

export default function ProfilePage() {
  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-headline font-bold">Your Digital Card</h1>
        <p className="text-muted-foreground">
          Create and share your personal digital business card.
        </p>
      </div>
      <DigitalCard />
    </div>
  );
}
