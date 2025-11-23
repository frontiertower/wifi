import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import rabbitImage from "@assets/FuzzyNop_logo_pink_1763832812948.png";

type PillChoice = "green" | "blue" | null;

export default function PillsPage() {
  const [crackIntensity, setCrackIntensity] = useState(0);
  const [showTerminal, setShowTerminal] = useState(false);
  const [buttonShakeState, setButtonShakeState] = useState<"green" | "blue" | null>(null);
  const [, setLocation] = useLocation();

  // Glass cracking effect on load
  useEffect(() => {
    const interval = setInterval(() => {
      setCrackIntensity((prev) => {
        if (prev >= 10) {
          clearInterval(interval);
          setTimeout(() => setShowTerminal(true), 2000);
          return 10;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle reboot screen interactions
  useEffect(() => {
    if (!showTerminal) return;

    let autoRebootTimer: NodeJS.Timeout | null = null;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (autoRebootTimer) clearTimeout(autoRebootTimer);
        window.location.reload();
      }
    };

    const handleClick = () => {
      if (autoRebootTimer) clearTimeout(autoRebootTimer);
      window.location.reload();
    };

    // Start 5-second auto-reboot timer
    autoRebootTimer = setTimeout(() => {
      window.location.reload();
    }, 5000);

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("click", handleClick);

    return () => {
      if (autoRebootTimer) clearTimeout(autoRebootTimer);
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("click", handleClick);
    };
  }, [showTerminal]);

  const handleRebootClick = () => {
    window.location.reload();
  };

  const handlePillChoice = (choice: PillChoice) => {
    setButtonShakeState(choice);
    
    // Generate extra sparks on pill selection
    setCrackIntensity(Math.min(crackIntensity + 3, 10));
    
    setTimeout(() => {
      if (choice === "green") {
        setLocation("/Regen");
      } else if (choice === "blue") {
        setLocation("/Finance");
      }
    }, 600);
  };

  // Generate additional shooting spark particles when pills are clicked
  const generateExtraSparks = () => {
    if (crackIntensity >= 6) {
      return Array.from({ length: 25 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 150 + Math.random() * 200;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        const delay = Math.random() * 0.3;
        
        return (
          <circle
            key={`extra-spark-${i}`}
            cx="50%"
            cy="50%"
            r={1 + Math.random() * 2}
            fill={`rgba(${Math.random() > 0.5 ? '255,150,0' : '255,255,0'}, ${0.4 + Math.random() * 0.6})`}
            style={{
              '--tx': `${tx}px`,
              '--ty': `${ty}px`,
              animation: `sparks 1.2s ease-out ${delay}s forwards`,
            } as React.CSSProperties}
            className="spark"
          />
        );
      });
    }
    return null;
  };

  return (
    <div className={`fixed inset-0 flex items-start justify-center pt-12 p-4 z-50 overflow-hidden ${crackIntensity >= 9 ? 'black-hole-collapse' : 'bg-black bg-opacity-50 pill-modal-backdrop'} ${crackIntensity >= 6 ? 'shake-effect' : ''}`}>
      {/* Glass crack overlay with trippy effects */}
      {crackIntensity > 0 && crackIntensity < 9 && (
        <>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}>
            {/* Base cracks */}
            {crackIntensity >= 1 && <line x1="50%" y1="0%" x2="45%" y2="100%" stroke="rgba(0,0,0,0.6)" strokeWidth="3" />}
            {crackIntensity >= 2 && <line x1="30%" y1="20%" x2="70%" y2="80%" stroke="rgba(0,0,0,0.5)" strokeWidth="2" />}
            {crackIntensity >= 3 && <line x1="70%" y1="10%" x2="20%" y2="90%" stroke="rgba(0,0,0,0.5)" strokeWidth="2" />}
            {crackIntensity >= 4 && <line x1="50%" y1="0%" x2="40%" y2="60%" stroke="rgba(0,0,0,0.4)" strokeWidth="2" />}
            {crackIntensity >= 5 && <line x1="60%" y1="30%" x2="30%" y2="70%" stroke="rgba(0,0,0,0.4)" strokeWidth="2" />}
            
            {/* Fragments */}
            {crackIntensity >= 6 && <polygon points="0,0 100,0 100,50 0,40" fill="rgba(0,0,0,0.15)" />}
            {crackIntensity >= 7 && <polygon points="0,100 100,100 100,60 0,70" fill="rgba(0,0,0,0.15)" />}
            {crackIntensity >= 8 && <polygon points="0,0 30,0 25,50 0,45" fill="rgba(0,0,0,0.2)" />}
            
            {/* Trippy zigzag lines (start at intensity 5) */}
            {crackIntensity >= 5 && <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="rgba(0,0,0,0.3)" strokeWidth="1" className="zigzag-line" strokeDasharray="5,5" />}
            {crackIntensity >= 6 && <line x1="20%" y1="0%" x2="20%" y2="100%" stroke="rgba(0,0,0,0.25)" strokeWidth="1" className="zigzag-line" strokeDasharray="5,5" />}
            {crackIntensity >= 7 && <line x1="80%" y1="0%" x2="80%" y2="100%" stroke="rgba(0,0,0,0.25)" strokeWidth="1" className="zigzag-line" strokeDasharray="5,5" />}
            {crackIntensity >= 7 && <line x1="0%" y1="25%" x2="100%" y2="25%" stroke="rgba(0,0,0,0.2)" strokeWidth="1" className="zigzag-line" strokeDasharray="5,5" />}
            {crackIntensity >= 8 && <line x1="0%" y1="75%" x2="100%" y2="75%" stroke="rgba(0,0,0,0.2)" strokeWidth="1" className="zigzag-line" strokeDasharray="5,5" />}
            
            {/* Flicker lines (intensity 7+) */}
            {crackIntensity >= 7 && <line x1="35%" y1="0%" x2="45%" y2="100%" stroke="rgba(255,255,255,0.2)" strokeWidth="1" className="flicker-line" />}
            {crackIntensity >= 8 && <line x1="55%" y1="0%" x2="65%" y2="100%" stroke="rgba(255,255,255,0.2)" strokeWidth="1" className="flicker-line" />}
            {crackIntensity >= 8 && <line x1="25%" y1="50%" x2="75%" y2="50%" stroke="rgba(255,255,255,0.15)" strokeWidth="1" className="flicker-line" />}
            
            {/* Chaotic geometry (intensity 8+) */}
            {crackIntensity >= 8 && (
              <>
                <polygon points="10,10 40,5 35,40 5,35" fill="rgba(0,0,0,0.1)" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
                <polygon points="90,90 60,95 65,60 95,65" fill="rgba(0,0,0,0.1)" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
                <circle cx="30%" cy="70%" r="8%" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                <circle cx="70%" cy="30%" r="10%" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
              </>
            )}

            {/* Extra animated lines */}
            {crackIntensity >= 7 && (
              <>
                <line x1="15%" y1="15%" x2="85%" y2="85%" stroke="rgba(255,100,100,0.2)" strokeWidth="1" className="flicker-line" strokeDasharray="3,3" />
                <line x1="85%" y1="15%" x2="15%" y2="85%" stroke="rgba(100,100,255,0.2)" strokeWidth="1" className="flicker-line" strokeDasharray="3,3" />
              </>
            )}
          </svg>
          
          {/* Spark particles (intensity 6+) */}
          {crackIntensity >= 6 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: "drop-shadow(0 0 5px rgba(0,0,0,0.5))" }}>
              {Array.from({ length: Math.min(crackIntensity - 5, 20) }).map((_, i) => {
                const angle = (i / (crackIntensity - 5)) * Math.PI * 2;
                const distance = 100 + i * 20;
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;
                return (
                  <circle
                    key={`spark-${i}`}
                    cx="50%"
                    cy="50%"
                    r="2"
                    fill={`rgba(${i % 2 ? '255,200,0' : '255,100,0'}, 0.7)`}
                    style={{
                      '--tx': `${tx}px`,
                      '--ty': `${ty}px`,
                    } as React.CSSProperties}
                    className="spark"
                  />
                );
              })}

              {/* Extra button click sparks */}
              {buttonShakeState && generateExtraSparks()}
            </svg>
          )}
        </>
      )}
      
      {/* Black hole vortex effect */}
      {crackIntensity >= 9 && (
        <>
          <div className="absolute inset-0 black-hole-vortex" />
          <div className="absolute inset-0 black-hole-singularity" />
        </>
      )}
      
      {!showTerminal && (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative ${crackIntensity >= 9 ? 'black-hole-pull' : 'z-10'}`}>
          <img 
            src={rabbitImage} 
            alt="Rabbit logo" 
            className="w-24 h-24 mx-auto mb-6 object-contain"
          />
          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            The Choice is Yours
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Choose your path forward
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handlePillChoice("green")}
              className={`flex flex-col items-center justify-center p-6 border-2 border-green-500 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors duration-200 group ${buttonShakeState === "green" ? "animate-bounce" : ""}`}
              data-testid="button-green-pill-choice"
            >
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-2 group-hover:scale-110 transition-transform ${buttonShakeState === "green" ? "scale-125" : ""}`} />
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                GREEN PILL
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Regenerate
              </span>
            </button>

            <button
              onClick={() => handlePillChoice("blue")}
              className={`flex flex-col items-center justify-center p-6 border-2 border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors duration-200 group ${buttonShakeState === "blue" ? "animate-bounce" : ""}`}
              data-testid="button-blue-pill-choice"
            >
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mb-2 group-hover:scale-110 transition-transform ${buttonShakeState === "blue" ? "scale-125" : ""}`} />
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                BLUE PILL
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Accelerate
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Terminal reboot screen */}
      {showTerminal && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-20 cursor-pointer" onClick={handleRebootClick}>
          <div className="text-center font-mono text-2xl md:text-4xl">
            <span className="terminal-text typing-reboot">reboot</span>
            <span className="terminal-cursor">_</span>
          </div>
        </div>
      )}
    </div>
  );
}
