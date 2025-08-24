import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Hash, Quote, Check, X, Circle, Brackets, Braces,
  ChevronRight, ChevronDown, Copy, Download, Expand, 
  Minimize, Network, Search, TreePine, Link,
  MoreVertical 
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { JsonGraphView } from "./json-view-implementations";

interface ViewMode {
  id: 'tree' | 'graph';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tooltip: string;
  description: string;
}

const VIEW_MODES: ViewMode[] = [
  {
    id: 'tree',
    label: 'Tree',
    icon: TreePine,
    tooltip: 'Tree View - Expandable structure',
    description: 'Navigate through nested objects and arrays'
  },
  {
    id: 'graph',
    label: 'Graph',
    icon: Network,
    tooltip: 'Graph View - Relationship visualization',
    description: 'Visualize data relationships as connected nodes'
  }
];

interface JsonViewerPanelProps {
  data: unknown;
  searchTerm: string;
  expandAll: boolean;
  onSearchChange: (term: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onDownload: () => void;
  viewMode?: 'tree' | 'graph';
  onViewModeChange?: (mode: 'tree' | 'graph') => void;
}

export function JsonViewerPanel({ 
  data, 
  searchTerm, 
  expandAll,
  onSearchChange, 
  onExpandAll, 
  onCollapseAll, 
  onDownload,
  viewMode = 'tree',
  onViewModeChange
}: JsonViewerPanelProps) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [activeMode, setActiveMode] = useState<'tree' | 'graph'>(viewMode);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(debouncedSearchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedSearchTerm, onSearchChange]);

  const handleSearchChange = useCallback((value: string) => {
    setDebouncedSearchTerm(value);
  }, []);

  const handleModeChange = useCallback((mode: 'tree' | 'graph') => {
    setActiveMode(mode);
    onViewModeChange?.(mode);
  }, [onViewModeChange]);

  const renderContent = useCallback(() => {
    if (!data) return <EmptyState />;
    if ((data as any).error) return <ErrorState error={(data as any).error} />;

    switch (activeMode) {
      case 'tree':
        return <JsonTreeImproved data={data} searchTerm={searchTerm} expandAll={expandAll} />;
      case 'graph':
        return <JsonGraphView data={data} searchTerm={searchTerm} />;
      default:
        return <JsonTreeImproved data={data} searchTerm={searchTerm} expandAll={expandAll} />;
    }
  }, [data, activeMode, searchTerm, expandAll]);

  return (
    <Card className="h-full flex flex-col border-0 rounded-none bg-card pt-3">
      {/* Empty header for alignment with main header */}
      <CardHeader className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90">
        <div className="flex items-center justify-end py-2">
          {/* Empty space to maintain alignment - responsive height matching left panel */}
          <div className="h-7 md:h-8 w-full"></div>
        </div>
      </CardHeader>
      
      {/* JSON Viewer Panel Header with View Mode Buttons */}
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Preview</h2>
          </div>
          
          {/* View Mode Buttons */}
          <TooltipProvider>
            <div className="flex items-center gap-1 border-l border-border pl-3">
              {VIEW_MODES.map((mode) => {
                const IconComponent = mode.icon;
                return (
                  <Tooltip key={mode.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={activeMode === mode.id ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleModeChange(mode.id)}
                        className="h-7 px-2 text-xs gap-1 transition-all duration-200"
                        disabled={!data || (data as any).error}
                      >
                        <IconComponent className="h-3.5 w-3.5" />
                        <span className="hidden lg:inline">{mode.label}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-center">
                        <p className="font-medium">{mode.tooltip}</p>
                        <p className="text-xs text-muted-foreground mt-1">{mode.description}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        </div>
        
        <div className="flex gap-1 md:gap-2">
          {activeMode === 'tree' && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onExpandAll}
                disabled={!data || (data as any).error}
                className="text-xs gap-1"
                title="Expand All"
              >
                <Expand className="h-4 w-4" />
                <span className="hidden sm:inline">Expand</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onCollapseAll}
                disabled={!data || (data as any).error}
                className="text-xs gap-1"
                title="Collapse All"
              >
                <Minimize className="h-4 w-4" />
                <span className="hidden sm:inline">Collapse</span>
              </Button>
            </>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDownload}
            disabled={!data || (data as any).error}
            className="text-xs gap-1"
            title="Download JSON"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </CardHeader>
      
      {/* Search Bar */}
      <div className="px-4 py-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={debouncedSearchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
            placeholder="Search keys and values..."
            className="pl-10 bg-background"
            disabled={!data || (data as any).error}
          />
        </div>
      </div>
      
      <CardContent className="flex-1 p-4 overflow-auto custom-scrollbar">
        {renderContent()}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
      <Search className="h-16 w-16 mb-4 opacity-50" />
      <p className="text-lg">Enter JSON data to visualize</p>
      <p className="text-sm mt-2">Use the input panel to paste, upload, or load example JSON</p>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-destructive">
      <div className="bg-destructive/10 rounded-lg p-6 max-w-md text-center">
        <h3 className="text-lg font-semibold mb-2">Invalid JSON</h3>
        <p className="text-sm">{error}</p>
        <p className="text-xs mt-2 text-muted-foreground">Please check your JSON syntax and try again</p>
      </div>
    </div>
  );
}


// Enhanced JsonTree with professional UI/UX improvements
interface JsonTreeImprovedProps {
  data: unknown;
  searchTerm: string;
  expandAll: boolean;
  parentKey?: string;
}

// Type definitions for improved tree view
type ValueType = 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object';

// Type icon mapping - used in TypeIndicator component
const getTypeIcon = (type: ValueType, value?: unknown) => {
  switch (type) {
    case 'string': return Quote;
    case 'number': return Hash;
    case 'boolean': return value ? Check : X;
    case 'null': return Circle;
    case 'array': return Brackets;
    case 'object': return Braces;
    default: return Circle;
  }
};

const TYPE_COLORS = {
  string: "text-emerald-600 dark:text-emerald-400",
  number: "text-amber-600 dark:text-amber-400", 
  boolean: "text-blue-600 dark:text-blue-400",
  null: "text-gray-500 dark:text-gray-400",
  array: "text-purple-600 dark:text-purple-400",
  object: "text-indigo-600 dark:text-indigo-400"
} as const;

// Utility functions
function getValueType(value: unknown): ValueType {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value as ValueType;
}

function getItemCount(value: unknown): number | undefined {
  if (Array.isArray(value)) return value.length;
  if (typeof value === 'object' && value !== null) return Object.keys(value).length;
  return undefined;
}

function pathToJsonPath(path: string): string {
  return path
    .split('.')
    .slice(1) // Remove 'root' prefix
    .map(segment => 
      /^\d+$/.test(segment) ? `[${segment}]` : `.${segment}`
    )
    .join('')
    .replace(/^\./, '') || '$';
}

// Type Indicator Component
interface TypeIndicatorProps {
  type: ValueType;
  value?: unknown;
  count?: number;
}

function TypeIndicator({ type, value, count }: TypeIndicatorProps) {
  const Icon = getTypeIcon(type, value);
  const colorClass = TYPE_COLORS[type] || TYPE_COLORS.null;

  return (
    <div className={`flex items-center gap-1.5 ${colorClass}`}>
      <Icon className="h-3.5 w-3.5" />
      {count !== undefined && (
        <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full min-w-[1.5rem] text-center">
          {count}
        </span>
      )}
    </div>
  );
}

// Tree Lines Component
interface TreeLinesProps {
  depth: number;
  isLast: boolean;
  hasChildren: boolean;
  isExpanded?: boolean;
}

function TreeLines({ depth, isLast }: TreeLinesProps) {
  if (depth === 0) return null;

  return (
    <div className="flex items-center">
      {Array.from({ length: depth - 1 }, (_, i) => (
        <div key={i} className="w-6 flex justify-center">
          <div className="w-px h-6 bg-border/30" />
        </div>
      ))}
      
      <div className="w-6 h-6 flex items-center justify-center relative">
        {/* Horizontal line */}
        <div className="absolute left-0 top-1/2 w-3 h-px bg-border/30" />
        
        {/* Vertical line (if not the last) */}
        {!isLast && (
          <div className="absolute left-0 top-0 w-px h-full bg-border/30" />
        )}
        
        {/* Connection node */}
        <div className="w-1.5 h-1.5 bg-border/50 rounded-full" />
      </div>
    </div>
  );
}

// Enhanced Copy Menu Component
interface CopyMenuProps {
  value: unknown;
  jsonPath: string;
}

function CopyMenu({ value, jsonPath }: CopyMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const copyOptions = [
    {
      label: "Copy Value",
      action: () => copyToClipboard(typeof value === 'string' ? value : JSON.stringify(value)),
      icon: Copy
    },
    {
      label: "Copy Path", 
      action: () => copyToClipboard(jsonPath),
      icon: Link
    },
    {
      label: "Copy Subtree",
      action: () => copyToClipboard(JSON.stringify(value, null, 2)),
      icon: Braces
    }
  ];

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedType(text);
    setTimeout(() => setCopiedType(null), 2000);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="copy-menu opacity-0 transition-opacity p-1 h-6 w-6"
        onClick={() => setShowMenu(!showMenu)}
        onBlur={() => setTimeout(() => setShowMenu(false), 200)}
      >
        {copiedType ? (
          <Check className="h-3 w-3 text-green-500" />
        ) : (
          <MoreVertical className="h-3 w-3" />
        )}
      </Button>

      {showMenu && (
        <div className="absolute right-0 top-full z-10 mt-1 bg-popover border border-border rounded-md shadow-md py-1 min-w-32">
          {copyOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.label}
                onClick={option.action}
                className="inline-flex items-center justify-start gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 w-full px-3 py-1.5 text-xs hover:bg-accent text-left rounded-sm"
              >
                <Icon className="h-3 w-3" />
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Value Preview Component
interface ValuePreviewProps {
  value: unknown;
  isExpanded: boolean;
  searchTerm: string;
}

function ValuePreview({ value, isExpanded, searchTerm }: ValuePreviewProps) {
  if (value === null) {
    return <span className="text-gray-500 dark:text-gray-400 italic font-medium">null</span>;
  }

  if (typeof value === 'boolean') {
    return (
      <span className={`font-medium ${
        value 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-red-600 dark:text-red-400'
      }`}>
        {String(value)}
      </span>
    );
  }

  if (typeof value === 'number') {
    return <span className="text-amber-600 dark:text-amber-400 font-mono font-medium">{value}</span>;
  }

  if (typeof value === 'string') {
    const highlighted = searchTerm && value.toLowerCase().includes(searchTerm.toLowerCase());
    const displayValue = value.length > 50 ? `${value.slice(0, 50)}...` : value;
    
    return (
      <span className="text-emerald-600 dark:text-emerald-400">
        &quot;
        {highlighted ? (
          <mark className="bg-yellow-200 dark:bg-yellow-800/50 px-0.5 rounded">
            {displayValue}
          </mark>
        ) : (
          <span className="font-medium">{displayValue}</span>
        )}
        &quot;
      </span>
    );
  }

  if (Array.isArray(value)) {
    return (
      <span className="text-muted-foreground text-sm font-medium">
        {isExpanded ? '[' : `Array(${value.length})`}
      </span>
    );
  }

  if (typeof value === 'object' && value !== null) {
    const keys = Object.keys(value);
    return (
      <span className="text-muted-foreground text-sm font-medium">
        {isExpanded ? '{' : `Object(${keys.length})`}
      </span>
    );
  }

  return <span className="text-muted-foreground">{String(value)}</span>;
}

// Enhanced Tree Node Component
interface TreeNodeProps {
  value: unknown;
  nodeKey: string;
  path: string;
  depth: number;
  isLast: boolean;
  searchTerm: string;
  expandedKeys: Set<string>;
  onToggleExpanded: (key: string) => void;
}

function TreeNode({ 
  value, 
  nodeKey, 
  path, 
  depth, 
  isLast, 
  searchTerm, 
  expandedKeys, 
  onToggleExpanded 
}: TreeNodeProps) {
  const valueType = getValueType(value);
  const isExpandable = Array.isArray(value) || (typeof value === 'object' && value !== null);
  const isExpanded = expandedKeys.has(path);
  const jsonPath = pathToJsonPath(path);

  const shouldHighlight = searchTerm && (
    nodeKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="group relative">
      <div className="flex items-center gap-2 py-1 hover:bg-accent/20 rounded-md transition-all duration-200 -mx-1 px-1 hover:[&_.copy-menu]:opacity-100">
        {/* Tree connection lines */}
        <TreeLines 
          depth={depth} 
          isLast={isLast} 
          hasChildren={isExpandable}
          isExpanded={isExpanded}
        />

        {/* Expand/Collapse Button */}
        {isExpandable ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpanded(path)}
            className="p-1 h-6 w-6 hover:bg-accent/50 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        ) : (
          <div className="w-6" /> 
        )}

        {/* Type Indicator */}
        <TypeIndicator 
          type={valueType}
          value={value}
          count={getItemCount(value)}
        />

        {/* Key */}
        {nodeKey && nodeKey !== 'root' && (
          <span className={`font-semibold text-sm mr-2 ${
            shouldHighlight 
              ? 'bg-yellow-200 dark:bg-yellow-800/50 px-1 rounded' 
              : 'text-slate-700 dark:text-slate-300'
          }`}>
            {nodeKey}
            <span className="text-muted-foreground ml-1 font-normal">:</span>
          </span>
        )}

        {/* Value Preview */}
        <ValuePreview 
          value={value}
          isExpanded={isExpanded}
          searchTerm={searchTerm}
        />

        {/* Copy Menu */}
        <CopyMenu 
          value={value}
          jsonPath={jsonPath}
        />
      </div>

      {/* Expanded Children */}
      {isExpanded && isExpandable && (
        <div className="ml-2">
          {renderChildren(value, path, depth + 1, searchTerm, expandedKeys, onToggleExpanded)}
        </div>
      )}
    </div>
  );
}

// Helper function to render children
function renderChildren(
  value: unknown, 
  path: string, 
  depth: number, 
  searchTerm: string, 
  expandedKeys: Set<string>, 
  onToggleExpanded: (key: string) => void
) {
  if (Array.isArray(value)) {
    return value.map((item, index) => {
      const childPath = `${path}.${index}`;
      const isLast = index === value.length - 1;
      
      return (
        <TreeNode
          key={index}
          value={item}
          nodeKey={String(index)}
          path={childPath}
          depth={depth}
          isLast={isLast}
          searchTerm={searchTerm}
          expandedKeys={expandedKeys}
          onToggleExpanded={onToggleExpanded}
        />
      );
    });
  }

  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);
    
    return keys.map((key, index) => {
      const childPath = `${path}.${key}`;
      const isLast = index === keys.length - 1;
      
      return (
        <TreeNode
          key={key}
          value={obj[key]}
          nodeKey={key}
          path={childPath}
          depth={depth}
          isLast={isLast}
          searchTerm={searchTerm}
          expandedKeys={expandedKeys}
          onToggleExpanded={onToggleExpanded}
        />
      );
    });
  }

  return null;
}

// Main JsonTreeImproved Component
function JsonTreeImproved({ data, searchTerm, expandAll, parentKey }: JsonTreeImprovedProps) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (expandAll) {
      setExpandedKeys(new Set(getAllKeys(data)));
    } else {
      setExpandedKeys(new Set());
    }
  }, [expandAll, data]);

  const toggleExpanded = useCallback((key: string) => {
    setExpandedKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  return (
    <div className="font-mono text-sm json-highlight leading-relaxed">
      <TreeNode
        value={data}
        nodeKey={parentKey || 'root'}
        path="root"
        depth={0}
        isLast={true}
        searchTerm={searchTerm}
        expandedKeys={expandedKeys}
        onToggleExpanded={toggleExpanded}
      />
    </div>
  );
}

function getAllKeys(obj: unknown, prefix = 'root'): string[] {
  const keys: string[] = [];
  
  if (Array.isArray(obj)) {
    keys.push(prefix);
    obj.forEach((item, index) => {
      keys.push(...getAllKeys(item, `${prefix}.${index}`));
    });
  } else if (typeof obj === 'object' && obj !== null) {
    keys.push(prefix);
    Object.entries(obj).forEach(([key, value]) => {
      keys.push(...getAllKeys(value, `${prefix}.${key}`));
    });
  }
  
  return keys;
}