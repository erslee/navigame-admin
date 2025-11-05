import { cityRepository } from '@/repositories/city-repository';
import { City, CreateCityInput, UpdateCityInput } from '@/models';
import { PaginationParams, SearchParams, PaginatedResult } from '@/repositories/base-repository';

export class CityService {
  async getCityById(id: string): Promise<City | null> {
    return cityRepository.getById(id);
  }

  async getAllCities(): Promise<City[]> {
    return cityRepository.getAll();
  }

  async getPaginatedCities(
    pagination: PaginationParams,
    searchParams?: SearchParams
  ): Promise<PaginatedResult<City>> {
    return cityRepository.getPaginated(pagination, searchParams);
  }

  async createCity(data: CreateCityInput): Promise<City> {
    return cityRepository.createCity(data);
  }

  async updateCity(id: string, data: UpdateCityInput): Promise<void> {
    return cityRepository.updateCity(id, data);
  }

  async deleteCity(id: string): Promise<void> {
    return cityRepository.delete(id);
  }

  async bulkDeleteCities(ids: string[]): Promise<void> {
    return cityRepository.bulkDelete(ids);
  }

  async findCityByNameAndCountry(cityName: string, countryName: string): Promise<City | null> {
    const allCities = await this.getAllCities();
    const city = allCities.find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase() &&
             c.countryName.toLowerCase() === countryName.toLowerCase()
    );
    return city || null;
  }
}

export const cityService = new CityService();
