'use client';

import { useState, useEffect } from 'react';
import { Country, City, Category, CreatePOIInput } from '@/models';
import { countryService } from '@/services/country-service';
import { cityService } from '@/services/city-service';
import { categoryService } from '@/services/category-service';
import { poiService } from '@/services/poi-service';
import { openRouterService, OpenRouterModel, GeneratedPOI } from '@/services/openrouter-service';
import { Input, Textarea, Select } from '@/components/common/form-input';
import { Loading } from '@/components/common/loading';

export function AIPOIGenerator() {
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);

  const [formData, setFormData] = useState({
    model: '',
    prompt: '',
    countryId: '',
    cityId: '',
    categoryId: '',
    count: 5,
    dynamicFieldsInput: '',
  });

  const [generatedPOIs, setGeneratedPOIs] = useState<GeneratedPOI[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filter cities by selected country
    if (formData.countryId) {
      const filtered = cities.filter((city) => city.countryId === formData.countryId);
      setFilteredCities(filtered);
      // Reset city selection if current city is not in the filtered list
      if (formData.cityId && !filtered.some((c) => c.id === formData.cityId)) {
        setFormData((prev) => ({ ...prev, cityId: '' }));
      }
    } else {
      setFilteredCities([]);
      setFormData((prev) => ({ ...prev, cityId: '' }));
    }
  }, [formData.countryId, cities]);

  const loadData = async () => {
    try {
      setLoadingModels(true);
      const [modelsData, countriesData, citiesData, categoriesData] = await Promise.all([
        openRouterService.getAvailableModels(),
        countryService.getAllCountries(),
        cityService.getAllCities(),
        categoryService.getAllCategories(),
      ]);

      setModels(modelsData);
      setCountries(countriesData);
      setCities(citiesData);
      setCategories(categoriesData);

      // Set default model if available
      if (modelsData.length > 0) {
        setFormData((prev) => ({ ...prev, model: modelsData[0].id }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setLoadingModels(false);
    }
  };

  const handleGenerate = async () => {
    setError(null);

    // Validation
    if (!formData.model) {
      setError('Please select a model');
      return;
    }
    if (!formData.prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }
    if (!formData.countryId || !formData.cityId || !formData.categoryId) {
      setError('Please select country, city, and category');
      return;
    }
    if (formData.count < 1 || formData.count > 50) {
      setError('Number of POIs must be between 1 and 50');
      return;
    }

    try {
      setLoading(true);
      setGeneratedPOIs([]);

      const selectedCountry = countries.find((c) => c.id === formData.countryId);
      const selectedCity = cities.find((c) => c.id === formData.cityId);
      const selectedCategory = categories.find((c) => c.id === formData.categoryId);

      if (!selectedCountry || !selectedCity || !selectedCategory) {
        throw new Error('Selected country, city, or category not found');
      }

      // Parse dynamic fields from comma-separated input
      const dynamicFields = formData.dynamicFieldsInput
        .split(',')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const pois = await openRouterService.generatePOIs({
        model: formData.model,
        prompt: formData.prompt,
        country: selectedCountry.name,
        city: selectedCity.name,
        category: selectedCategory.name,
        count: formData.count,
        dynamicFields,
      });

      setGeneratedPOIs(pois);
    } catch (error) {
      console.error('Error generating POIs:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate POIs');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (generatedPOIs.length === 0) return;

    try {
      setImporting(true);
      setError(null);

      const selectedCity = cities.find((c) => c.id === formData.cityId);
      const selectedCategory = categories.find((c) => c.id === formData.categoryId);

      if (!selectedCity || !selectedCategory) {
        throw new Error('Selected city or category not found');
      }

      // Import all generated POIs
      const importPromises = generatedPOIs.map((poi) => {
        const poiData: CreatePOIInput = {
          name: poi.name,
          address: poi.address,
          cityId: formData.cityId,
          cityName: selectedCity.name,
          categoryId: formData.categoryId,
          categoryName: selectedCategory.name,
          dynamicFields: poi.dynamicFields,
        };

        return poiService.createPOI(poiData);
      });

      await Promise.all(importPromises);

      alert(`Successfully imported ${generatedPOIs.length} POIs!`);
      setGeneratedPOIs([]);
      setFormData((prev) => ({ ...prev, prompt: '' }));
    } catch (error) {
      console.error('Error importing POIs:', error);
      setError('Failed to import POIs. Some POIs may have been imported.');
    } finally {
      setImporting(false);
    }
  };

  const handleRemovePOI = (index: number) => {
    setGeneratedPOIs((prev) => prev.filter((_, i) => i !== index));
  };

  if (loadingModels) {
    return <Loading />;
  }

  const modelOptions = models.map((model) => ({
    value: model.id,
    label: model.name,
  }));

  const countryOptions = countries.map((country) => ({
    value: country.id,
    label: `${country.name} (${country.code})`,
  }));

  const cityOptions = filteredCities.map((city) => ({
    value: city.id,
    label: city.name,
  }));

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          AI POI Generator
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <Select
            label="AI Model"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            options={modelOptions}
            required
          />

          <Textarea
            label="Prompt"
            value={formData.prompt}
            onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
            placeholder="Describe what kind of POIs you want to generate. E.g., 'Popular tourist attractions with historical significance' or 'Family-friendly restaurants with outdoor seating'"
            rows={4}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Country"
              value={formData.countryId}
              onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
              options={countryOptions}
              required
            />

            <Select
              label="City"
              value={formData.cityId}
              onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
              options={cityOptions}
              required
              disabled={!formData.countryId}
            />

            <Select
              label="Category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              options={categoryOptions}
              required
            />
          </div>

          <Input
            label="Number of POIs to Generate"
            type="number"
            min="1"
            max="50"
            value={formData.count}
            onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) || 1 })}
            required
          />

          <Input
            label="Dynamic Fields (comma-separated)"
            value={formData.dynamicFieldsInput}
            onChange={(e) => setFormData({ ...formData, dynamicFieldsInput: e.target.value })}
            placeholder="e.g., phone, website, opening_hours, price_range"
          />

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Generating...' : 'Generate POIs'}
          </button>
        </div>
      </div>

      {generatedPOIs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Generated POIs ({generatedPOIs.length})
            </h2>
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? 'Importing...' : 'Import All'}
            </button>
          </div>

          <div className="space-y-4">
            {generatedPOIs.map((poi, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{poi.name}</h3>
                  <button
                    onClick={() => handleRemovePOI(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <strong>Address:</strong> {poi.address}
                </p>
                {Object.keys(poi.dynamicFields).length > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Fields:</strong>
                    <ul className="ml-4 mt-1">
                      {Object.entries(poi.dynamicFields).map(([key, value]) => (
                        <li key={key}>
                          {key}: {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
