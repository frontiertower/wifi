import { useState, useRef, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, Move, RotateCcw, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DOMPurify from "dompurify";

interface Floor {
  id: string;
  name: string;
  level: number;
}

interface FloorMapViewerProps {
  floor: Floor | null;
}

// All available floors from GitHub repository (excluding floor 13 which doesn't exist)
const availableBlueprints = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '14', '15', '16', '17'];

const GITHUB_RAW_URL = "https://raw.githubusercontent.com/frontiertower/floorfinder/main/src/components/floor-svgs/blueprints";

// Configure DOMPurify with strict SVG profile
// Only allow safe SVG elements and attributes
const ALLOWED_TAGS = ['g', 'path', 'line', 'circle', 'rect', 'ellipse', 'polygon', 'polyline', 'text', 'tspan', 'defs', 'use', 'clipPath', 'mask', 'style', 'svg'];
const ALLOWED_ATTR = ['d', 'class', 'transform', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'x', 'y', 'x1', 'x2', 'y1', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'width', 'height', 'points', 'viewBox', 'id', 'clip-path', 'mask', 'fill-rule', 'clip-rule', 'font-family', 'font-size', 'text-anchor'];

// Sanitize SVG content using DOMPurify with strict SVG-only configuration
function sanitizeSvgContent(content: string): string {
  // Use DOMPurify with strict SVG configuration
  const sanitized = DOMPurify.sanitize(content, {
    USE_PROFILES: { svg: true },
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'link', 'meta', 'foreignObject', 'a', 'animate', 'animateMotion', 'animateTransform', 'set'],
    FORBID_ATTR: ['onload', 'onclick', 'onerror', 'onmouseover', 'onmouseenter', 'onfocus', 'onblur', 'onchange', 'xlink:href', 'href'],
    ALLOW_DATA_ATTR: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
    SANITIZE_DOM: true,
  });
  
  return sanitized;
}

export function FloorMapViewer({ floor }: FloorMapViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialZoom, setInitialZoom] = useState(1);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch blueprint from GitHub with sanitization
  const fetchBlueprint = useCallback(async (floorId: string) => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const response = await fetch(`${GITHUB_RAW_URL}/floor-${floorId}.tsx`);
      if (!response.ok) {
        throw new Error(`Blueprint not found for floor ${floorId}`);
      }
      
      const text = await response.text();
      
      // Extract the transform from the React component
      const transformMatch = text.match(/transform=\{`([^`]+)`\}/);
      const transform = transformMatch ? transformMatch[1] : "";
      
      // Extract all SVG path content - find all <path> and other SVG elements
      // Use a more robust extraction that captures all g content including nested groups
      const gContentMatch = text.match(/<g[^>]*>([\s\S]*)<\/g>/);
      
      if (gContentMatch) {
        let pathContent = gContentMatch[0];
        
        // Convert React className to standard SVG class
        pathContent = pathContent
          .replace(/className="g1"/g, 'class="blueprint-stroke-primary"')
          .replace(/className="g2"/g, 'class="blueprint-stroke-secondary"')
          .replace(/className='g1'/g, 'class="blueprint-stroke-primary"')
          .replace(/className='g2'/g, 'class="blueprint-stroke-secondary"');
        
        // Apply the transform if present (to the outer g element)
        // Clean up any backticks or template literal syntax from the transform
        if (transform && !pathContent.includes('transform=')) {
          const cleanTransform = transform.replace(/`/g, '').trim();
          pathContent = pathContent.replace('<g', `<g transform="${cleanTransform}"`);
        }
        
        // Sanitize the SVG content to prevent XSS
        const sanitizedContent = sanitizeSvgContent(pathContent);
        
        setSvgContent(sanitizedContent);
      } else {
        throw new Error("Could not parse floor plan SVG");
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load floor plan");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load blueprint when floor changes
  useEffect(() => {
    if (floor && availableBlueprints.includes(floor.id)) {
      fetchBlueprint(floor.id);
    } else {
      setSvgContent(null);
      setLoadError(null);
      // Only reset zoom/pan when switching to non-blueprint floor or no floor
      setInitialZoom(1);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [floor?.id, fetchBlueprint]);

  // Calculate and set zoom only after SVG content has loaded
  useEffect(() => {
    if (!svgContent || !containerRef.current) return;
    
    const calculateZoom = () => {
      const container = containerRef.current;
      if (!container) return false;
      
      const containerWidth = container.clientWidth;
      
      // Only calculate if we have a valid container width
      if (containerWidth > 0) {
        // Scale to fill most of the container width
        const calculatedZoom = Math.max(1.5, (containerWidth / 400) * 0.85);
        setInitialZoom(calculatedZoom);
        setZoom(calculatedZoom);
        setPan({ x: 0, y: 0 });
        return true;
      }
      return false;
    };

    // Try immediately
    if (calculateZoom()) return;

    // If container wasn't ready, retry after a short delay
    const timer = setTimeout(() => {
      if (!calculateZoom()) {
        // Fallback: use window width as approximation
        const calculatedZoom = Math.max(1.5, (window.innerWidth * 0.7) / 400);
        setInitialZoom(calculatedZoom);
        setZoom(calculatedZoom);
        setPan({ x: 0, y: 0 });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [svgContent]);

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

  const hasBlueprint = availableBlueprints.includes(floor.id);

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
        data-testid="floor-map-container"
      >
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Loading floor plan...</p>
            </div>
          </div>
        )}

        {loadError && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <Building2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {floor.name}
              </h3>
              <p className="text-sm text-red-500 dark:text-red-400 mt-2">
                {loadError}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => fetchBlueprint(floor.id)}
                data-testid="button-retry-load"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !loadError && svgContent && (
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 250"
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
            <g dangerouslySetInnerHTML={{ __html: svgContent }} />
          </svg>
        )}

        {!isLoading && !loadError && !svgContent && !hasBlueprint && (
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
