'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type ModelConfig = {
  modelName: string;
  enabled: boolean;
  tier: 'enterprise' | 'professional' | 'standard';
  contextLength: number;
  costTier: 'free' | 'paid';
  usageToday: number;
  limitToday: number;
  description: string;
};

type AdminModelControls = {
  availableModels: ModelConfig[];
  overrideRules: {
    forceModel?: string;
    disableAutoRouting?: boolean;
    emergencyFallback?: string;
  };
  analytics: {
    totalRequests: number;
    costToday: number;
    popularQueries: string[];
    modelPerformance: Array<{
      model: string;
      avgResponseTime: number;
      successRate: number;
      usageCount: number;
    }>;
  };
};

export default function AIModelsAdminPage() {
  const router = useRouter();
  const [modelControls, setModelControls] = useState<AdminModelControls | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overrideModel, setOverrideModel] = useState('');
  const [autoRoutingDisabled, setAutoRoutingDisabled] = useState(false);
  const [emergencyFallback, setEmergencyFallback] =
    useState('gpt-oss:20b-cloud');
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [updatingModel, setUpdatingModel] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const fetchModelControls = useCallback(
    async (token: string) => {
      try {
        const response = await fetch('/api/admin/ai-models', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('adminSession');
            router.push('/admin/login');
            return;
          }
          throw new Error('Failed to fetch model controls');
        }
        const data = await response.json();
        setModelControls(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    // Check for admin session
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      router.push('/admin/login');
      return;
    }

    try {
      const sessionData = JSON.parse(adminSession);
      setAdminToken(sessionData.token);
      fetchModelControls(sessionData.token);
      // Refresh every 30 seconds for real-time updates
      const interval = setInterval(
        () => fetchModelControls(sessionData.token),
        30000
      );
      return () => clearInterval(interval);
    } catch {
      localStorage.removeItem('adminSession');
      router.push('/admin/login');
    }
  }, [router, fetchModelControls]);

  const updateModelStatus = async (modelName: string, enabled: boolean) => {
    if (!adminToken) {
      setUpdateError('Not authenticated');
      return;
    }

    // Prevent multiple simultaneous updates
    if (updatingModel) {
      return;
    }

    setUpdatingModel(modelName);
    setUpdateError(null);

    try {
      const response = await fetch('/api/admin/ai-models', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          action: 'toggleModel',
          modelName,
          enabled,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminSession');
          router.push('/admin/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update model status');
      }

      // Refresh model controls after successful update
      await fetchModelControls(adminToken);
    } catch (err) {
      setUpdateError(
        err instanceof Error ? err.message : 'Failed to update model'
      );
      // Revert the UI by refetching current state
      await fetchModelControls(adminToken);
    } finally {
      setUpdatingModel(null);
    }
  };

  const updateOverrideRules = async () => {
    if (!adminToken) {
      setError('Not authenticated');
      return;
    }

    try {
      const response = await fetch('/api/admin/ai-models', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          action: 'updateOverrideRules',
          overrideRules: {
            forceModel: overrideModel || undefined,
            disableAutoRouting: autoRoutingDisabled,
            emergencyFallback,
          },
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminSession');
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to update override rules');
      }

      await fetchModelControls(adminToken);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update override rules'
      );
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return 'text-purple-600 bg-purple-100';
      case 'professional':
        return 'text-blue-600 bg-blue-100';
      case 'standard':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCostTierColor = (costTier: string) => {
    switch (costTier) {
      case 'free':
        return 'text-green-600 bg-green-100';
      case 'paid':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading AI Model Controls...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-red-600 text-xl mb-4'>⚠️ Error</div>
          <p className='text-gray-600 mb-4'>{error}</p>
          <button
            onClick={() => adminToken && fetchModelControls(adminToken)}
            className='px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!modelControls) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600'>No model controls available</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                AI Models Management
              </h1>
              <p className='mt-2 text-gray-600'>
                Real-time control and monitoring of Ollama Cloud AI models
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className='px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50'
            >
              ← Back to Admin
            </button>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white p-6 rounded-lg shadow'>
            <div className='text-2xl font-bold text-gray-900'>
              {modelControls.analytics.totalRequests}
            </div>
            <div className='text-sm text-gray-600'>Total Requests Today</div>
          </div>
          <div className='bg-white p-6 rounded-lg shadow'>
            <div className='text-2xl font-bold text-green-600'>
              ${modelControls.analytics.costToday.toFixed(2)}
            </div>
            <div className='text-sm text-gray-600'>Cost Today</div>
          </div>
          <div className='bg-white p-6 rounded-lg shadow'>
            <div className='text-2xl font-bold text-blue-600'>
              {modelControls.availableModels.filter(m => m.enabled).length}
            </div>
            <div className='text-sm text-gray-600'>Active Models</div>
          </div>
          <div className='bg-white p-6 rounded-lg shadow'>
            <div className='text-2xl font-bold text-purple-600'>
              {modelControls.analytics.modelPerformance.length}
            </div>
            <div className='text-sm text-gray-600'>Model Tiers</div>
          </div>
        </div>

        {/* Model Controls */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Available Models */}
          <div className='bg-white rounded-lg shadow'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <h2 className='text-xl font-semibold text-gray-900'>
                Available Models
              </h2>
              <p className='text-sm text-gray-600'>
                Toggle models on/off and monitor usage
              </p>
              {updateError && (
                <div className='mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600'>
                  {updateError}
                </div>
              )}
            </div>
            <div className='p-6'>
              <div className='space-y-4'>
                {modelControls.availableModels.map(model => {
                  const isUpdating = updatingModel === model.modelName;
                  return (
                    <div
                      key={model.modelName}
                      className={`border border-gray-200 rounded-lg p-4 transition-opacity ${isUpdating ? 'opacity-60' : ''}`}
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex-1'>
                          <h3 className='font-medium text-gray-900'>
                            {model.modelName}
                            {isUpdating && (
                              <span className='ml-2 text-xs text-purple-600'>
                                Updating...
                              </span>
                            )}
                          </h3>
                          <p className='text-sm text-gray-600'>
                            {model.description}
                          </p>
                        </div>
                        <label
                          className={`relative inline-flex items-center ${isUpdating ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <input
                            type='checkbox'
                            checked={model.enabled}
                            disabled={isUpdating}
                            onChange={e =>
                              updateModelStatus(
                                model.modelName,
                                e.target.checked
                              )
                            }
                            className='sr-only peer'
                          />
                          <div
                            className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 ${isUpdating ? 'peer-disabled:opacity-50' : ''}`}
                          ></div>
                        </label>
                      </div>
                      <div className='flex flex-wrap gap-2 mb-3'>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getTierColor(model.tier)}`}
                        >
                          {model.tier.toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getCostTierColor(model.costTier)}`}
                        >
                          {model.costTier.toUpperCase()}
                        </span>
                        <span className='px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600'>
                          {model.contextLength.toLocaleString()} context
                        </span>
                      </div>
                      <div className='text-sm text-gray-600'>
                        Usage: {model.usageToday}/{model.limitToday} requests
                        today
                        <div className='w-full bg-gray-200 rounded-full h-2 mt-1'>
                          <div
                            className='bg-purple-600 h-2 rounded-full'
                            style={{
                              width: `${(model.usageToday / model.limitToday) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Override Controls */}
          <div className='bg-white rounded-lg shadow'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <h2 className='text-xl font-semibold text-gray-900'>
                Override Controls
              </h2>
              <p className='text-sm text-gray-600'>
                Emergency controls and manual overrides
              </p>
            </div>
            <div className='p-6 space-y-6'>
              {/* Force Model */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Force All Queries to Use Model
                </label>
                <select
                  value={overrideModel}
                  onChange={e => setOverrideModel(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                >
                  <option value=''>Auto-select (default)</option>
                  {modelControls.availableModels.map(model => (
                    <option key={model.modelName} value={model.modelName}>
                      {model.modelName} ({model.tier})
                    </option>
                  ))}
                </select>
              </div>

              {/* Disable Auto Routing */}
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  id='disableAutoRouting'
                  checked={autoRoutingDisabled}
                  onChange={e => setAutoRoutingDisabled(e.target.checked)}
                  className='h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded'
                />
                <label
                  htmlFor='disableAutoRouting'
                  className='ml-2 block text-sm text-gray-700'
                >
                  Disable automatic model selection
                </label>
              </div>

              {/* Emergency Fallback */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Emergency Fallback Model
                </label>
                <select
                  value={emergencyFallback}
                  onChange={e => setEmergencyFallback(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                >
                  {modelControls.availableModels.map(model => (
                    <option key={model.modelName} value={model.modelName}>
                      {model.modelName} ({model.tier})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={updateOverrideRules}
                className='w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500'
              >
                Update Override Rules
              </button>
            </div>
          </div>
        </div>

        {/* Model Performance */}
        <div className='mt-8 bg-white rounded-lg shadow'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Model Performance
            </h2>
            <p className='text-sm text-gray-600'>
              Real-time performance metrics
            </p>
          </div>
          <div className='p-6'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Model
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Avg Response Time
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Success Rate
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Usage Count
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {modelControls.analytics.modelPerformance.map(performance => (
                    <tr key={performance.model}>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {performance.model}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {performance.avgResponseTime}ms
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            performance.successRate >= 95
                              ? 'bg-green-100 text-green-800'
                              : performance.successRate >= 90
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {performance.successRate}%
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {performance.usageCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Popular Queries */}
        {modelControls.analytics.popularQueries.length > 0 && (
          <div className='mt-8 bg-white rounded-lg shadow'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <h2 className='text-xl font-semibold text-gray-900'>
                Popular Queries
              </h2>
              <p className='text-sm text-gray-600'>
                Most common user queries today
              </p>
            </div>
            <div className='p-6'>
              <div className='space-y-2'>
                {modelControls.analytics.popularQueries.map((query, index) => (
                  <div key={index} className='text-sm text-gray-600'>
                    {index + 1}. {query}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
