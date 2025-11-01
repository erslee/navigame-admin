import { BaseRepository } from './base-repository';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '@/models';

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super('categories');
  }

  async createCategory(data: CreateCategoryInput): Promise<Category> {
    return this.create(data);
  }

  async updateCategory(id: string, data: UpdateCategoryInput): Promise<void> {
    return this.update(id, data);
  }
}

export const categoryRepository = new CategoryRepository();
