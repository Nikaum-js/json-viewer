import { Button } from '@/components/ui/button'
import { FileText, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileTabsProps {
  activePanel: 'editor' | 'viewer'
  onPanelChange: (panel: 'editor' | 'viewer') => void
}

const PANELS = [
  {
    id: 'editor' as const,
    label: 'Editor',
    icon: FileText,
    description: 'JSON Input'
  },
  {
    id: 'viewer' as const,
    label: 'Viewer',
    icon: Search,
    description: 'JSON Preview'
  }
] as const

export function MobileTabs({ activePanel, onPanelChange }: MobileTabsProps) {
  return (
    <div className="flex w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
      {PANELS.map((panel) => {
        const Icon = panel.icon
        const isActive = activePanel === panel.id
        
        return (
          <Button
            key={panel.id}
            variant="ghost"
            onClick={() => onPanelChange(panel.id)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-3 px-4 h-auto rounded-none border-b-2 transition-all duration-200",
              "touch-target", // Custom utility class for minimum touch target size
              isActive 
                ? "border-primary text-primary bg-primary/5" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <Icon className="h-5 w-5" />
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-sm font-medium">{panel.label}</span>
              <span className="text-xs opacity-75">{panel.description}</span>
            </div>
          </Button>
        )
      })}
    </div>
  )
}