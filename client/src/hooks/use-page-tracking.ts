import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

function getVisitorId(): string {
  const storageKey = "ft_visitor_id";
  let visitorId = localStorage.getItem(storageKey);
  
  if (!visitorId) {
    visitorId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem(storageKey, visitorId);
  }
  
  return visitorId;
}

export function usePageTracking() {
  const [location] = useLocation();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (lastTrackedPath.current === location) {
      return;
    }

    lastTrackedPath.current = location;

    const trackVisit = async () => {
      try {
        const visitorId = getVisitorId();
        const referrer = document.referrer || null;

        await fetch("/api/track/visit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: location,
            visitorId,
            referrer,
          }),
        });
      } catch (error) {
        // Silently fail - analytics should not break the app
      }
    };

    trackVisit();
  }, [location]);
}
