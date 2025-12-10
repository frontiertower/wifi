import { useState, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, Move, Maximize2, RotateCcw, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Floor {
  id: string;
  name: string;
  level: number;
  rooms?: Room[];
}

interface Room {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type?: string;
  color?: string;
}

interface FloorMapViewerProps {
  floor: Floor | null;
  onClose?: () => void;
}

const defaultRoomsByFloor: Record<string, Room[]> = {
  "0": [
    { id: "b-storage", name: "Storage", x: 50, y: 50, width: 200, height: 150, type: "utility", color: "#6B7280" },
    { id: "b-mechanical", name: "Mechanical Room", x: 280, y: 50, width: 180, height: 150, type: "utility", color: "#6B7280" },
    { id: "b-parking", name: "Parking Area", x: 50, y: 230, width: 410, height: 200, type: "parking", color: "#9CA3AF" },
  ],
  "1": [
    { id: "1-lobby", name: "Main Lobby", x: 150, y: 100, width: 300, height: 200, type: "common", color: "#60A5FA" },
    { id: "1-reception", name: "Reception", x: 50, y: 100, width: 80, height: 100, type: "service", color: "#34D399" },
    { id: "1-security", name: "Security", x: 50, y: 220, width: 80, height: 80, type: "service", color: "#FBBF24" },
    { id: "1-mailroom", name: "Mail Room", x: 470, y: 100, width: 80, height: 80, type: "service", color: "#A78BFA" },
  ],
  "2": [
    { id: "2-main", name: "Event Space-ship", x: 80, y: 80, width: 350, height: 250, type: "event", color: "#F472B6" },
    { id: "2-stage", name: "Stage Area", x: 80, y: 350, width: 200, height: 100, type: "event", color: "#FB923C" },
    { id: "2-av", name: "AV Control", x: 450, y: 80, width: 100, height: 80, type: "utility", color: "#6B7280" },
    { id: "2-green", name: "Green Room", x: 450, y: 180, width: 100, height: 100, type: "lounge", color: "#34D399" },
  ],
  "3": [
    { id: "3-gym", name: "Main Gym", x: 80, y: 80, width: 280, height: 200, type: "fitness", color: "#EF4444" },
    { id: "3-studio", name: "Yoga Studio", x: 380, y: 80, width: 150, height: 120, type: "fitness", color: "#A78BFA" },
    { id: "3-lockers", name: "Lockers", x: 380, y: 220, width: 150, height: 100, type: "utility", color: "#6B7280" },
    { id: "3-cardio", name: "Cardio Zone", x: 80, y: 300, width: 200, height: 120, type: "fitness", color: "#FB923C" },
  ],
  "4": [
    { id: "4-robotics", name: "Robotics Lab", x: 80, y: 80, width: 250, height: 180, type: "lab", color: "#8B5CF6" },
    { id: "4-workshop", name: "Workshop", x: 350, y: 80, width: 180, height: 180, type: "workspace", color: "#F59E0B" },
    { id: "4-3dprint", name: "3D Printing", x: 80, y: 280, width: 150, height: 120, type: "lab", color: "#14B8A6" },
    { id: "4-electronics", name: "Electronics Lab", x: 250, y: 280, width: 150, height: 120, type: "lab", color: "#EC4899" },
  ],
  "5": [
    { id: "5-movement", name: "Movement Studio", x: 80, y: 80, width: 250, height: 200, type: "fitness", color: "#22C55E" },
    { id: "5-dance", name: "Dance Floor", x: 350, y: 80, width: 180, height: 150, type: "fitness", color: "#F472B6" },
    { id: "5-recovery", name: "Recovery Zone", x: 350, y: 250, width: 180, height: 120, type: "wellness", color: "#60A5FA" },
  ],
  "6": [
    { id: "6-mass", name: "MASS Main Hall", x: 80, y: 80, width: 300, height: 220, type: "creative", color: "#8B5CF6" },
    { id: "6-recording", name: "Recording Studio", x: 400, y: 80, width: 130, height: 100, type: "creative", color: "#EF4444" },
    { id: "6-practice", name: "Practice Rooms", x: 400, y: 200, width: 130, height: 120, type: "creative", color: "#F59E0B" },
    { id: "6-gallery", name: "Art Gallery", x: 80, y: 320, width: 200, height: 100, type: "creative", color: "#14B8A6" },
  ],
  "7": [
    { id: "7-makerspace", name: "Makerspace", x: 80, y: 80, width: 280, height: 200, type: "workspace", color: "#3B82F6" },
    { id: "7-desks", name: "Hacker Desks", x: 380, y: 80, width: 150, height: 280, type: "workspace", color: "#10B981" },
    { id: "7-tools", name: "Tool Library", x: 80, y: 300, width: 140, height: 100, type: "utility", color: "#F59E0B" },
    { id: "7-meeting", name: "Meeting Pod", x: 240, y: 300, width: 120, height: 100, type: "meeting", color: "#EC4899" },
  ],
  "8": [
    { id: "8-neurolab", name: "Neurotech Lab", x: 80, y: 80, width: 220, height: 180, type: "lab", color: "#8B5CF6" },
    { id: "8-biolab", name: "Biotech Lab", x: 320, y: 80, width: 200, height: 180, type: "lab", color: "#22C55E" },
    { id: "8-cleanroom", name: "Clean Room", x: 80, y: 280, width: 180, height: 120, type: "lab", color: "#06B6D4" },
    { id: "8-analysis", name: "Data Analysis", x: 280, y: 280, width: 150, height: 120, type: "workspace", color: "#F59E0B" },
  ],
  "9": [
    { id: "9-ailab", name: "AI Lab", x: 80, y: 80, width: 250, height: 200, type: "lab", color: "#6366F1" },
    { id: "9-gpu", name: "GPU Cluster", x: 350, y: 80, width: 180, height: 120, type: "infrastructure", color: "#EF4444" },
    { id: "9-desks", name: "Research Desks", x: 350, y: 220, width: 180, height: 180, type: "workspace", color: "#10B981" },
    { id: "9-collab", name: "Collaboration Zone", x: 80, y: 300, width: 250, height: 100, type: "common", color: "#F59E0B" },
  ],
  "10": [
    { id: "10-accelerate", name: "Accelerate Hub", x: 80, y: 80, width: 300, height: 180, type: "workspace", color: "#3B82F6" },
    { id: "10-pitch", name: "Pitch Room", x: 400, y: 80, width: 130, height: 100, type: "meeting", color: "#EC4899" },
    { id: "10-mentor", name: "Mentor Suites", x: 400, y: 200, width: 130, height: 120, type: "meeting", color: "#8B5CF6" },
    { id: "10-cafe", name: "Startup Cafe", x: 80, y: 280, width: 200, height: 120, type: "common", color: "#F59E0B" },
  ],
  "11": [
    { id: "11-wellness", name: "Wellness Center", x: 80, y: 80, width: 250, height: 180, type: "wellness", color: "#22C55E" },
    { id: "11-meditation", name: "Meditation Room", x: 350, y: 80, width: 150, height: 100, type: "wellness", color: "#A78BFA" },
    { id: "11-health", name: "Health Clinic", x: 350, y: 200, width: 150, height: 120, type: "medical", color: "#EF4444" },
    { id: "11-longevity", name: "Longevity Lab", x: 80, y: 280, width: 200, height: 120, type: "lab", color: "#06B6D4" },
  ],
  "12": [
    { id: "12-ethereum", name: "Ethereum Hub", x: 80, y: 80, width: 280, height: 200, type: "workspace", color: "#6366F1" },
    { id: "12-hackspace", name: "Hack Space", x: 380, y: 80, width: 150, height: 280, type: "workspace", color: "#10B981" },
    { id: "12-nodes", name: "Node Room", x: 80, y: 300, width: 140, height: 100, type: "infrastructure", color: "#F59E0B" },
    { id: "12-crypto", name: "Crypto Lounge", x: 240, y: 300, width: 120, height: 100, type: "lounge", color: "#EC4899" },
  ],
  "14": [
    { id: "14-flourishing", name: "Flourishing Hall", x: 80, y: 80, width: 300, height: 200, type: "common", color: "#22C55E" },
    { id: "14-therapy", name: "Therapy Rooms", x: 400, y: 80, width: 130, height: 150, type: "wellness", color: "#A78BFA" },
    { id: "14-community", name: "Community Space", x: 80, y: 300, width: 250, height: 100, type: "common", color: "#F59E0B" },
  ],
  "15": [
    { id: "15-hackathon", name: "Hackathon Arena", x: 80, y: 80, width: 350, height: 220, type: "event", color: "#3B82F6" },
    { id: "15-desks", name: "Team Desks", x: 80, y: 320, width: 350, height: 100, type: "workspace", color: "#10B981" },
    { id: "15-judges", name: "Judges Room", x: 450, y: 80, width: 100, height: 100, type: "meeting", color: "#EC4899" },
    { id: "15-snacks", name: "Snack Bar", x: 450, y: 200, width: 100, height: 80, type: "common", color: "#F59E0B" },
  ],
  "16": [
    { id: "16-lounge", name: "Hacker Lounge", x: 80, y: 80, width: 280, height: 180, type: "lounge", color: "#8B5CF6" },
    { id: "16-tables", name: "Collaboration Tables", x: 380, y: 80, width: 150, height: 280, type: "workspace", color: "#10B981" },
    { id: "16-kitchen", name: "Community Kitchen", x: 80, y: 280, width: 140, height: 100, type: "common", color: "#F59E0B" },
    { id: "16-quiet", name: "Quiet Zone", x: 240, y: 280, width: 120, height: 100, type: "focus", color: "#06B6D4" },
  ],
  "17": [
    { id: "17-deck", name: "Roof Deck", x: 80, y: 80, width: 350, height: 250, type: "outdoor", color: "#22C55E" },
    { id: "17-garden", name: "Rooftop Garden", x: 450, y: 80, width: 100, height: 150, type: "outdoor", color: "#84CC16" },
    { id: "17-lounge", name: "Sky Lounge", x: 80, y: 350, width: 200, height: 80, type: "lounge", color: "#60A5FA" },
  ],
};

export function FloorMapViewer({ floor }: FloorMapViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredRoom, setHoveredRoom] = useState<Room | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [floor?.id]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
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
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.max(0.5, Math.min(3, z + delta)));
  };

  if (!floor) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <Building2 className="w-24 h-24 text-gray-400 dark:text-gray-600 mb-6" />
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Frontier Tower</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md px-4">
          Select a floor from the sidebar to view its interactive map and room layout.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Workspace</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Common Areas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Labs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Utilities</span>
          </div>
        </div>
      </div>
    );
  }

  const rooms = floor.rooms || defaultRoomsByFloor[floor.id] || [];

  return (
    <div className="relative h-full flex flex-col bg-gray-100 dark:bg-gray-900">
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

      {hoveredRoom && (
        <div className="absolute bottom-4 left-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="font-semibold text-gray-900 dark:text-white">{hoveredRoom.name}</h3>
          {hoveredRoom.type && (
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mt-1">
              Type: {hoveredRoom.type}
            </p>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 600 500"
          className="select-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-gray-300 dark:text-gray-700"
              />
            </pattern>
          </defs>

          <rect width="600" height="500" fill="url(#grid)" />

          <rect
            x="40"
            y="40"
            width="520"
            height="420"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-gray-400 dark:text-gray-600"
            rx="4"
          />

          {rooms.map((room) => (
            <g
              key={room.id}
              onMouseEnter={() => setHoveredRoom(room)}
              onMouseLeave={() => setHoveredRoom(null)}
              className="cursor-pointer"
              data-testid={`room-${room.id}`}
            >
              <rect
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                fill={room.color || "#60A5FA"}
                fillOpacity={hoveredRoom?.id === room.id ? 0.9 : 0.7}
                stroke={room.color || "#3B82F6"}
                strokeWidth={hoveredRoom?.id === room.id ? 3 : 1.5}
                rx="4"
                className="transition-all duration-150"
              />
              <text
                x={room.x + room.width / 2}
                y={room.y + room.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium fill-white pointer-events-none"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
              >
                {room.name.length > 15 ? room.name.slice(0, 15) + "..." : room.name}
              </text>
            </g>
          ))}

          <text
            x="300"
            y="25"
            textAnchor="middle"
            className="text-sm font-bold fill-gray-600 dark:fill-gray-400"
          >
            {floor.level === 0 ? "Basement" : floor.level === 17 ? "Roof" : `Floor ${floor.level}`} - {floor.name}
          </text>
        </svg>
      </div>

      <div className="absolute bottom-4 right-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {rooms.length} rooms on this floor
        </div>
      </div>
    </div>
  );
}
