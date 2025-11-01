'use client';

import { useState, useEffect } from 'react';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '@/models';
import { categoryService } from '@/services/category-service';
import { DataTable, Column } from '@/components/common/data-table';
import { Modal } from '@/components/common/modal';
import { CategoryForm } from './category-form';
import { DocumentSnapshot, DocumentData } from 'firebase/firestore';

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot<DocumentData>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();

  const loadCategories = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const result = await categoryService.getPaginatedCategories(
        { pageSize: 20, lastDoc: loadMore ? lastDoc : undefined },
        searchQuery ? { field: 'name', value: searchQuery } : undefined
      );

      if (loadMore) {
        setCategories([...categories, ...result.items]);
      } else {
        setCategories(result.items);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [searchQuery]);

  const handleCreate = () => {
    setEditingCategory(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CreateCategoryInput | UpdateCategoryInput) => {
    if (editingCategory) {
      await categoryService.updateCategory(editingCategory.id, data);
    } else {
      await categoryService.createCategory(data as CreateCategoryInput);
    }
    setIsModalOpen(false);
    loadCategories();
  };

  const handleDelete = async (id: string) => {
    await categoryService.deleteCategory(id);
    loadCategories();
  };

  const handleBulkDelete = async (ids: string[]) => {
    await categoryService.bulkDeleteCategories(ids);
    loadCategories();
  };

  const columns: Column<Category>[] = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (category) => new Date(category.createdAt.toDate()).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Category
        </button>
      </div>

      <DataTable
        data={categories}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        searchPlaceholder="Search categories..."
        onSearch={setSearchQuery}
        onLoadMore={() => loadCategories(true)}
        hasMore={hasMore}
        loadingMore={loadingMore}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <CategoryForm
          category={editingCategory}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
