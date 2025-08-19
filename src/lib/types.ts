
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
  genres?: string[];           // ["Pop", "Electronic", "Hip-Hop"]
  publisher?: string;        // Editorial musical
  proSociety?: string;       // "ASCAP", "BMI", "SGAE", etc.
  ipiNumber?: string;        // International Publishers Index
  phone?: string;
  locationCountry?: string;
  locationState?: string;
  locationCity?: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'professional';
  bio?: string;
  website?: string;
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
