
'use client';
import { useRef, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { RotateCcw } from 'lucide-react';

interface SignatureCanvasProps {
  onSignatureEnd: (signature: string | null) => void;
}

export function SignatureCanvas({ onSignatureEnd }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const getContext = () => canvasRef.current?.getContext('2d');

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set drawing properties
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
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = getContext();
    if (!ctx) return;
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
    }
  };


  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={350}
        height={150}
        className="border border-input rounded-md bg-white cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
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
