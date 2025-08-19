
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
