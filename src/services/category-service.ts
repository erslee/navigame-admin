import { categoryRepository } from '@/repositories/category-repository';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '@/models';
import { PaginationParams, SearchParams, PaginatedResult } from '@/repositories/base-repository';

export class CategoryService {
  async getCategoryById(id: string): Promise<Category | null> {
    return categoryRepository.getById(id);
  }

  async getAllCategories(): Promise<Category[]> {
    return categoryRepository.getAll();
  }

  async getPaginatedCategories(
    pagination: PaginationParams,
    searchParams?: SearchParams
  ): Promise<PaginatedResult<Category>> {
    return categoryRepository.getPaginated(pagination, searchParams);
  }

  async createCategory(data: CreateCategoryInput): Promise<Category> {
    return categoryRepository.createCategory(data);
  }

  async updateCategory(id: string, data: UpdateCategoryInput): Promise<void> {
    return categoryRepository.updateCategory(id, data);
  }

  async deleteCategory(id: string): Promise<void> {
    return categoryRepository.delete(id);
  }

  async bulkDeleteCategories(ids: string[]): Promise<void> {
    return categoryRepository.bulkDelete(ids);
  }

  async findCategoryByName(categoryName: string): Promise<Category | null> {
    const allCategories = await this.getAllCategories();
    const category = allCategories.find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase()
    );
    return category || null;
  }
}

export const categoryService = new CategoryService();
