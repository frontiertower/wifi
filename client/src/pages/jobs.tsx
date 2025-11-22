import { useLocation } from "wouter";
import { useEffect } from "react";

export default function JobsPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/pills");
  }, [setLocation]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center font-mono text-2xl md:text-4xl">
        <span className="terminal-text text-terminal-green">redirecting to pills...</span>
      </div>
    </div>
  );
}
