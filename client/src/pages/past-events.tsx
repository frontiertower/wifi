import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, Users, ExternalLink, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Link } from "wouter";
import type { Event } from "@shared/schema";

interface EventsResponse {
  success: boolean;
  events: Event[];
}

export default function PastEvents() {
  const { data, isLoading } = useQuery<EventsResponse>({
    queryKey: ['/api/events'],
  });

  const events = data?.events || [];
  const now = new Date();
  const pastEvents = events.filter(event => new Date(event.endDate) < now);

  const cleanHostName = (host: string | null): string | null => {
    if (!host) return null;
    
    return host
      .replace(/Frontier Tower \| San Francisco/gi, '')
      .replace(/^[\s,&]+|[\s,&]+$/g, '')
      .trim() || null;
  };

  const cleanDescription = (description: string | null): string | null => {
    if (!description) return null;
    
    let cleaned = description
      // Remove "Get up-to-date information at: URL"
      .replace(/Get up-to-date information at:\s*https?:\/\/[^\s\n]+/gi, '')
      // Remove "This event is hosted at the Frontier Tower:" and everything after
      .replace(/This event is hosted at the Frontier Tower:[\s\S]*/gi, '')
      // Remove "Address:" section when it appears at the start or after newlines
      .replace(/(?:^|\n)Address:[\s\S]*?(?=\n\n|Hosted by|$)/gi, '')
      // Remove "Hosted by" section at the end (we show this separately)
      .replace(/(?:^|\n)Hosted by[\s\S]*/gi, '')
      // Clean up extra whitespace and newlines
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleaned || null;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/events">
                <Button variant="ghost" size="sm" data-testid="button-back-to-events">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Events
                </Button>
              </Link>
            </div>
            <h1 className="text-2xl font-bold">Past Events</h1>
            <p className="text-sm text-muted-foreground">Previous events at Frontier Tower</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6 animate-pulse" data-testid={`skeleton-event-${i}`}>
                <div className="h-6 bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        ) : pastEvents.length === 0 ? (
          <div className="text-center py-12" data-testid="no-past-events-message">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">No Past Events</h2>
            <p className="text-muted-foreground">There are no past events to display</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {pastEvents.map((event) => {
              const start = new Date(event.startDate);
              const end = new Date(event.endDate);

              return (
                <div key={event.id}>
                  {/* Mobile: Icon-only view */}
                  <div 
                    className="aspect-[2/1] rounded-lg overflow-hidden opacity-60 md:hidden"
                    data-testid={`icon-event-${event.id}`}
                  >
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.name}
                        className="w-full h-full object-cover"
                        data-testid={`img-event-icon-${event.id}`}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Desktop: Full card view */}
                  <Card
                    className="hidden md:block overflow-hidden opacity-75"
                    data-testid={`card-event-${event.id}`}
                  >
                    {event.imageUrl && (
                      <div className="w-full h-48 overflow-hidden">
                        <img
                          src={event.imageUrl}
                          alt={event.name}
                          className="w-full h-full object-cover"
                          data-testid={`img-event-${event.id}`}
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold line-clamp-2" data-testid={`text-event-name-${event.id}`}>
                          {event.name}
                        </h3>
                      </div>

                      {cleanDescription(event.description) && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3" data-testid={`text-description-${event.id}`}>
                          {cleanDescription(event.description)}
                        </p>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span data-testid={`text-date-${event.id}`}>
                            {format(start, "MMM d, yyyy")}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span data-testid={`text-time-${event.id}`}>
                            {format(start, "h:mm a")} - {format(end, "h:mm a")}
                          </span>
                        </div>

                        {cleanHostName(event.host) && (
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground" data-testid={`text-host-${event.id}`}>
                              Hosted by {cleanHostName(event.host)}
                            </span>
                          </div>
                        )}

                        {event.originalLocation && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground" data-testid={`text-location-${event.id}`}>
                              {event.originalLocation}
                            </span>
                          </div>
                        )}
                      </div>

                      {event.url && (
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            asChild
                            data-testid={`button-view-event-${event.id}`}
                          >
                            <a
                              href={event.url.trim().startsWith('http') ? event.url.trim() : `https://lu.ma/${event.url.trim()}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Event
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
