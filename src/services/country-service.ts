import { countryRepository } from '@/repositories/country-repository';
import { Country, CreateCountryInput, UpdateCountryInput } from '@/models';
import { PaginationParams, SearchParams, PaginatedResult } from '@/repositories/base-repository';

export class CountryService {
  async getCountryById(id: string): Promise<Country | null> {
    return countryRepository.getById(id);
  }

  async getAllCountries(): Promise<Country[]> {
    return countryRepository.getAll();
  }

  async getPaginatedCountries(
    pagination: PaginationParams,
    searchParams?: SearchParams
  ): Promise<PaginatedResult<Country>> {
    return countryRepository.getPaginated(pagination, searchParams);
  }

  async createCountry(data: CreateCountryInput): Promise<Country> {
    // Add validation logic here if needed
    return countryRepository.createCountry(data);
  }

  async updateCountry(id: string, data: UpdateCountryInput): Promise<void> {
    return countryRepository.updateCountry(id, data);
  }

  async deleteCountry(id: string): Promise<void> {
    return countryRepository.delete(id);
  }

  async bulkDeleteCountries(ids: string[]): Promise<void> {
    return countryRepository.bulkDelete(ids);
  }
}

export const countryService = new CountryService();
