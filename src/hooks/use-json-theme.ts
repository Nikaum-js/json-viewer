import { useTheme } from "@/components/theme-provider";
import { useCallback, useEffect } from "react";

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

  const getJsonColors = useCallback((): JsonThemeColors => {
    const root = document.documentElement;
    const style = getComputedStyle(root);
    
    const getColor = (property: string): string => {
      const value = style.getPropertyValue(property).trim();
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
    const colors = getJsonColors();
    
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
    getJsonColors: () => getJsonColors(),
    updateJsonColors,
  };
}