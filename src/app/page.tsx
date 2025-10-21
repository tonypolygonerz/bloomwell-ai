import { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Bloomwell AI - AI-Powered Grant Discovery for Nonprofits",
  description: "Transform your grant search with AI. Discover relevant funding opportunities in minutes, not days. Save $5,000+ per year compared to traditional solutions.",
  keywords: "nonprofit, grant discovery, AI, fundraising, grant search, nonprofit technology",
  openGraph: {
    title: "Bloomwell AI - AI-Powered Grant Discovery for Nonprofits",
    description: "Transform your grant search with AI. Discover relevant funding opportunities in minutes, not days.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bloomwell AI - AI-Powered Grant Discovery for Nonprofits",
    description: "Transform your grant search with AI. Discover relevant funding opportunities in minutes, not days.",
  },
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-green-50 to-white py-20 sm:py-28" aria-labelledby="hero-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 
              id="hero-heading"
              className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
            >
              <span className="block">AI-Powered Grant Discovery</span>
              <span className="block text-primary mt-2">For Nonprofits That Need Funding Fast</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Stop spending hours searching for grants. Our AI assistant finds the perfect funding opportunities 
              for your mission in minutes—not days.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="text-base px-8">
                <Link href="/auth/register" aria-label="Start your free trial">
                  Start Free Trial
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8">
                <Link href="#features" aria-label="See how it works">
                  See How It Works
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 bg-white" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              id="features-heading"
              className="text-3xl font-extrabold text-gray-900 sm:text-4xl"
            >
              Why Choose Bloomwell AI?
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Powerful features that help you find funding faster
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle>Instant AI Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Our AI analyzes thousands of grants in seconds to find perfect matches for your nonprofit's unique mission and needs.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle>Save $5,000+/Year</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Starting at just $49/month vs. $179-899 for competitors. No expensive consultants needed.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle>Smart Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Get personalized grant suggestions based on your organization's history, size, and focus areas.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle>Real-Time Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Never miss a deadline. Get instant notifications about new opportunities and upcoming deadlines.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <CardTitle>AI Chat Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Ask questions about grants, deadlines, and requirements. Get instant, accurate answers 24/7.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <CardTitle>Success Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Track your grant applications, success rates, and optimize your strategy with data-driven insights.
                </CardDescription>
              </CardContent>
            </Card>
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
              <div className="text-4xl font-bold text-primary">10,000+</div>
              <div className="mt-2 text-lg text-gray-600">Grants Discovered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">$50M+</div>
              <div className="mt-2 text-lg text-gray-600">Funding Matched</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">95%</div>
              <div className="mt-2 text-lg text-gray-600">Satisfaction Rate</div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Button asChild size="lg" className="text-base px-8">
              <Link href="/auth/register" aria-label="Get started with Bloomwell AI">
                Get Started Today
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-xl font-bold mb-4">Bloomwell AI</h3>
              <p className="text-gray-400">
                Empowering nonprofits with AI-driven grant discovery and management tools.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-gray-400 hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register" className="text-gray-400 hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Bloomwell AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
