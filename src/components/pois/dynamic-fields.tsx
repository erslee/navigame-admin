'use client';

import { useState } from 'react';
import { Input } from '@/components/common/form-input';

interface DynamicFieldsProps {
  fields: Record<string, string>;
  onChange: (fields: Record<string, string>) => void;
}

export function DynamicFields({ fields, onChange }: DynamicFieldsProps) {
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  const handleAddField = () => {
    if (!newFieldKey.trim()) {
      alert('Field name is required');
      return;
    }

    if (newFieldKey in fields) {
      alert('Field name already exists');
      return;
    }

    onChange({
      ...fields,
      [newFieldKey]: newFieldValue,
    });

    setNewFieldKey('');
    setNewFieldValue('');
  };

  const handleRemoveField = (key: string) => {
    const newFields = { ...fields };
    delete newFields[key];
    onChange(newFields);
  };

  const handleUpdateField = (key: string, value: string) => {
    onChange({
      ...fields,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Dynamic Fields
        </label>
        <div className="space-y-2">
          {Object.entries(fields).map(([key, value]) => (
            <div key={key} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={key}
                  disabled
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleUpdateField(key, e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveField(key)}
                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Add New Field
        </label>
        <div className="flex gap-2 items-start">
          <div className="flex-1 grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Field name"
              value={newFieldKey}
              onChange={(e) => setNewFieldKey(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="Field value"
              value={newFieldValue}
              onChange={(e) => setNewFieldValue(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            type="button"
            onClick={handleAddField}
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
