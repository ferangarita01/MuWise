'use client';
import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import SignaturePad from 'signature_pad';
import { cn } from '@/lib/utils';

interface SignatureCanvasProps {
  onSignatureEnd: (signature: string | null) => void;
  color?: string;
  weight?: number;
}

export interface SignatureCanvasHandle {
  clear: () => void;
  getSignature: () => string | null;
}

export const SignatureCanvas = forwardRef<SignatureCanvasHandle, SignatureCanvasProps>(({ onSignatureEnd, color = '#0f172a', weight = 2.2 }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const signaturePad = new SignaturePad(canvas, {
      penColor: color,
      minWidth: weight - 1 > 0 ? weight - 1 : 0.5,
      maxWidth: weight + 1,
    });
    signaturePadRef.current = signaturePad;

    const handleResize = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
        signaturePad.clear();
        setIsEmpty(true);
        onSignatureEnd(null);
    };

    signaturePad.onBegin = () => {
      setIsEmpty(false);
    };
    
    signaturePad.onEnd = () => {
      onSignatureEnd(signaturePad.toDataURL('image/png'));
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      signaturePad.off();
    };
  }, []); // Empty dependency array ensures this runs once.

  useEffect(() => {
    if(signaturePadRef.current) {
        signaturePadRef.current.penColor = color;
    }
  }, [color]);

  useEffect(() => {
    if(signaturePadRef.current) {
        signaturePadRef.current.minWidth = weight - 1 > 0 ? weight - 1 : 0.5;
        signaturePadRef.current.maxWidth = weight + 1;
    }
  }, [weight]);

  const clearCanvas = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setIsEmpty(true);
      onSignatureEnd(null);
    }
  };

  useImperativeHandle(ref, () => ({
    clear: clearCanvas,
    getSignature: () => {
      if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
        return signaturePadRef.current.toDataURL('image/png');
      }
      return null;
    }
  }));

  return (
    <div className="relative w-full rounded-lg border bg-white ring-1 ring-slate-200">
       <div className="relative w-full h-[150px]">
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full rounded-md cursor-crosshair touch-none bg-transparent"
            />
            {isEmpty && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    Firme aquí...
                </div>
            )}
        </div>
    </div>
  );
});
SignatureCanvas.displayName = 'SignatureCanvas';
