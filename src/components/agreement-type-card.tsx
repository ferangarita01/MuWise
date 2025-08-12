
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AgreementType } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

interface AgreementTypeCardProps {
  type: AgreementType;
  onSelect: () => void;
}

export function AgreementTypeCard({ type, onSelect }: AgreementTypeCardProps) {
  return (
    <Card className="flex flex-col h-full transition-all duration-300 hover:border-primary hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="text-4xl">{type.icon}</div>
           <Badge variant="outline">{type.badge}</Badge>
        </div>
        <CardTitle className="pt-4">{type.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{type.description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onSelect}>
          Select
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
