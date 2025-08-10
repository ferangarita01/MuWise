
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, SendHorizonal, Bot, User, BrainCircuit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useActionState } from 'react';
import { detectRightsConflictAction, type ActionState } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { TypingIndicator } from '@/components/typing-indicator';
import { MessageBubble } from '@/components/message-bubble';

type Message = {
  id: string;
  sender: 'user' | 'ai';
  content: React.ReactNode;
  isAction?: boolean;
};

const initialState: ActionState = {
  status: 'idle',
  message: '',
};

export default function ConflictDetectionPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-1',
      sender: 'ai',
      content: (
        <>
          <p className="mb-4">
            ¡Hola! 👋 Soy tu asistente de detección de conflictos musicales.
          </p>
          <p>
            Puedo ayudarte a analizar hojas de reparto (split sheets) para
            identificar posibles conflictos de derechos, verificar porcentajes y
            detectar inconsistencias.
          </p>
          <p className="mt-4">
            Sube un documento (PDF, DOCX, TXT, PNG, JPG) para empezar.
          </p>
        </>
      ),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const [state, formAction] = useActionState(detectRightsConflictAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isAiTyping]);
  
  useEffect(() => {
    if (state.status === 'error') {
      setIsAiTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          content: `Hubo un error: ${state.message}`,
        },
      ]);
    }
    if (state.status === 'success' && state.data) {
       setIsAiTyping(false);
       setMessages((prev) => [
        ...prev,
        {
          id: `res-${Date.now()}`,
          sender: 'ai',
          content: (
            <div>
              <h3 className="font-bold mb-2">✅ Análisis Completado</h3>
              <p>{state.data.conflictAnalysis}</p>
            </div>
          ),
        },
      ]);
    }
  }, [state]);


  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    
    setMessages((prev) => [
      ...prev,
      {
        id: `user-file-${Date.now()}`,
        sender: 'user',
        content: `He subido el archivo: ${file.name}`,
      },
    ]);

    setIsAiTyping(true);

    const formData = new FormData();
    formData.append('splitSheet', file);
    formAction(formData);
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue.trim()) return;

      const newUserMessage: Message = {
        id: `user-${Date.now()}`,
        sender: 'user',
        content: inputValue,
      };

      setMessages(prev => [...prev, newUserMessage]);
      setInputValue('');
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto w-full">
       <header className="flex items-center gap-4 p-4 border-b">
         <Avatar>
            <AvatarFallback><BrainCircuit /></AvatarFallback>
          </Avatar>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Rights Conflict Detection</h1>
          <p className="text-muted-foreground text-sm">
            Tu asistente de IA para analizar acuerdos.
          </p>
        </div>
      </header>
      
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
            <MessageBubble key={msg.id} sender={msg.sender}>
                {msg.content}
            </MessageBubble>
        ))}
        {isAiTyping && (
          <MessageBubble sender="ai">
            <TypingIndicator />
          </MessageBubble>
        )}
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe un mensaje o sube un archivo..."
            className="w-full pr-24 pl-12 py-3 border rounded-full bg-input"
            disabled={isAiTyping}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-muted"
            aria-label="Adjuntar archivo"
            disabled={isAiTyping}
          >
            <Paperclip className="h-5 w-5" />
          </button>
           <Button 
            type="submit" 
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
            size="icon"
            disabled={!inputValue.trim() || isAiTyping}
            >
             <SendHorizonal className="h-5 w-5" />
             <span className="sr-only">Enviar</span>
           </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            disabled={isAiTyping}
          />
        </form>
      </div>
    </div>
  );
}
