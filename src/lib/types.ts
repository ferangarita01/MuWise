export type AgreementStatus = 'Draft' | 'Sent' | 'Signed';

export type Composer = {
  id: string;
  name: string;
  role: string;
  share: number;
  email: string;
  publisher: string;
};

export type Agreement = {
  id: string;
  songTitle: string;
  composers: Composer[];
  status: AgreementStatus;
  createdAt: string;
};
