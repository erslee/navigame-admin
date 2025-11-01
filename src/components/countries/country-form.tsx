'use client';

import { useState, useEffect } from 'react';
import { Country, CreateCountryInput, UpdateCountryInput } from '@/models';
import { Input } from '@/components/common/form-input';

interface CountryFormProps {
  country?: Country;
  onSubmit: (data: CreateCountryInput | UpdateCountryInput) => Promise<void>;
  onCancel: () => void;
}

export function CountryForm({ country, onSubmit, onCancel }: CountryFormProps) {
  const [formData, setFormData] = useState({
    name: country?.name || '',
    code: country?.code || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    } else if (formData.code.length !== 2) {
      newErrors.code = 'Code must be 2 characters (ISO format)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to save country');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Country Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        placeholder="e.g., United States"
        required
      />

      <Input
        label="Country Code (ISO)"
        value={formData.code}
        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
        error={errors.code}
        placeholder="e.g., US"
        maxLength={2}
        required
      />

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving...' : country ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
