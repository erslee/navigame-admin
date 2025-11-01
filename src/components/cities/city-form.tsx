'use client';

import { useState, useEffect } from 'react';
import { City, CreateCityInput, UpdateCityInput, Country } from '@/models';
import { countryService } from '@/services/country-service';
import { Input, Select } from '@/components/common/form-input';

interface CityFormProps {
  city?: City;
  onSubmit: (data: CreateCityInput | UpdateCityInput) => Promise<void>;
  onCancel: () => void;
}

export function CityForm({ city, onSubmit, onCancel }: CityFormProps) {
  const [formData, setFormData] = useState({
    name: city?.name || '',
    countryId: city?.countryId || '',
  });
  const [countries, setCountries] = useState<Country[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      const allCountries = await countryService.getAllCountries();
      setCountries(allCountries);
    } catch (error) {
      console.error('Error loading countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.countryId) {
      newErrors.countryId = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSubmitting(true);
      const selectedCountry = countries.find((c) => c.id === formData.countryId);

      if (!selectedCountry) {
        alert('Selected country not found');
        return;
      }

      await onSubmit({
        name: formData.name,
        countryId: formData.countryId,
        countryName: selectedCountry.name,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to save city');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading countries...</div>;
  }

  const countryOptions = countries.map((country) => ({
    value: country.id,
    label: `${country.name} (${country.code})`,
  }));

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="City Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        placeholder="e.g., New York"
        required
      />

      <Select
        label="Country"
        value={formData.countryId}
        onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
        options={countryOptions}
        error={errors.countryId}
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
          {submitting ? 'Saving...' : city ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
