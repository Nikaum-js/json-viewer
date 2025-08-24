import { Button } from "@/components/ui/button";
import { Moon, Sun, Zap } from "lucide-react";
import React from "react";
import { useTheme } from "./theme-provider";
import { useTranslation } from 'react-i18next';

type Theme = 'light' | 'dark' | 'system' | 'cyberpunk';

interface ThemeSwitcherProps {
  className?: string;
  // Adicione a prop asChild aqui
  asChild?: boolean;
}

export const ThemeSwitcher = React.forwardRef<HTMLButtonElement, ThemeSwitcherProps>(
  // Adicione a prop asChild aqui
  ({ className, asChild }, ref) => {
  const { theme, setTheme: setThemeContext } = useTheme();
  const { t } = useTranslation();

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

  const getThemeName = () => {
    switch (theme) {
      case 'light':
        return t('themes.light');
      case 'dark':
        return t('themes.dark');
      case 'cyberpunk':
        return t('themes.cyberpunk');
      case 'system':
        return t('themes.system');
      default:
        return t('header.theme');
    }
  };

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className={`h-9 w-9 ${className}`}
      asChild={asChild}
      title={getThemeName()}
    >
      {getIcon()}
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
  }
);

ThemeSwitcher.displayName = "ThemeSwitcher";