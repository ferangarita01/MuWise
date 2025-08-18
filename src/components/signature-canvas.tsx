
'use client';
import { useRef, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignatureCanvasProps {
  onSignatureEnd: (signature: string | null) => void;
}

export function SignatureCanvas({ onSignatureEnd }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const getContext = () => canvasRef.current?.getContext('2d');

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }

  useEffect(() => {
    initializeCanvas();
  }, []);

  const getCoords = (event: MouseEvent | TouchEvent): [number, number] => {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];
    const rect = canvas.getBoundingClientRect();
    if (event instanceof MouseEvent) {
      return [event.clientX - rect.left, event.clientY - rect.top];
    } else {
      return [event.touches[0].clientX - rect.left, event.touches[0].clientY - rect.top];
    }
  }

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
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
    const ctx = getContext();
    if (!ctx) return;
    event.preventDefault(); // Prevent scrolling on touch devices
    const [x, y] = getCoords(event.nativeEvent);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
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
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        width={350}
        height={150}
        className={cn(
            "border border-input rounded-md bg-white cursor-crosshair touch-none w-full",
            "bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px]",
            "bg-bottom bg-repeat-x",
            "bg-[image:repeating-linear-gradient(0deg,#e5e7eb,#e5e7eb_1px,transparent_1px,transparent_40px),linear-gradient(to_bottom,transparent,transparent_36px,#3b82f6_36px,#3b82f6_37px,transparent_37px)]"
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
      <Button 
        type="button"
        variant="ghost" 
        size="icon" 
        className="absolute top-1 right-1 h-7 w-7"
        onClick={clearCanvas}
        title="Clear signature"
        >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}
