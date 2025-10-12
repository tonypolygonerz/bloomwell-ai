'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

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


