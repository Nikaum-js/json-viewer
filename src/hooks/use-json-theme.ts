import { useCallback, useEffect } from "react";
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

  const getJsonColors = useCallback((isDark: boolean): JsonThemeColors => {
    // Get computed colors from CSS variables (now in hex format)
    const root = document.documentElement;
    const style = getComputedStyle(root);
    
    const getColor = (property: string): string => {
      const value = style.getPropertyValue(property).trim();
      // Return hex color directly
      return value || '#000000';
    };

    return {
      string: getColor('--json-string'),
      number: getColor('--json-number'),
      boolean: getColor('--json-boolean'),
      null: getColor('--json-null'),
      key: getColor('--json-key'),
      bracket: getColor('--json-bracket'),
      punctuation: getColor('--json-punctuation'),
      error: getColor('--json-error'),
    };
  }, []);

  const updateJsonColors = useCallback(() => {
    const isDark = theme === 'dark' || theme === 'cyberpunk';
    const colors = getJsonColors(isDark);
    
    // Trigger a custom event to notify other components about color changes
    const event = new CustomEvent('json-theme-change', { 
      detail: { colors, isDark } 
    });
    window.dispatchEvent(event);
  }, [theme, getJsonColors]);

  useEffect(() => {
    updateJsonColors();
  }, [updateJsonColors]);

  return {
    theme,
    isDark: theme === 'dark' || theme === 'cyberpunk',
    getJsonColors: () => getJsonColors(theme === 'dark' || theme === 'cyberpunk'),
    updateJsonColors,
  };
}