'use client'

import Link from "next/link"

import { AnalyticsProvider } from "./components/AnalyticsProvider"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { trackCTAClick, trackTrialSignup } from "./lib/analytics"

function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2" aria-label="Bloomwell AI home">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">Bloomwell AI</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Features
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('pricing-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('webinars')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Webinars
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('testimonials-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Testimonials
              </button>
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/auth/login" 
                onClick={() => trackCTAClick('Sign In', 'Navigation')}
                className="text-gray-700 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/register"
                onClick={() => {
                  trackCTAClick('Get Started', 'Navigation')
                  trackTrialSignup('nav_cta')
                }}
                className="inline-flex items-center bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 px-6 py-2 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Get Started
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Link 
                href="/auth/register"
                onClick={() => {
                  trackCTAClick('Get Started', 'Mobile Navigation')
                  trackTrialSignup('mobile_nav_cta')
                }}
                className="inline-flex items-center bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-green-50/30 py-20 sm:py-28 lg:py-32 overflow-hidden" aria-labelledby="hero-heading">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            {/* Animated headline */}
            <h1 
              id="hero-heading"
              className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in-up"
            >
              <span className="block">AI-Powered Grant Discovery</span>
              <span className="block text-green-600 mt-2">for Nonprofits</span>
            </h1>
            
            {/* Subheadline with key metrics */}
            <p className="mt-6 max-w-3xl mx-auto text-xl sm:text-2xl text-gray-700 font-medium animate-fade-in-up animation-delay-200">
              Access <span className="text-green-600 font-bold">73,000+ federal grants</span> instantly. 
              Get expert AI assistance for just{" "}
              <span className="text-green-600 font-bold">$29.99/month</span>.
            </p>

            {/* Hero Card with gradient */}
            <div className="mt-12 max-w-4xl mx-auto animate-fade-in-up animation-delay-400">
              <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-2xl p-8 sm:p-12">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] rounded-2xl" aria-hidden="true"></div>
                
                <div className="relative">
                  <p className="text-white text-lg sm:text-xl mb-8">
                    Stop spending hours searching for grants. Our AI assistant finds the perfect funding opportunities for your mission in minutes—not days.
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                      href="/auth/register"
                      onClick={() => {
                        trackCTAClick('Start Free Trial', 'Hero')
                        trackTrialSignup('hero_cta')
                      }}
                      className="group inline-flex items-center justify-center px-8 py-4 text-base sm:text-lg font-semibold rounded-lg text-green-600 bg-white hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto"
                      aria-label="Start your 14-day free trial"
                    >
                      Start Your 14-Day Free Trial
                      <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('features')?.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }}
                      className="inline-flex items-center justify-center px-8 py-4 text-base sm:text-lg font-semibold rounded-lg text-white bg-transparent border-2 border-white hover:bg-white/10 transition-all duration-200 w-full sm:w-auto"
                      aria-label="View features section"
                    >
                      View Features
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Trust signals */}
                  <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-white/90 text-sm sm:text-base">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      No credit card required
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      14-day free trial
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Cancel anytime
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional trust indicator */}
            <p className="mt-8 text-gray-600 text-sm sm:text-base animate-fade-in-up animation-delay-600">
              Join <span className="font-semibold text-gray-900">500+ nonprofits</span> already using Bloomwell AI to secure funding
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-gray-50" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              id="features-heading"
              className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl"
            >
              Everything Your Nonprofit Needs
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and resources to help you find and secure funding
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1: 73,000+ Federal Grants */}
            <article 
              className="group bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-2xl hover:border-green-300 transition-all duration-300 overflow-hidden"
              aria-labelledby="feature-grants-title"
            >
              <div className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                
                <h3 id="feature-grants-title" className="text-2xl font-bold text-gray-900 mb-3">
                  73,000+ Federal Grants
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Access our comprehensive database with thousands of grant opportunities. Search, filter, and discover funding that matches your nonprofit's mission and needs.
                </p>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('grants-database')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                  className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 group-hover:translate-x-1 transition-all"
                  aria-label="Learn more about our grant database"
                >
                  Learn more
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
              
              <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" aria-hidden="true"></div>
            </article>

            {/* Feature 2: Expert AI Assistant */}
            <article 
              className="group bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-2xl hover:border-green-300 transition-all duration-300 overflow-hidden"
              aria-labelledby="feature-ai-title"
            >
              <div className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                
                <h3 id="feature-ai-title" className="text-2xl font-bold text-gray-900 mb-3">
                  Expert AI Assistant
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Get instant expert answers to your grant writing questions. Our AI assistant provides personalized guidance, tips, and strategies 24/7 to help you succeed.
                </p>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('ai-assistant')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                  className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 group-hover:translate-x-1 transition-all"
                  aria-label="Learn more about our AI assistant"
                >
                  Learn more
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
              
              <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" aria-hidden="true"></div>
            </article>

            {/* Feature 3: Live Expert Webinars */}
            <article 
              className="group bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-2xl hover:border-green-300 transition-all duration-300 overflow-hidden"
              aria-labelledby="feature-webinars-title"
            >
              <div className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <h3 id="feature-webinars-title" className="text-2xl font-bold text-gray-900 mb-3">
                  Live Expert Webinars
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Join monthly live webinars with nonprofit experts. Learn best practices, get your questions answered in real-time, and network with other nonprofit professionals.
                </p>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('webinars')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                  className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 group-hover:translate-x-1 transition-all"
                  aria-label="Learn more about our webinars"
                >
                  Learn more
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
              
              <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" aria-hidden="true"></div>
            </article>
          </div>

          {/* Additional Benefits */}
          <div className="mt-16 text-center">
            <p className="text-lg text-gray-700 mb-6">
              Plus dozens more features to help you save time and secure more funding
            </p>
            <Link
              href="/auth/register"
              onClick={() => {
                trackCTAClick('Start Free Trial', 'Features Section')
                trackTrialSignup('features_cta')
              }}
              className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
              aria-label="Start your free trial now"
            >
              Start Your Free Trial Today
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Highlight Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 relative overflow-hidden" aria-labelledby="stats-heading">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            {/* Section Title */}
            <h2 id="stats-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
              Comprehensive Grant Database
            </h2>
            
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-12">
              Access the most complete and up-to-date federal grant database, 
              intelligently categorized by our AI for your nonprofit's success
            </p>

            {/* Statistics Card */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 md:p-16 transform hover:scale-105 transition-transform duration-300">
                <div className="flex flex-col items-center">
                  {/* Large Number Display with Count-up Animation */}
                  <div className="mb-6">
                    <div className="text-6xl sm:text-7xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 tabular-nums animate-count-up">
                      6,622
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div className="mb-8">
                    <p className="text-2xl sm:text-3xl font-semibold text-gray-700">
                      grants and counting
                    </p>
                    
                    {/* Freshness Indicator */}
                    <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-50 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" aria-hidden="true"></div>
                      <span className="text-sm font-medium text-green-700">
                        Updated daily
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-lg text-gray-600 max-w-2xl mb-8 leading-relaxed">
                    Our comprehensive database includes federal, state, and foundation grants—all 
                    expertly organized and searchable with advanced AI-powered filters to match 
                    your nonprofit's unique mission and funding needs.
                  </p>

                  {/* Key Features Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 w-full max-w-2xl">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">73,000+</div>
                      <div className="text-sm text-gray-600">Total Opportunities</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">Daily</div>
                      <div className="text-sm text-gray-600">Database Updates</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">AI-Powered</div>
                      <div className="text-sm text-gray-600">Smart Matching</div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href="/auth/register"
                    className="group inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:scale-105"
                    aria-label="Search grants now and start your free trial"
                  >
                    Search Grants Now
                    <svg className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </Link>

                  {/* Additional Trust Elements */}
                  <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified Sources
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Real-Time Alerts
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Expert Curation
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant Showcase Section */}
<section className="py-20 bg-white" aria-labelledby="ai-showcase-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Content */}
            <div>
              <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-6">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                AI-Powered Expert
              </div>

              <h2 id="ai-showcase-heading" className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
                Get answers in seconds, 
                <span className="text-green-600"> not hours</span>
              </h2>

              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Our advanced AI assistant with <span className="font-semibold text-gray-900">128K context window</span> can 
                understand and analyze your longest grant documents, giving you expert-level answers instantly.
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-lg text-gray-700">
                      <span className="font-semibold">128K token context</span> - Analyze entire grant applications
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-lg text-gray-700">
                      <span className="font-semibold">Real-time responses</span> - Get instant expert guidance 24/7
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-lg text-gray-700">
                      <span className="font-semibold">Citation support</span> - Every answer backed by sources
                    </p>
                  </div>
                </div>
              </div>

              {/* Model Badges */}
              <div className="mb-8">
                <p className="text-sm font-semibold text-gray-700 mb-3">Powered by 6 specialized AI models:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300">
                    Enterprise: 671B
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">
                    Professional: 480B
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300">
                    Standard: 320B
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:scale-105"
                aria-label="Try AI Assistant now"
              >
                Try AI Assistant Free
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {/* Right Column: Chat Interface Mockup */}
            <div className="relative">
              {/* Chat Window */}
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
                    <span className="text-white font-semibold">Bloomwell AI Assistant</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-6 space-y-4 bg-gray-50 min-h-[400px] max-h-[500px] overflow-y-auto">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-green-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 max-w-[80%] shadow-md">
                      <p className="text-sm">
                        What eligibility requirements should our small nonprofit focus on when applying for federal education grants?
                      </p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-4 max-w-[85%] shadow-md border border-gray-200">
                      <div className="flex items-start mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 leading-relaxed mb-3">
                            For federal education grants, small nonprofits should prioritize these key eligibility requirements:
                          </p>
                          <ol className="text-sm text-gray-700 space-y-2 ml-4 list-decimal">
                            <li><span className="font-semibold">501(c)(3) status</span> - Must be current and in good standing</li>
                            <li><span className="font-semibold">DUNS/UEI number</span> - Required for federal applications</li>
                            <li><span className="font-semibold">SAM.gov registration</span> - Active registration is mandatory</li>
                            <li><span className="font-semibold">Financial capacity</span> - Demonstrate ability to manage grant funds</li>
                          </ol>
                          <p className="text-sm text-gray-800 mt-3">
                            I can help you prepare documentation for any of these requirements. Would you like specific guidance on any area?
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span>Response based on current federal guidelines</span>
                      </div>
                    </div>
                  </div>

                  {/* Typing Indicator */}
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-3 shadow-md border border-gray-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Input (Disabled/Preview) */}
                <div className="px-6 py-4 bg-white border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-gray-400 text-sm">
                      Ask anything about grants, eligibility, or applications...
                    </div>
                    <button 
                      disabled
                      className="bg-gray-200 text-gray-400 rounded-xl px-4 py-3 cursor-not-allowed"
                      aria-label="Send message - preview only"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Preview only • Sign up to start chatting
                  </p>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full shadow-lg transform rotate-12 font-bold text-sm">
                Live Demo
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white" aria-labelledby="testimonials-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 id="testimonials-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Trusted by nonprofits nationwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join hundreds of organizations that have transformed their grant discovery process
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Testimonial 1 */}
            <article className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col">
              {/* Star Rating */}
              <div className="flex items-center mb-4" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="flex-1 mb-6">
                <p className="text-gray-700 leading-relaxed">
                  "Bloomwell AI helped us find <span className="font-semibold text-gray-900">3 perfect grant matches</span> in our first week. 
                  The AI assistant answered questions we'd been struggling with for months. It's like having a grant consultant on staff."
                </p>
              </blockquote>

              {/* Separator */}
              <div className="h-px bg-gray-200 mb-6" role="separator" aria-hidden="true"></div>

              {/* Author Info */}
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg mr-4 flex-shrink-0">
                  SM
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Sarah Martinez</div>
                  <div className="text-sm text-gray-600">Executive Director</div>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-500">Hope Community Center</span>
                    <svg className="w-4 h-4 ml-1 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-label="Verified nonprofit">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </article>

            {/* Testimonial 2 */}
            <article className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col">
              {/* Star Rating */}
              <div className="flex items-center mb-4" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="flex-1 mb-6">
                <p className="text-gray-700 leading-relaxed">
                  "We were spending <span className="font-semibold text-gray-900">15+ hours per week</span> searching for grants. 
                  Now it takes minutes. The webinars are incredibly valuable, and the AI gives us confidence we're on the right track."
                </p>
              </blockquote>

              {/* Separator */}
              <div className="h-px bg-gray-200 mb-6" role="separator" aria-hidden="true"></div>

              {/* Author Info */}
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-lg mr-4 flex-shrink-0">
                  JC
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">James Chen</div>
                  <div className="text-sm text-gray-600">Development Director</div>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-500">Youth Arts Alliance</span>
                    <svg className="w-4 h-4 ml-1 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-label="Verified nonprofit">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </article>

            {/* Testimonial 3 */}
            <article className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col">
              {/* Star Rating */}
              <div className="flex items-center mb-4" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="flex-1 mb-6">
                <p className="text-gray-700 leading-relaxed">
                  "The ROI is incredible. We secured <span className="font-semibold text-gray-900">$125,000 in funding</span> in our first 3 months. 
                  The platform paid for itself in the first week. Couldn't recommend it more highly!"
                </p>
              </blockquote>

              {/* Separator */}
              <div className="h-px bg-gray-200 mb-6" role="separator" aria-hidden="true"></div>

              {/* Author Info */}
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-bold text-lg mr-4 flex-shrink-0">
                  RP
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Rachel Patel</div>
                  <div className="text-sm text-gray-600">Grant Writer</div>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-500">Green Future Foundation</span>
                    <svg className="w-4 h-4 ml-1 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-label="Verified nonprofit">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </article>

            {/* Testimonial 4 */}
            <article className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col">
              {/* Star Rating */}
              <div className="flex items-center mb-4" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="flex-1 mb-6">
                <p className="text-gray-700 leading-relaxed">
                  "As a small nonprofit with limited staff, we needed something efficient. The database is comprehensive, 
                  the AI is surprisingly helpful, and the <span className="font-semibold text-gray-900">support team is fantastic</span>."
                </p>
              </blockquote>

              {/* Separator */}
              <div className="h-px bg-gray-200 mb-6" role="separator" aria-hidden="true"></div>

              {/* Author Info */}
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-white font-bold text-lg mr-4 flex-shrink-0">
                  MJ
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Michael Johnson</div>
                  <div className="text-sm text-gray-600">Founder</div>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-500">Rural Health Initiative</span>
                    <svg className="w-4 h-4 ml-1 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-label="Verified nonprofit">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </article>

            {/* Testimonial 5 */}
            <article className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col">
              {/* Star Rating */}
              <div className="flex items-center mb-4" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="flex-1 mb-6">
                <p className="text-gray-700 leading-relaxed">
                  "The monthly webinars alone are worth the subscription. Learning from other nonprofits' success stories 
                  has been invaluable. Plus, the <span className="font-semibold text-gray-900">grant matching is incredibly accurate</span>."
                </p>
              </blockquote>

              {/* Separator */}
              <div className="h-px bg-gray-200 mb-6" role="separator" aria-hidden="true"></div>

              {/* Author Info */}
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white font-bold text-lg mr-4 flex-shrink-0">
                  LT
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Lisa Thompson</div>
                  <div className="text-sm text-gray-600">Program Manager</div>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-500">Education First Network</span>
                    <svg className="w-4 h-4 ml-1 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-label="Verified nonprofit">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </article>

            {/* Testimonial 6 */}
            <article className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col">
              {/* Star Rating */}
              <div className="flex items-center mb-4" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="flex-1 mb-6">
                <p className="text-gray-700 leading-relaxed">
                  "We've tried other platforms, but nothing comes close. The combination of database size, AI quality, 
                  and price point is unbeatable. <span className="font-semibold text-gray-900">Best investment we've made</span> this year."
                </p>
              </blockquote>

              {/* Separator */}
              <div className="h-px bg-gray-200 mb-6" role="separator" aria-hidden="true"></div>

              {/* Author Info */}
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg mr-4 flex-shrink-0">
                  DK
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">David Kim</div>
                  <div className="text-sm text-gray-600">Chief Operations Officer</div>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-500">Community Wellness Center</span>
                    <svg className="w-4 h-4 ml-1 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-label="Verified nonprofit">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Trust Indicators */}
          <div className="bg-green-50 rounded-2xl p-8 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">500+</div>
                <div className="text-sm text-gray-600">Active Organizations</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">4.9/5</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">$50M+</div>
                <div className="text-sm text-gray-600">Funding Secured</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">98%</div>
                <div className="text-sm text-gray-600">Would Recommend</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 bg-white" aria-labelledby="pricing-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="pricing-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Ready to secure more funding for your mission?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join hundreds of nonprofits saving time and money with Bloomwell AI
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left Column: Pricing Card */}
            <div className="order-2 lg:order-1">
              <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-500 shadow-2xl overflow-hidden">
                {/* Most Popular Badge */}
                <div className="absolute top-0 right-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-bl-2xl font-bold text-sm shadow-lg">
                  MOST POPULAR
                </div>

                <div className="p-8 sm:p-10">
                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline mb-2">
                      <span className="text-5xl sm:text-6xl font-extrabold text-gray-900">$29.99</span>
                      <span className="text-2xl text-gray-600 ml-2">/month</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                        </svg>
                        Save 20% with annual billing
                      </span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-base text-gray-900 font-medium">
                          Access to 73,000+ federal grants
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-base text-gray-900 font-medium">
                          AI-powered grant matching & recommendations
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-base text-gray-900 font-medium">
                          24/7 expert AI assistant with 128K context
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-base text-gray-900 font-medium">
                          Monthly live expert webinars
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-base text-gray-900 font-medium">
                          Real-time grant alerts & notifications
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-base text-gray-900 font-medium">
                          Priority email support
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href="/auth/register"
                    onClick={() => {
                      trackCTAClick('Start Free Trial', 'Pricing Section')
                      trackTrialSignup('pricing_cta')
                    }}
                    className="block w-full text-center px-8 py-4 text-lg font-bold rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:scale-105 mb-6"
                    aria-label="Start your free trial today"
                  >
                    Start Your Free Trial Today
                  </Link>

                  {/* Trust Signals */}
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">14-day free trial • No credit card required</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">30-day money-back guarantee</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Cancel anytime • No setup fees</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Comparison & Benefits */}
            <div className="order-1 lg:order-2">
              <div className="space-y-8">
                {/* Value Proposition */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Why nonprofits choose Bloomwell AI
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Traditional grant consultants cost <span className="font-semibold text-gray-900">$150-500/hour</span> and 
                    platforms like Instrumentl charge <span className="font-semibold text-gray-900">$179-899/month</span>. 
                    Get better results for a fraction of the cost.
                  </p>
                </div>

                {/* Comparison Table */}
                <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Solution</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Monthly Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="bg-green-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-900">Bloomwell AI</span>
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-600 text-white">
                              YOU
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-green-600">$29.99</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-gray-700">Instrumentl</td>
                        <td className="px-6 py-4 text-right text-gray-700">$179-899</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-gray-700">Grant Consultant</td>
                        <td className="px-6 py-4 text-right text-gray-700">$600-2,000</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-gray-700">Manual Research</td>
                        <td className="px-6 py-4 text-right text-gray-700">15+ hrs/week</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Annual Savings Highlight */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
                  <div className="flex items-center mb-2">
                    <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <div className="text-2xl font-bold">Save $5,000+ per year</div>
                      <div className="text-green-100">compared to traditional solutions</div>
                    </div>
                  </div>
                </div>

                {/* Additional Benefits */}
                <div className="space-y-3">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Instant Access</p>
                      <p className="text-gray-600 text-sm">Start searching grants in under 2 minutes</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Scale With You</p>
                      <p className="text-gray-600 text-sm">Perfect for nonprofits of any size</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Always Improving</p>
                      <p className="text-gray-600 text-sm">New features and grants added regularly</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Features Sections - Placeholders for smooth scroll targets */}
      <section id="grants-database" className="py-16 bg-white" aria-labelledby="grants-database-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 id="grants-database-heading" className="text-3xl font-bold text-gray-900 mb-4">
              73,000+ Federal Grants Database
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              More details about our comprehensive grant database coming soon. 
              <Link href="/auth/register" className="text-green-600 hover:text-green-700 font-semibold ml-2">
                Start exploring now →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section id="ai-assistant" className="py-16 bg-gray-50" aria-labelledby="ai-assistant-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 id="ai-assistant-heading" className="text-3xl font-bold text-gray-900 mb-4">
              Expert AI Assistant
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get instant answers to your grant questions 24/7. 
              <Link href="/auth/register" className="text-green-600 hover:text-green-700 font-semibold ml-2">
                Try it now →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section id="webinars" className="py-16 bg-white" aria-labelledby="webinars-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 id="webinars-heading" className="text-3xl font-bold text-gray-900 mb-4">
              Live Expert Webinars
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join our monthly webinars with nonprofit funding experts. 
              <Link href="/auth/register" className="text-green-600 hover:text-green-700 font-semibold ml-2">
                Register now →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-gray-50" aria-labelledby="social-proof-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 
              id="social-proof-heading"
              className="text-3xl font-extrabold text-gray-900 sm:text-4xl"
            >
              Trusted by Nonprofits Nationwide
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Join hundreds of organizations finding funding faster
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">10,000+</div>
              <div className="mt-2 text-lg text-gray-600">Grants Discovered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">$50M+</div>
              <div className="mt-2 text-lg text-gray-600">Funding Matched</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">95%</div>
              <div className="mt-2 text-lg text-gray-600">Satisfaction Rate</div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              aria-label="Get started with Bloomwell AI"
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">Bloomwell AI</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-sm">
                Empowering nonprofits with AI-driven grant discovery and management tools. 
                Find funding faster, save time, and grow your impact.
              </p>
              
              {/* Newsletter Signup */}
              <div>
                <h4 className="font-semibold mb-3 text-white">Stay Updated</h4>
                <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    aria-label="Email for newsletter"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
                <p className="text-xs text-gray-500 mt-2">
                  Get grant tips and product updates
                </p>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('pricing-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/chat" className="text-gray-400 hover:text-white transition-colors text-sm">
                    AI Assistant
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                    About Us
                  </Link>
                </li>
                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('testimonials-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Testimonials
                  </button>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/help" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/api/health" className="text-gray-400 hover:text-white transition-colors text-sm">
                    System Status
                  </Link>
                </li>
                <li>
                  <Link href="/webinars" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Webinars
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-gray-800 mb-8" role="separator" aria-hidden="true"></div>

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} Bloomwell AI. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-6">
              <a
                href="https://twitter.com/bloomwellai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/company/bloomwellai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="https://facebook.com/bloomwellai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 pt-8 border-t border-gray-800 flex flex-wrap justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              SOC 2 Compliant
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              256-bit SSL
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              GDPR Ready
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              99.9% Uptime
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Export with Error Boundary and Analytics
export default function Home() {
  return (
    <ErrorBoundary>
      <AnalyticsProvider>
        <HomePage />
      </AnalyticsProvider>
    </ErrorBoundary>
  )
}
