'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { 
  TemplateWorkflowState, 
  TemplateStepResponse,
  IntelligenceUpdate 
} from '@/types/json-fields';

type ProjectStep = {
  id: string;
  stepNumber: number;
  questionKey: string;
  questionText: string;
  questionType: string;
  dataType: string;
  isRequired: boolean;
  validationRules: any;
  helpText: string | null;
  options: any;
  order: number;
};

type ProjectTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedTime: number;
  difficulty: string;
};

export default function TemplateWorkflow() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [workflowState, setWorkflowState] = useState<TemplateWorkflowState | null>(null);
  const [currentStep, setCurrentStep] = useState<ProjectStep | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [intelligenceUpdates, setIntelligenceUpdates] = useState<IntelligenceUpdate[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
      return;
    }
    
    fetchWorkflowState();
  }, [session, status, router, projectId]);

  const fetchWorkflowState = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/templates/workflow/${projectId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch workflow state');
      }
      
      const data = await response.json();
      setWorkflowState(data.workflowState);
      setCurrentStep(data.currentStep);
      setIntelligenceUpdates(data.intelligenceUpdates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const submitResponse = async () => {
    if (!currentStep || !response.trim()) {
      setError('Please provide a response');
      return;
    }

    try {
      setSaving(true);
      const responseData = await fetch(`/api/templates/workflow/${projectId}/step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stepId: currentStep.id,
          response: response.trim(),
        }),
      });

      if (!responseData.ok) {
        throw new Error('Failed to submit response');
      }

      const result = await responseData.json();
      
      // Update workflow state
      setWorkflowState(result.workflowState);
      setIntelligenceUpdates(result.intelligenceUpdates || []);
      
      // Clear response
      setResponse('');
      
      // Move to next step or complete
      if (result.nextStep) {
        setCurrentStep(result.nextStep);
      } else {
        // Workflow completed
        router.push(`/templates/completed/${projectId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit response');
    } finally {
      setSaving(false);
    }
  };

  const skipStep = async () => {
    if (!currentStep) return;

    try {
      setSaving(true);
      const responseData = await fetch(`/api/templates/workflow/${projectId}/skip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stepId: currentStep.id,
        }),
      });

      if (!responseData.ok) {
        throw new Error('Failed to skip step');
      }

      const result = await responseData.json();
      
      // Update workflow state
      setWorkflowState(result.workflowState);
      
      // Move to next step
      if (result.nextStep) {
        setCurrentStep(result.nextStep);
      } else {
        // Workflow completed
        router.push(`/templates/completed/${projectId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to skip step');
    } finally {
      setSaving(false);
    }
  };

  const goBack = async () => {
    if (!workflowState || workflowState.progress.currentStep <= 1) return;

    try {
      setSaving(true);
      const responseData = await fetch(`/api/templates/workflow/${projectId}/back`, {
        method: 'POST',
      });

      if (!responseData.ok) {
        throw new Error('Failed to go back');
      }

      const result = await responseData.json();
      
      // Update workflow state
      setWorkflowState(result.workflowState);
      setCurrentStep(result.currentStep);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to go back');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workflow...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Workflow</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchWorkflowState}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!workflowState || !currentStep) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Workflow Not Found</h2>
          <p className="text-gray-600">Unable to load workflow data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{workflowState.templateId}</h1>
              <p className="mt-1 text-gray-600">
                Step {workflowState.progress.currentStep} of {workflowState.progress.totalSteps}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Time Remaining</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatTime(workflowState.progress.estimatedTimeRemaining)}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{workflowState.progress.overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${workflowState.progress.overallProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {currentStep.questionText}
                </h2>
                {currentStep.helpText && (
                  <p className="text-gray-600 text-sm mb-4">{currentStep.helpText}</p>
                )}
              </div>

              {/* Response Input */}
              <div className="mb-6">
                {currentStep.questionType === 'textarea' ? (
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Enter your response here..."
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    disabled={saving}
                  />
                ) : currentStep.questionType === 'select' ? (
                  <select
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={saving}
                  >
                    <option value="">Select an option...</option>
                    {currentStep.options && Array.isArray(currentStep.options) && 
                      currentStep.options.map((option: any, index: number) => (
                        <option key={index} value={option.value}>
                          {option.label}
                        </option>
                      ))
                    }
                  </select>
                ) : (
                  <input
                    type="text"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Enter your response here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={saving}
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={submitResponse}
                  disabled={saving || !response.trim()}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Submit & Continue'}
                </button>
                
                {!currentStep.isRequired && (
                  <button
                    onClick={skipStep}
                    disabled={saving}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Skip Step
                  </button>
                )}
                
                {workflowState.progress.currentStep > 1 && (
                  <button
                    onClick={goBack}
                    disabled={saving}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Go Back
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Intelligence Updates */}
            {intelligenceUpdates.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Intelligence Updates</h3>
                <div className="space-y-3">
                  {intelligenceUpdates.slice(-3).map((update, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-3">
                      <div className="text-sm font-medium text-gray-900">
                        {update.updateType.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-600">
                        {update.field}: {String(update.newValue)}
                      </div>
                      {update.reasoning && (
                        <div className="text-xs text-gray-500 mt-1">
                          {update.reasoning}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step Navigation */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Step Navigation</h3>
              <div className="space-y-2">
                {Array.from({ length: workflowState.progress.totalSteps }, (_, i) => i + 1).map((stepNum) => {
                  const isCompleted = workflowState.progress.completedSteps.includes(stepNum);
                  const isSkipped = workflowState.progress.skippedSteps.includes(stepNum);
                  const isCurrent = stepNum === workflowState.progress.currentStep;
                  
                  return (
                    <div
                      key={stepNum}
                      className={`flex items-center p-2 rounded-lg text-sm ${
                        isCurrent 
                          ? 'bg-green-100 text-green-800 font-medium' 
                          : isCompleted 
                            ? 'bg-blue-100 text-blue-800' 
                            : isSkipped
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3 ${
                        isCurrent 
                          ? 'bg-green-600 text-white' 
                          : isCompleted 
                            ? 'bg-blue-600 text-white' 
                            : isSkipped
                              ? 'bg-gray-400 text-white'
                              : 'bg-gray-300 text-gray-600'
                      }`}>
                        {isCompleted ? '✓' : isSkipped ? '—' : stepNum}
                      </div>
                      Step {stepNum}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Workflow Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize">{workflowState.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Started:</span>
                  <span className="font-medium">
                    {new Date(workflowState.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Active:</span>
                  <span className="font-medium">
                    {new Date(workflowState.progress.lastActiveAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
