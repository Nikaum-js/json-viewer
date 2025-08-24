import { useCallback, useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';

export interface MonacoEditorConfig {
  // Font and Typography
  fontFamily: string;
  fontLigatures: boolean;
  fontSize: number;
  lineHeight: number;
  
  // Indentation and Formatting  
  tabSize: number;
  insertSpaces: boolean;
  detectIndentation: boolean;
  autoIndent: 'none' | 'keep' | 'brackets' | 'advanced' | 'full';
  trimAutoWhitespace: boolean;
  formatOnSave: boolean;
  formatOnPaste: boolean;
  
  // Cursor and Animation
  cursorBlinking: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid';
  cursorSmoothCaretAnimation: 'off' | 'explicit' | 'on';
  smoothScrolling: boolean;
  
  // Code Intelligence
  suggestSelection: 'first' | 'recentlyUsed' | 'recentlyUsedByPrefix';
  acceptSuggestionOnCommitCharacter: boolean;
  parameterHintsEnabled: boolean;
  semanticHighlighting: boolean;
  
  // Visual Elements
  renderLineHighlight: 'none' | 'gutter' | 'line' | 'all';
  rulers: number[];
  autoClosingBrackets: 'always' | 'languageDefined' | 'beforeWhitespace' | 'never';
  renderWhitespace: 'none' | 'boundary' | 'selection' | 'trailing' | 'all';
  
  // Layout and Display
  wordWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  minimapEnabled: boolean;
  scrollBeyondLastLine: boolean;
  
  // Advanced Features
  bracketPairColorization: boolean;
  guides: {
    indentation: boolean;
    bracketPairs: boolean | 'active';
    bracketPairsHorizontal: boolean | 'active';
    highlightActiveIndentation: boolean;
  };
  folding: boolean;
  showFoldingControls: 'always' | 'never' | 'mouseover';
}

// Default configuration based on VS Code preferences
const defaultConfig: MonacoEditorConfig = {
  // Font and Typography
  fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', monospace",
  fontLigatures: true,
  fontSize: 16,
  lineHeight: 26,
  
  // Indentation and Formatting
  tabSize: 2,
  insertSpaces: true,
  detectIndentation: false,
  autoIndent: 'full',
  trimAutoWhitespace: true,
  formatOnSave: true,
  formatOnPaste: true,
  
  // Cursor and Animation
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  smoothScrolling: true,
  
  // Code Intelligence
  suggestSelection: 'first',
  acceptSuggestionOnCommitCharacter: false,
  parameterHintsEnabled: false,
  semanticHighlighting: false,
  
  // Visual Elements
  renderLineHighlight: 'gutter',
  rulers: [80, 120],
  autoClosingBrackets: 'always',
  renderWhitespace: 'selection',
  
  // Layout and Display
  wordWrap: 'off',
  minimapEnabled: true,
  scrollBeyondLastLine: false,
  
  // Advanced Features
  bracketPairColorization: true,
  guides: {
    indentation: true,
    bracketPairs: 'active',
    bracketPairsHorizontal: 'active',
    highlightActiveIndentation: true
  },
  folding: true,
  showFoldingControls: 'mouseover'
};

const CONFIG_STORAGE_KEY = 'monaco-editor-config';

export function useMonacoConfig() {
  const [config, setConfig] = useState<MonacoEditorConfig>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
        if (saved) {
          return { ...defaultConfig, ...JSON.parse(saved) };
        }
      } catch (error) {
        console.warn('Failed to load Monaco config from localStorage:', error);
      }
    }
    return defaultConfig;
  });

  // Save to localStorage whenever config changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
      } catch (error) {
        console.warn('Failed to save Monaco config to localStorage:', error);
      }
    }
  }, [config]);

  const updateConfig = useCallback((updates: Partial<MonacoEditorConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(defaultConfig);
  }, []);

  // Convert config to Monaco editor options
  const getMonacoOptions = useCallback((): monaco.editor.IStandaloneEditorConstructionOptions => {
    return {
      // Font and Typography
      fontFamily: config.fontFamily,
      fontLigatures: config.fontLigatures,
      fontSize: config.fontSize,
      lineHeight: config.lineHeight,
      
      // Indentation and Formatting
      tabSize: config.tabSize,
      insertSpaces: config.insertSpaces,
      detectIndentation: config.detectIndentation,
      autoIndent: config.autoIndent,
      trimAutoWhitespace: config.trimAutoWhitespace,
      formatOnType: config.formatOnSave, // Monaco uses formatOnType for live formatting
      formatOnPaste: config.formatOnPaste,
      
      // Cursor and Animation
      cursorBlinking: config.cursorBlinking,
      cursorSmoothCaretAnimation: config.cursorSmoothCaretAnimation,
      smoothScrolling: config.smoothScrolling,
      
      // Code Intelligence
      suggestSelection: config.suggestSelection,
      acceptSuggestionOnCommitCharacter: config.acceptSuggestionOnCommitCharacter,
      parameterHints: { enabled: config.parameterHintsEnabled },
      
      // Visual Elements
      renderLineHighlight: config.renderLineHighlight,
      rulers: config.rulers,
      autoClosingBrackets: config.autoClosingBrackets,
      renderWhitespace: config.renderWhitespace,
      
      // Layout and Display
      wordWrap: config.wordWrap,
      minimap: { 
        enabled: config.minimapEnabled,
        size: 'proportional',
        showSlider: 'mouseover',
        renderCharacters: true,
        maxColumn: 120,
        scale: 1
      },
      scrollBeyondLastLine: config.scrollBeyondLastLine,
      
      // Advanced Features
      bracketPairColorization: { 
        enabled: config.bracketPairColorization,
        independentColorPoolPerBracketType: true
      },
      guides: {
        indentation: config.guides.indentation,
        bracketPairs: config.guides.bracketPairs,
        bracketPairsHorizontal: config.guides.bracketPairsHorizontal,
        highlightActiveIndentation: config.guides.highlightActiveIndentation
      },
      folding: config.folding,
      showFoldingControls: config.showFoldingControls,
      
      // Additional Monaco-specific optimizations
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        useShadows: true,
        verticalScrollbarSize: 12,
        horizontalScrollbarSize: 12,
        arrowSize: 11
      },
      
      // Performance optimizations
      largeFileOptimizations: true,
      stopRenderingLineAfter: 1000,
      maxTokenizationLineLength: 2000,
      
      // Enhanced editing features
      dragAndDrop: true,
      copyWithSyntaxHighlighting: true,
      selectionHighlight: true,
      occurrencesHighlight: 'singleFile',
      
      // Multi-cursor support
      multiCursorModifier: 'ctrlCmd',
      multiCursorMergeOverlapping: true,
      
      // Find and hover
      find: {
        seedSearchStringFromSelection: 'always',
        autoFindInSelection: 'multiline'
      },
      hover: {
        enabled: true,
        delay: 300,
        sticky: true
      }
    };
  }, [config]);

  return {
    config,
    updateConfig,
    resetConfig,
    getMonacoOptions,
    defaultConfig
  };
}

export { defaultConfig };