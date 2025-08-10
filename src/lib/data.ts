
import type { Agreement } from './types';

export const mockAgreements: Agreement[] = [
  {
    id: 'AGR-001',
    songTitle: 'Midnight Bloom',
    publicationDate: new Date('2023-10-26'),
    performerArtists: 'The Midnight Bloomers',
    duration: '03:45',
    composers: [
      { id: 'C1', name: 'Alina Vera', role: 'Composer & Lyricist', share: 50, email: 'alina@example.com', publisher: 'Vera Music Publishing', signedAt: '2023-10-27T10:00:00Z', signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==' },
      { id: 'C2', name: 'Leo Rivera', role: 'Composer', share: 50, email: 'leo@example.com', publisher: 'Rivera Sounds', signedAt: '2023-10-28T11:30:00Z', signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==' },
    ],
    status: 'Signed',
    createdAt: '2023-10-26',
  },
  {
    id: 'AGR-002',
    songTitle: 'Echoes in the Rain',
    publicationDate: new Date('2023-11-15'),
    performerArtists: 'Sara Jones',
    duration: '04:12',
    composers: [
      { id: 'C3', name: 'Sara Jones', role: 'Composer & Lyricist', share: 100, email: 'sara@example.com', publisher: 'Self-Published' },
    ],
    status: 'Sent',
    createdAt: '2023-11-15',
  },
  {
    id: 'AGR-003',
    songTitle: 'City Lights',
    publicationDate: new Date('2023-12-01'),
    performerArtists: 'Ben Carter ft. Chloe Kim',
    duration: '03:15',
    composers: [
      { id: 'C4', name: 'Ben Carter', role: 'Composer', share: 40, email: 'ben@example.com', publisher: 'Carter Creations' },
      { id: 'C5', name: 'Chloe Kim', role: 'Lyricist', share: 40, email: 'chloe@example.com', publisher: 'Kim Lyrics Co.' },
      { id: 'C6', name: 'David Lee', role: 'Producer', share: 20, email: 'david@example.com', publisher: 'Lee Productions' },
    ],
    status: 'Draft',
    createdAt: '2023-12-01',
  },
  {
    id: 'AGR-004',
    songTitle: 'Lost & Found',
    publicationDate: new Date('2024-01-20'),
    performerArtists: 'Maria Garcia',
    duration: '02:55',
    composers: [
      { id: 'C7', name: 'Maria Garcia', role: 'Composer & Lyricist', share: 70, email: 'maria@example.com', publisher: 'Garcia Grooves', signedAt: '2024-01-21T14:00:00Z', signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==' },
      { id: 'C8', name: 'Tom Harris', role: 'Producer', share: 30, email: 'tom@example.com', publisher: 'Harris Beats' },
    ],
    status: 'Partial',
    createdAt: '2024-01-20',
  },
  {
    id: 'AGR-005',
    songTitle: 'Ocean Drive',
    publicationDate: new Date('2024-02-10'),
    performerArtists: 'Olivia Chen',
    duration: '03:30',
    composers: [
       { id: 'C9', name: 'Olivia Chen', role: 'Composer', share: 60, email: 'olivia@example.com', publisher: 'Chen Chords' },
       { id: 'C10', name: 'James Brown', role: 'Lyricist', share: 40, email: 'james@example.com', publisher: 'Brown Words' },
    ],
    status: 'Sent',
    createdAt: '2024-02-10',
  },
    {
    id: 'AGR-006',
    songTitle: 'Desert Rose',
    publicationDate: new Date('2023-09-05'),
    performerArtists: 'The Wanderers',
    duration: '05:20',
    composers: [
      { id: 'C11', name: 'Sting', role: 'Composer & Lyricist', share: 100, email: 'sting@example.com', publisher: 'EMI Music Publishing', signedAt: '2023-09-06T10:00:00Z', signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==' },
    ],
    status: 'Archived',
    createdAt: '2023-09-05',
  },
];
