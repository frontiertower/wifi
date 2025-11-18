import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, Users, ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow, isPast, isFuture, isToday } from "date-fns";
import type { Event } from "@shared/schema";

interface EventsResponse {
  success: boolean;
  events: Event[];
}

export default function Events() {
  const { data, isLoading } = useQuery<EventsResponse>({
    queryKey: ['/api/events'],
  });

  const events = data?.events || [];
  const now = new Date();
  const upcomingEvents = events.filter(event => new Date(event.endDate) >= now);
  const pastEvents = events.filter(event => new Date(event.endDate) < now);

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (now >= start && now <= end) {
      return { label: "Happening Now", variant: "default" as const };
    } else if (isFuture(start)) {
      return { label: "Upcoming", variant: "secondary" as const };
    } else {
      return { label: "Past", variant: "outline" as const };
    }
  };

  const cleanHostName = (host: string | null): string | null => {
    if (!host) return null;
    
    return host
      .replace(/Frontier Tower \| San Francisco/gi, '')
      .replace(/^[\s,&]+|[\s,&]+$/g, '')
      .trim() || null;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Events</h1>
            <p className="text-sm text-muted-foreground">Discover what's happening at Frontier Tower</p>
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
        ) : events.length === 0 ? (
          <div className="text-center py-12" data-testid="no-events-message">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">No Events Scheduled</h2>
            <p className="text-muted-foreground">Check back later for upcoming events</p>
          </div>
        ) : (
          <div className="space-y-8">
            {upcomingEvents.length > 0 && (
              <section>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingEvents.map((event) => {
                    const status = getEventStatus(event);
                    const start = new Date(event.startDate);
                    const end = new Date(event.endDate);

                    return (
                      <Card
                        key={event.id}
                        className="p-6 hover-elevate transition-all"
                        data-testid={`card-event-${event.id}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-4">
                          <h3 className="text-lg font-semibold line-clamp-2" data-testid={`text-event-name-${event.id}`}>
                            {event.name}
                          </h3>
                          <Badge variant={status.variant} className="flex-shrink-0" data-testid={`badge-status-${event.id}`}>
                            {status.label}
                          </Badge>
                        </div>

                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3" data-testid={`text-description-${event.id}`}>
                            {event.description}
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

                        {event.maxAttendees && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center justify-between gap-2 text-sm">
                              <span className="text-muted-foreground">Attendees</span>
                              <span className="font-medium" data-testid={`text-attendees-${event.id}`}>
                                {event.currentAttendees || 0} / {event.maxAttendees}
                              </span>
                            </div>
                          </div>
                        )}

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
                                href={`https://lu.ma/${event.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View Event
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            {pastEvents.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4" data-testid="heading-past-events">
                  Past Events
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pastEvents.map((event) => {
                    const start = new Date(event.startDate);
                    const end = new Date(event.endDate);

                    return (
                      <Card
                        key={event.id}
                        className="p-6 opacity-75"
                        data-testid={`card-event-${event.id}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-4">
                          <h3 className="text-lg font-semibold line-clamp-2" data-testid={`text-event-name-${event.id}`}>
                            {event.name}
                          </h3>
                          <Badge variant="outline" className="flex-shrink-0" data-testid={`badge-status-${event.id}`}>
                            Past
                          </Badge>
                        </div>

                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3" data-testid={`text-description-${event.id}`}>
                            {event.description}
                          </p>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span data-testid={`text-date-${event.id}`}>
                              {format(start, "MMM d, yyyy")}
                            </span>
                          </div>

                          {cleanHostName(event.host) && (
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground" data-testid={`text-host-${event.id}`}>
                                {cleanHostName(event.host)}
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
                                href={`https://lu.ma/${event.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View Event
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
