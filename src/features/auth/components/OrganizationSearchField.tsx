'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

type Organization = {
  name: string;
  ein: string;
  city: string;
  state: string;
};

type OrganizationSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (org: Organization | null) => void;
  selectedOrg: Organization | null;
  error?: string;
};

export default function OrganizationSearchField({
  value,
  onChange,
  onSelect,
  selectedOrg,
  error,
}: OrganizationSearchFieldProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Organization[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualEin, setManualEin] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualState, setManualState] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/organizations/search?q=${encodeURIComponent(value)}`
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.organizations || []);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Organization search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [value]);

  const handleSelectOrg = (org: Organization) => {
    onSelect(org);
    setShowDropdown(false);
  };

  const handleManualEntry = () => {
    setShowManualEntry(true);
    setShowDropdown(false);
    onSelect(null);
  };

  const handleClearSelection = () => {
    onSelect(null);
    onChange('');
    setShowManualEntry(false);
    setSearchResults([]);
    setManualName('');
    setManualEin('');
    setManualCity('');
    setManualState('');
  };

  const handleSaveManualEntry = () => {
    if (!manualName.trim()) {
      return; // Organization name is required
    }

    const manualOrg: Organization = {
      name: manualName.trim(),
      ein: manualEin.trim() || 'N/A',
      city: manualCity.trim() || '',
      state: manualState.trim() || '',
    };

    onSelect(manualOrg);
    setShowManualEntry(false);
  };

  if (selectedOrg) {
    return (
      <div className='space-y-2'>
        <label className='block text-sm font-semibold text-gray-900'>
          Organization
        </label>
        <div className='relative'>
          <div className='flex items-start space-x-3 p-4 bg-emerald-50 border-2 border-emerald-500 rounded-lg'>
            <CheckCircleIcon className='h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5' />
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-semibold text-gray-900'>
                {selectedOrg.name}
              </p>
              <p className='text-xs text-gray-600 mt-1'>
                EIN: {selectedOrg.ein} • {selectedOrg.city}, {selectedOrg.state}
              </p>
            </div>
            <button
              type='button'
              onClick={handleClearSelection}
              className='text-xs text-emerald-700 hover:text-emerald-900 font-medium'
            >
              Change
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-2' ref={dropdownRef}>
      <label
        htmlFor='organization'
        className='block text-sm font-semibold text-gray-900'
      >
        Organization name <span className='text-red-500'>*</span>
      </label>
      <div className='relative'>
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <MagnifyingGlassIcon className='h-5 w-5 text-gray-400' />
        </div>
        <input
          type='text'
          id='organization'
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder='Search for your organization'
          className={`block w-full pl-10 pr-3 py-2.5 border ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
          } rounded-lg shadow-sm focus:outline-none focus:ring-2 text-sm`}
        />
        {isSearching && (
          <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
            <div className='animate-spin h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full'></div>
          </div>
        )}
      </div>
      {error && <p className='text-sm text-red-600'>{error}</p>}
      <p className='text-xs text-gray-500'>
        Start typing to search IRS-registered nonprofits
      </p>

      {/* Search Results Dropdown */}
      {showDropdown && value.length >= 3 && (
        <div className='absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto'>
          {isSearching ? (
            <div className='p-4 text-center text-sm text-gray-500'>
              <div className='animate-spin h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-2'></div>
              Searching organizations...
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className='py-2'>
                {searchResults.slice(0, 5).map((org, index) => (
                  <button
                    key={index}
                    type='button'
                    onClick={() => handleSelectOrg(org)}
                    className='w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors'
                  >
                    <p className='text-sm font-medium text-gray-900'>
                      {org.name}
                    </p>
                    <p className='text-xs text-gray-500 mt-1'>
                      EIN: {org.ein} • {org.city}, {org.state}
                    </p>
                  </button>
                ))}
              </div>
              <div className='border-t border-gray-100'>
                <button
                  type='button'
                  onClick={handleManualEntry}
                  className='w-full px-4 py-3 text-left text-sm text-emerald-700 hover:bg-emerald-50 focus:bg-emerald-50 focus:outline-none font-medium transition-colors'
                >
                  Not found? Enter manually →
                </button>
              </div>
            </>
          ) : (
            <div className='p-4'>
              <p className='text-sm text-gray-600 mb-3'>
                No organizations found
              </p>
              <button
                type='button'
                onClick={handleManualEntry}
                className='w-full px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 font-medium rounded-lg transition-colors'
              >
                Enter organization details manually →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual Entry Fields */}
      {showManualEntry && (
        <div className='mt-4 p-4 bg-gray-50 rounded-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-300'>
          <p className='text-sm font-medium text-gray-900'>
            Enter organization details
          </p>
          <div>
            <label
              htmlFor='manual-name'
              className='block text-xs font-medium text-gray-700 mb-1'
            >
              Organization name <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              id='manual-name'
              value={manualName}
              onChange={e => setManualName(e.target.value)}
              placeholder='Enter organization name'
              className='block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm'
            />
          </div>
          <div>
            <label
              htmlFor='manual-ein'
              className='block text-xs font-medium text-gray-700 mb-1'
            >
              EIN (optional)
            </label>
            <input
              type='text'
              id='manual-ein'
              value={manualEin}
              onChange={e => setManualEin(e.target.value)}
              placeholder='XX-XXXXXXX'
              className='block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm'
            />
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label
                htmlFor='manual-city'
                className='block text-xs font-medium text-gray-700 mb-1'
              >
                City
              </label>
              <input
                type='text'
                id='manual-city'
                value={manualCity}
                onChange={e => setManualCity(e.target.value)}
                placeholder='City'
                className='block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm'
              />
            </div>
            <div>
              <label
                htmlFor='manual-state'
                className='block text-xs font-medium text-gray-700 mb-1'
              >
                State
              </label>
              <input
                type='text'
                id='manual-state'
                value={manualState}
                onChange={e => setManualState(e.target.value)}
                placeholder='State'
                className='block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm'
              />
            </div>
          </div>
          <div className='flex justify-end space-x-2'>
            <button
              type='button'
              onClick={() => setShowManualEntry(false)}
              className='px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900'
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={handleSaveManualEntry}
              disabled={!manualName.trim()}
              className='px-4 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
