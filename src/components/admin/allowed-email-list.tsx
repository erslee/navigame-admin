'use client';

import { useState, useEffect } from 'react';
import { AllowedEmail } from '@/models';
import { allowedEmailService } from '@/services/allowed-email-service';
import { useAuth } from '@/providers/auth-provider';

export function AllowedEmailList() {
  const [emails, setEmails] = useState<AllowedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const { user } = useAuth();

  const loadEmails = async () => {
    try {
      setLoading(true);
      const allEmails = await allowedEmailService.getAllowedEmails();
      setEmails(allEmails);
    } catch (error) {
      console.error('Error loading emails:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail.trim()) {
      alert('Email is required');
      return;
    }

    try {
      setAdding(true);
      await allowedEmailService.addAllowedEmail(newEmail.trim(), user?.email || 'unknown');
      setNewEmail('');
      loadEmails();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add email');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from the allowed list?`)) {
      return;
    }

    try {
      await allowedEmailService.removeAllowedEmail(email);
      loadEmails();
    } catch (error) {
      alert('Failed to remove email');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Allowed Emails</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form onSubmit={handleAdd} className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Add New Email
          </label>
          <div className="flex gap-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="email@example.com"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
            <button
              type="submit"
              disabled={adding}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>

        <div className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Allowed Emails ({emails.length})
          </h2>
          {emails.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No allowed emails yet
            </p>
          ) : (
            <div className="space-y-2">
              {emails.map((emailRecord) => (
                <div
                  key={emailRecord.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {emailRecord.email}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Added by {emailRecord.addedBy} on{' '}
                      {new Date(emailRecord.createdAt.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(emailRecord.email)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> Only emails in this list can sign in and access the admin
          dashboard. Make sure to add your email and other admin emails here.
        </p>
      </div>
    </div>
  );
}
