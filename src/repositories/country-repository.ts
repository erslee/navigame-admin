import { BaseRepository } from './base-repository';
import { Country, CreateCountryInput, UpdateCountryInput } from '@/models';

export class CountryRepository extends BaseRepository<Country> {
  constructor() {
    super('countries');
  }

  async createCountry(data: CreateCountryInput): Promise<Country> {
    return this.create(data);
  }

  async updateCountry(id: string, data: UpdateCountryInput): Promise<void> {
    return this.update(id, data);
  }
}

export const countryRepository = new CountryRepository();
