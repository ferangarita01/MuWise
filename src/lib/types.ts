
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
  songTitle: string;
  composers: Composer[];
  status: AgreementStatus;
  createdAt: string;
  publicationDate?: Date;
  performerArtists?: string;
  duration?: string;
};
