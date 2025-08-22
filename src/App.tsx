import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeProvider } from "@/components/theme-provider"

export function App() {
  const handlePrimaryClick = () => {
    console.log('Primary button clicked!')
  }

  const handleSecondaryClick = () => {
    console.log('Secondary button clicked!')
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="json-viewer-theme">
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              JSON Viewer
            </h1>
            <p className="text-muted-foreground">
              A beautiful JSON visualization tool with custom orange theme
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Theme Test</CardTitle>
                <CardDescription>
                  Testing the custom orange/GitHub theme colors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button onClick={handlePrimaryClick}>
                    Primary Button
                  </Button>
                  <Button variant="secondary" onClick={handleSecondaryClick}>
                    Secondary Button
                  </Button>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline">
                    Outline Button
                  </Button>
                  <Button variant="ghost">
                    Ghost Button
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Color Palette</CardTitle>
                <CardDescription>
                  Preview of theme colors and CSS variables
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-primary text-primary-foreground p-2 rounded">
                    Primary
                  </div>
                  <div className="bg-secondary text-secondary-foreground p-2 rounded">
                    Secondary
                  </div>
                  <div className="bg-accent text-accent-foreground p-2 rounded">
                    Accent
                  </div>
                  <div className="bg-muted text-muted-foreground p-2 rounded">
                    Muted
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Ready for JSON Viewer Features</CardTitle>
              <CardDescription>
                The theme system is configured and ready for implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  ✅ Tailwind CSS + shadcn/ui configured<br />
                  ✅ Custom orange/GitHub theme applied<br />
                  ✅ Dark/light mode system ready<br />
                  ✅ Path aliases (@/) configured<br />
                  ✅ Component structure established
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ThemeProvider>
  )
}