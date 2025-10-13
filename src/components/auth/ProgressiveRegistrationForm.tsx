'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OrganizationSearchField from './OrganizationSearchField';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

type RegistrationState = {
  // Step 1: Initial fields (like Instrumentl)
  firstName: string;
  lastName: string;
  email: string;

  // Step 2: Organization details
  organizationType: string;
  organizationQuery: string;
  selectedOrg: {
    name: string;
    ein: string;
    city: string;
    state: string;
  } | null;

  // Step 3: Additional details
  has501c3Status: string;
  operatingRevenue: string;
  grantHistory: string;

  // User credentials
  password: string;
  phone: string;
  countryCode: string;

  // UI state
  currentStep: 1 | 2 | 3;
  isSubmitting: boolean;
};

const ORG_TYPES = [
  { value: 'nonprofit', label: 'US registered 501c3 nonprofit' },
  { value: 'church', label: 'Church or religious organization' },
  { value: 'social_enterprise', label: 'Social enterprise / B-Corp' },
  { value: 'foundation', label: 'Private foundation' },
  { value: 'government', label: 'Government agency' },
  { value: 'other', label: 'Other (specify)' },
];

const REVENUE_RANGES = [
  'Below $90K',
  '$90K-$200K',
  '$200K-$500K',
  '$500K-$750K',
  '$750K-$1M',
  '$1M-$5M',
  '$5M-$10M',
  '>$10M',
];

const GRANT_HISTORY_OPTIONS = [
  'In the last 12 months, my organization received no grants',
  'In the last 12 months, my organization received 1-3 grants',
  'In the last 12 months, my organization received 4-10 grants',
  'In the last 12 months, my organization received 10+ grants',
  'My organization has never applied for grants',
];

const COUNTRY_CODES = [
  { code: '+1', flag: '🇺🇸', country: 'US' },
  { code: '+44', flag: '🇬🇧', country: 'UK' },
  { code: '+91', flag: '🇮🇳', country: 'IN' },
  { code: '+61', flag: '🇦🇺', country: 'AU' },
  { code: '+254', flag: '🇰🇪', country: 'KE' },
];

