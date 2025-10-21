import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function TestDefaultPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-foreground">shadcn/ui Default Theme Test</h1>
          <p className="text-muted-foreground">
            Testing the default shadcn/ui theme to ensure everything works properly
          </p>
        </div>
        
        {/* Button Variants Card */}
        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4 flex-wrap">
              <Button>Primary</Button>
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
              <Badge>Primary Badge</Badge>
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
            <Input placeholder="Test input with focus ring" />
            <Input type="email" placeholder="Email input" />
            <Input type="password" placeholder="Password input" />
          </CardContent>
        </Card>

        {/* Success Indicator */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge variant="outline" className="mb-4">
                ✅ Installation Working
              </Badge>
              <h3 className="text-lg font-semibold mb-2">
                shadcn/ui Default Theme Success!
              </h3>
              <p className="text-sm text-muted-foreground">
                All components are rendering correctly with the default theme.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
