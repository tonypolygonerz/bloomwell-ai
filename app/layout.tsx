import "styles/tailwind.css"
import { Metadata } from "next"

import { GoogleAnalytics } from "./components/AnalyticsProvider"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bloomwellai.com"
const gaId = process.env.NEXT_PUBLIC_GA_ID || ""

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bloomwell AI - AI-Powered Grant Discovery for Nonprofits",
    template: "%s | Bloomwell AI"
  },
  description: "Access 73,000+ federal grants instantly with AI-powered matching. Get expert AI assistance for just $29.99/month. 14-day free trial, no credit card required. Join 500+ nonprofits securing funding faster.",
  keywords: [
    "nonprofit grants",
    "federal grants",
    "grant discovery",
    "AI grant matching",
    "nonprofit funding",
    "grant writing assistance",
    "grant database",
    "nonprofit AI assistant",
    "501c3 grants",
    "charitable funding"
  ],
  authors: [{ name: "Bloomwell AI" }],
  creator: "Bloomwell AI",
  publisher: "Bloomwell AI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Bloomwell AI - AI-Powered Grant Discovery for Nonprofits",
    description: "Access 73,000+ federal grants instantly with AI-powered matching. Get expert AI assistance for just $29.99/month. Join 500+ nonprofits securing funding faster.",
    siteName: "Bloomwell AI",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Bloomwell AI - AI-Powered Grant Discovery Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bloomwell AI - AI-Powered Grant Discovery for Nonprofits",
    description: "Access 73,000+ federal grants with AI assistance. 14-day free trial. Join 500+ nonprofits.",
    images: [`${siteUrl}/og-image.png`],
    creator: "@bloomwellai",
    site: "@bloomwellai",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
  category: "technology",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Bloomwell AI",
  description: "AI-powered grant discovery and management platform for nonprofits",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  foundingDate: "2024",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Service",
    email: "support@bloomwellai.com",
    availableLanguage: "English"
  },
  sameAs: [
    "https://twitter.com/bloomwellai",
    "https://linkedin.com/company/bloomwellai",
    "https://facebook.com/bloomwellai"
  ],
  offers: {
    "@type": "Offer",
    name: "Bloomwell AI Subscription",
    price: "29.99",
    priceCurrency: "USD",
    priceValidUntil: "2026-12-31",
    availability: "https://schema.org/InStock",
    description: "Monthly subscription to Bloomwell AI grant discovery platform",
    url: `${siteUrl}/auth/register`
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Optimize font loading */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes blob {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            25% {
              transform: translate(20px, -20px) scale(1.1);
            }
            50% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            75% {
              transform: translate(20px, 20px) scale(1.05);
            }
          }

          @keyframes count-up {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out forwards;
            opacity: 0;
          }

          .animation-delay-200 {
            animation-delay: 0.2s;
          }

          .animation-delay-400 {
            animation-delay: 0.4s;
          }

          .animation-delay-600 {
            animation-delay: 0.6s;
          }

          .animation-delay-2000 {
            animation-delay: 2s;
          }

          .animate-blob {
            animation: blob 7s infinite;
          }

          .animate-count-up {
            animation: count-up 1s ease-out forwards;
          }

          html {
            scroll-behavior: smooth;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        ` }} />
        
        {/* Google Analytics */}
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
