import { Button } from "@/components/ui/button";
import { Moon, Sun, Zap } from "lucide-react";
import React from "react";
import { useTheme } from "./theme-provider";

type Theme = 'light' | 'dark' | 'system' | 'cyberpunk';

interface ThemeSwitcherProps {
  className?: string;
}

export const ThemeSwitcher = React.forwardRef<HTMLButtonElement, ThemeSwitcherProps>(
  ({ className }, ref) => {
  const { theme, setTheme: setThemeContext } = useTheme();

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'cyberpunk'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    setThemeContext(nextTheme);
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
        return <Moon className="h-5 w-5" />;
      case 'cyberpunk':
        return <Zap className="h-5 w-5" />;
      case 'system':
        return <Zap className="h-5 w-5" />;
    }
  };

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className={`h-9 w-9 ${className}`}
    >
      {getIcon()}
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
  }
);

ThemeSwitcher.displayName = "ThemeSwitcher";