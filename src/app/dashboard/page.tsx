
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Plus,
  Search,
  X,
  Eye,
  EyeOff,
  Bookmark,
  BookmarkCheck,
  Rocket,
  Download,
  Clock,
  Globe,
  FileText,
  ShieldCheck,
  Lightbulb,
  Send,
} from 'lucide-react';
import { ContractCard } from '@/components/dashboard/agreements/contract-card';
import type { Contract } from '@/lib/types';
import { QuickViewModal } from '@/components/dashboard/agreements/quick-view-modal';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';


export const contractData: Contract[] = [
    {
        id: "split-sheet-acuerdo-de-coautoria",
        title: "Split Sheet: Acuerdo de Coautoría",
        tags: "música, colaboración, bilingüe, gratis",
        category: "música, colaboración",
        type: "Plantilla",
        status: "Gratis",
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
        status: "Pro",
        mins: "7",
        filetypes: "PDF, DOCX",
        verified: true,
        image: "https://placehold.co/400x225.png",
        desc: "Autoriza el uso audiovisual de una obra musical en películas, anuncios o series. Incluye campos de territorio, plazo y medios.",
        shortDesc: "Cubre medios, exclusividad y reportes. Pensado para productoras, sellos y creadores.",
    },
    {
        id: "contrato-de-artista-en-vivo",
        title: "Contrato de Artista en Vivo",
        tags: "eventos, performance, artista, gratis",
        category: "eventos",
        type: "Contrato",
        status: "Gratis",
        mins: "6",
        filetypes: "PDF, DOCX",
        verified: true,
        image: "https://firebasestorage.googleapis.com/v0/b/new-prototype-rmkd6.firebasestorage.app/o/jean1.png?alt=media&token=b54755a8-0876-4daf-ab49-9dfb3857eeb7",
        desc: "Asegura logística, pagos, backline y cancelaciones para presentaciones en vivo. Incluye riders y penalizaciones.",
        shortDesc: "Protege a artista y contratante. Claridad en pagos, horarios y condiciones técnicas.",
    },
    {
        id: "acuerdo-de-distribucion-digital",
        title: "Acuerdo de Distribución Digital",
        tags: "distribución, plataformas, regalías, pro",
        category: "distribución",
        type: "Contrato",
        status: "Pro",
        mins: "8",
        filetypes: "PDF, DOCX",
        verified: true,
        image: "https://placehold.co/400x225.png",
        desc: "Estructura comisiones, territorios, ventanas de lanzamiento y reportes con agregadores o sellos.",
        shortDesc: "Define split de regalías, auditorías y derechos de catálogo para releases.",
    },
    {
        id: "contrato-de-manager-de-artista",
        title: "Contrato de Manager de Artista",
        tags: "management, comisión, representación, pro",
        category: "management",
        type: "Contrato",
        status: "Pro",
        mins: "10",
        filetypes: "PDF, DOCX",
        verified: true,
        image: "https://placehold.co/400x225.png",
        desc: "Define alcance de representación, comisiones, exclusividad y terminación con managers o agencias.",
        shortDesc: "Incluye nivel de comisión por áreas, sunset clause y gastos reembolsables.",
    },
    {
        id: "contrato-de-produccion-musical",
        title: "Contrato de Producción Musical",
        tags: "música, producción, obra por encargo, gratis",
        category: "música",
        type: "Contrato",
        status: "Gratis",
        mins: "9",
        filetypes: "PDF, DOCX",
        verified: true,
        image: "https://placehold.co/400x225.png",
        desc: "Alinea entregables, propiedad intelectual y pagos por hitos con productores y artistas.",
        shortDesc: "Incluye obra por encargo, stems, revisiones y créditos de productor.",
    },
    {
        id: "cesion-de-derechos-publishing",
        title: "Cesión de Derechos (Publishing)",
        tags: "publishing, licencias, edición, pro",
        category: "licencias",
        type: "Contrato",
        status: "Pro",
        mins: "11",
        filetypes: "PDF, DOCX",
        verified: true,
        image: "https://firebasestorage.googleapis.com/v0/b/new-prototype-rmkd6.firebasestorage.app/o/img6.jpg?alt=media&token=8d5c0dd4-dc3d-4d48-871d-66e738b7b32b",
        desc: "Formaliza la cesión total o parcial de derechos editoriales con cláusulas de reversion y reportes.",
        shortDesc: "Modelo para works for hire, participación y subedición con límites claros.",
    },
    {
        id: "acuerdo-de-colaboracion-entre-artistas",
        title: "Acuerdo de Colaboración entre Artistas",
        tags: "colaboración, música, derechos, gratis",
        category: "colaboración",
        type: "Plantilla",
        status: "Gratis",
        mins: "4",
        filetypes: "PDF, DOCX",
        verified: true,
        image: "https://placehold.co/400x225.png",
        desc: "Define aportes creativos, splits de master y publishing, y autorizaciones de lanzamiento.",
        shortDesc: "Perfecto para feats. Cubre créditos, distribución de ingresos y aprobación creativa.",
    },
];

const categories = [
  "música", "licencias", "eventos", "distribución", "management", "colaboración"
];

