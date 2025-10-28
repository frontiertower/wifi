import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Calendar } from "lucide-react";

export default function AdminEventsTable() {
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    description: "",
    isActive: true
  });

  //todo: remove mock functionality
  const events = [
    { id: 1, name: "Tech Summit 2025", date: "2025-11-15", attendees: 45, status: "Upcoming", isActive: true },
    { id: 2, name: "Startup Networking Mixer", date: "2025-11-20", attendees: 0, status: "Upcoming", isActive: true },
    { id: 3, name: "Web3 Workshop", date: "2025-11-22", attendees: 12, status: "Upcoming", isActive: true },
    { id: 4, name: "AI Hackathon", date: "2025-10-10", attendees: 89, status: "Completed", isActive: false }
  ];

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
            data-testid="button-create-event"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
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
                Create Event
              </Button>
            </div>
          </Card>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-sm">Event Name</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Date</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Attendees</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Active</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b hover-elevate" data-testid={`row-event-${event.id}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{event.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{event.date}</td>
                  <td className="py-3 px-4 text-sm">{event.attendees}</td>
                  <td className="py-3 px-4">
                    <Badge variant={event.status === "Upcoming" ? "default" : "outline"}>
                      {event.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Switch checked={event.isActive} data-testid={`switch-active-${event.id}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
