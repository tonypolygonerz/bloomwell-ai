'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GrantsErrorTest } from './GrantsErrorBoundary';

interface GrantStats {
  activeGrants: number;
  deadlineSoon: number;
  matchScore: number;
}

const GrantsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<GrantStats>({
    activeGrants: 0,
    deadlineSoon: 0,
    matchScore: 0,
  });

  useEffect(() => {
    const fetchGrantStats = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setStats({
            activeGrants: 1243,
            deadlineSoon: 87,
            matchScore: 76,
          });
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching grant stats:', error);
        setLoading(false);
      }
    };

    fetchGrantStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Grant Opportunities</h3>
      
      {/* For testing purposes */}
      <GrantsErrorTest />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="p-3 bg-green-50 border border-green-100 rounded-md">
          <p className="text-sm text-gray-500">Active Grants</p>
          <p className="text-xl font-semibold">{stats.activeGrants.toLocaleString()}</p>
        </div>
        
        <div className="p-3 bg-amber-50 border border-amber-100 rounded-md">
          <p className="text-sm text-gray-500">Deadline Soon</p>
          <p className="text-xl font-semibold">{stats.deadlineSoon}</p>
        </div>
        
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
          <p className="text-sm text-gray-500">Match Score</p>
          <p className="text-xl font-semibold">{stats.matchScore}%</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <Link
          href="/chat?prompt=find-grants"
          className="block w-full text-left p-3 border rounded hover:bg-gray-50 transition-colors"
        >
          🔍 Find Matching Grants
        </Link>
        <Link
          href="/chat?prompt=grant-application-help"
          className="block w-full text-left p-3 border rounded hover:bg-gray-50 transition-colors"
        >
          📝 Grant Application Help
        </Link>
      </div>
    </div>
  );
};

export default GrantsDashboard;
