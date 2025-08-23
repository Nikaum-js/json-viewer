import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette } from "lucide-react";
import { useEffect, useState } from "react";

interface ColorPalettePickerProps {
  className?: string;
  currentTheme?: string;
  onThemeChange?: (theme: string) => void;
}

interface ColorTheme {
  name: string;
  primary: string;
  primaryDark: string;
  preview: string;
}

const COLOR_THEMES: ColorTheme[] = [
  {
    name: 'orange',
    primary: '#e36209',
    primaryDark: '#f97516', 
    preview: '#e36209'
  },
  {
    name: 'amber',
    primary: '#d97706',
    primaryDark: '#f59e0b',
    preview: '#d97706'
  },
  {
    name: 'red', 
    primary: '#dc2626',
    primaryDark: '#ef4444',
    preview: '#dc2626'
  },
  {
    name: 'rose',
    primary: '#e11d48',
    primaryDark: '#f43f5e', 
    preview: '#e11d48'
  },
  {
    name: 'blue',
    primary: '#2563eb',
    primaryDark: '#3b82f6', 
    preview: '#2563eb'
  },
  {
    name: 'emerald',
    primary: '#059669',
    primaryDark: '#10b981', 
    preview: '#059669'
  },
  {
    name: 'violet',
    primary: '#7c3aed',
    primaryDark: '#8b5cf6', 
    preview: '#7c3aed'
  },
  {
    name: 'slate',
    primary: '#475569',
    primaryDark: '#64748b', 
    preview: '#475569'
  }
];

export function ColorPalettePicker({ className, currentTheme = 'orange', onThemeChange }: ColorPalettePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(currentTheme);

  const applyColorTheme = (themeName: string) => {
    const theme = COLOR_THEMES.find(t => t.name === themeName);
    if (!theme) return;

    const root = document.documentElement;
    
    // Convert hex to HSL for CSS variables
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // Apply theme colors to CSS variables
    root.style.setProperty('--primary', hexToHsl(theme.primary));
    root.style.setProperty('--ring', hexToHsl(theme.primary));
    
    // Store in data attribute for dark mode handling
    root.setAttribute('data-color-theme', themeName);
  };

  const handleColorChange = (themeName: string) => {
    localStorage.setItem('json-viewer-color-theme', themeName);
    applyColorTheme(themeName);
    setActiveTheme(themeName);
    setIsOpen(false);
    onThemeChange?.(themeName);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('json-viewer-color-theme');
    if (savedTheme && COLOR_THEMES.find(t => t.name === savedTheme)) {
      applyColorTheme(savedTheme);
      setActiveTheme(savedTheme);
      onThemeChange?.(savedTheme);
    } else {
      // Apply default theme
      applyColorTheme(currentTheme);
    }
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-10 w-10 ${className}`}
          title="Alterar paleta de cores"
        >
          <Palette className="h-4 w-4" />
          <span className="sr-only">Paleta de cores</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-4 bg-background/95 backdrop-blur-sm border border-border/50 shadow-xl" align="end">
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground text-center">
            Escolha uma cor
          </div>
          <div className="grid grid-cols-4 gap-3 place-items-center">
            {COLOR_THEMES.map((theme) => (
              <button
                key={theme.name}
                onClick={() => handleColorChange(theme.name)}
                className={`
                  relative w-6 h-6 rounded-full transition-all duration-300 ease-out
                  ${activeTheme === theme.name 
                    ? 'scale-125 shadow-lg' 
                    : 'hover:scale-110 hover:shadow-md'
                  }
                `}
                style={{ backgroundColor: theme.preview }}
                title={`Tema ${theme.name}`}
              >
                {activeTheme === theme.name && (
                  <div className="absolute inset-0 rounded-full border-2 border-background shadow-[0_0_0_2px_currentColor] animate-pulse" />
                )}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}