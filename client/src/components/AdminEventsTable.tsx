import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Calendar } from "lucide-react";
import { format } from "date-fns";

type EventFilter = "upcoming" | "past";

export default function AdminEventsTable() {
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventFilter, setEventFilter] = useState<EventFilter>("upcoming");
  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    description: "",
    isActive: true
  });

  const { data: events = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/events"],
  });

  const now = new Date();
  const filteredEvents = events.filter((event) => {
    const endDate = new Date(event.endDate);
    if (eventFilter === "upcoming") {
      return endDate >= now;
    } else {
      return endDate < now;
    }
  });

  const handleCreateEvent = () => {
    console.log('Creating event:', newEvent);
    setShowEventForm(false);
    setNewEvent({ name: "", date: "", description: "", isActive: true });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Event Management</h2>
          <Button
            onClick={() => setShowEventForm(!showEventForm)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            data-testid="button-create-event"
          >
            <Plus className="w-4 h-4 mr-2" />
            Import Events
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={eventFilter === "upcoming" ? "default" : "outline"}
            onClick={() => setEventFilter("upcoming")}
            data-testid="button-filter-upcoming"
          >
            Upcoming
          </Button>
          <Button
            variant={eventFilter === "past" ? "default" : "outline"}
            onClick={() => setEventFilter("past")}
            data-testid="button-filter-past"
          >
            Past Events
          </Button>
        </div>

        {showEventForm && (
          <Card className="p-4 mb-6 bg-muted/50">
            <h3 className="font-medium mb-4">Create New Event</h3>
            <div className="space-y-4">
              <div>
                <Label>Event Name</Label>
                <Input
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  placeholder="Enter event name"
                  data-testid="input-event-name"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Event Date</Label>
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    data-testid="input-event-date"
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newEvent.isActive}
                      onCheckedChange={(checked) => setNewEvent({ ...newEvent, isActive: checked })}
                      data-testid="switch-event-active"
                    />
                    <Label>Active</Label>
                  </div>
                </div>
              </div>
              <div>
                <Label>Description (Optional)</Label>
                <Input
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Event description"
                  data-testid="input-event-description"
                />
              </div>
              <Button onClick={handleCreateEvent} data-testid="button-save-event">
                Import Events
              </Button>
            </div>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No {eventFilter} events found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm">Event Name</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Location</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Host</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Attendees</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => {
                  const startDate = new Date(event.startDate);
                  const endDate = new Date(event.endDate);
                  
                  return (
                    <tr key={event.id} className="border-b hover-elevate" data-testid={`row-event-${event.id}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{event.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {format(startDate, "MMM d, yyyy")}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {event.location || event.originalLocation || "-"}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {event.host || "-"}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {event.currentAttendees || 0} {event.maxAttendees ? `/ ${event.maxAttendees}` : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
