import { Network } from "lucide-react";

// Interface for view components
interface JsonViewComponentProps {
  data: unknown;
  searchTerm: string;
}

// Graph View Implementation (placeholder for now)
export function JsonGraphView({}: JsonViewComponentProps) {
  return (
    <div className="text-center text-muted-foreground p-8">
      <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <h3 className="text-lg font-medium mb-2">Graph View</h3>
      <p className="text-sm">Coming soon - Visualize data relationships as connected nodes</p>
      <p className="text-xs mt-2 opacity-75">D3.js powered graph visualization</p>
    </div>
  );
}