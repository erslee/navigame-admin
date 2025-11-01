'use client';

import { useState, useEffect } from 'react';
import { POI, CreatePOIInput, UpdatePOIInput, Category, City } from '@/models';
import { categoryService } from '@/services/category-service';
import { cityService } from '@/services/city-service';
import { Input, Select, Textarea } from '@/components/common/form-input';
import { DynamicFields } from './dynamic-fields';

interface POIFormProps {
  poi?: POI;
  onSubmit: (data: CreatePOIInput | UpdatePOIInput) => Promise<void>;
  onCancel: () => void;
}

export function POIForm({ poi, onSubmit, onCancel }: POIFormProps) {
  const [formData, setFormData] = useState({
    name: poi?.name || '',
    categoryId: poi?.categoryId || '',
    cityId: poi?.cityId || '',
    address: poi?.address || '',
    dynamicFields: poi?.dynamicFields || {},
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allCategories, allCities] = await Promise.all([
        categoryService.getAllCategories(),
        cityService.getAllCities(),
      ]);
      setCategories(allCategories);
      setCities(allCities);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (!formData.cityId) {
      newErrors.cityId = 'City is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSubmitting(true);
      const selectedCategory = categories.find((c) => c.id === formData.categoryId);
      const selectedCity = cities.find((c) => c.id === formData.cityId);

      if (!selectedCategory || !selectedCity) {
        alert('Selected category or city not found');
        return;
      }

      await onSubmit({
        name: formData.name,
        categoryId: formData.categoryId,
        categoryName: selectedCategory.name,
        cityId: formData.cityId,
        cityName: selectedCity.name,
        address: formData.address,
        dynamicFields: formData.dynamicFields,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to save POI');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const cityOptions = cities.map((city) => ({
    value: city.id,
    label: `${city.name}, ${city.countryName}`,
  }));

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="POI Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        placeholder="e.g., Eiffel Tower"
        required
      />

      <Select
        label="Category"
        value={formData.categoryId}
        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
        options={categoryOptions}
        error={errors.categoryId}
        required
      />

      <Select
        label="City"
        value={formData.cityId}
        onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
        options={cityOptions}
        error={errors.cityId}
        required
      />

      <Textarea
        label="Address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        error={errors.address}
        placeholder="Full address of the POI"
        rows={2}
        required
      />

      <div className="mb-4">
        <DynamicFields
          fields={formData.dynamicFields}
          onChange={(fields) => setFormData({ ...formData, dynamicFields: fields })}
        />
      </div>

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
          {submitting ? 'Saving...' : poi ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
