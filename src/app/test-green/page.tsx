import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function TestGreenPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Green Banner */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-foreground">shadcn/ui Green Theme Test</h1>
          
          {/* EXPLICIT GREEN TEST */}
          <div style={{backgroundColor: 'hsl(120, 100%, 40%)', color: 'white'}} className="p-6 rounded-lg mb-4 text-xl font-semibold">
            🌱 EXPLICIT GREEN TEST - This should be GREEN via inline style
          </div>
          
          <div className="bg-primary text-primary-foreground p-6 rounded-lg mb-4 text-xl font-semibold">
            🌱 CSS VARIABLE TEST - This should be GREEN via CSS variables
          </div>
          
          {/* Debug CSS Variables */}
          <div className="mb-4 p-4 bg-gray-100 rounded text-left text-sm">
            <strong>CSS Variable Debug:</strong><br/>
            --primary should be: 120 100% 40%<br/>
            Current computed: <span style={{color: 'hsl(var(--primary))'}} className="font-bold">■ This text color</span><br/>
            Background test: <span style={{backgroundColor: 'hsl(var(--primary))', color: 'white', padding: '2px 8px', borderRadius: '4px'}}>■ BG test</span>
          </div>
          
          <p className="text-muted-foreground">
            Testing the manual shadcn/ui installation with green theme from the official{" "}
            <a href="https://github.com/shadcn-ui/ui" className="text-primary hover:underline">
              GitHub repository
            </a>
          </p>
        </div>
        
        {/* Button Variants Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Button Variants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4 flex-wrap">
              <Button>Primary (Should be Green)</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            
            <div className="flex gap-4 flex-wrap">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Badge>Primary Badge (Green)</Badge>
              <Badge variant="secondary">Secondary Badge</Badge>
              <Badge variant="destructive">Destructive Badge</Badge>
              <Badge variant="outline">Outline Badge</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Input Testing Card */}
        <Card>
          <CardHeader>
            <CardTitle>Input Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Test input with green focus ring" />
            <Input type="email" placeholder="Email input" />
            <Input type="password" placeholder="Password input" />
          </CardContent>
        </Card>

        {/* Color Verification - Enhanced */}
        <Card>
          <CardHeader>
            <CardTitle>CSS Variables Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="w-full h-16 bg-primary rounded border-2 border-gray-300" />
                <p className="text-sm">Primary (Green)</p>
                <p className="text-xs text-gray-500">Should be bright green</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-secondary rounded border-2 border-gray-300" />
                <p className="text-sm">Secondary</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-muted rounded border-2 border-gray-300" />
                <p className="text-sm">Muted</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-accent rounded border-2 border-gray-300" />
                <p className="text-sm">Accent</p>
              </div>
            </div>
            
            {/* Raw CSS Variable Test */}
            <div className="mt-6 p-4 bg-gray-50 rounded">
              <h4 className="font-semibold mb-2">Raw CSS Variable Tests:</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div style={{backgroundColor: 'hsl(120, 100%, 40%)'}} className="w-full h-8 rounded mb-1"></div>
                  <p className="text-xs">Inline: hsl(120, 100%, 40%)</p>
                </div>
                <div>
                  <div style={{backgroundColor: 'hsl(var(--primary))'}} className="w-full h-8 rounded mb-1"></div>
                  <p className="text-xs">CSS Var: hsl(var(--primary))</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Indicator */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge variant="outline" className="mb-4">
                ✅ Installation Complete
              </Badge>
              <h3 className="text-lg font-semibold text-primary mb-2">
                Manual shadcn/ui Installation Test
              </h3>
              <p className="text-sm text-muted-foreground">
                Based on the official{" "}
                <a 
                  href="https://github.com/shadcn-ui/ui" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  shadcn/ui repository
                </a>
                {" "}with green theme CSS variables properly configured.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}