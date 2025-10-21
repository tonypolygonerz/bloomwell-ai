'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function AdminLoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        // Store admin session info
        localStorage.setItem('adminSession', JSON.stringify(data))
        router.push('/admin')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Invalid credentials')
      }
    } catch (error) {
      setError('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="flex overflow-hidden rounded-lg bg-background shadow-2xl md:grid md:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex flex-col justify-center p-6 md:p-8">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Admin Access
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Super Administrator Dashboard
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {/* Admin Login Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Administrator Username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Administrator Password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3">
                  <p className="text-sm text-destructive text-center">{error}</p>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    Signing in...
                  </div>
                ) : (
                  'Sign in to Admin Dashboard'
                )}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="text-center">
              <a 
                href="/" 
                className="text-sm text-primary hover:text-primary/80 hover:underline"
              >
                ← Back to Main Site
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Admin Branding */}
      <div className="hidden bg-muted md:block">
        <div className="flex h-full flex-col justify-center p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">
                Administrator Dashboard
              </h2>
              <p className="text-lg text-muted-foreground">
                Manage users, monitor system health, and oversee platform operations with advanced administrative tools.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground">User management and permissions</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground">System analytics and reporting</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground">Platform configuration and settings</span>
              </div>
            </div>

            <div className="mt-8 rounded-lg bg-primary/10 p-4">
              <div className="flex items-start space-x-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs">
                  ⚠️
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Admin Access Required
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This area is restricted to authorized administrators only. 
                    All actions are logged and monitored.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>🔐 Secure admin portal</span>
              <span>•</span>
              <span>📊 Real-time monitoring</span>
              <span>•</span>
              <span>🛡️ Audit logging</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
