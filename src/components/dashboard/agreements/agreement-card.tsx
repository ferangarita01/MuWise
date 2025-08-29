
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Bookmark,
  BookmarkCheck,
  EyeOff,
  Trash2,
  AlertTriangle,
  Users,
  FileClock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Contract } from '@/types/legacy';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FormattedDate } from '@/components/formatted-date';

interface AgreementCardProps {
    agreement: Contract;
    onBookmarkToggle?: () => void;
    onDelete: (id: string) => void;
}

const statusStyles: { [key: string]: string } = {
    Borrador: 'bg-slate-500 text-slate-950',
    Pendiente: 'bg-amber-500 text-amber-950',
    Completado: 'bg-green-500 text-green-950',
};

export function AgreementCard({ agreement, onBookmarkToggle, onDelete }: AgreementCardProps) {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const saved = JSON.parse(localStorage.getItem('bookmarks') || '[]');
            setIsBookmarked(saved.includes(agreement.id));
        } catch (e) {
            console.error("Failed to parse from localStorage", e);
        }
    }, [agreement.id]);

    const handleBookmark = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (typeof window === 'undefined') return;
        const newIsBookmarked = !isBookmarked;
        setIsBookmarked(newIsBookmarked);
        try {
            let saved = JSON.parse(localStorage.getItem('bookmarks') || '[]');
            if (newIsBookmarked) {
                saved.push(agreement.id);
            } else {
                saved = saved.filter((id: string) => id !== agreement.id);
            }
            localStorage.setItem('bookmarks', JSON.stringify(saved));
            toast({
                title: newIsBookmarked ? 'Guardado' : 'Eliminado de guardados',
                description: agreement.title,
            });
            onBookmarkToggle?.();
        } catch (error) {
            console.error("Failed to update bookmarks in localStorage", error);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(agreement.id);
    }

    const goToAgreement = () => {
        router.push(`/dashboard/agreements/${agreement.id}`);
    };

    const signersCount = agreement.signers?.length || 0;

    return (
        <article id={agreement.id} onClick={goToAgreement} className={`agreement-card group relative flex flex-col rounded-xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/5 to-transparent hover:border-white/20 transition cursor-pointer`}>
            <div className="relative h-40 overflow-hidden">
                <Image src={agreement.image || 'https://placehold.co/400x225/0f172a/94a3b8.png'} alt={agreement.title || 'Agreement visual representation'} width={400} height={225} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" data-ai-hint="agreement document"/>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/0"></div>
                <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span className={`px-2.5 h-7 inline-flex items-center rounded-full text-[12px] font-medium ${statusStyles[agreement.status] || statusStyles['Borrador']}`}>{agreement.status}</span>
                </div>
                 <div className="absolute right-3 top-3 flex gap-2">
                    <button onClick={handleBookmark} className="bookmark-btn p-2 rounded-md bg-slate-950/40 backdrop-blur hover:bg-slate-950/60 transition" aria-pressed={isBookmarked}>
                        {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-amber-300" /> : <Bookmark className="h-4 w-4 text-white" />}
                    </button>
                </div>
            </div>
            <div className="p-4 flex flex-col flex-1">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold tracking-tight leading-snug text-white/95">{agreement.title}</h3>
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                        <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {signersCount} {signersCount === 1 ? 'firmante' : 'firmantes'}</span>
                        <span className="inline-flex items-center gap-1.5"><FileClock className="h-3.5 w-3.5" /> <FormattedDate dateString={agreement.lastModified || agreement.createdAt} /></span>
                    </div>
                </div>
                 <div className="mt-4 flex items-center justify-end gap-2">
                    {agreement.status === 'Borrador' && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button onClick={e => e.stopPropagation()} title="Eliminar borrador" className="delete-btn h-9 w-9 rounded-md bg-red-900/50 border border-red-500/30 text-sm text-red-400 hover:bg-red-900/70 hover:text-red-300 transition flex items-center justify-center">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={e => e.stopPropagation()}>
                                <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro de que quieres eliminar este borrador?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente el contrato de tu biblioteca.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    Sí, eliminar borrador
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>
        </article>
    );
}
