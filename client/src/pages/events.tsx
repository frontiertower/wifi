import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, Users, ExternalLink, History, ArrowLeft, LayoutGrid, List as ListIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow, isPast, isFuture, isToday } from "date-fns";
import { Link } from "wouter";
import type { Event } from "@shared/schema";

interface EventsResponse {
  success: boolean;
  events: Event[];
}

export default function Events() {
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());
  const { data, isLoading } = useQuery<EventsResponse>({
    queryKey: ['/api/events'],
  });

  const toggleEventExpand = (eventId: number) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  // Deduplicate events by merging Luma and Frontier Tower sources
  const deduplicateEvents = (events: Event[]): Event[] => {
    const eventMap = new Map<string, Event[]>();
    
    // Group events by name
    events.forEach(event => {
      const key = event.name.trim().toLowerCase();
      if (!eventMap.has(key)) {
        eventMap.set(key, []);
      }
      eventMap.get(key)!.push(event);
    });
    
    // Merge duplicates
    const deduplicated: Event[] = [];
    eventMap.forEach((duplicates) => {
      if (duplicates.length === 1) {
        deduplicated.push(duplicates[0]);
      } else {
        // Find Luma and Frontier Tower versions
        const lumaEvent = duplicates.find(e => e.source === 'luma');
        const ftEvent = duplicates.find(e => e.source === 'frontier-tower');
        
        // Merge: prefer Luma for URL/imageUrl, Frontier Tower for description
        const merged: Event = {
          ...(lumaEvent || ftEvent || duplicates[0]),
          // Prefer Luma URL and image
          url: lumaEvent?.url || ftEvent?.url || duplicates[0].url,
          imageUrl: lumaEvent?.imageUrl || ftEvent?.imageUrl || duplicates[0].imageUrl,
          // Prefer Frontier Tower description (usually better)
          description: ftEvent?.description || lumaEvent?.description || duplicates[0].description,
        };
        
        deduplicated.push(merged);
      }
    });
    
    return deduplicated;
  };

  const events = deduplicateEvents(data?.events || []);
  const now = new Date();
  const upcomingEvents = events.filter(event => new Date(event.endDate) >= now);

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
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4"
              data-testid="button-back-home"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <h1 className="text-3xl font-bold">Events</h1>
              <div className="flex items-center gap-2">
                <Button
                  variant={layoutMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLayoutMode('grid')}
                  data-testid="button-layout-grid"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={layoutMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLayoutMode('list')}
                  data-testid="button-layout-list"
                >
                  <ListIcon className="w-4 h-4" />
                </Button>
                <Link href="/past-events">
                  <Button variant="outline" size="sm" data-testid="button-past-events">
                    <History className="w-4 h-4 mr-2" />
                    Past
                  </Button>
                </Link>
              </div>
            </div>
            <p className="text-muted-foreground">Discover what's happening at Frontier Tower</p>
          </div>
        </div>

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
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-12" data-testid="no-events-message">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">No Upcoming Events</h2>
            <p className="text-muted-foreground mb-4">Check back later for upcoming events</p>
            <Link href="/past-events">
              <Button variant="outline" data-testid="button-view-past-events">
                <History className="w-4 h-4 mr-2" />
                View Past Events
              </Button>
            </Link>
          </div>
        ) : layoutMode === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => {
              const start = new Date(event.startDate);
              const end = new Date(event.endDate);

              return (
                <Card
                  key={event.id}
                  className="overflow-hidden hover-elevate transition-all"
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
                          {format(new Date(event.startDate), "MMM d, yyyy")}
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

                    {event.currentAttendees && event.currentAttendees > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-muted-foreground">Attendees</span>
                          <span className="font-medium" data-testid={`text-attendees-${event.id}`}>
                            {event.currentAttendees}
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
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => {
              const start = new Date(event.startDate);
              const end = new Date(event.endDate);
              const isExpanded = expandedEvents.has(event.id);

              return (
                <Card
                  key={event.id}
                  className="overflow-hidden hover-elevate transition-all cursor-pointer"
                  data-testid={`list-event-${event.id}`}
                  onClick={() => toggleEventExpand(event.id)}
                >
                  <div className="p-4">
                    <div className="flex gap-4 items-start">
                      {event.imageUrl && (
                        <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={event.imageUrl}
                            alt={event.name}
                            className="w-full h-full object-cover"
                            data-testid={`img-list-event-${event.id}`}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold line-clamp-2 mb-2" data-testid={`text-list-event-name-${event.id}`}>
                          {event.name}
                        </h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span data-testid={`text-list-date-${event.id}`}>
                              {format(start, "MMM d")}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span data-testid={`text-list-time-${event.id}`}>
                              {format(start, "h:mm a")}
                            </span>
                          </div>

                          {cleanHostName(event.host) && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground truncate" data-testid={`text-list-host-${event.id}`}>
                                {cleanHostName(event.host)}
                              </span>
                            </div>
                          )}

                          {event.originalLocation && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground truncate" data-testid={`text-list-location-${event.id}`}>
                                {event.originalLocation}
                              </span>
                            </div>
                          )}
                        </div>

                        {cleanDescription(event.description) && (
                          <p 
                            className={`text-sm text-muted-foreground ${isExpanded ? '' : 'line-clamp-2'}`}
                            data-testid={`text-list-description-${event.id}`}
                          >
                            {cleanDescription(event.description)}
                          </p>
                        )}
                      </div>

                      {event.url && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="flex-shrink-0"
                          data-testid={`button-list-view-event-${event.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a
                            href={event.url.trim().startsWith('http') ? event.url.trim() : `https://lu.ma/${event.url.trim()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
