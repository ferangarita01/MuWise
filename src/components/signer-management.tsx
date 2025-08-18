
'use client';
import type { Composer } from '@/lib/types';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function SignerManagement({ composers }: { composers: Composer[] }) {
    
  const getInitials = (name: string) => {
    return name.split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase();
  };
  
  return (
    <div className="divide-y divide-border">
      {composers.map(composer => (
        <div key={composer.id} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(composer.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{composer.name} <span className="text-xs text-muted-foreground">({composer.role})</span></p>
              <p className="text-xs text-muted-foreground">{composer.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {composer.signedAt ? (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary border border-primary/30">
                    <CheckCircle className="h-3 w-3" />
                    Firmado
                </span>
                <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(composer.signedAt), { addSuffix: true })}
                </span>
              </>
            ) : (
                 <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-accent/10 text-accent border border-accent/30">
                    <Clock className="h-3 w-3" />
                    Pendiente
                 </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
