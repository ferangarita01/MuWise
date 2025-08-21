
'use client';
import { UserPlus, Plus } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';

export function SignersTable() {
  const { userProfile } = useUserProfile();

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map((p:string) => p[0]).slice(0,2).join('').toUpperCase();
  }

  return (
    <div className="mb-6 rounded-lg border border-secondary bg-secondary ring-1 ring-white/5">
      <div className="flex items-center justify-between border-b border-secondary px-4 py-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Firmantes
        </h2>
        <div className="flex items-center gap-2">
          <span
            id="allSignedBadge"
            className="hidden rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
          >
            Todos firmaron
          </span>
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
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10 text-xs font-medium text-foreground/90">
              {getInitials(userProfile?.displayName)}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                 {userProfile?.displayName || 'Usuario Actual'}
              </p>
              <p className="text-xs text-foreground/65">{userProfile?.email || 'email@example.com'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              id="status-client"
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
            >
              <span className="h-1.5 w-1.5 rounded-full"></span>
            </span>
            <span
              id="date-client"
              className="text-xs text-foreground/50"
            ></span>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10 text-xs font-medium text-foreground/90">
              DN
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                DJ Nova
              </p>
              <p className="text-xs text-foreground/65">dj.nova@example.com</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              id="status-provider"
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
            ></span>
            <span
              id="date-provider"
              className="text-xs text-foreground/50"
            ></span>
          </div>
        </div>
      </div>
    </div>
  );
}
