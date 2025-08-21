
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Bookmark,
  BookmarkCheck,
  Eye,
  EyeOff,
  Rocket,
  Download,
  Clock,
  Globe,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Contract } from '@/lib/types';
import { useRouter } from 'next/navigation';


interface ContractCardProps {
    contract: Contract;
    onQuickView: () => void;
    onBookmarkToggle?: () => void;
    onHideToggle?: () => void;
}

export function ContractCard({ contract, onQuickView, onBookmarkToggle, onHideToggle }: ContractCardProps) {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('bookmarks') || '[]');
            setIsBookmarked(saved.includes(contract.id));
            
            const hidden = JSON.parse(localStorage.getItem('hiddenContracts') || '[]');
            setIsHidden(hidden.includes(contract.id));

        } catch (e) {
            console.error("Failed to parse from localStorage", e);
        }
    }, [contract.id]);

    const handleBookmark = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newIsBookmarked = !isBookmarked;
        setIsBookmarked(newIsBookmarked);
        try {
            let saved = JSON.parse(localStorage.getItem('bookmarks') || '[]');
            if (newIsBookmarked) {
                saved.push(contract.id);
            } else {
                saved = saved.filter((id: string) => id !== contract.id);
            }
            localStorage.setItem('bookmarks', JSON.stringify(saved));
            toast({
                title: newIsBookmarked ? 'Guardado' : 'Eliminado de guardados',
                description: contract.title,
            });
            onBookmarkToggle?.(); // Notify parent component
        } catch (error) {
            console.error("Failed to update bookmarks in localStorage", error);
        }
    };

    const handleHide = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!onHideToggle) return; // Hide button should only work where the handler is passed
        const newIsHidden = !isHidden;
        setIsHidden(newIsHidden);
        try {
            let hidden = JSON.parse(localStorage.getItem('hiddenContracts') || '[]');
            if (newIsHidden) {
                hidden.push(contract.id);
            } else {
                hidden = hidden.filter((id: string) => id !== contract.id);
            }
            localStorage.setItem('hiddenContracts', JSON.stringify(hidden));
            toast({
                title: newIsHidden ? 'Contrato oculto' : 'Contrato visible',
                description: contract.title,
            });
            onHideToggle(); // Notify parent
        } catch (error) {
            console.error("Failed to update hidden contracts in localStorage", error);
        }
    };
    
    const handleUse = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/dashboard/agreements/${contract.id}`);
    }

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        toast({ title: `Descargando: ${contract.title}`});
    }


    return (
        <article id={contract.id} className={`contract-card group relative flex flex-col rounded-xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/5 to-transparent hover:border-white/20 transition ${isHidden && onHideToggle ? 'opacity-50' : ''}`}>
            <div className="relative h-40 overflow-hidden">
                <Image src={contract.image} alt={contract.title} width={400} height={225} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" data-ai-hint="agreement template"/>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/0"></div>
                <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span className="px-2.5 h-7 inline-flex items-center rounded-full text-[12px] bg-white/90 text-slate-900 font-medium">{contract.type}</span>
                     <span className={`px-2.5 h-7 inline-flex items-center rounded-full text-[12px] font-medium ${contract.status === 'Gratis' || contract.status === 'Completado' ? 'bg-emerald-400/90 text-emerald-950' : 'bg-indigo-400/90 text-indigo-950'}`}>{contract.status}</span>
                </div>
                <div className="absolute right-3 top-3 flex gap-2">
                    {onHideToggle && (
                        <button onClick={handleHide} className="p-2 rounded-md bg-slate-950/40 backdrop-blur hover:bg-slate-950/60 transition" title={isHidden ? "Mostrar contrato" : "Ocultar contrato"}>
                            {isHidden ? <EyeOff className="h-4 w-4 text-white" /> : <Eye className="h-4 w-4 text-white" />}
                        </button>
                    )}
                    {onBookmarkToggle && (
                        <button onClick={handleBookmark} className="bookmark-btn p-2 rounded-md bg-slate-950/40 backdrop-blur hover:bg-slate-950/60 transition" aria-pressed={isBookmarked}>
                            {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-amber-300" /> : <Bookmark className="h-4 w-4 text-white" />}
                        </button>
                    )}
                </div>
                <button onClick={onQuickView} className="quick-view absolute inset-x-3 bottom-3 h-9 rounded-md bg-white/90 text-slate-900 text-sm opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <Eye className="h-4 w-4" /> Vista rápida
                </button>
            </div>
            <div className="p-4 flex flex-col flex-1">
                <div className="flex-1">
                    <h3 className="text-xl font-semibold tracking-tight leading-snug text-white/95">{contract.title}</h3>
                    <p className="mt-2 text-sm text-slate-400">{contract.shortDesc}</p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                        <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {contract.mins} min</span>
                        <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> EN/ES</span>
                        <span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> {contract.filetypes}</span>
                        {contract.verified && <span className="inline-flex items-center gap-1.5 text-emerald-300"><ShieldCheck className="h-3.5 w-3.5" /> Revisado</span>}
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="px-2 h-6 inline-flex items-center rounded-md text-xs bg-white/5 border border-white/10 text-slate-300 capitalize">{contract.category.split(',')[0]}</span>
                    <div className="flex items-center gap-2">
                       <button onClick={handleUse} className="use-btn px-3 h-9 rounded-md bg-white text-slate-900 text-sm hover:bg-slate-100 transition flex items-center gap-2">
                            <Rocket className="h-4 w-4" /> Usar
                        </button>
                        <button onClick={handleDownload} title="Descargar" className="download-btn h-9 w-9 rounded-md bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white hover:border-white/20 transition flex items-center justify-center">
                            <Download className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}
