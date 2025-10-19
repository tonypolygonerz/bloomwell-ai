import React from 'react';
import { isFeatureEnabled, withFeatureFlag } from '../utils/featureFlags';

// Example of a component that uses feature flags directly
export const GrantsFeature: React.FC = () => {
  const isGrantsEnabled = isFeatureEnabled('grants');
  
  if (!isGrantsEnabled) {
    return (
      <div className="p-4 bg-gray-100 rounded-md">
        <h3 className="text-lg font-medium text-gray-900">Grants Feature</h3>
        <p className="mt-2 text-sm text-gray-500">
          This feature is currently unavailable. Please check back later.
        </p>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-green-50 rounded-md">
      <h3 className="text-lg font-medium text-green-900">Grants Feature</h3>
      <p className="mt-2 text-sm text-green-700">
        Browse and search through our database of over 73,000 federal grants.
      </p>
      {/* Grant feature content would go here */}
    </div>
  );
};

// Example of a component wrapped with the HOC
const WebinarComponent: React.FC = () => (
  <div className="p-4 bg-purple-50 rounded-md">
    <h3 className="text-lg font-medium text-purple-900">Webinars Feature</h3>
    <p className="mt-2 text-sm text-purple-700">
      Access our library of nonprofit webinars and resources.
    </p>
    {/* Webinar feature content would go here */}
  </div>
);

const WebinarUnavailable: React.FC = () => (
  <div className="p-4 bg-gray-100 rounded-md">
    <h3 className="text-lg font-medium text-gray-900">Webinars Feature</h3>
    <p className="mt-2 text-sm text-gray-500">
      This feature is currently unavailable. Please check back later.
    </p>
  </div>
);

// Using the HOC pattern
export const FeatureFlaggedWebinar = withFeatureFlag(
  'webinars',
  WebinarComponent,
  WebinarUnavailable
);

// Example of a component that conditionally renders based on multiple feature flags
export const FeatureDashboard: React.FC = () => {
  const featureFlags = {
    grants: isFeatureEnabled('grants'),
    webinars: isFeatureEnabled('webinars'),
    chat: isFeatureEnabled('chat'),
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Bloomwell AI Features</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featureFlags.grants && (
          <div className="p-4 bg-green-50 rounded-md">
            <h3 className="text-lg font-medium text-green-900">Grants</h3>
            <p className="mt-2 text-sm text-green-700">
              Access our database of nonprofit grants
            </p>
          </div>
        )}
        
        {featureFlags.webinars && (
          <div className="p-4 bg-purple-50 rounded-md">
            <h3 className="text-lg font-medium text-purple-900">Webinars</h3>
            <p className="mt-2 text-sm text-purple-700">
              Watch educational webinars for nonprofits
            </p>
          </div>
        )}
        
        {featureFlags.chat && (
          <div className="p-4 bg-blue-50 rounded-md">
            <h3 className="text-lg font-medium text-blue-900">AI Chat</h3>
            <p className="mt-2 text-sm text-blue-700">
              Get answers to your nonprofit questions
            </p>
          </div>
        )}
      </div>
      
      {Object.values(featureFlags).every(flag => !flag) && (
        <div className="p-4 bg-yellow-50 rounded-md">
          <h3 className="text-lg font-medium text-yellow-900">Maintenance Mode</h3>
          <p className="mt-2 text-sm text-yellow-700">
            Our features are currently undergoing maintenance. Please check back soon.
          </p>
        </div>
      )}
    </div>
  );
};
