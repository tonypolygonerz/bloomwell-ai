'use client'

import { useState } from 'react'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const themes = {
  default: {
    name: "Default",
    primary: "222.2 47.4% 11.2%",
    primaryForeground: "210 40% 98%",
    ring: "222.2 47.4% 11.2%"
  },
  red: {
    name: "Red", 
    primary: "0 72.2% 50.6%",
    primaryForeground: "0 85.7% 97.3%",
    ring: "0 72.2% 50.6%"
  },
  rose: {
    name: "Rose",
    primary: "346.8 77.2% 49.8%", 
    primaryForeground: "355.7 100% 97.3%",
    ring: "346.8 77.2% 49.8%"
  },
  orange: {
    name: "Orange",
    primary: "24.6 95% 53.1%",
    primaryForeground: "60 9.1% 97.8%", 
    ring: "24.6 95% 53.1%"
  },
  green: {
    name: "Green",
    primary: "142.1 76.2% 36.3%",
    primaryForeground: "355.7 100% 97.3%",
    ring: "142.1 76.2% 36.3%"
  },
  blue: {
    name: "Blue", 
    primary: "221.2 83.2% 53.3%",
    primaryForeground: "210 40% 98%",
    ring: "221.2 83.2% 53.3%"
  },
  yellow: {
    name: "Yellow",
    primary: "47.9 95.8% 53.1%",
    primaryForeground: "26 83.3% 14.1%",
    ring: "47.9 95.8% 53.1%"
  },
  violet: {
    name: "Violet",
    primary: "262.1 83.3% 57.8%", 
    primaryForeground: "210 40% 98%",
    ring: "262.1 83.3% 57.8%"
  }
}

export default function ThemesPage() {
  const [selectedTheme, setSelectedTheme] = useState('green')

  const applyTheme = (themeKey: string) => {
    const theme = themes[themeKey as keyof typeof themes]
    if (theme) {
      document.documentElement.style.setProperty('--primary', theme.primary)
      document.documentElement.style.setProperty('--primary-foreground', theme.primaryForeground)
      document.documentElement.style.setProperty('--ring', theme.ring)
      setSelectedTheme(themeKey)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Pick a Color. Make it yours.
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Try our hand-picked themes. Copy and paste them into your project. 
              New theme editor coming soon.
            </p>
            
            {/* Theme Selector */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {Object.entries(themes).map(([key, theme]) => (
                <Button
                  key={key}
                  variant={selectedTheme === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyTheme(key)}
                  className="capitalize"
                >
                  {theme.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Theme Preview */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4">
            Theme: {themes[selectedTheme as keyof typeof themes].name}
          </Badge>
          <div className="flex justify-center gap-4">
            <Button size="sm" variant="outline">
              Copy Code
            </Button>
            <Button size="sm" variant="outline">
              Copy Code
            </Button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="max-w-6xl mx-auto">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex items-center justify-between">
                <CardTitle>Dashboard</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary">Live Preview</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Revenue
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M12 2v20m-7-9 7-7 7 7" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$15,231.89</div>
                    <p className="text-xs text-muted-foreground">
                      +20.1% from last month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Subscriptions
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="m13 21 5-5 5 5" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+2,350</div>
                    <p className="text-xs text-muted-foreground">
                      +180.1% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sales</CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+12,234</div>
                    <p className="text-xs text-muted-foreground">
                      +19% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Now
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+573</div>
                    <p className="text-xs text-muted-foreground">
                      +201 since last hour
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <Button>View More</Button>
                <Button variant="outline">Set Goal</Button>
                <Button variant="secondary">Upgrade Plan</Button>
              </div>

              {/* Form Example */}
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Enter your email below to create your account
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      GitHub
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Input placeholder="Email" type="email" />
                    <Input placeholder="Password" type="password" />
                  </div>
                  
                  <Button className="w-full">Create account</Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        {/* Color Palette Display */}
        <div className="mt-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Current Theme Colors</CardTitle>
              <p className="text-sm text-muted-foreground">
                Live preview of the selected theme colors
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="w-full h-16 bg-primary rounded-lg border" />
                  <p className="text-sm font-medium">Primary</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {themes[selectedTheme as keyof typeof themes].primary}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-16 bg-secondary rounded-lg border" />
                  <p className="text-sm font-medium">Secondary</p>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-16 bg-muted rounded-lg border" />
                  <p className="text-sm font-medium">Muted</p>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-16 bg-accent rounded-lg border" />
                  <p className="text-sm font-medium">Accent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Component Examples */}
        <div className="mt-8 max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Component Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Buttons */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Buttons</h3>
                <div className="flex gap-2 flex-wrap">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>

              {/* Badges */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Badges</h3>
                <div className="flex gap-2 flex-wrap">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>

              {/* Inputs */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Inputs</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  <Input placeholder="Email address" />
                  <Input placeholder="Password" type="password" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Built with{" "}
            <a 
              href="https://ui.shadcn.com/themes" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              shadcn/ui
            </a>
            {" "}at Vercel. The source code is available on{" "}
            <a 
              href="https://github.com/shadcn-ui/ui" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
