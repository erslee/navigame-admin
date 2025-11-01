import { Timestamp } from 'firebase/firestore';

export interface City {
  id: string;
  name: string;
  countryId: string;
  countryName: string; // Denormalized for performance
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateCityInput {
  name: string;
  countryId: string;
  countryName: string;
}

export interface UpdateCityInput {
  name?: string;
  countryId?: string;
  countryName?: string;
}
