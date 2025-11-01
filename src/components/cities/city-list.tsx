'use client';

import { useState, useEffect } from 'react';
import { City, CreateCityInput, UpdateCityInput } from '@/models';
import { cityService } from '@/services/city-service';
import { DataTable, Column } from '@/components/common/data-table';
import { Modal } from '@/components/common/modal';
import { CityForm } from './city-form';
import { DocumentSnapshot, DocumentData } from 'firebase/firestore';

export function CityList() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot<DocumentData>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | undefined>();

  const loadCities = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const result = await cityService.getPaginatedCities(
        { pageSize: 20, lastDoc: loadMore ? lastDoc : undefined },
        searchQuery ? { field: 'name', value: searchQuery } : undefined
      );

      if (loadMore) {
        setCities([...cities, ...result.items]);
      } else {
        setCities(result.items);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadCities();
  }, [searchQuery]);

  const handleCreate = () => {
    setEditingCity(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (city: City) => {
    setEditingCity(city);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CreateCityInput | UpdateCityInput) => {
    if (editingCity) {
      await cityService.updateCity(editingCity.id, data);
    } else {
      await cityService.createCity(data as CreateCityInput);
    }
    setIsModalOpen(false);
    loadCities();
  };

  const handleDelete = async (id: string) => {
    await cityService.deleteCity(id);
    loadCities();
  };

  const handleBulkDelete = async (ids: string[]) => {
    await cityService.bulkDeleteCities(ids);
    loadCities();
  };

  const columns: Column<City>[] = [
    { key: 'name', label: 'Name' },
    { key: 'countryName', label: 'Country' },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (city) => new Date(city.createdAt.toDate()).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cities</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add City
        </button>
      </div>

      <DataTable
        data={cities}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        searchPlaceholder="Search cities..."
        onSearch={setSearchQuery}
        onLoadMore={() => loadCities(true)}
        hasMore={hasMore}
        loadingMore={loadingMore}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCity ? 'Edit City' : 'Add City'}
      >
        <CityForm
          city={editingCity}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
