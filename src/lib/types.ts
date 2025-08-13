// ================================================
// TIPOS PRINCIPALES DE LA APLICACIÓN MUSICAL
// ================================================

// ===== USUARIO =====
export interface User {
  uid: string;
  displayName: string;
  email: string;
  createdAt: string;
  photoURL?: string;
  
  // Campos profesionales de la industria musical
  artistName?: string;       // Nombre artístico
  primaryRole?: string;      // "Composer", "Producer", etc.
  genres?: string;           // "Pop, Electronic, Hip-Hop"
  publisher?: string;        // Editorial musical
  proSociety?: string;       // "ASCAP", "BMI", "SGAE", etc.
  ipiNumber?: string;        // International Publishers Index
}

// ===== ACUERDO MUSICAL =====
export interface Agreement {
  id: string;
  userId: string;                    // UID del creador (owner)
  
  // Información de la canción
  songTitle: string;
  performerArtists: string;
  duration: string;                  // "03:45"
  publicationDate: string;           // ISO string
  
  // Colaboradores y estado
  composers: Composer[];
  status: AgreementStatus;
  createdAt: string;                 // ISO string
  
  // Campos opcionales
  genre?: string;
  allowPublicAccess?: boolean;       // Para enlaces de firma
  description?: string;
  label?: string;                    // Sello discográfico
  isrc?: string;                     // International Standard Recording Code
  templateUsed?: string;
  lastModified?: string;
  lastModifiedBy?: string;
}

// ===== COMPOSITOR/COLABORADOR =====
export interface Composer {
  id: string;                        // "C1", "C2", etc.
  
  // Información personal
  name: string;
  email: string;
  
  // Rol y contribución
  role: ComposerRole;
  share: number;                     // Porcentaje (0-100)
  
  // Información profesional
  publisher: string;
  proSociety?: string;               // Sociedad de gestión
  ipiNumber?: string;                // International Publishers Index
  
  // Firma digital
  signature?: string;                // Base64 de imagen
  signedAt?: string;                 // ISO string
  
  // Metadata
  isRegisteredUser?: boolean;        // Si tiene cuenta en la app
  invitedAt?: string;                // Cuándo se le envió invitación
  remindersSent?: number;            // Número de recordatorios
}

// ===== TOKEN DE FIRMA SEGURO =====
export interface SigningToken {
  id: string;                        // "{agreementId}_{composerId}"
  
  // Referencias
  agreementId: string;
  composerId: string;
  
  // Token y expiración
  token: string;                     // UUID v4
  expiresAt: string;                 // ISO string
  createdAt: string;                 // ISO string
  
  // Auditoría
  createdBy: string;                 // UID del creador
  used: boolean;
  usedAt?: string;                   // ISO string
  
  // Información del compositor
  email: string;
  name: string;
  
  // Metadata de acceso
  ipAddress?: string;
  userAgent?: string;
  accessCount?: number;
  lastAccessAt?: string;
}

// ===== METADATOS DE ARCHIVO =====
export interface FileMetadata {
  id: string;
  
  // Información del archivo
  originalName: string;              // "split_sheet.pdf"
  storagePath: string;               // "/user-uploads/uid/split-sheets/file.pdf"
  contentType: string;               // "application/pdf"
  size: number;                      // Bytes
  
  // Propietario
  uploadedBy: string;                // UID
  uploadedAt: string;                // ISO string
  
  // Categorización
  category: FileCategory;
  tags?: string[];                   // ["ai-analysis", "draft"]
  
  // Relaciones
  agreementId?: string;              // Si está asociado a un acuerdo
  relatedTo?: string;                // ID de entidad relacionada
  
  // Procesamiento IA
  processed?: boolean;
  processedAt?: string;
  analysisResult?: any;              // Resultado del análisis
  
  // Metadata adicional
  description?: string;
  isPublic?: boolean;
  downloadCount?: number;
  lastAccessedAt?: string;
  lastAccessedBy?: string;
}

// ===== LOG DE AUDITORÍA =====
export interface AuditLog {
  id: string;
  
  // Evento
  action: AuditAction;
  resource: string;                  // "agreement", "user", "file"
  resourceId: string;
  
  // Usuario
  userId?: string;                   // UID (null para acciones sin auth)
  userEmail?: string;
  
