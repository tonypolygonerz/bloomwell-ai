'use client';

import { SessionProvider } from 'next-auth/react';
import MonitoringProvider from './MonitoringProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MonitoringProvider 
        debug={process.env.NEXT_PUBLIC_MONITORING_DEBUG === 'true'}
        sampleRate={parseFloat(process.env.NEXT_PUBLIC_MONITORING_SAMPLE_RATE || '0.1')}
      >
        {children}
      </MonitoringProvider>
    </SessionProvider>
  );
}