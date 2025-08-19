

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


// ===== COMPOSER / PARTICIPANT =====
export interface Composer {
  id: string; // Unique ID for the list
  documentId: string;
  name: string;
  email: string;
  role: string; // e.g., "Composer", "Producer", "Lyricist"
  share: number; // Ownership percentage
  publisher: string;
  ipiNumber?: string;
  isRegisteredUser: boolean; // Does this person have an account on Muwise?
  status: 'pending' | 'signed';
  signedAt?: string; // ISO date string
  signatureDataUrl?: string; // The image data URL of the signature
}


// ===== AGREEMENT / CONTRACT =====
export type AgreementStatus = 'draft' | 'pending' | 'signed' | 'void';

export interface Agreement {
  id: string;
  songTitle: string;
  createdBy: string; // User ID of the creator
  createdAt: string; // ISO date string
  lastModified: string; // ISO date string
  publicationDate: string; // ISO date string
  status: AgreementStatus;

  // Array of composers/participants in the agreement
  composers: Composer[];
  
  // Optional metadata
  isrc?: string; // International Standard Recording Code
  iswc?: string; // International Standard Musical Work Code
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
