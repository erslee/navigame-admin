import { Timestamp } from 'firebase/firestore';

export enum POIStatus {
  NEW = 'NEW',
  PUBLISHED = 'PUBLISHED',
  DISABLED = 'DISABLED',
}

export interface Geolocation {
  latitude: number;
  longitude: number;
}

export interface POI {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string; // Denormalized for performance
  cityId: string;
  cityName: string; // Denormalized for performance
  address: string; // Required field
  geolocation: Geolocation; // Required field
  status: POIStatus; // NEW, PUBLISHED, or DISABLED
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
  geolocation: Geolocation;
  status: POIStatus;
  dynamicFields: Record<string, string>;
}

export interface UpdatePOIInput {
  name?: string;
  categoryId?: string;
  categoryName?: string;
  cityId?: string;
  cityName?: string;
  address?: string;
  geolocation?: Geolocation;
  status?: POIStatus;
  dynamicFields?: Record<string, string>;
}

export interface POIJsonInput {
  name: string;
  categoryName: string;
  cityName: string;
  countryName: string;
  address: string;
  geolocation: Geolocation;
  status: POIStatus;
  dynamicFields?: Record<string, string>;
}

export interface POIImportValidationResult {
  isValid: boolean;
  poi: CreatePOIInput | null;
  originalInput: POIJsonInput | null;
  errors: string[];
  index: number;
}

export interface POIImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ index: number; error: string }>;
}
