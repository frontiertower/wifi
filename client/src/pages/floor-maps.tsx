import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Map, Layers, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloorMapViewer } from "@/components/FloorMapViewer";

// Floor data imported from https://github.com/frontiertower/floorfinder
const floors = [
  { id: "0", name: "Basement", level: 0 },
  { id: "1", name: "Lobby", level: 1 },
  { id: "2", name: "Event Space-ship", level: 2 },
  { id: "3", name: "Fitness Center", level: 3 },
  { id: "4", name: "Cyberpunk Robotics Lab", level: 4 },
  { id: "5", name: "Movement & Fitness", level: 5 },
  { id: "6", name: "Music Arts Social Space (MASS)", level: 6 },
  { id: "7", name: "Makerspace - Hacker Desk Area", level: 7 },
  { id: "8", name: "Neurotech & Biotech", level: 8 },
  { id: "9", name: "AI Lab Desk Area", level: 9 },
  { id: "10", name: "Frontier @ Accelerate", level: 10 },
  { id: "11", name: "Health & Longevity", level: 11 },
  { id: "12", name: "Ethereum House - Hack Space", level: 12 },
  { id: "14", name: "Human Flourishing", level: 14 },
  { id: "15", name: "Hackathon Desk Area", level: 15 },
  { id: "16", name: "Hacker Lounge & Tables", level: 16 },
  { id: "17", name: "Roof", level: 17 },
];

export default function FloorMaps() {
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);

  const currentFloor = selectedFloor ? floors.find(f => f.id === selectedFloor) : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
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
            <a 
              href="https://github.com/frontiertower/floorfinder" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm flex items-center gap-1"
              data-testid="link-github-repo"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">View on GitHub</span>
            </a>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        <aside className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex md:flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              <button
                onClick={() => setSelectedFloor(null)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedFloor === null 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                data-testid="button-floor-all"
              >
                Frontier Tower Overview
              </button>
              
              <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 px-1">All Floors</p>
              
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
                  <span className="font-medium">{floor.level === 0 ? 'B' : floor.level === 17 ? 'R' : floor.level}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{floor.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Floor data from{" "}
                <a 
                  href="https://github.com/frontiertower/floorfinder" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  floorfinder
                </a>
                . Drag to pan, scroll to zoom.
              </p>
            </div>
          </div>
        </aside>

        <main className="flex-1 relative">
          <FloorMapViewer 
            floor={currentFloor || null}
          />
        </main>
      </div>

      {/* Mobile floor selector */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedFloor(null)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm ${
              selectedFloor === null 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            data-testid="button-mobile-floor-all"
          >
            Overview
          </button>
          {floors.map((floor) => (
            <button
              key={floor.id}
              onClick={() => setSelectedFloor(floor.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm ${
                selectedFloor === floor.id 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              data-testid={`button-mobile-floor-${floor.id}`}
            >
              {floor.level === 0 ? 'B' : floor.level === 17 ? 'R' : floor.level}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
