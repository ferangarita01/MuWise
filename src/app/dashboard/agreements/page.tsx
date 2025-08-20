
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  X,
} from 'lucide-react';
import { ContractCard } from '@/components/dashboard/agreements/contract-card';
import type { Contract } from '@/lib/types';
import { QuickViewModal } from '@/components/dashboard/agreements/quick-view-modal';

export const contractData: Contract[] = [
    {
        id: "split-sheet-acuerdo-de-coautoria",
        title: "Split Sheet: Acuerdo de Coautoría",
        tags: "música, colaboración, bilingüe, gratis",
        category: "música, colaboración",
        type: "Plantilla",
        status: "Completado",
        mins: "5",
        filetypes: "PDF, DOCX",
        verified: true,
        image: "https://placehold.co/400x225.png",
        desc: "Define porcentajes de autoría y administración de forma clara. Incluye cláusulas de créditos y regalías.",
        shortDesc: "Ideal para sesiones. Establece porcentajes, administración y créditos en minutos.",
    },
    {
        id: "licencia-de-uso-de-obra-sincronizacion",
        title: "Licencia de Uso de Obra: Sincronización",
        tags: "licencias, sincronización, pro, bilingüe",
        category: "licencias",
        type: "Contrato",
        status: "Borrador",
        mins: "7",
        filetypes: "PDF, DOCX",
        verified: true,
        image: "https://placehold.co/400x225.png",
        desc: "Autoriza el uso audiovisual de una obra musical en películas, anuncios o series. Incluye campos de territorio, plazo y medios.",
        shortDesc: "Cubre medios, exclusividad y reportes. Pensado para productoras, sellos y creadores.",
    },
];

const categories = [
  "Todos", "Guardados", "Completado", "Borrador", "Pendiente"
];

export default function AgreementsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set(['Todos']));
    const [filteredContracts, setFilteredContracts] = useState<Contract[]>(contractData);
    const [modalContract, setModalContract] = useState<Contract | null>(null);
    const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

    const updateBookmarks = useCallback(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('bookmarks') || '[]');
            setBookmarkedIds(new Set(saved));
        } catch (e) {
            console.error("Failed to parse bookmarks from localStorage", e);
        }
    }, []);

    useEffect(() => {
        updateBookmarks();
        window.addEventListener('storage', updateBookmarks);
        return () => window.removeEventListener('storage', updateBookmarks);
    }, [updateBookmarks]);

    useEffect(() => {
        const q = searchQuery.trim().toLowerCase();
        const filtered = contractData.filter(card => {
            const matchText = q === '' ||
                card.title.toLowerCase().includes(q) ||
                card.tags.toLowerCase().includes(q);

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
        setFilteredContracts(filtered);
    }, [searchQuery, activeCategories, bookmarkedIds]);
    
    useEffect(() => {
        const openModalFromHash = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash) {
                const contract = contractData.find(c => c.id === hash);
                if (contract) {
                    setModalContract(contract);
                }
            }
        };

        openModalFromHash();
        window.addEventListener('hashchange', openModalFromHash, false);
        return () => window.removeEventListener('hashchange', openModalFromHash, false);
    }, []);

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

    const resetFilters = () => {
        setSearchQuery('');
        setActiveCategories(new Set(['Todos']));
    };

    const handleOpenModal = (contract: Contract) => {
        setModalContract(contract);
        window.location.hash = contract.id;
    }

    const handleCloseModal = () => {
        setModalContract(null);
        history.pushState("", document.title, window.location.pathname + window.location.search);
    };


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
                {filteredContracts.map(contract => (
                    <ContractCard key={contract.id} contract={contract} onQuickView={() => handleOpenModal(contract)} onBookmarkToggle={updateBookmarks} />
                ))}
            </div>

            {filteredContracts.length === 0 && (
                 <div id="emptyState">
                    <div className="mt-14 rounded-xl border border-white/10 bg-white/5 p-10 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                        <Search className="h-5 w-5 text-slate-300" />
                    </div>
                    <h3 className="mt-4 text-2xl font-semibold tracking-tight">Sin resultados</h3>
                    <p className="mt-1 text-sm text-slate-400">Prueba con otro término o limpia los filtros.</p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <button onClick={resetFilters} className="px-3 h-9 rounded-md bg-white text-slate-900 text-sm hover:bg-slate-100 transition">Limpiar todo</button>
                    </div>
                    </div>
                </div>
            )}
        </main>

        {modalContract && (
            <QuickViewModal contract={modalContract} onClose={handleCloseModal} />
        )}
        </>
    );
}
