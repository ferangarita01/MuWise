

export type AgreementStatus = 'Draft' | 'Sent' | 'Partial' | 'Signed' | 'Archived';

export type Composer = {
  id: string;
  name: string;
  role: string;
  share: number;
  email: string;
  publisher: string;
  signedAt?: string;
  signature?: string;
};

export type Agreement = {
  id:string;
  userId: string;
  songTitle: string;
  composers: Composer[];
  status: AgreementStatus;
  createdAt: string;
  publicationDate?: string;
  performerArtists?: string;
  duration?: string;
  language?: 'en' | 'es';
};

export type AgreementType = {
  id: string;
  title: string;
  icon: string;
  description: string;
  badge: string;
  category: string;
};
