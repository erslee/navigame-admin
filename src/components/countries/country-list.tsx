'use client';

import { useState, useEffect } from 'react';
import { Country, CreateCountryInput, UpdateCountryInput } from '@/models';
import { countryService } from '@/services/country-service';
import { DataTable, Column } from '@/components/common/data-table';
import { Modal } from '@/components/common/modal';
import { CountryForm } from './country-form';
import { DocumentSnapshot, DocumentData } from 'firebase/firestore';

export function CountryList() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot<DocumentData>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | undefined>();

  const loadCountries = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const result = await countryService.getPaginatedCountries(
        { pageSize: 20, lastDoc: loadMore ? lastDoc : undefined },
        searchQuery ? { field: 'name', value: searchQuery } : undefined
      );

      if (loadMore) {
        setCountries([...countries, ...result.items]);
      } else {
        setCountries(result.items);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading countries:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadCountries();
  }, [searchQuery]);

  const handleCreate = () => {
    setEditingCountry(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (country: Country) => {
    setEditingCountry(country);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CreateCountryInput | UpdateCountryInput) => {
    if (editingCountry) {
      await countryService.updateCountry(editingCountry.id, data);
    } else {
      await countryService.createCountry(data as CreateCountryInput);
    }
    setIsModalOpen(false);
    loadCountries();
  };

  const handleDelete = async (id: string) => {
    await countryService.deleteCountry(id);
    loadCountries();
  };

  const handleBulkDelete = async (ids: string[]) => {
    await countryService.bulkDeleteCountries(ids);
    loadCountries();
  };

  const columns: Column<Country>[] = [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (country) => new Date(country.createdAt.toDate()).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Countries</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Country
        </button>
      </div>

      <DataTable
        data={countries}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        searchPlaceholder="Search countries..."
        onSearch={setSearchQuery}
        onLoadMore={() => loadCountries(true)}
        hasMore={hasMore}
        loadingMore={loadingMore}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCountry ? 'Edit Country' : 'Add Country'}
      >
        <CountryForm
          country={editingCountry}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
