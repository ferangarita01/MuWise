# MuWise

MuWise es una aplicación web para crear, gestionar y firmar acuerdos musicales de forma segura y profesional. Combina Next.js (App Router), TypeScript y Firebase (Auth, Firestore, Storage, App Hosting). Integra IA con Genkit + Google AI para validar información de contratos y detectar posibles conflictos de derechos. Es extensible para enriquecer contratos con metadatos públicos de la API de Spotify.

> Objetivo: simplificar el ciclo de vida de acuerdos musicales (split sheets, contratos de servicios, licencias) con firma electrónica multiusuario y almacenamiento seguro.

---

## Tabla de contenidos

- [Características clave](#características-clave)
- [Tecnologías](#tecnologías)
- [Arquitectura y estructura del proyecto](#arquitectura-y-estructura-del-proyecto)
- [Flujo de firma electrónica](#flujo-de-firma-electrónica)
- [Seguridad y cumplimiento](#seguridad-y-cumplimiento)
- [IA (Genkit + Google AI)](#ia-genkit--google-ai)
- [Integración con Spotify (opcional)](#integración-con-spotify-opcional)
- [Variables de entorno](#variables-de-entorno)
- [Requisitos y puesta en marcha](#requisitos-y-puesta-en-marcha)
- [Despliegue](#despliegue)
- [Roadmap](#roadmap)
- [Contribución](#contribución)
- [Licencia](#licencia)

---

## Características clave

- Gestión integral de acuerdos musicales:
  - Split sheets bilingües, contratos de servicio (p. ej., DJ Service Agreement), licencias y colaboraciones.
  - Validaciones de negocio (porcentajes de splits, roles y campos requeridos).
- Firma electrónica multiusuario:
  - Selección de firmantes, dibujo de firma, aceptación explícita de términos y trazabilidad.
  - Enlaces de firma seguros (JWT) y expirables; estado por firmante (pendiente/firmado).
  - Descarga de PDF/certificado digital (módulo de certificado en preparación).
- Notificaciones:
  - Solicitud de firma vía email con enlace seguro.
- Almacenamiento y datos:
  - Datos en Firestore; documentos firmados y assets en Cloud Storage.
- IA aplicada:
  - Genkit + Google AI para validación contextual y detección de conflictos de derechos.
- Extensible con Spotify:
  - Enriquecimiento de contratos con metadata pública (título, artistas, fechas).

---

## Tecnologías

- Frontend: Next.js (App Router) + React + TypeScript
- UI: Tailwind CSS + ShadCN UI
- Backend-as-a-Service: Firebase (Auth, Firestore, Storage, App Hosting)
- IA: Genkit + Google AI (Gemini 2.0 Flash)
- Seguridad de enlaces: JWT (jsonwebtoken)

---

## Arquitectura y estructura del proyecto

```
ferangarita01-muwise/
├─ apphosting.yaml
├─ firebase.json
├─ firestore.rules
├─ storage.rules
├─ components.json
├─ tailwind.config.ts
├─ tsconfig.json
├─ docs/
│  └─ blueprint.md
└─ src/
   ├─ actions/
   │  ├─ agreement/         # create, update, sign, email
   │  └─ user/
   ├─ ai/
   │  ├─ genkit.ts          # Configuración Genkit + Google AI
   │  └─ dev.ts
   ├─ app/                  # App Router (Next.js)
   │  ├─ api/
   │  │  ├─ auth/session/route.ts  # cookies de sesión desde ID token
   │  │  ├─ debug/route.ts
   │  │  └─ email/route.ts
   │  ├─ auth/...(signin/signup)
   │  └─ dashboard/
   │     ├─ agreements/
   │     │  ├─ [agreementId]/...(client/document)
   │     │  └─ dj-service-agreement/page.tsx
   │     └─ profile/, settings/
   ├─ components/
   │  ├─ agreement/         # UI y flujo de firma
   │  └─ ui/                # ShadCN components
   ├─ hooks/
   │  └─ use-auth.tsx       # sincroniza cookie de sesión
   ├─ lib/
   │  ├─ firebase-client.ts
   │  ├─ firebase-server.ts
   │  ├─ signing-links.ts   # generateSigningLink / verifySigningToken
   │  ├─ initialData.ts
   │  └─ cloud-function/
   ├─ services/             # capa de servicios de dominio
   └─ types/                # modelos y tipos (Agreement, Signer, etc.)
```

Puntos de interés:
- Firma UI: `src/components/agreement/agreement-actions.tsx` y `agreement-document.tsx`
- Enlaces de firma (JWT): `src/lib/signing-links.ts`
- Sesión y cookies: `src/hooks/use-auth.tsx` + `src/app/api/auth/session/route.ts`
- Tipos ricos de acuerdo y firmante: `src/types/agreement.ts`, `src/types/legacy.ts`

---

## Flujo de firma electrónica

1. Autenticación del usuario (Firebase Auth).
2. Acceso al acuerdo y selección del firmante.
3. Dibujo de la firma y aceptación de términos legales visibles.
4. Aplicación de la firma:
   - Se guarda la imagen de la firma (Data URL o binario) y se registra `signedAt`.
   - Se marca el firmante como `signed`; se actualiza el estado del acuerdo en Firestore.
5. Enlaces seguros:
   - Se generan con JWT, ligados a `agreementId` + `participantId`, con expiración configurable.
   - Verificación del token en el endpoint de firma.
6. Notificación:
   - Envío de correo con el enlace de firma.
7. Descarga:
   - PDF o certificado de finalización (certificado digital en preparación).

Archivos clave:
- `src/components/agreement/agreement-actions.tsx`
- `src/lib/signing-links.ts` (JWT)
- `src/app/dashboard/agreements/[agreementId]/page.tsx` (carga y serialización)

---

## Seguridad y cumplimiento

- Autenticación y sesiones:
  - Firebase Auth con sincronización de cookie de sesión vía `/api/auth/session`.
- Autorización y datos:
  - Reglas en `firestore.rules` y `storage.rules` restringen acceso por usuario/rol.
  - Validaciones de negocio en acciones y servicios (p. ej., splits suman 100%).
- Enlaces de firma:
  - JWT con expiración, verificación robusta del token y control de participante.
- Legalidad:
  - Términos y condiciones visibles y aceptación explícita antes de firmar.
  - Registro de timestamps (`signedAt`, `completedAt`) y estados por firmante.
- Buenas prácticas:
  - Mantener `JWT_SECRET` fuera del repositorio.
  - Revisar y testear reglas de seguridad en entornos de prueba.

---

## IA (Genkit + Google AI)

- Configuración en `src/ai/genkit.ts` con el modelo `googleai/gemini-2.0-flash`.
- Uso propuesto:
  - Validación contextual de cláusulas.
  - Detección de conflictos de derechos con datos públicos de referencia.
  - Sugerencias de redacción y checklist legal.
- Telemetría de Firebase activada si existe `GCP_PROJECT` en el entorno.

---

## Integración con Spotify (opcional)

- Objetivo: enriquecer acuerdos con metadata (título, artistas, álbum, fechas).
- Requisitos:
  - Token de acceso de Spotify (App o Client Credentials).
  - Variables de entorno (p. ej., `SPOTIFY_TOKEN`).
- Integración sugerida:
  - Servicio en `src/services/spotifyService.ts` que consulte `GET /v1/tracks/{id}`.
  - Mapeo de respuesta a campos del acuerdo o a metadatos.

---

## Variables de entorno

Crea un archivo `.env.local` en la raíz con valores como:

```
# Base URL pública de la app (para enlaces firmables)
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com

# Firma de enlaces seguros
JWT_SECRET=una_clave_larga_y_secreta

# IA / Google
GCP_PROJECT=tu-proyecto-gcp   # opcional, habilita telemetría Genkit/Firebase

# Spotify (opcional)
SPOTIFY_TOKEN=token_de_acceso

# Si usas Admin SDK de Firebase en el servidor:
# GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/sa.json
```

Nota: La configuración de Firebase cliente está en `src/lib/firebase-client.ts`. Asegura que el proyecto, bucket y dominios sean correctos para tu entorno.

---

## Requisitos y puesta en marcha

- Node.js 18+
- npm 9+ (o pnpm/yarn)

Instalación y desarrollo:

```bash
git clone https://github.com/ferangarita01/MuWise.git
cd MuWise
npm install

# Configura .env.local con las variables anteriores
npm run dev
```

Compilación y producción (verifica scripts disponibles en package.json):

```bash
npm run build
npm start
# opcional
npm run lint
```

---

## Despliegue

MuWise está preparado para Firebase App Hosting.

- Revisa `apphosting.yaml`, `firebase.json`, `firestore.rules`, `storage.rules`.
- Despliega desde Firebase Console o usando la CLI de Firebase.
- Asegura variables de entorno y dominios autorizados para Auth y enlaces públicos.
- Protege `JWT_SECRET` y cualquier credencial de administración.

Consulta la documentación de Firebase App Hosting para el flujo más actualizado de despliegue.

---

## Roadmap

- Certificado digital de finalización con hash/auditoría.
- Orden de firma (signing order) y recordatorios automáticos.
- Auditoría avanzada: IP, agente de usuario, ubicación aproximada.
- Enriquecimiento automático desde Spotify/PROs y verificación de ISRC/ISWC.
- Modo multiorganización y roles granulares (owner, approver, witness).
- Tests e2e (Cypress/Playwright) y unit tests (Vitest/Jest).

---

## Contribución

- Issues y PRs son bienvenidos.
- Por favor, discute cambios sustanciales en un issue antes de un PR.
- Mantén estilo de código consistente (ESLint, convenciones de tipos).
- Evita incluir secretos en commits.

---

## Licencia

MIT

© 2025 MuWise. Todos los derechos reservados.