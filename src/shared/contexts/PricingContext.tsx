'use client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  useCallback,
} from 'react';
import { Plan, Interval } from '@/shared/types';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useSession } from 'next-auth/react';

type PricingContextType = {
  isAnnual: boolean;
  setIsAnnual: (value: boolean) => void;
};

const PricingContext = createContext<PricingContextType | undefined>(undefined);

export function PricingProvider({ children }: { children: React.ReactNode }) {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <PricingContext.Provider value={{ isAnnual, setIsAnnual }}>
      {children}
    </PricingContext.Provider>
  );
}

export function usePricing() {
  const context = useContext(PricingContext);
  if (context === undefined) {
    throw new Error('usePricing must be used within a PricingProvider');
  }
  return context;
}
