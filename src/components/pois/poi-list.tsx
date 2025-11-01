'use client';

import { useState, useEffect } from 'react';
import { POI, CreatePOIInput, UpdatePOIInput } from '@/models';
import { poiService } from '@/services/poi-service';
import { DataTable, Column } from '@/components/common/data-table';
import { Modal } from '@/components/common/modal';
import { POIForm } from './poi-form';
import { DocumentSnapshot, DocumentData } from 'firebase/firestore';

export function POIList() {
  const [pois, setPOIs] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot<DocumentData>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPOI, setEditingPOI] = useState<POI | undefined>();

  const loadPOIs = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const result = await poiService.getPaginatedPOIs(
        { pageSize: 20, lastDoc: loadMore ? lastDoc : undefined },
        searchQuery ? { field: 'name', value: searchQuery } : undefined
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
    loadPOIs();
  }, [searchQuery]);

  const handleCreate = () => {
    setEditingPOI(undefined);
    setIsModalOpen(true);
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
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add POI
        </button>
      </div>

      <DataTable
        data={pois}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
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
    </div>
  );
}
