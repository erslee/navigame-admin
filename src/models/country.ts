import { Timestamp } from 'firebase/firestore';

export interface Country {
  id: string;
  name: string;
  code: string; // ISO country code (e.g., "US", "FR")
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateCountryInput {
  name: string;
  code: string;
}

export interface UpdateCountryInput {
  name?: string;
  code?: string;
}
