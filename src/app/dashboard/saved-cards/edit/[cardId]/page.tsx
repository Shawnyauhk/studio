
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EditCardPage() {
    const { t } = useTranslation();
    const params = useParams();
    const cardId = params.cardId as string;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/saved-cards">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Saved Cards
                </Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Edit Business Card</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Editing form for card ID: {cardId} will be here.</p>
                    {/* Placeholder for the editing form */}
                </CardContent>
            </Card>
        </div>
    );
}
