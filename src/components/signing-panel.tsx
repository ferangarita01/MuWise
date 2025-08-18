
'use client';
import { useState, useMemo } from 'react';
import type { Agreement, Composer } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { SignatureCanvas } from './signature-canvas';
import { Progress } from './ui/progress';

interface SigningPanelProps {
    agreement: Agreement;
    selectedSignerId: string | null;
    termsAccepted: boolean;
    onSignerChange: (id: string | null) => void;
    onTermsChange: (accepted: boolean) => void;
    onSignatureChange: (signatureData: string | null) => void;
}

export function SigningPanel({
    agreement,
    selectedSignerId,
    termsAccepted,
    onSignerChange,
    onTermsChange,
    onSignatureChange,
}: SigningPanelProps) {
    const [signatureData, setSignatureData] = useState<string | null>(null);
    const unsignedComposers = agreement.composers.filter(c => !c.signature);
    
    const handleSignatureEnd = (data: string | null) => {
        setSignatureData(data);
        onSignatureChange(data);
    };

    const progress = useMemo(() => {
        let pct = 0;
        if (selectedSignerId) pct += 33.34;
        if (signatureData) pct += 33.33;
        if (termsAccepted) pct += 33.33;
        return Math.min(100, Math.round(pct));
    }, [selectedSignerId, signatureData, termsAccepted]);

    return (
         <div className="rounded-xl border p-4 shadow-sm ring-1 ring-white/5 bg-muted border-border">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold tracking-tight text-foreground">Flujo de firma</h3>
              <span className="text-xs font-medium text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="mb-4 h-1.5" />

            <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-foreground/80 text-xs font-medium">1</span>
                    <Label className="text-sm font-medium text-foreground">Selecciona quién firma</Label>
                </div>
                <Select value={selectedSignerId || ''} onValueChange={(id) => onSignerChange(id)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select signer..." />
                    </SelectTrigger>
                    <SelectContent>
                        {unsignedComposers.map((composer) => (
                        <SelectItem key={composer.id} value={composer.id}>
                            {composer.name} ({composer.role})
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
             <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-foreground/80 text-xs font-medium">2</span>
                    <Label className="text-sm font-medium text-foreground">Dibuja tu firma</Label>
                </div>
                <SignatureCanvas onSignatureEnd={handleSignatureEnd} />
            </div>
            
            <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-foreground/80 text-xs font-medium">3</span>
                    <Label className="text-sm font-medium text-foreground">Acepta los términos</Label>
                </div>
                 <div className="flex items-start space-x-3 rounded-md border p-3 bg-background/50">
                    <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => onTermsChange(!!checked)} className="mt-1" />
                    <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
                        He leído y acepto los términos legales del acuerdo y autorizo el uso de mi firma electrónica.
                    </Label>
                </div>
            </div>

            <div className="rounded-md p-3 text-xs bg-background/50 text-muted-foreground">
              Completa los 3 pasos para habilitar “Firmar documento”.
            </div>
         </div>
    )
}
