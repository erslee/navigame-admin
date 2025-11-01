import { BaseRepository } from './base-repository';
import { City, CreateCityInput, UpdateCityInput } from '@/models';

export class CityRepository extends BaseRepository<City> {
  constructor() {
    super('cities');
  }

  async createCity(data: CreateCityInput): Promise<City> {
    return this.create(data);
  }

  async updateCity(id: string, data: UpdateCityInput): Promise<void> {
    return this.update(id, data);
  }
}

export const cityRepository = new CityRepository();
