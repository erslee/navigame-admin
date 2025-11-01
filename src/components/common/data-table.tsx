'use client';

import { useState } from 'react';
import { Loading } from './loading';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

export interface BulkAction {
  label: string;
  onClick: (ids: string[]) => void;
  className?: string;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  bulkActions?: BulkAction[];
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  onEdit,
  onDelete,
  onBulkDelete,
  bulkActions,
  searchPlaceholder = 'Search...',
  onSearch,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
}: DataTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((item) => item.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size > 0 && onBulkDelete) {
      if (confirm(`Are you sure you want to delete ${selectedIds.size} items?`)) {
        onBulkDelete(Array.from(selectedIds));
        setSelectedIds(new Set());
      }
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {onSearch && (
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        )}

        {selectedIds.size > 0 && (
          <div className="flex gap-2">
            {bulkActions?.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick(Array.from(selectedIds));
                  setSelectedIds(new Set());
                }}
                className={action.className || 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'}
              >
                {action.label} ({selectedIds.size})
              </button>
            ))}
            {onBulkDelete && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete Selected ({selectedIds.size})
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {(onBulkDelete || bulkActions) && (
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === data.length && data.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </th>
                  )}
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {column.label}
                    </th>
                  ))}
                  {(onEdit || onDelete) && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + (onBulkDelete || bulkActions ? 1 : 0) + (onEdit || onDelete ? 1 : 0)}
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No data found
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      {(onBulkDelete || bulkActions) && (
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.id)}
                            onChange={() => handleSelectOne(item.id)}
                            className="rounded border-gray-300 dark:border-gray-600"
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100"
                        >
                          {column.render
                            ? column.render(item)
                            : String((item as any)[column.key] || '')}
                        </td>
                      ))}
                      {(onEdit || onDelete) && (
                        <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Edit
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this item?')) {
                                  onDelete(item.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {hasMore && onLoadMore && (
            <div className="flex justify-center">
              <button
                onClick={onLoadMore}
                disabled={loadingMore}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