export default function ProgressiveRegistrationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegistrationState>({
    firstName: '',
    lastName: '',
    email: '',
    organizationType: 'nonprofit',
    organizationQuery: '',
    selectedOrg: null,
    has501c3Status: '',
    operatingRevenue: '',
    grantHistory: '',
    password: '',
    phone: '',
    countryCode: '+1',
    currentStep: 1,
    isSubmitting: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
    if (errors.phone) setErrors({ ...errors, phone: '' });
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.organizationType) {
      newErrors.organizationType = 'Please select an organization type';
    }
    
    if (!formData.selectedOrg && !formData.organizationQuery) {
      newErrors.organizationQuery = 'Please search for your organization';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.has501c3Status) {
      newErrors.has501c3Status = 'Please confirm 501(c)(3) status';
    }
    
    if (!formData.operatingRevenue) {
      newErrors.operatingRevenue = 'Please select your operating revenue';
    }

    if (!formData.grantHistory) {
      newErrors.grantHistory = 'Please select your grant history';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Continue = () => {
    if (validateStep1()) {
      setFormData({ ...formData, currentStep: 2 });
    }
  };

  const handleStep2Continue = () => {
    if (validateStep2()) {
      setFormData({ ...formData, currentStep: 3 });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep3()) return;

    setFormData({ ...formData, isSubmitting: true });

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.countryCode + formData.phone.replace(/\D/g, ''),
          organization: {
            name: formData.selectedOrg?.name || '',
            ein: formData.selectedOrg?.ein || '',
            city: formData.selectedOrg?.city || '',
            state: formData.selectedOrg?.state || '',
            organizationType: formData.organizationType,
            has501c3Status: formData.has501c3Status === 'yes',
            operatingRevenue: formData.operatingRevenue,
            grantHistory: formData.grantHistory,
          },
        }),
      });

      if (response.ok) {
        router.push('/auth/verify-email');
      } else {
        const data = await response.json();
        setErrors({ submit: data.error || 'Registration failed' });
        setFormData({ ...formData, isSubmitting: false });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
      setFormData({ ...formData, isSubmitting: false });
    }
  };

  const goBack = () => {
    if (formData.currentStep === 2) {
      setFormData({ ...formData, currentStep: 1 });
    } else if (formData.currentStep === 3) {
      setFormData({ ...formData, currentStep: 2 });
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'microsoft') => {
    // Redirect to NextAuth OAuth provider
    const signInUrl = `/api/auth/signin/${provider}`;
    window.location.href = signInUrl;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          {formData.currentStep > 1 && (
            <button
              type="button"
              onClick={goBack}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
          )}
          <span className="text-sm font-medium text-gray-600">
            Step {formData.currentStep} of 3
          </span>
        </div>
        <div className="flex space-x-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-2 w-12 rounded-full transition-colors ${
                step <= formData.currentStep ? 'bg-emerald-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step 1: Initial Fields (like Instrumentl) */}
      <div className="space-y-5">
        {/* OAuth Login Options - Hide when user starts typing */}
        {!formData.firstName && !formData.lastName && !formData.email && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Microsoft 365 OAuth Button */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('microsoft')}
              className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#F25022" d="M1 1h10v10H1z"/>
                <path fill="#00A4EF" d="M13 1h10v10H13z"/>
                <path fill="#7FBA00" d="M1 13h10v10H1z"/>
                <path fill="#FFB900" d="M13 13h10v10H13z"/>
              </svg>
              Continue with Microsoft 365
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 1 Fields - Only show on Step 1 */}
        {formData.currentStep === 1 && (
          <>
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-gray-900 mb-2">
                First name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="First name"
                className={`block w-full px-3 py-2.5 border ${
                  errors.firstName ? 'border-red-300' : 'border-gray-300'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm`}
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-gray-900 mb-2">
                Last name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Last name"
                className={`block w-full px-3 py-2.5 border ${
                  errors.lastName ? 'border-red-300' : 'border-gray-300'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm`}
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Work email address"
                className={`block w-full px-3 py-2.5 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Continue Button for Step 1 */}
            <button
              type="button"
              onClick={handleStep1Continue}
              className="w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-sm"
            >
              Continue
            </button>
          </>
        )}
      </div>

      {/* Step 2: Organization Details */}
      {formData.currentStep >= 2 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization details</h3>
            
            {/* Organization Type */}
            <div className="mb-5">
              <label htmlFor="orgType" className="block text-sm font-semibold text-gray-900 mb-2">
                Organization type <span className="text-red-500">*</span>
              </label>
              <select
                id="orgType"
                value={formData.organizationType}
                onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                className={`block w-full px-3 py-2.5 border ${
                  errors.organizationType ? 'border-red-300' : 'border-gray-300'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm`}
              >
                {ORG_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.organizationType && (
                <p className="mt-1 text-sm text-red-600">{errors.organizationType}</p>
              )}
            </div>

            {/* Organization Search */}
            <div>
              <OrganizationSearchField
                value={formData.organizationQuery}
                onChange={(value) => setFormData({ ...formData, organizationQuery: value })}
                onSelect={(org) => setFormData({ ...formData, selectedOrg: org })}
                selectedOrg={formData.selectedOrg}
                error={errors.organizationQuery}
              />
            </div>
          </div>

          {/* Continue Button for Step 2 */}
          {formData.currentStep === 2 && (
            <button
              type="button"
              onClick={handleStep2Continue}
              className="w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-sm"
            >
              Continue
            </button>
          )}
        </div>
      )}

      {/* Step 3: Final Details & Account Creation */}
      {formData.currentStep === 3 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete your profile</h3>
            
            {/* 501(c)(3) Status */}
            <div className="mb-5">
              <label htmlFor="501c3Status" className="block text-sm font-semibold text-gray-900 mb-2">
                Does your organization have 501(c)(3) status? <span className="text-red-500">*</span>
              </label>
              <select
                id="501c3Status"
                value={formData.has501c3Status}
                onChange={(e) => setFormData({ ...formData, has501c3Status: e.target.value })}
                className={`block w-full px-3 py-2.5 border ${
                  errors.has501c3Status ? 'border-red-300' : 'border-gray-300'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm`}
              >
                <option value="">Select...</option>
                <option value="yes">Yes, we have 501(c)(3) status</option>
                <option value="no">No, but we are a tax-exempt organization</option>
                <option value="pending">Application pending</option>
                <option value="na">Not applicable</option>
              </select>
              {errors.has501c3Status && (
                <p className="mt-1 text-sm text-red-600">{errors.has501c3Status}</p>
              )}
            </div>

            {/* Operating Revenue */}
            <div className="mb-5">
              <label htmlFor="revenue" className="block text-sm font-semibold text-gray-900 mb-2">
                Annual operating revenue <span className="text-red-500">*</span>
              </label>
              <select
                id="revenue"
                value={formData.operatingRevenue}
                onChange={(e) => setFormData({ ...formData, operatingRevenue: e.target.value })}
                className={`block w-full px-3 py-2.5 border ${
                  errors.operatingRevenue ? 'border-red-300' : 'border-gray-300'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm`}
              >
                <option value="">Select revenue range...</option>
                {REVENUE_RANGES.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
              {errors.operatingRevenue && (
                <p className="mt-1 text-sm text-red-600">{errors.operatingRevenue}</p>
              )}
            </div>

            {/* Grant History */}
            <div className="mb-5">
              <label htmlFor="grantHistory" className="block text-sm font-semibold text-gray-900 mb-2">
                Grant history <span className="text-red-500">*</span>
              </label>
              <select
                id="grantHistory"
                value={formData.grantHistory}
                onChange={(e) => setFormData({ ...formData, grantHistory: e.target.value })}
                className={`block w-full px-3 py-2.5 border ${
                  errors.grantHistory ? 'border-red-300' : 'border-gray-300'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm`}
              >
                <option value="">Select...</option>
                {GRANT_HISTORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.grantHistory && (
                <p className="mt-1 text-sm text-red-600">{errors.grantHistory}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="mb-5">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                Phone number <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <select
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  className="w-24 px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                >
                  {COUNTRY_CODES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="(555) 123-4567"
                  className={`flex-1 px-3 py-2.5 border ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm`}
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 8 characters"
                className={`block w-full px-3 py-2.5 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm`}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={formData.isSubmitting}
            className="w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formData.isSubmitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Creating account...
              </span>
            ) : (
              'Start my free trial'
            )}
          </button>

          {errors.submit && (
            <p className="text-sm text-red-600 text-center">{errors.submit}</p>
          )}
        </div>
      )}

      {/* Terms */}
      <p className="text-xs text-center text-gray-500">
        By signing up, you agree to our{' '}
        <a href="/terms" className="text-emerald-600 hover:text-emerald-700 underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-emerald-600 hover:text-emerald-700 underline">
          Privacy Policy
        </a>
      </p>
    </form>
  );
}

