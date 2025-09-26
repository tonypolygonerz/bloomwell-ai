'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface UpgradeButtonProps {
  priceId: string;
  planType: 'monthly' | 'annual';
  label: string;
  className?: string;
}

export default function UpgradeButton({
  priceId,
  planType,
  label,
  className = '',
}: UpgradeButtonProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!session) {
      // Redirect to login
      window.location.href = '/auth/login';
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, planType }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        console.error(
          'Checkout error:',
          data.error || 'No checkout URL returned'
        );
        alert('Error creating checkout session. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Error processing upgrade. Please try again.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={`px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? 'Redirecting to Stripe...' : label}
    </button>
  );
}
