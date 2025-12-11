import { useState, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, Move, RotateCcw, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Floor2Blueprint, 
  Floor7Blueprint, 
  Floor12Blueprint, 
  Floor15Blueprint, 
  Floor16Blueprint,
  availableBlueprints 
} from "./floor-blueprints";

interface Floor {
  id: string;
  name: string;
  level: number;
}

interface FloorMapViewerProps {
  floor: Floor | null;
}

const blueprintComponents: Record<string, () => JSX.Element> = {
  "2": Floor2Blueprint,
  "7": Floor7Blueprint,
  "12": Floor12Blueprint,
  "15": Floor15Blueprint,
  "16": Floor16Blueprint,
};

const blueprintViewBoxes: Record<string, string> = {
  "2": "0 0 600 400",
  "7": "0 0 400 250",
  "12": "0 0 400 250",
  "15": "0 0 400 250",
  "16": "0 0 400 250",
};

export function FloorMapViewer({ floor }: FloorMapViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialZoom, setInitialZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (floor && containerRef.current) {
      const container = containerRef.current;
      const viewBox = blueprintViewBoxes[floor.id] || "0 0 400 250";
      const [, , vbWidth] = viewBox.split(" ").map(Number);
      const containerWidth = container.clientWidth;
      const calculatedZoom = Math.max(1, containerWidth / vbWidth * 0.9);
      setInitialZoom(calculatedZoom);
      setZoom(calculatedZoom);
      setPan({ x: 0, y: 0 });
    } else {
      setInitialZoom(1);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [floor?.id]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25));
  const handleReset = () => {
    setZoom(initialZoom);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom((z) => Math.max(0.25, Math.min(5, z + delta)));
  };

  if (!floor) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <Building2 className="w-24 h-24 text-gray-400 dark:text-gray-600 mb-6" />
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Frontier Tower</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md px-4">
          Select a floor from the sidebar to view its interactive map and room layout.
        </p>
        <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
            Floors with CAD blueprints:
          </p>
          <div className="flex gap-2">
            {availableBlueprints.map(id => (
              <span key={id} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm">
                Floor {id}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const BlueprintComponent = blueprintComponents[floor.id];
  const hasBlueprint = availableBlueprints.includes(floor.id);
  const viewBox = blueprintViewBoxes[floor.id] || "0 0 400 250";

  return (
    <div className="relative h-full flex flex-col bg-white dark:bg-gray-950">
      <div className="absolute top-4 right-4 z-10 flex gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          title="Zoom In"
          data-testid="button-zoom-in"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          title="Zoom Out"
          data-testid="button-zoom-out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          title="Reset View"
          data-testid="button-reset-view"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <div className="px-2 flex items-center text-sm text-gray-600 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      <div className="absolute top-4 left-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Drag to pan, scroll to zoom</span>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
          {floor.level === 0 ? "Basement" : floor.level === 17 ? "Roof" : `Floor ${floor.level}`}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{floor.name}</p>
        {hasBlueprint && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
            CAD Blueprint
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {hasBlueprint && BlueprintComponent ? (
          <svg
            width="100%"
            height="100%"
            viewBox={viewBox}
            className="select-none blueprint-svg"
            preserveAspectRatio="xMidYMid meet"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
            }}
          >
            <style>
              {`
                .blueprint-stroke-primary {
                  fill: none;
                  stroke: #1e3a5f;
                  stroke-width: 0.5;
                  stroke-linecap: round;
                  stroke-linejoin: round;
                }
                .blueprint-stroke-secondary {
                  fill: none;
                  stroke: #3b82f6;
                  stroke-width: 0.3;
                  stroke-linecap: round;
                  stroke-linejoin: round;
                }
                @media (prefers-color-scheme: dark) {
                  .blueprint-stroke-primary {
                    stroke: #93c5fd;
                  }
                  .blueprint-stroke-secondary {
                    stroke: #60a5fa;
                  }
                }
                .dark .blueprint-stroke-primary {
                  stroke: #93c5fd;
                }
                .dark .blueprint-stroke-secondary {
                  stroke: #60a5fa;
                }
              `}
            </style>
            <BlueprintComponent />
          </svg>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <Building2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {floor.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                CAD blueprint not available for this floor.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                Blueprints are available for floors: {availableBlueprints.join(", ")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
