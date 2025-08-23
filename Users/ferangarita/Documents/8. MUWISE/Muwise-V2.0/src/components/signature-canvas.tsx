
'use client';
import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Button } from './ui/button';
import { RotateCcw, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignatureCanvasProps {
  onSignatureEnd: (signature: string | null) => void;
}

interface SignatureCanvasHandle {
  clear: () => void;
  getSignature: () => string | null;
}

export const SignatureCanvas = forwardRef<SignatureCanvasHandle, SignatureCanvasProps>(({ onSignatureEnd }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const getContext = () => canvasRef.current?.getContext('2d');

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set styles from CSS variables for better theme integration
        const foregroundColor = getComputedStyle(document.documentElement).getPropertyValue('--foreground');
        ctx.strokeStyle = `hsl(${foregroundColor})`;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }

  useEffect(() => {
    initializeCanvas();
    window.addEventListener('resize', initializeCanvas);
    return () => window.removeEventListener('resize', initializeCanvas);
  }, []);
  
  useImperativeHandle(ref, () => ({
    clear: clearCanvas,
    getSignature: () => {
        const canvas = canvasRef.current;
        if (!canvas || isEmpty) return null;
        return canvas.toDataURL('image/png');
    }
  }));

  const getCoords = (event: MouseEvent | TouchEvent): [number, number] => {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];
    const rect = canvas.getBoundingClientRect();
    const target = event instanceof MouseEvent ? event : event.touches[0];
    return [target.clientX - rect.left, target.clientY - rect.top];
  }

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const ctx = getContext();
    if (!ctx) return;
    const [x, y] = getCoords(event.nativeEvent);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setIsEmpty(false);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    event.preventDefault();
    const ctx = getContext();
    if (!ctx) return;
    const [x, y] = getCoords(event.nativeEvent);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !isDrawing) return;
    const ctx = getContext();
    if(ctx) {
        ctx.closePath();
    }
    setIsDrawing(false);
    onSignatureEnd(canvas.toDataURL());
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onSignatureEnd(null);
      setIsEmpty(true);
    }
  };


  return (
    <div className="relative w-full rounded-lg border ring-1 ring-white/5 bg-background/50 border-border">
      <div className="flex items-center justify-between border-b px-3 py-2 border-border text-muted-foreground">
          <div className="flex items-center gap-2 text-xs">
            <Pencil className="h-4 w-4" />
            Traza con el mouse o el dedo
          </div>
           <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                className="h-7"
                onClick={clearCanvas}
                title="Clear signature"
            >
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Limpiar
          </Button>
      </div>
      <div className="p-3">
        <canvas
            ref={canvasRef}
            width={350}
            height={150}
            className={cn(
                "rounded-md cursor-crosshair touch-none w-full bg-background",
                "bg-[radial-gradient(circle_at_12px_12px,hsl(var(--foreground)/0.04)_1px,transparent_1px)] bg-[length:24px_24px]"
            )}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
        />
        {isEmpty && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                Firme aquí...
            </div>
        )}
      </div>
    </div>
  );
});
SignatureCanvas.displayName = 'SignatureCanvas';
