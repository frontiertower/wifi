import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function PillChoice() {
  const [, setLocation] = useLocation();
  const [hoveredPill, setHoveredPill] = useState<"green" | "blue" | null>(null);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        {/* Title */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 terminal-glow" style={{ textShadow: "0 0 20px rgba(0, 255, 0, 0.5)" }}>
            FRONTIER TOWER
          </h1>
          <p className="text-xl text-gray-300 font-mono">
            Choose your path to the future
          </p>
        </div>

        {/* Pills Container */}
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Green Pill */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setLocation("/green")}
              onMouseEnter={() => setHoveredPill("green")}
              onMouseLeave={() => setHoveredPill(null)}
              className="mb-4 focus:outline-none transition-all duration-300"
              data-testid="button-green-pill"
            >
              <div
                className={`w-24 h-24 rounded-full bg-gradient-to-br from-[#00ff41] to-[#00cc33] flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  hoveredPill === "green" ? "scale-110 shadow-2xl" : "shadow-lg"
                }`}
                style={{
                  boxShadow:
                    hoveredPill === "green"
                      ? "0 0 40px rgba(0, 255, 65, 0.8), 0 0 80px rgba(0, 255, 65, 0.4)"
                      : "0 0 20px rgba(0, 255, 65, 0.5)",
                }}
              >
                <span className="text-black font-bold text-lg">•</span>
              </div>
            </button>
            <h2 className="text-2xl font-bold text-[#00ff41] mb-2 terminal-text">GREEN PILL</h2>
            <p className="text-gray-300 text-center text-sm">
              Join the Frontier Initiative
              <br />
              Head of Finance Recruitment
            </p>
          </div>

          {/* Blue Pill */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setLocation("/blue")}
              onMouseEnter={() => setHoveredPill("blue")}
              onMouseLeave={() => setHoveredPill(null)}
              className="mb-4 focus:outline-none transition-all duration-300"
              data-testid="button-blue-pill"
            >
              <div
                className={`w-24 h-24 rounded-full bg-gradient-to-br from-[#4a90e2] to-[#2e5c8a] flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  hoveredPill === "blue" ? "scale-110 shadow-2xl" : "shadow-lg"
                }`}
                style={{
                  boxShadow:
                    hoveredPill === "blue"
                      ? "0 0 40px rgba(74, 144, 226, 0.8), 0 0 80px rgba(74, 144, 226, 0.4)"
                      : "0 0 20px rgba(74, 144, 226, 0.5)",
                }}
              >
                <span className="text-white font-bold text-lg">•</span>
              </div>
            </button>
            <h2 className="text-2xl font-bold text-[#4a90e2] mb-2 blueprint-text">BLUE PILL</h2>
            <p className="text-gray-300 text-center text-sm">
              Access the Master Blueprint
              <br />
              Project Documentation
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-16 text-gray-400 text-xs max-w-md mx-auto">
          <p className="font-mono">
            "There is no spoon. There is only Frontier Tower."
          </p>
        </div>
      </div>
    </div>
  );
}
