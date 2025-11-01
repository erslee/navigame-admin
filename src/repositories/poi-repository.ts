import { BaseRepository } from './base-repository';
import { POI, CreatePOIInput, UpdatePOIInput } from '@/models';

export class POIRepository extends BaseRepository<POI> {
  constructor() {
    super('pois');
  }

  async createPOI(data: CreatePOIInput): Promise<POI> {
    return this.create(data);
  }

  async updatePOI(id: string, data: UpdatePOIInput): Promise<void> {
    return this.update(id, data);
  }
}

export const poiRepository = new POIRepository();