function SuggestionDialog() {
    const { toast } = useToast();
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        if(comment.trim().length > 0) {
            toast({
                title: 'Sugerencia enviada',
                description: '¡Gracias por tu feedback! Lo tendremos en cuenta para futuras actualizaciones.',
            });
            setComment('');
            return true; // Indicate success to close dialog
        } else {
             toast({
                variant: 'destructive',
                title: 'Campo vacío',
                description: 'Por favor, escribe tu sugerencia antes de enviarla.',
            });
            return false; // Indicate failure, don't close
        }
    }
    
    return (
       <Dialog>
            <DialogTrigger asChild>
                <div className="text-right">
                    <button className="px-4 h-10 rounded-md text-sm bg-white text-slate-900 hover:bg-slate-100 transition flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" /> sugiereme algo
                    </button>
                    <p className="text-xs text-slate-400 mt-1">¿qué contrato necesitas en MuWise?</p>
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Solicita un Contrato</DialogTitle>
                    <DialogDescription>
                        ¿No encuentras la plantilla que necesitas? Dinos qué contrato te gustaría que añadiéramos a nuestra biblioteca.
                    </DialogDescription>
                </DialogHeader>
                <Textarea 
                    placeholder="Describe el tipo de contrato que necesitas, por ejemplo: 'Contrato de licencia para samples' o 'Acuerdo de banda'..." 
                    rows={5}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <DialogFooter>
                    <DialogClose asChild>
                       <Button type="button" variant="secondary">Cancelar</Button>
                    </DialogClose>
                     <Button onClick={() => {
                        if(handleSubmit()) {
                           // Manually close dialog on success
                           // This is a bit of a workaround because DialogClose closes regardless
                           document.querySelector('[data-radix-dialog-close]')?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                        }
                     }}>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar sugerencia
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
    const [filteredContracts, setFilteredContracts] = useState<Contract[]>(contractData);
    const [modalContract, setModalContract] = useState<Contract | null>(null);
    const [hiddenContractIds, setHiddenContractIds] = useState<Set<string>>(new Set());
    const [showHidden, setShowHidden] = useState(false);

    const updateHiddenContracts = () => {
        try {
            const hidden = JSON.parse(localStorage.getItem('hiddenContracts') || '[]');
            setHiddenContractIds(new Set(hidden));
        } catch (e) {
            console.error("Failed to parse hiddenContracts from localStorage", e);
        }
    };

    useEffect(() => {
        updateHiddenContracts();
        window.addEventListener('storage', updateHiddenContracts);
        return () => window.removeEventListener('storage', updateHiddenContracts);
    }, []);

    useEffect(() => {
        try {
            const savedCategories = localStorage.getItem('activeCategories');
            if (savedCategories) {
                setActiveCategories(new Set(JSON.parse(savedCategories)));
            }
        } catch (e) {
            console.error("Failed to parse activeCategories from localStorage", e);
            setActiveCategories(new Set());
        }
    }, []);

    useEffect(() => {
        const q = searchQuery.trim().toLowerCase();
        let filtered = contractData.filter(card => {
            const matchText = q === '' ||
                card.title.toLowerCase().includes(q) ||
                card.tags.toLowerCase().includes(q);

            const matchCats = activeCategories.size === 0 ||
                card.category.split(', ').some(c => activeCategories.has(c));

            const isHidden = hiddenContractIds.has(card.id);
            const matchHidden = showHidden || !isHidden;
            
            return matchText && matchCats && matchHidden;
        });
        setFilteredContracts(filtered);
    }, [searchQuery, activeCategories, hiddenContractIds, showHidden]);
    
    useEffect(() => {
        // Handle deep link to open modal
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
        if (newCategories.has(category)) {
            newCategories.delete(category);
        } else {
            newCategories.add(category);
        }
        setActiveCategories(newCategories);
        try {
            localStorage.setItem('activeCategories', JSON.stringify(Array.from(newCategories)));
        } catch (e) {
            console.error("Failed to save activeCategories to localStorage", e);
        }
    };

    const handleOpenModal = (contract: Contract) => {
        setModalContract(contract);
        window.location.hash = contract.id;
    }

    const handleCloseModal = () => {
        setModalContract(null);
        // Clear hash from URL without reloading
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
                        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">Biblioteca de Contratos</h1>
                        <p className="mt-3 text-base text-slate-300 max-w-2xl">Plantillas bilingües, listas para firmar. Optimiza tus acuerdos con tarjetas más claras, acciones directas y vista rápida.</p>
                    </div>
                     <div className="flex items-center gap-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowHidden(prev => !prev)} 
                          className="px-3 h-10 rounded-md text-sm text-slate-300 hover:text-white/90 bg-white/5 border-white/10 hover:bg-white/10 transition flex items-center gap-2"
                          title={showHidden ? "Ocultar contratos escondidos" : "Mostrar contratos escondidos"}
                        >
                            {showHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {showHidden ? 'Viendo todos' : 'Viendo visibles'}
                        </Button>
                        <SuggestionDialog />
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
                            placeholder="Buscar por título, etiquetas o tipo…"
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
                                className={`chip px-3 h-9 rounded-md border text-sm font-medium transition capitalize ${activeCategories.has(cat) ? 'bg-white text-slate-900 border-transparent' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:border-white/20'}`}
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
                    <ContractCard key={contract.id} contract={contract} onQuickView={() => handleOpenModal(contract)} onHideToggle={updateHiddenContracts} />
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
                        <button onClick={() => { setSearchQuery(''); setActiveCategories(new Set()) }} className="px-3 h-9 rounded-md bg-white text-slate-900 text-sm hover:bg-slate-100 transition">Limpiar todo</button>
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

    