import { useEffect } from 'react';
import { initMonitoring } from '../lib/monitoring';

interface MonitoringProviderProps {
  children: React.ReactNode;
  debug?: boolean;
  sampleRate?: number;
}

/**
 * MonitoringProvider component
 * 
 * This component initializes the monitoring service on mount.
 * It should be included near the root of the application.
 * 
 * @param props Component props
 * @returns React component
 */
const MonitoringProvider: React.FC<MonitoringProviderProps> = ({
  children,
  debug = false,
  sampleRate = 0.1,
}) => {
  useEffect(() => {
    // Initialize monitoring on mount
    initMonitoring({
      debug,
      sampleRate,
      environment: process.env.NEXT_PUBLIC_ENVIRONMENT as 'production' | 'staging' | 'development' || 'development',
    });
    
    // Log initialization
    if (debug) {
      console.log('MonitoringProvider initialized');
    }
  }, [debug, sampleRate]);
  
  // Just render children
  return <>{children}</>;
};

export default MonitoringProvider;

