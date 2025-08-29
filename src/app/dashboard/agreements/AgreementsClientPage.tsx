
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { AgreementCard } from '@/components/dashboard/agreements/agreement-card'; // Cambiado a AgreementCard
import type { Contract } from '@/types/legacy';
import { useToast } from '@/hooks/use-toast';

const categories = ["Todos", "Guardados", "Completado", "Borrador", "Pendiente"];

interface AgreementsClientPageProps {
  initialContracts: Contract[];
}

export default function AgreementsClientPage({ initialContracts }: AgreementsClientPageProps) {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set(['Todos']));
    const [allContracts, setAllContracts] = useState<Contract[]>(initialContracts);
    const [filteredContracts, setFilteredContracts] = useState<Contract[]>(initialContracts);
    const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        updateBookmarks();
    }, []);

    const updateBookmarks = useCallback(() => {
        if (typeof window === 'undefined') return;
        try {
            const saved = JSON.parse(localStorage.getItem('bookmarks') || '[]');
            setBookmarkedIds(new Set(saved));
        } catch (e) {
            console.error("Failed to parse bookmarks from localStorage", e);
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;
        window.addEventListener('storage', updateBookmarks);
        return () => window.removeEventListener('storage', updateBookmarks);
    }, [mounted, updateBookmarks]);
    
    const handleDeleteContract = (contractId: string) => {
        setAllContracts(prev => prev.filter(c => c.id !== contractId));
        toast({
            title: 'Contrato eliminado',
            description: 'El borrador ha sido eliminado de tu vista.',
        });
    };

    useEffect(() => {
        const q = searchQuery.trim().toLowerCase();
        let filtered = allContracts.filter(card => {
            const matchText = q === '' ||
                (card.title && card.title.toLowerCase().includes(q)) ||
                (card.tags && card.tags.toLowerCase().includes(q));

            let matchCats = true;
            if (!activeCategories.has('Todos') && activeCategories.size > 0) {
                 matchCats = activeCategories.has('Guardados') ? 
                    bookmarkedIds.has(card.id) :
                    activeCategories.has(card.status);
                 
                 if(activeCategories.has('Guardados') && activeCategories.has(card.status)) {
                    matchCats = bookmarkedIds.has(card.id);
                 } else if (activeCategories.size > 1 && !activeCategories.has('Guardados')) {
                    matchCats = activeCategories.has(card.status)
                 }
            }
            
            return matchText && matchCats;
        });

        filtered.sort((a, b) => {
            const aIsBookmarked = bookmarkedIds.has(a.id);
            const bIsBookmarked = bookmarkedIds.has(b.id);
            if (aIsBookmarked && !bIsBookmarked) return -1;
            if (!aIsBookmarked && bIsBookmarked) return 1;
            // Sort by last modified date as a fallback
            const dateA = new Date(a.lastModified || a.createdAt || 0);
            const dateB = new Date(b.lastModified || b.createdAt || 0);
            return dateB.getTime() - dateA.getTime();
        });
        
        setFilteredContracts(filtered);
    }, [searchQuery, activeCategories, bookmarkedIds, allContracts]);
    
    const toggleCategory = (category: string) => {
        const newCategories = new Set(activeCategories);

        if (category === 'Todos') {
            newCategories.clear();
            newCategories.add('Todos');
        } else {
            newCategories.delete('Todos');
            if (newCategories.has(category)) {
                newCategories.delete(category);
            } else {
                newCategories.add(category);
            }
            if (newCategories.size === 0) {
              newCategories.add('Todos');
            }
        }
        setActiveCategories(newCategories);
    };

    if (!mounted) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Cargando acuerdos...</p>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="relative overflow-hidden">
             {/* Background accents */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-32 right-0 w-[620px] h-[620px] bg-gradient-to-br from-cyan-400/20 via-indigo-500/20 to-fuchsia-400/10 blur-3xl rounded-full"></div>
                <div className="absolute -bottom-24 -left-16 w-[520px] h-[520px] bg-gradient-to-tr from-sky-400/10 via-blue-500/10 to-indigo-500/10 blur-3xl rounded-full"></div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 relative">
                <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">Mis Acuerdos</h1>
                        <p className="mt-3 text-base text-slate-300 max-w-2xl">Gestiona tus contratos finalizados, borradores y acuerdos pendientes de firma.</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="mt-8 flex flex-col lg:flex-row gap-4 lg:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            id="searchInput"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por título, estado o tipo…"
                            className="w-full h-11 pl-10 pr-12 rounded-md bg-white/5 border border-white/10 focus:border-white/20 outline-none text-base placeholder:text-slate-400 text-white transition"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded hover:bg-white/5">
                                <X className="h-4 w-4 text-slate-400" />
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => toggleCategory(cat)}
                                className={`chip px-3 h-9 rounded-md bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white hover:border-white/20 transition capitalize ${activeCategories.has(cat) ? 'ring-1 ring-white/30 bg-white/10 text-white' : ''}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
            <div id="cardsGrid" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredContracts.map(agreement => (
                    <AgreementCard
                        key={agreement.id} 
                        agreement={agreement} 
                        onBookmarkToggle={updateBookmarks} 
                        onDelete={handleDeleteContract}
                    />
                ))}
            </div>

            {filteredContracts.length === 0 && (
                 <div id="emptyState">
                    <div className="mt-14 rounded-xl border border-white/10 bg-white/5 p-10 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                        <Search className="h-5 w-5 text-slate-300" />
                    </div>
                    <h3 className="mt-4 text-2xl font-semibold tracking-tight">Sin resultados</h3>
                    <p className="mt-1 text-sm text-slate-400">No se encontraron acuerdos que coincidan con tu búsqueda o filtros.</p>
                    </div>
                </div>
            )}
        </main>
        </>
    );
}
