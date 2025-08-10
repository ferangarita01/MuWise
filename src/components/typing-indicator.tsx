
import { cn } from '@/lib/utils';

export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1">
      <span className="sr-only">AI is typing</span>
      <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="h-2 w-2 bg-current rounded-full animate-bounce" />
    </div>
  );
}
