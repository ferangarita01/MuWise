
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
  sender: 'user' | 'ai';
  children: React.ReactNode;
}

export function MessageBubble({ sender, children }: MessageBubbleProps) {
  const isUser = sender === 'user';
  return (
    <div
      className={cn(
        'flex items-start gap-3 w-full max-w-xl transition-all duration-200',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      <Avatar className="flex-shrink-0">
        <AvatarFallback className={cn(isUser ? 'bg-primary/20' : 'bg-muted')}>
            {isUser ? <User /> : <Bot />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          'p-4 rounded-2xl',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-muted text-card-foreground rounded-bl-none'
        )}
      >
        {children}
      </div>
    </div>
  );
}
