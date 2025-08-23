
'use client';
import { UserPlus, Plus, Check, X } from 'lucide-react';
import type { Composer } from '@/lib/types';
import { Button } from '../ui/button';
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
} from "@/components/ui/alert-dialog"

interface SignersTableProps {
  signers: Composer[];
  onDeleteSigner: (signerId: string) => void;
}

export function SignersTable({ signers, onDeleteSigner }: SignersTableProps) {
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map((p:string) => p[0]).slice(0,2).join('').toUpperCase();
  }

  const allSigned = signers.every(s => s.signature);

  return (
    <div className="mb-6 rounded-lg border border-secondary bg-secondary ring-1 ring-white/5">
      <div className="flex items-center justify-between border-b border-secondary px-4 py-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Firmantes
        </h2>
        <div className="flex items-center gap-2">
          {allSigned && (
            <span
              id="allSignedBadge"
              className="rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              Todos firmaron
            </span>
          )}
          <button
            id="addSignerBtn"
            className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:translate-y-px hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/10"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Añadir firmante
          </button>
        </div>
      </div>

      {/* Add signer form (toggle) */}
      <div id="addSignerForm" className="hidden border-b border-secondary px-4 py-4">
          <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    id="newSignerName"
                    type="text"
                    placeholder="Nombre completo"
                    className="w-full rounded-md border border-secondary bg-background/50 px-3 py-2 text-sm text-foreground outline-none transition focus:ring-0 focus-visible:ring-2 focus-visible:ring-white/10"
                  />
                  <input
                    id="newSignerEmail"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="w-full rounded-md border border-secondary bg-background/50 px-3 py-2 text-sm text-foreground outline-none transition focus:ring-0 focus-visible:ring-2 focus-visible:ring-white/10"
                  />
              </div>
              <select
                  id="newSignerRole"
                  className="w-full rounded-md border border-secondary bg-background/50 px-3 py-2 text-sm text-foreground outline-none transition focus:ring-0 focus-visible:ring-2 focus-visible:ring-white/10"
                >
                  <option>Invitado</option>
                  <option>Testigo</option>
                  <option>Representante</option>
                  <option>Coordinación</option>
                  <option>Cliente</option>
                  <option>Artista</option>
                  <option>SongWriter</option>
                  <option>Singer</option>
                  <option>Contratante</option>
              </select>
              <div className="flex justify-end gap-2">
                <button
                    id="cancelAddSignerBtn"
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-secondary bg-secondary px-3 py-2 text-sm font-medium text-foreground/80 transition-all hover:translate-y-px hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/10"
                  >
                    Cancelar
                  </button>
                  <button
                    id="confirmAddSignerBtn"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-all hover:translate-y-px hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/10"
                  >
                    <Plus className="h-4 w-4" /> Agregar
                  </button>
              </div>
          </div>
      </div>

      <div id="signersList" className="divide-y divide-white/5">
        {signers.map(signer => (
          <div key={signer.id} className="flex items-center justify-between px-4 py-3 group">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10 text-xs font-medium text-foreground/90">
                {getInitials(signer.name)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {signer.name}
                </p>
                <p className="text-xs text-foreground/65">{signer.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${signer.signature ? 'text-green-400 bg-green-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${signer.signature ? 'bg-green-400' : 'bg-amber-400'}`}></span>
                {signer.signature ? 'Firmado' : 'Pendiente'}
              </span>
              {signer.signedAt && (
                <span className="text-xs text-foreground/50">
                  {new Date(signer.signedAt).toLocaleDateString()}
                </span>
              )}
               <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                      <X className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar a {signer.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente a este firmante del acuerdo.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDeleteSigner(signer.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Sí, eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
