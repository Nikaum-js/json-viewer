import { JsonLayout } from "@/components/json-layout"
import { ThemeProvider } from "@/components/theme-provider"

function AppContent() {
  return (
    <div className="h-screen bg-background text-foreground">
      <JsonLayout />
    </div>
  )
}

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="json-viewer-theme">
      <AppContent />
    </ThemeProvider>
  )
}