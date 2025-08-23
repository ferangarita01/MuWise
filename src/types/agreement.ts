import { BaseEntity, Status } from './common';
import { User } from './user';

export interface Agreement extends BaseEntity {
  title: string;
  description?: string;
  status: AgreementStatus;
  type: AgreementType;
  createdBy: string;
  signers: Signer[];
  documentUrl?: string;
  metadata: AgreementMetadata;
  expiresAt?: Date;
  signedAt?: Date;
  completedAt?: Date;
}

export type AgreementStatus = 
  | 'draft' 
  | 'pending' 
  | 'in_progress' 
  | 'signed' 
  | 'completed' 
  | 'expired' 
  | 'cancelled';

export type AgreementType = 
  | 'dj_service' 
  | 'venue_rental' 
  | 'equipment_rental' 
  | 'service_contract' 
  | 'custom';

export interface Signer {
  id: string;
  userId?: string;
  email: string;
  name: string;
  role: SignerRole;
  status: SignerStatus;
  signedAt?: Date;
  signatureData?: string;
  order: number;
}

export type SignerRole = 'client' | 'contractor' | 'witness' | 'approver';
export type SignerStatus = 'pending' | 'signed' | 'declined';

export interface AgreementMetadata {
  totalAmount?: number;
  currency?: string;
  eventDate?: Date;
  location?: string;
  duration?: number;
  equipment?: string[];
  specialRequirements?: string;
  paymentTerms?: PaymentTerms;
}

export interface PaymentTerms {
  amount: number;
  currency: string;
  dueDate?: Date;
  installments?: PaymentInstallment[];
  method?: 'cash' | 'card' | 'transfer' | 'check';
}

export interface PaymentInstallment {
  amount: number;
  dueDate: Date;
  description?: string;
  paid: boolean;
}

export interface CreateAgreementData {
  title: string;
  description?: string;
  type: AgreementType;
  signers: Omit<Signer, 'id' | 'status' | 'signedAt'>[];
  metadata: AgreementMetadata;
  expiresAt?: Date;
}

export interface UpdateAgreementData {
  title?: string;
  description?: string;
  status?: AgreementStatus;
  metadata?: Partial<AgreementMetadata>;
  expiresAt?: Date;
}

export interface SignAgreementData {
  signerId: string;
  signatureData: string;
  timestamp: Date;
}