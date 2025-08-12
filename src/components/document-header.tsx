
import { Music } from 'lucide-react';
import type { Agreement } from '@/lib/types';
import { Separator } from './ui/separator';
import { format } from 'date-fns';

export function DocumentHeader({ agreement }: { agreement: Agreement }) {
  return (
    <header className="space-y-4">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold uppercase tracking-wider" style={{fontFamily: "Arial, sans-serif", color: "#1e40af"}}>
            Songwriter Split Agreement
        </h1>
      </div>

       <div className="text-sm space-y-1 py-4 border-y border-gray-400" style={{fontFamily: "'Times New Roman', Times, serif"}}>
        <p><strong>Song Title:</strong> {agreement.songTitle}</p>
        <p><strong>Publication Date:</strong> {agreement.publicationDate ? format(new Date(agreement.publicationDate), 'PPP') : 'N/A'}</p>
        <p><strong>Duration:</strong> {agreement.duration || 'N/A'}</p>
        <p><strong>Performer Artists:</strong> {agreement.performerArtists || 'N/A'}</p>
        <p><strong>Creation Date:</strong> {format(new Date(agreement.createdAt), 'PPP')}</p>
        <p><strong>Contract Number:</strong> SW-2024-{agreement.id.slice(-3)}</p>
       </div>
       <div className="text-sm space-y-2 pt-2" style={{fontFamily: "'Times New Roman', Times, serif"}}>
        <p>We, the undersigned songwriters and composers, hereby acknowledge and agree to the following distribution of songwriting credits and publishing rights for the musical composition detailed above.</p>
       </div>
    </header>
  );
}
