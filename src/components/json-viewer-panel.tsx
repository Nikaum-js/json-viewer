import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronRight, Download, Expand, Minimize } from "lucide-react";

interface JsonViewerPanelProps {
  data: unknown;
  searchTerm: string;
  expandAll: boolean;
  onSearchChange: (term: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onDownload: () => void;
}

export function JsonViewerPanel({ 
  data, 
  searchTerm, 
  expandAll,
  onSearchChange, 
  onExpandAll, 
  onCollapseAll, 
  onDownload 
}: JsonViewerPanelProps) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(debouncedSearchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedSearchTerm, onSearchChange]);

  const handleSearchChange = useCallback((value: string) => {
    setDebouncedSearchTerm(value);
  }, []);

  return (
    <Card className="h-full flex flex-col border-0 rounded-none bg-card">
      {/* Empty header for alignment with main header */}
      <CardHeader className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90">
        <div className="flex items-center justify-end py-2">
          {/* Empty space to maintain alignment - responsive height matching left panel */}
          <div className="h-7 md:h-8 w-full"></div>
        </div>
      </CardHeader>
      
      {/* JSON Viewer Panel Header */}
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">JSON Viewer</h2>
        </div>
        <div className="flex gap-1 md:gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExpandAll}
            disabled={!data || (data as any).error}
            className="text-xs"
            title="Expand All"
          >
            <Expand className="h-3 w-3 sm:mr-1" />
            <span className="hidden sm:inline">Expand</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCollapseAll}
            disabled={!data || (data as any).error}
            className="text-xs"
            title="Collapse All"
          >
            <Minimize className="h-3 w-3 sm:mr-1" />
            <span className="hidden sm:inline">Collapse</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDownload}
            disabled={!data || (data as any).error}
            className="text-xs"
            title="Download JSON"
          >
            <Download className="h-3 w-3 sm:mr-1" />
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
      
      <CardContent className="flex-1 p-4 overflow-auto">
        {!data ? (
          <EmptyState />
        ) : (data as any).error ? (
          <ErrorState error={(data as any).error} />
        ) : (
          <JsonTree data={data} searchTerm={searchTerm} expandAll={expandAll} />
        )}
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

interface JsonTreeProps {
  data: unknown;
  searchTerm: string;
  expandAll: boolean;
  parentKey?: string;
}

function JsonTree({ data, searchTerm, expandAll, parentKey }: JsonTreeProps) {
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

  const renderValue = useCallback((value: unknown, key: string, path: string): React.ReactNode => {
    const shouldHighlight = searchTerm && (
      key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (value === null) {
      return <span className="json-null">null</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="json-boolean">{String(value)}</span>;
    }

    if (typeof value === 'number') {
      return <span className="json-number">{value}</span>;
    }

    if (typeof value === 'string') {
      return (
        <span className="json-string">
          "{shouldHighlight ? <mark className="bg-yellow-200 text-black">{value}</mark> : value}"
        </span>
      );
    }

    if (Array.isArray(value)) {
      const isExpanded = expandedKeys.has(path);
      return (
        <div>
          <button
            onClick={() => toggleExpanded(path)}
            className="flex items-center gap-1 hover:bg-accent rounded px-1"
          >
            <span className="json-bracket">{isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}</span>
            <span className="text-muted-foreground">[{value.length} items]</span>
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1">
              {value.map((item, index) => (
                <div key={index} className="flex items-start gap-2 py-1">
                  <span className="json-key min-w-6">{index}<span className="json-punctuation">:</span></span>
                  {renderValue(item, String(index), `${path}.${index}`)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>;
      const keys = Object.keys(obj);
      const isExpanded = expandedKeys.has(path);
      
      return (
        <div>
          <button
            onClick={() => toggleExpanded(path)}
            className="flex items-center gap-1 hover:bg-accent rounded px-1"
          >
            <span className="json-bracket">{isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}</span>
            <span className="text-muted-foreground">{`{${keys.length} keys}`}</span>
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1">
              {keys.map((objKey) => (
                <div key={objKey} className="flex items-start gap-2 py-1">
                  <span className={`json-key min-w-20 ${shouldHighlight && objKey.toLowerCase().includes(searchTerm.toLowerCase()) ? 'bg-yellow-200 text-black' : ''}`}>
                    {objKey}<span className="json-punctuation">:</span>
                  </span>
                  {renderValue(obj[objKey], objKey, `${path}.${objKey}`)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <span>{String(value)}</span>;
  }, [searchTerm, expandedKeys, toggleExpanded]);

  return (
    <div className="font-mono text-sm json-highlight">
      {renderValue(data, parentKey || 'root', 'root')}
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