import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Maximize2, ExternalLink, Map, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

const floors = [
  { id: "2", name: "Event Space-ship", level: 2 },
  { id: "7", name: "Floor 7", level: 7 },
  { id: "12", name: "Floor 12", level: 12 },
  { id: "15", name: "Floor 15", level: 15 },
  { id: "16", name: "Floor 16", level: 16 },
];

export default function FloorMaps() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const floorFinderUrl = selectedFloor 
    ? `https://sensaihack.space/#${selectedFloor}`
    : "https://sensaihack.space/#spreadsheet";

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {!isFullscreen && (
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="ghost" size="sm" data-testid="button-back-home">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <Map className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Floor Maps</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href="https://sensaihack.space" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-1"
                  data-testid="link-sensaihack-space"
                >
                  Open in new tab
                  <ExternalLink className="w-3 h-3" />
                </a>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleFullscreen}
                  data-testid="button-fullscreen"
                >
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Fullscreen
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      <div className={`flex ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-80px)]'}`}>
        {!isFullscreen && (
          <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 hidden md:block">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Quick Access</h2>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => setSelectedFloor(null)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedFloor === null 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                data-testid="button-floor-all"
              >
                Frontier Tower Spaces
              </button>
              
              <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Floors</p>
              
              {floors.map((floor) => (
                <button
                  key={floor.id}
                  onClick={() => setSelectedFloor(floor.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedFloor === floor.id 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                  data-testid={`button-floor-${floor.id}`}
                >
                  <span className="font-medium">Floor {floor.level}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block">{floor.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Interactive floor plans of Frontier Tower. Use zoom and pan to navigate.
              </p>
            </div>
          </aside>
        )}

        <main className="flex-1 relative">
          {isFullscreen && (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 z-10 shadow-lg"
              data-testid="button-exit-fullscreen"
            >
              Exit Fullscreen
            </Button>
          )}
          
          <iframe
            src={floorFinderUrl}
            className="w-full h-full border-0"
            title="Floor Maps - Frontier Tower"
            allow="fullscreen"
            data-testid="iframe-floor-maps"
          />
        </main>
      </div>
    </div>
  );
}
