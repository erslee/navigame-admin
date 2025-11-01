import { Timestamp } from 'firebase/firestore';

export interface POI {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string; // Denormalized for performance
  cityId: string;
  cityName: string; // Denormalized for performance
  address: string; // Required field
  dynamicFields: Record<string, string>; // Key-value pairs for additional fields
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreatePOIInput {
  name: string;
  categoryId: string;
  categoryName: string;
  cityId: string;
  cityName: string;
  address: string;
  dynamicFields: Record<string, string>;
}

export interface UpdatePOIInput {
  name?: string;
  categoryId?: string;
  categoryName?: string;
  cityId?: string;
  cityName?: string;
  address?: string;
  dynamicFields?: Record<string, string>;
}
