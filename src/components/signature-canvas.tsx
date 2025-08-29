'use client';
import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
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
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const getContext = () => canvasRef.current?.getContext('2d');

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = weight;
      }
    }
  }

  // Effect to update drawing style when props change
  useEffect(() => {
    const ctx = getContext();
    if(ctx) {
      ctx.strokeStyle = color;
      ctx.lineWidth = weight;
    }
  }, [color, weight]);
  

  useEffect(() => {
    initializeCanvas();
    
    // Handle window resizing
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        // Save drawing if any
        const dataUrl = !isEmpty ? canvas.toDataURL() : null;
        
        // Resize
        const parent = canvas.parentElement;
        if(parent){
            const dpr = window.devicePixelRatio || 1;
            const rect = parent.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            const ctx = getContext();
            if(ctx) ctx.scale(dpr, dpr);
        }

        // Restore context styles and drawing
        initializeCanvas();
        if(dataUrl){
            const img = new Image();
            img.onload = () => {
                const ctx = getContext();
                if(!ctx) return;
                const dpr = window.devicePixelRatio || 1;
                ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
            }
            img.src = dataUrl;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []); // Removed isEmpty dependency to avoid clearing on first stroke
  
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
    if(isEmpty) setIsEmpty(false);
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
    onSignatureEnd(canvas.toDataURL('image/png'));
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (canvas && ctx) {
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      onSignatureEnd(null);
      setIsEmpty(true);
    }
  };


  return (
    <div className="relative w-full rounded-lg border bg-white ring-1 ring-slate-200">
       <div className="relative w-full h-[150px]">
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full rounded-md cursor-crosshair touch-none bg-transparent"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
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