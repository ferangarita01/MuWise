
import { Music } from 'lucide-react';
import type { Agreement } from '@/lib/types';
import { Separator } from './ui/separator';

export function DocumentHeader({ agreement }: { agreement: Agreement }) {
  return (
    <header className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Music className="h-8 w-8 text-primary" />
            <span className="font-sans text-xl font-semibold">Muwise</span>
        </div>
        <div className="text-right text-xs">
            <p><strong>Agreement ID:</strong> {agreement.id}</p>
            <p><strong>Created on:</strong> {new Date(agreement.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold uppercase tracking-wider" style={{fontFamily: "Arial, sans-serif", color: "#1e40af"}}>
            Songwriter Split Agreement
        </h1>
        <p className="text-sm text-muted-foreground" style={{fontFamily: "Arial, sans-serif"}}>
            Rights and Royalties Distribution Contract
        </p>
      </div>
       <Separator className="bg-gray-300" />
    </header>
  );
}

    