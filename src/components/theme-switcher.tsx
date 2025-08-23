import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Zap } from "lucide-react";
import { useTheme } from "./theme-provider";

type Theme = 'light' | 'dark' | 'system' | 'cyberpunk';

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { theme, setTheme: setThemeContext } = useTheme();
  console.log('🎯 ThemeSwitcher render - current theme:', theme);

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'cyberpunk'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    console.log('🔄 ThemeSwitcher cycling from', theme, 'to', nextTheme);
    setThemeContext(nextTheme);
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'cyberpunk':
        return <Zap className="h-4 w-4" />;
      case 'system':
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
      case 'system':
        return 'Alternar para modo claro';
    }
  };

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