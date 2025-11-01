import { poiRepository } from '@/repositories/poi-repository';
import { POI, CreatePOIInput, UpdatePOIInput, POIStatus } from '@/models';
import { PaginationParams, SearchParams, PaginatedResult, FilterParams } from '@/repositories/base-repository';

export class POIService {
  async getPOIById(id: string): Promise<POI | null> {
    return poiRepository.getById(id);
  }

  async getAllPOIs(): Promise<POI[]> {
    return poiRepository.getAll();
  }

  async getPaginatedPOIs(
    pagination: PaginationParams,
    searchParams?: SearchParams,
    filterParams?: FilterParams[]
  ): Promise<PaginatedResult<POI>> {
    return poiRepository.getPaginated(pagination, searchParams, filterParams);
  }

  async createPOI(data: CreatePOIInput): Promise<POI> {
    // Validate that address is provided
    if (!data.address || data.address.trim() === '') {
      throw new Error('Address is required for POI');
    }

    // Validate geolocation
    if (!data.geolocation || typeof data.geolocation.latitude !== 'number' || typeof data.geolocation.longitude !== 'number') {
      throw new Error('Valid geolocation with latitude and longitude is required');
    }

    if (data.geolocation.latitude < -90 || data.geolocation.latitude > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }

    if (data.geolocation.longitude < -180 || data.geolocation.longitude > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    // Validate status
    if (!data.status) {
      throw new Error('Status is required for POI');
    }

    return poiRepository.createPOI(data);
  }

  async updatePOI(id: string, data: UpdatePOIInput): Promise<void> {
    // Validate address if it's being updated
    if (data.address !== undefined && data.address.trim() === '') {
      throw new Error('Address cannot be empty');
    }

    // Validate geolocation if it's being updated
    if (data.geolocation !== undefined) {
      if (typeof data.geolocation.latitude !== 'number' || typeof data.geolocation.longitude !== 'number') {
        throw new Error('Valid geolocation with latitude and longitude is required');
      }

      if (data.geolocation.latitude < -90 || data.geolocation.latitude > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }

      if (data.geolocation.longitude < -180 || data.geolocation.longitude > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
    }

    return poiRepository.updatePOI(id, data);
  }

  async deletePOI(id: string): Promise<void> {
    return poiRepository.delete(id);
  }

  async bulkDeletePOIs(ids: string[]): Promise<void> {
    return poiRepository.bulkDelete(ids);
  }

  async bulkUpdatePOIStatus(ids: string[], status: POIStatus): Promise<void> {
    // Validate status
    if (!Object.values(POIStatus).includes(status)) {
      throw new Error('Invalid status value');
    }

    return poiRepository.bulkUpdateStatus(ids, status);
  }
}

export const poiService = new POIService();