  // Temporal
  timestamp: string;                 // ISO string
  
  // Contexto
  ipAddress?: string;
  userAgent?: string;
  
  // Datos del cambio
  oldValue?: any;                    // Valor anterior
  newValue?: any;                    // Nuevo valor
  metadata?: Record<string, any>;    // Datos adicionales
  
  // Resultado
  success: boolean;
  error?: string;                    // Si falló
}

// ================================================
// ENUMS Y TIPOS
// ================================================

// ===== ESTADOS DE ACUERDO =====
export type AgreementStatus = 
  | 'Draft'                          // Borrador
  | 'Sent'                           // Enviado para firmas
  | 'Partial'                        // Firmas parciales
  | 'Signed'                         // Completamente firmado
  | 'Archived';                      // Archivado

// ===== ROLES DE COMPOSITOR =====
export type ComposerRole = 
  | 'Composer'                       // Compositor de música
  | 'Lyricist'                       // Letrista
  | 'Producer'                       // Productor
  | 'Composer & Lyricist'            // Música y letra
  | 'Composer & Producer'            // Música y producción
  | 'Arranger'                       // Arreglista
  | 'Performer'                      // Intérprete principal
  | 'Additional Producer'            // Producción adicional
  | 'Mixer'                          // Ingeniero de mezcla
  | 'Mastering Engineer';            // Ingeniero de mastering

// ===== CATEGORÍAS DE ARCHIVO =====
export type FileCategory = 
  | 'split-sheet'                    // Para análisis IA
  | 'contract'                       // Contratos legales
  | 'photo'                          // Fotos generales
  | 'document'                       // Documentos generales
  | 'avatar'                         // Fotos de perfil
  | 'agreement-attachment'           // Adjuntos de acuerdos
  | 'temp';                          // Temporales

// ===== ACCIONES DE AUDITORÍA =====
export type AuditAction = 
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'agreement.created'
  | 'agreement.updated'
  | 'agreement.deleted'
  | 'agreement.signed'
  | 'agreement.status_changed'
  | 'file.uploaded'
  | 'file.downloaded'
  | 'file.deleted'
  | 'token.generated'
  | 'token.used'
  | 'auth.login'
  | 'auth.logout'
  | 'auth.failed';

// ================================================
// TIPOS DE UTILIDAD
// ================================================

// ===== CREDENCIALES DE AUTENTICACIÓN =====
export type EmailPasswordCredentials = {
  email: string;
  password: string;
};

// ===== DETALLES DE REGISTRO =====
export type SignUpDetails = {
  fullName: string;
  email: string;
  password: string;
  artistName?: string;
  primaryRole?: string;
  genres?: string;
  publisher?: string;
  proSociety?: string;
  ipiNumber?: string;
};

// ===== ESTADO DE ACCIÓN =====
export type ActionState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  data?: any;
};

// ===== RESULTADO DE ANÁLISIS IA =====
export type RightsConflictDetectionOutput = {
  conflicts: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    suggestions: string[];
  }>;
  summary: {
    totalConflicts: number;
    highSeverityCount: number;
    confidence: number;
  };
  extractedData?: {
    songTitle?: string;
    composers?: Array<{
      name: string;
      role?: string;
      share?: number;
    }>;
  };
};

// ================================================
// FUNCIONES DE VALIDACIÓN (OPCIONAL)
// ================================================

// ===== VALIDADORES =====
export const isValidUser = (data: any): data is User => {
  return typeof data === 'object' &&
         typeof data.uid === 'string' &&
         typeof data.displayName === 'string' &&
         typeof data.email === 'string' &&
         typeof data.createdAt === 'string';
};

export const isValidAgreement = (data: any): data is Agreement => {
  return typeof data === 'object' &&
         typeof data.userId === 'string' &&
         typeof data.songTitle === 'string' &&
         Array.isArray(data.composers) &&
         ['Draft', 'Sent', 'Partial', 'Signed', 'Archived'].includes(data.status);
};

export const isValidComposer = (data: any): data is Composer => {
  return typeof data === 'object' &&
         typeof data.id === 'string' &&
         typeof data.name === 'string' &&
         typeof data.email === 'string' &&
         typeof data.share === 'number' &&
         data.share >= 0 && data.share <= 100;
};
