import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Zap } from "lucide-react";

type Theme = 'light' | 'dark' | 'cyberpunk';

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const [theme, setTheme] = useState<Theme>('light');

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'cyberpunk');
    
    // Add the new theme class
    root.classList.add(newTheme);
    
    // Store in localStorage
    localStorage.setItem('json-viewer-theme', newTheme);
  };

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'cyberpunk'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'cyberpunk':
        return <Zap className="h-4 w-4" />;
    }
  };

  const getTitle = () => {
    switch (theme) {
      case 'light':
        return 'Alternar para modo escuro';
      case 'dark':
        return 'Alternar para modo cyberpunk';
      case 'cyberpunk':
        return 'Alternar para modo claro';
    }
  };

  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('json-viewer-theme') as Theme;
    if (savedTheme && ['light', 'dark', 'cyberpunk'].includes(savedTheme)) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      setTheme(defaultTheme);
      applyTheme(defaultTheme);
    }
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className={`h-10 w-10 ${className}`}
      title={getTitle()}
    >
      {getIcon()}
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}