import { poiRepository } from '@/repositories/poi-repository';
import { POI, CreatePOIInput, UpdatePOIInput } from '@/models';
import { PaginationParams, SearchParams, PaginatedResult } from '@/repositories/base-repository';

export class POIService {
  async getPOIById(id: string): Promise<POI | null> {
    return poiRepository.getById(id);
  }

  async getAllPOIs(): Promise<POI[]> {
    return poiRepository.getAll();
  }

  async getPaginatedPOIs(
    pagination: PaginationParams,
    searchParams?: SearchParams
  ): Promise<PaginatedResult<POI>> {
    return poiRepository.getPaginated(pagination, searchParams);
  }

  async createPOI(data: CreatePOIInput): Promise<POI> {
    // Validate that address is provided
    if (!data.address || data.address.trim() === '') {
      throw new Error('Address is required for POI');
    }

    return poiRepository.createPOI(data);
  }

  async updatePOI(id: string, data: UpdatePOIInput): Promise<void> {
    // Validate address if it's being updated
    if (data.address !== undefined && data.address.trim() === '') {
      throw new Error('Address cannot be empty');
    }

    return poiRepository.updatePOI(id, data);
  }

  async deletePOI(id: string): Promise<void> {
    return poiRepository.delete(id);
  }

  async bulkDeletePOIs(ids: string[]): Promise<void> {
    return poiRepository.bulkDelete(ids);
  }
}

export const poiService = new POIService();
