import { BaseRepository } from './base-repository';
import { POI, CreatePOIInput, UpdatePOIInput, POIStatus } from '@/models';

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

  async bulkUpdateStatus(ids: string[], status: POIStatus): Promise<void> {
    return this.bulkUpdate(ids, { status });
  }
}

export const poiRepository = new POIRepository();
