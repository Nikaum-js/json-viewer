import { useState, useCallback, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";

export interface JsonThemeColors {
  string: string;
  number: string;
  boolean: string;
  null: string;
  key: string;
  bracket: string;
  punctuation: string;
  error: string;
}

export function useJsonTheme() {
  const { theme } = useTheme();
  const [colorTheme, setColorTheme] = useState<string>('orange');

  const getJsonColors = useCallback((themeName: string, isDark: boolean): JsonThemeColors => {
    // Get computed colors from CSS variables
    const root = document.documentElement;
    const style = getComputedStyle(root);
    
    const getHSL = (property: string): string => {
      const value = style.getPropertyValue(property).trim();
      return `hsl(${value})`;
    };

    return {
      string: getHSL('--json-string'),
      number: getHSL('--json-number'),
      boolean: getHSL('--json-boolean'),
      null: getHSL('--json-null'),
      key: getHSL('--json-key'),
      bracket: getHSL('--json-bracket'),
      punctuation: getHSL('--json-punctuation'),
      error: getHSL('--json-error'),
    };
  }, []);

  const updateJsonColors = useCallback(() => {
    const isDark = theme === 'dark' || theme === 'cyberpunk';
    const colors = getJsonColors(colorTheme, isDark);
    
    // Trigger a custom event to notify other components about color changes
    const event = new CustomEvent('json-theme-change', { 
      detail: { colors, colorTheme, isDark } 
    });
    window.dispatchEvent(event);
  }, [colorTheme, theme, getJsonColors]);

  useEffect(() => {
    // Listen for color theme changes from ColorPalettePicker
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-color-theme') {
          const newTheme = document.documentElement.getAttribute('data-color-theme');
          if (newTheme && newTheme !== colorTheme) {
            setColorTheme(newTheme);
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-color-theme']
    });

    // Get initial color theme
    const initialTheme = document.documentElement.getAttribute('data-color-theme') || 'orange';
    setColorTheme(initialTheme);

    return () => observer.disconnect();
  }, [colorTheme]);

  useEffect(() => {
    updateJsonColors();
  }, [updateJsonColors]);

  return {
    colorTheme,
    theme,
    isDark: theme === 'dark' || theme === 'cyberpunk',
    getJsonColors: () => getJsonColors(colorTheme, theme === 'dark' || theme === 'cyberpunk'),
    updateJsonColors,
  };
}