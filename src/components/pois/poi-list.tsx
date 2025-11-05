'use client';

import { useState, useEffect } from 'react';
import { POI, CreatePOIInput, UpdatePOIInput, POIStatus, City, Category } from '@/models';
import { poiService } from '@/services/poi-service';
import { cityService } from '@/services/city-service';
import { categoryService } from '@/services/category-service';
import { DataTable, Column, BulkAction } from '@/components/common/data-table';
import { Modal } from '@/components/common/modal';
import { POIForm } from './poi-form';
import { POIJsonImporter } from './poi-json-importer';
import { DocumentSnapshot, DocumentData } from 'firebase/firestore';
import { FilterParams } from '@/repositories/base-repository';

export function POIList() {
  const [pois, setPOIs] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot<DocumentData>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingPOI, setEditingPOI] = useState<POI | undefined>();

  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const loadPOIs = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      // Build filter parameters
      const filters: FilterParams[] = [];
      if (selectedCityId) {
        filters.push({ field: 'cityId', value: selectedCityId });
      }
      if (selectedCategoryId) {
        filters.push({ field: 'categoryId', value: selectedCategoryId });
      }

      const result = await poiService.getPaginatedPOIs(
        { pageSize: 20, lastDoc: loadMore ? lastDoc : undefined },
        searchQuery ? { field: 'name', value: searchQuery } : undefined,
        filters.length > 0 ? filters : undefined
      );

      if (loadMore) {
        setPOIs([...pois, ...result.items]);
      } else {
        setPOIs(result.items);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading POIs:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allCities, allCategories] = await Promise.all([
          cityService.getAllCities(),
          categoryService.getAllCategories(),
        ]);
        setCities(allCities);
        setCategories(allCategories);
      } catch (error) {
        console.error('Error loading cities and categories:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    loadPOIs();
  }, [searchQuery, selectedCityId, selectedCategoryId]);

  const handleCreate = () => {
    setEditingPOI(undefined);
    setIsModalOpen(true);
  };

  const handleImport = () => {
    setIsImportModalOpen(true);
  };

  const handleImportSuccess = () => {
    setIsImportModalOpen(false);
    loadPOIs();
  };

  const handleEdit = (poi: POI) => {
    setEditingPOI(poi);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CreatePOIInput | UpdatePOIInput) => {
    if (editingPOI) {
      await poiService.updatePOI(editingPOI.id, data);
    } else {
      await poiService.createPOI(data as CreatePOIInput);
    }
    setIsModalOpen(false);
    loadPOIs();
  };

  const handleDelete = async (id: string) => {
    await poiService.deletePOI(id);
    loadPOIs();
  };

  const handleBulkDelete = async (ids: string[]) => {
    await poiService.bulkDeletePOIs(ids);
    loadPOIs();
  };

  const handleBulkUpdateStatus = async (ids: string[], status: POIStatus) => {
    try {
      await poiService.bulkUpdatePOIStatus(ids, status);
      loadPOIs();
    } catch (error) {
      console.error('Error updating POI status:', error);
      alert('Failed to update POI status');
    }
  };

  const bulkActions: BulkAction[] = [
    {
      label: 'Set to NEW',
      onClick: (ids) => {
        if (confirm(`Set ${ids.length} POIs to NEW status?`)) {
          handleBulkUpdateStatus(ids, POIStatus.NEW);
        }
      },
      className: 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500',
    },
    {
      label: 'Set to PUBLISHED',
      onClick: (ids) => {
        if (confirm(`Set ${ids.length} POIs to PUBLISHED status?`)) {
          handleBulkUpdateStatus(ids, POIStatus.PUBLISHED);
        }
      },
      className: 'px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500',
    },
    {
      label: 'Set to DISABLED',
      onClick: (ids) => {
        if (confirm(`Set ${ids.length} POIs to DISABLED status?`)) {
          handleBulkUpdateStatus(ids, POIStatus.DISABLED);
        }
      },
      className: 'px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500',
    },
  ];

  const getStatusBadge = (status: string) => {
    const colors = {
      NEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      PUBLISHED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      DISABLED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || ''}`}>
        {status}
      </span>
    );
  };

  const columns: Column<POI>[] = [
    { key: 'name', label: 'Name' },
    { key: 'categoryName', label: 'Category' },
    { key: 'cityName', label: 'City' },
    { key: 'address', label: 'Address', render: (poi) => poi.address.substring(0, 50) + (poi.address.length > 50 ? '...' : '') },
    {
      key: 'status',
      label: 'Status',
      render: (poi) => getStatusBadge(poi.status),
    },
    {
      key: 'geolocation',
      label: 'Coordinates',
      render: (poi) => `${poi.geolocation.latitude.toFixed(4)}, ${poi.geolocation.longitude.toFixed(4)}`,
    },
    {
      key: 'dynamicFields',
      label: 'Extra Fields',
      render: (poi) => Object.keys(poi.dynamicFields).length.toString(),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (poi) => new Date(poi.createdAt.toDate()).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Points of Interest</h1>
        <div className="flex gap-3">
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Import JSON
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add POI
          </button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <select
          value={selectedCityId}
          onChange={(e) => setSelectedCityId(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Cities</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}, {city.countryName}
            </option>
          ))}
        </select>

        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {(selectedCityId || selectedCategoryId) && (
          <button
            onClick={() => {
              setSelectedCityId('');
              setSelectedCategoryId('');
            }}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Clear Filters
          </button>
        )}
      </div>

      <DataTable
        data={pois}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        bulkActions={bulkActions}
        searchPlaceholder="Search POIs..."
        onSearch={setSearchQuery}
        onLoadMore={() => loadPOIs(true)}
        hasMore={hasMore}
        loadingMore={loadingMore}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPOI ? 'Edit POI' : 'Add POI'}
      >
        <POIForm
          poi={editingPOI}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import POIs from JSON"
      >
        <POIJsonImporter
          onSuccess={handleImportSuccess}
          onCancel={() => setIsImportModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
