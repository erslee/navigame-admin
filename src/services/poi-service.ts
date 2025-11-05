import { poiRepository } from '@/repositories/poi-repository';
import { POI, CreatePOIInput, UpdatePOIInput, POIStatus, POIJsonInput, POIImportValidationResult, POIImportResult } from '@/models';
import { PaginationParams, SearchParams, PaginatedResult, FilterParams } from '@/repositories/base-repository';
import { cityService } from './city-service';
import { categoryService } from './category-service';

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

  async validatePOIJSON(data: unknown, index: number): Promise<POIImportValidationResult> {
    const errors: string[] = [];

    // Check if data is an object
    if (!data || typeof data !== 'object') {
      return {
        isValid: false,
        poi: null,
        originalInput: null,
        errors: ['POI must be an object'],
        index,
      };
    }

    const poi = data as Record<string, unknown>;

    // Validate required fields
    if (!poi.name || typeof poi.name !== 'string' || poi.name.trim() === '') {
      errors.push('Name is required and must be a non-empty string');
    }

    if (!poi.categoryName || typeof poi.categoryName !== 'string') {
      errors.push('Category name is required and must be a string');
    }

    if (!poi.cityName || typeof poi.cityName !== 'string') {
      errors.push('City name is required and must be a string');
    }

    if (!poi.countryName || typeof poi.countryName !== 'string') {
      errors.push('Country name is required and must be a string');
    }

    if (!poi.address || typeof poi.address !== 'string' || poi.address.trim() === '') {
      errors.push('Address is required and must be a non-empty string');
    }

    // Validate geolocation
    if (!poi.geolocation || typeof poi.geolocation !== 'object') {
      errors.push('Geolocation is required and must be an object');
    } else {
      const geo = poi.geolocation as Record<string, unknown>;
      if (typeof geo.latitude !== 'number') {
        errors.push('Latitude is required and must be a number');
      } else if (geo.latitude < -90 || geo.latitude > 90) {
        errors.push('Latitude must be between -90 and 90');
      }

      if (typeof geo.longitude !== 'number') {
        errors.push('Longitude is required and must be a number');
      } else if (geo.longitude < -180 || geo.longitude > 180) {
        errors.push('Longitude must be between -180 and 180');
      }
    }

    // Validate status
    if (!poi.status || typeof poi.status !== 'string') {
      errors.push('Status is required and must be a string');
    } else if (!Object.values(POIStatus).includes(poi.status as POIStatus)) {
      errors.push(`Status must be one of: ${Object.values(POIStatus).join(', ')}`);
    }

    // Validate dynamicFields if present
    if (poi.dynamicFields !== undefined) {
      if (typeof poi.dynamicFields !== 'object' || Array.isArray(poi.dynamicFields)) {
        errors.push('Dynamic fields must be an object');
      }
    }

    // If basic validation fails, return early
    if (errors.length > 0) {
      return {
        isValid: false,
        poi: null,
        originalInput: null,
        errors,
        index,
      };
    }

    // Construct original input for display
    const originalInput: POIJsonInput = {
      name: poi.name as string,
      categoryName: poi.categoryName as string,
      cityName: poi.cityName as string,
      countryName: poi.countryName as string,
      address: poi.address as string,
      geolocation: poi.geolocation as { latitude: number; longitude: number },
      status: poi.status as POIStatus,
      dynamicFields: (poi.dynamicFields as Record<string, string>) || {},
    };

    // Look up category by name
    const category = await categoryService.findCategoryByName(poi.categoryName as string);
    if (!category) {
      errors.push(`Category "${poi.categoryName}" not found in database`);
    }

    // Look up city by name and country
    const city = await cityService.findCityByNameAndCountry(
      poi.cityName as string,
      poi.countryName as string
    );
    if (!city) {
      errors.push(`City "${poi.cityName}" in "${poi.countryName}" not found in database`);
    }

    // If lookups failed, return with errors
    if (errors.length > 0) {
      return {
        isValid: false,
        poi: null,
        originalInput,
        errors,
        index,
      };
    }

    // Construct valid POI with mapped IDs
    const validPOI: CreatePOIInput = {
      name: poi.name as string,
      categoryId: category!.id,
      categoryName: category!.name,
      cityId: city!.id,
      cityName: city!.name,
      address: poi.address as string,
      geolocation: poi.geolocation as { latitude: number; longitude: number },
      status: poi.status as POIStatus,
      dynamicFields: (poi.dynamicFields as Record<string, string>) || {},
    };

    return {
      isValid: true,
      poi: validPOI,
      originalInput,
      errors: [],
      index,
    };
  }

  async bulkCreatePOIs(pois: CreatePOIInput[], onProgress?: (current: number, total: number) => void): Promise<POIImportResult> {
    const result: POIImportResult = {
      total: pois.length,
      successful: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < pois.length; i++) {
      try {
        await this.createPOI(pois[i]);
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      if (onProgress) {
        onProgress(i + 1, pois.length);
      }
    }

    return result;
  }
}

export const poiService = new POIService();
