'use client';

import { useState } from 'react';
import { CreatePOIInput, POIImportValidationResult, POIImportResult } from '@/models';
import { poiService } from '@/services/poi-service';
import { Textarea } from '@/components/common/form-input';

interface POIJsonImporterProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function POIJsonImporter({ onSuccess, onCancel }: POIJsonImporterProps) {
  const [jsonText, setJsonText] = useState('');
  const [parseError, setParseError] = useState('');
  const [validationResults, setValidationResults] = useState<POIImportValidationResult[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState<POIImportResult | null>(null);
  const [skipInvalid, setSkipInvalid] = useState(true);
  const [step, setStep] = useState<'input' | 'preview' | 'importing' | 'complete'>('input');

  const handleValidate = async () => {
    setParseError('');
    setValidationResults([]);
    setImportResult(null);

    if (!jsonText.trim()) {
      setParseError('Please paste JSON data');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);

      if (!Array.isArray(parsed)) {
        setParseError('JSON must be an array of POI objects');
        return;
      }

      if (parsed.length === 0) {
        setParseError('JSON array is empty');
        return;
      }

      // Validate each POI (now async)
      const results = await Promise.all(
        parsed.map((item, index) => poiService.validatePOIJSON(item, index))
      );
      setValidationResults(results);
      setStep('preview');
    } catch (error) {
      setParseError(
        error instanceof Error ? `Invalid JSON: ${error.message}` : 'Invalid JSON format'
      );
    }
  };

  const handleImport = async () => {
    const validPOIs = validationResults
      .filter((result) => result.isValid && result.poi !== null)
      .map((result) => result.poi as CreatePOIInput);

    const invalidCount = validationResults.filter((result) => !result.isValid).length;

    if (validPOIs.length === 0) {
      setParseError('No valid POIs to import');
      return;
    }

    if (invalidCount > 0 && !skipInvalid) {
      setParseError(`Found ${invalidCount} invalid POI(s). Please fix them or enable "Skip invalid POIs"`);
      return;
    }

    setImporting(true);
    setStep('importing');
    setImportProgress({ current: 0, total: validPOIs.length });

    try {
      const result = await poiService.bulkCreatePOIs(validPOIs, (current, total) => {
        setImportProgress({ current, total });
      });

      setImportResult(result);
      setStep('complete');
    } catch (error) {
      setParseError(
        error instanceof Error ? `Import failed: ${error.message}` : 'Import failed'
      );
      setStep('preview');
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setJsonText('');
    setParseError('');
    setValidationResults([]);
    setImportProgress({ current: 0, total: 0 });
    setImportResult(null);
    setStep('input');
  };

  const validCount = validationResults.filter((r) => r.isValid).length;
  const invalidCount = validationResults.filter((r) => !r.isValid).length;

  return (
    <div className="space-y-4">
      {step === 'input' && (
        <>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <p className="mb-2">Paste a JSON array of POI objects. Expected format:</p>
            <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs overflow-x-auto">
{`[
  {
    "name": "Example POI",
    "categoryName": "Restaurant",
    "cityName": "New York",
    "countryName": "United States",
    "address": "123 Main St",
    "geolocation": {
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "status": "NEW",
    "dynamicFields": {
      "phone": "+1234567890"
    }
  }
]`}
            </pre>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              Note: Category and city will be automatically looked up from the database by name.
            </p>
          </div>

          <Textarea
            label="JSON Data"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={12}
            placeholder="Paste your JSON array here..."
            error={parseError}
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleValidate}
              disabled={!jsonText.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Validate & Preview
            </button>
          </div>
        </>
      )}

      {step === 'preview' && (
        <>
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <div className="space-y-1">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Validation Results
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total: {validationResults.length} | Valid: {validCount} | Invalid: {invalidCount}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={skipInvalid}
                  onChange={(e) => setSkipInvalid(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Skip invalid POIs</span>
              </label>
            </div>

            <div className="max-h-96 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      City
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Country
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Errors
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {validationResults.map((result) => (
                    <tr
                      key={result.index}
                      className={result.isValid ? '' : 'bg-red-50 dark:bg-red-900/20'}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {result.index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {result.isValid ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                            Invalid
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {result.originalInput?.name || result.poi?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {result.originalInput?.categoryName || result.poi?.categoryName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {result.originalInput?.cityName || result.poi?.cityName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {result.originalInput?.countryName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {result.errors.length > 0 ? (
                          <ul className="list-disc list-inside text-red-600 dark:text-red-400 text-xs">
                            {result.errors.map((error, idx) => (
                              <li key={idx}>{error}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {parseError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{parseError}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={validCount === 0 || importing}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import {validCount} POI{validCount !== 1 ? 's' : ''}
            </button>
          </div>
        </>
      )}

      {step === 'importing' && (
        <div className="space-y-4">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Importing POIs...
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {importProgress.current} of {importProgress.total}
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(importProgress.current / importProgress.total) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {step === 'complete' && importResult && (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-green-600 dark:text-green-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Import Complete!
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>Total: {importResult.total}</p>
              <p className="text-green-600 dark:text-green-400">
                Successful: {importResult.successful}
              </p>
              {importResult.failed > 0 && (
                <p className="text-red-600 dark:text-red-400">Failed: {importResult.failed}</p>
              )}
            </div>

            {importResult.errors.length > 0 && (
              <div className="mt-4 text-left max-h-40 overflow-y-auto bg-white dark:bg-gray-900 rounded p-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Errors:
                </p>
                <ul className="list-disc list-inside text-xs text-red-600 dark:text-red-400">
                  {importResult.errors.map((error, idx) => (
                    <li key={idx}>
                      POI #{error.index + 1}: {error.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Import More
            </button>
            <button
              type="button"
              onClick={onSuccess}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
