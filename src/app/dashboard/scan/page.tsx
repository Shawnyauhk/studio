import CardScanner from '@/components/CardScanner';

export default function ScanPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-headline font-bold">Scan Business Card</h1>
        <p className="text-muted-foreground">
          Position the card within the frame and capture.
        </p>
      </div>
      <CardScanner />
    </div>
  );
}
