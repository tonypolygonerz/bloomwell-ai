'use client';

import { useState, useEffect } from 'react';
import {
  UserIntelligence,
  IntelligenceUpdate,
  ValidationResult,
} from '@/types/json-fields';

interface IntelligenceProfileManagerProps {
  userId: string;
  onUpdate?: (intelligence: UserIntelligence) => void;
}

export default function IntelligenceProfileManager({
  userId,
  onUpdate,
}: IntelligenceProfileManagerProps) {
  const [intelligence, setIntelligence] = useState<UserIntelligence | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] =
    useState<ValidationResult<UserIntelligence> | null>(null);
  const [updates, setUpdates] = useState<IntelligenceUpdate[]>([]);
  const [activeTab, setActiveTab] = useState<
    'profile' | 'updates' | 'validation'
  >('profile');

  useEffect(() => {
    fetchIntelligenceProfile();
  }, [userId]);

  const fetchIntelligenceProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/intelligence');

      if (!response.ok) {
        throw new Error('Failed to fetch intelligence profile');
      }

      const data = await response.json();
      setIntelligence(data.intelligenceProfile);
      setValidation(data.validation);
      setUpdates(data.updates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateIntelligence = async (updates: Partial<UserIntelligence>) => {
    if (!intelligence) return;

    try {
      setSaving(true);
      const response = await fetch('/api/user/intelligence', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intelligenceProfile: { ...intelligence, ...updates },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update intelligence profile');
      }

      const data = await response.json();
      setIntelligence(data.intelligenceProfile);
      setValidation(data.validation);
      setUpdates(data.updates || []);

      if (onUpdate) {
        onUpdate(data.intelligenceProfile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const applyIntelligenceUpdate = async (update: IntelligenceUpdate) => {
    try {
      setSaving(true);
      const response = await fetch('/api/user/intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ update }),
      });

      if (!response.ok) {
        throw new Error('Failed to apply intelligence update');
      }

      const data = await response.json();
      setIntelligence(data.intelligenceProfile);
      setValidation(data.validation);

      if (onUpdate) {
        onUpdate(data.intelligenceProfile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply update');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getValidationColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <div className='animate-pulse'>
          <div className='h-4 bg-gray-200 rounded w-1/4 mb-4'></div>
          <div className='space-y-3'>
            <div className='h-3 bg-gray-200 rounded'></div>
            <div className='h-3 bg-gray-200 rounded w-5/6'></div>
            <div className='h-3 bg-gray-200 rounded w-4/6'></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <div className='text-center'>
          <div className='text-red-600 text-4xl mb-4'>⚠️</div>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            Error Loading Profile
          </h3>
          <p className='text-gray-600 mb-4'>{error}</p>
          <button
            onClick={fetchIntelligenceProfile}
            className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!intelligence) {
    return (
      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <div className='text-center'>
          <div className='text-gray-400 text-4xl mb-4'>👤</div>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            No Intelligence Profile
          </h3>
          <p className='text-gray-600'>
            Create your intelligence profile to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-sm border'>
      {/* Header */}
      <div className='border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Intelligence Profile
          </h2>
          <div className='flex items-center space-x-2'>
            {validation && (
              <span
                className={`text-sm font-medium ${getValidationColor((validation as any).score || 100)}`}
              >
                {(validation as any).score || 100}% Complete
              </span>
            )}
            <span className='text-sm text-gray-500'>
              Last updated:{' '}
              {formatDate(intelligence.lastAnalysis || new Date())}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='border-b border-gray-200'>
        <nav className='flex space-x-8 px-6'>
          {[
            { id: 'profile', label: 'Profile', count: null },
            { id: 'updates', label: 'Updates', count: updates.length },
            {
              id: 'validation',
              label: 'Validation',
              count: validation?.errors?.length || 0,
            },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span className='ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs'>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className='p-6'>
        {activeTab === 'profile' && (
          <div className='space-y-6'>
            {/* Basic Information */}
            <div>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Basic Information
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Organization Type
                  </label>
                  <select
                    value={intelligence.organizationType || 'nonprofit'}
                    onChange={e =>
                      updateIntelligence({
                        organizationType: e.target.value as any,
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    disabled={saving}
                  >
                    <option value='nonprofit'>Nonprofit</option>
                    <option value='social_enterprise'>Social Enterprise</option>
                    <option value='faith_based'>Faith-Based</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Expertise Level
                  </label>
                  <select
                    value={intelligence.expertiseLevel || 'beginner'}
                    onChange={e =>
                      updateIntelligence({
                        expertiseLevel: e.target.value as any,
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    disabled={saving}
                  >
                    <option value='beginner'>Beginner</option>
                    <option value='intermediate'>Intermediate</option>
                    <option value='advanced'>Advanced</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Budget Range
                  </label>
                  <input
                    type='text'
                    value={intelligence.budgetRange || ''}
                    onChange={e =>
                      updateIntelligence({ budgetRange: e.target.value })
                    }
                    placeholder='e.g., $100K - $500K'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Staff Size
                  </label>
                  <input
                    type='number'
                    value={intelligence.staffSize || 0}
                    onChange={e =>
                      updateIntelligence({
                        staffSize: parseInt(e.target.value) || 0,
                      })
                    }
                    min='0'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Focus Areas */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Focus Areas
              </label>
              <textarea
                value={intelligence.focusAreas?.join(', ') || ''}
                onChange={e =>
                  updateIntelligence({
                    focusAreas: e.target.value
                      .split(',')
                      .map(s => s.trim())
                      .filter(s => s),
                  })
                }
                placeholder='Enter focus areas separated by commas'
                className='w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none'
                disabled={saving}
              />
            </div>

            {/* Grant Interests */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Grant Interests
              </label>
              <textarea
                value={intelligence.grantInterests?.join(', ') || ''}
                onChange={e =>
                  updateIntelligence({
                    grantInterests: e.target.value
                      .split(',')
                      .map(s => s.trim())
                      .filter(s => s),
                  })
                }
                placeholder='Enter grant interests separated by commas'
                className='w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none'
                disabled={saving}
              />
            </div>

            {/* Preferences */}
            <div>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Preferences
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Communication Style
                  </label>
                  <select
                    value={
                      intelligence.preferences?.communicationStyle || 'formal'
                    }
                    onChange={e =>
                      updateIntelligence({
                        preferences: {
                          ...intelligence.preferences,
                          communicationStyle: e.target.value as any,
                        },
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    disabled={saving}
                  >
                    <option value='formal'>Formal</option>
                    <option value='casual'>Casual</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Detail Level
                  </label>
                  <select
                    value={intelligence.preferences?.detailLevel || 'medium'}
                    onChange={e =>
                      updateIntelligence({
                        preferences: {
                          ...intelligence.preferences,
                          detailLevel: e.target.value as any,
                        },
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    disabled={saving}
                  >
                    <option value='low'>Low</option>
                    <option value='medium'>Medium</option>
                    <option value='high'>High</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Funding History */}
            <div>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Funding History
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Total Grants
                  </label>
                  <input
                    type='number'
                    value={intelligence.fundingHistory?.totalGrants || 0}
                    onChange={e =>
                      updateIntelligence({
                        fundingHistory: {
                          ...intelligence.fundingHistory,
                          totalGrants: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    min='0'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Average Award
                  </label>
                  <input
                    type='number'
                    value={intelligence.fundingHistory?.averageAward || 0}
                    onChange={e =>
                      updateIntelligence({
                        fundingHistory: {
                          ...intelligence.fundingHistory,
                          averageAward: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    min='0'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Success Rate (%)
                  </label>
                  <input
                    type='number'
                    value={Math.round(
                      (intelligence.fundingHistory?.successRate || 0) * 100
                    )}
                    onChange={e =>
                      updateIntelligence({
                        fundingHistory: {
                          ...intelligence.fundingHistory,
                          successRate: (parseInt(e.target.value) || 0) / 100,
                        },
                      })
                    }
                    min='0'
                    max='100'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'updates' && (
          <div className='space-y-4'>
            {updates.length === 0 ? (
              <div className='text-center py-8'>
                <div className='text-gray-400 text-4xl mb-4'>📝</div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  No Updates Yet
                </h3>
                <p className='text-gray-600'>
                  Intelligence updates will appear here as you complete
                  templates.
                </p>
              </div>
            ) : (
              updates.map((update, index) => (
                <div
                  key={index}
                  className='border border-gray-200 rounded-lg p-4'
                >
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-gray-900'>
                      {update.updateType.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className='text-xs text-gray-500'>
                      {formatDate(update.timestamp)}
                    </span>
                  </div>
                  <div className='text-sm text-gray-600 mb-2'>
                    <strong>{update.field}:</strong> {String(update.newValue)}
                  </div>
                  {update.reasoning && (
                    <div className='text-xs text-gray-500'>
                      {update.reasoning}
                    </div>
                  )}
                  <div className='flex items-center justify-between mt-2'>
                    <span className='text-xs text-gray-500'>
                      Source: {update.source.replace('_', ' ')}
                    </span>
                    <span className='text-xs text-gray-500'>
                      Confidence: {Math.round(update.confidence * 100)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'validation' && validation && (
          <div className='space-y-4'>
            <div className='bg-gray-50 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm font-medium text-gray-900'>
                  Profile Completeness
                </span>
                <span
                  className={`text-sm font-medium ${getValidationColor((validation as any).score || 100)}`}
                >
                  {(validation as any).score || 100}%
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-green-600 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${(validation as any).score || 100}%` }}
                ></div>
              </div>
            </div>

            {(validation as any).missingFields &&
              (validation as any).missingFields.length > 0 && (
                <div>
                  <h4 className='text-sm font-medium text-gray-900 mb-2'>
                    Missing Fields
                  </h4>
                  <div className='space-y-1'>
                    {((validation as any).missingFields || []).map(
                      (field: any, index: number) => (
                        <div key={index} className='text-sm text-red-600'>
                          • {field}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {validation.errors && validation.errors.length > 0 && (
              <div>
                <h4 className='text-sm font-medium text-gray-900 mb-2'>
                  Validation Errors
                </h4>
                <div className='space-y-2'>
                  {validation.errors.map((error, index) => (
                    <div
                      key={index}
                      className='bg-red-50 border border-red-200 rounded-lg p-3'
                    >
                      <div className='text-sm font-medium text-red-800'>
                        {error.field}
                      </div>
                      <div className='text-sm text-red-600'>
                        {error.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {validation.warnings && validation.warnings.length > 0 && (
              <div>
                <h4 className='text-sm font-medium text-gray-900 mb-2'>
                  Warnings
                </h4>
                <div className='space-y-2'>
                  {validation.warnings.map((warning, index) => (
                    <div
                      key={index}
                      className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'
                    >
                      <div className='text-sm text-yellow-800'>{warning}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className='border-t border-gray-200 px-6 py-4 bg-gray-50'>
        <div className='flex items-center justify-between'>
          <div className='text-sm text-gray-500'>
            {saving ? 'Saving...' : 'Changes are saved automatically'}
          </div>
          <button
            onClick={fetchIntelligenceProfile}
            disabled={saving}
            className='text-sm text-green-600 hover:text-green-700 disabled:text-gray-400'
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
