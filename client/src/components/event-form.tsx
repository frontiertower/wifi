import { useState } from "react";
import { ArrowLeft, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface UniFiParams {
  id?: string;
  ap?: string;
  t?: string;
  url?: string;
  ssid?: string;
  mac?: string;
}

interface EventFormProps {
  onBack: () => void;
  onSuccess: (data: { message: string; networkName: string; duration: string; speedLimit: string }) => void;
  unifiParams: UniFiParams;
}

interface EventFormData {
  eventName: string;
  name: string;
  email: string;
  telegramUsername: string;
  organization: string;
}

export default function EventForm({ onBack, onSuccess, unifiParams }: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    eventName: "",
    name: "",
    email: "",
    telegramUsername: "",
    organization: "",
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [customEventName, setCustomEventName] = useState<string>("");
  const [isOtherEvent, setIsOtherEvent] = useState<boolean>(false);

  const { toast } = useToast();

  const timezoneOffset = new Date().getTimezoneOffset();

  const { data: eventsData, isLoading: eventsLoading } = useQuery<{ success: boolean; events: Array<{ id: number; name: string }> }>({
    queryKey: [`/api/events/today?offset=${timezoneOffset}&date=${selectedDate}`],
  });

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setFormData(prev => ({ ...prev, eventName: "" }));
    setIsOtherEvent(false);
    setCustomEventName("");
  };

  const availableEvents = eventsData?.events?.map((event) => event.name) || [];

  const isValidEvent = isOtherEvent ? customEventName.trim().length > 0 : availableEvents.includes(formData.eventName);

  const handleEventChange = (value: string) => {
    if (value === "Other Event") {
      setIsOtherEvent(true);
      setFormData(prev => ({ ...prev, eventName: "" }));
    } else {
      setIsOtherEvent(false);
      setCustomEventName("");
      handleInputChange("eventName", value);
    }
  };

  const registerMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const response = await apiRequest("POST", "/api/register/event", {
        role: "event",
        name: data.name,
        email: data.email,
        telegramUsername: data.telegramUsername,
        eventName: data.eventName,
        organization: data.organization,
        unifiParams: unifiParams,
      });
      return response.json();
    },
    onSuccess: (data) => {
      onSuccess({
        message: "You are now connected to the event WiFi network.",
        networkName: "Frontier-Event",
        duration: "24 hours",
        speedLimit: "High-speed"
      });
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register for event",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEvent) {
      toast({
        title: "Invalid Event Name",
        description: isOtherEvent ? "Please enter a custom event name." : "Please select a valid event from the list.",
        variant: "destructive",
      });
      return;
    }

    const finalEventName = isOtherEvent ? customEventName : formData.eventName;

    registerMutation.mutate({
      ...formData,
      eventName: finalEventName
    });
  };

  const handleInputChange = (field: keyof EventFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getFormattedDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    };
    const formatted = date.toLocaleDateString('en-US', options);

    const day = date.getDate();
    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    else if (day === 2 || day === 22) suffix = 'nd';
    else if (day === 3 || day === 23) suffix = 'rd';

    return formatted.replace(/\d+/, `${day}${suffix}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-lg mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-orange-600 text-white p-6">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="mb-4 text-white hover:text-white/80 hover:bg-white/10 p-0"
              data-testid="button-back"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold">Event Access</h1>
            <p className="text-white/90 text-sm mt-1">Conference and event attendee registration</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Event Date
              </Label>
              <Input
                id="eventDate"
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="h-12"
                data-testid="input-event-date"
              />
              <p className="text-sm text-gray-600">
                Showing events for {getFormattedDate(selectedDate)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name</Label>
              <Select
                value={isOtherEvent ? "Other Event" : formData.eventName}
                onValueChange={handleEventChange}
                required
                disabled={eventsLoading}
              >
                <SelectTrigger className="h-12" data-testid="select-event-name">
                  <SelectValue placeholder={eventsLoading ? "Loading events..." : "Select an event"} />
                </SelectTrigger>
                <SelectContent>
                  {availableEvents.map((event) => (
                    <SelectItem key={event} value={event}>
                      {event}
                    </SelectItem>
                  ))}
                  <SelectItem value="Other Event">Other Event</SelectItem>
                </SelectContent>
              </Select>
              {eventsLoading && (
                <p className="text-sm text-gray-500">Loading today's events...</p>
              )}
              {!eventsLoading && availableEvents.length === 0 && !isOtherEvent && (
                <p className="text-sm text-orange-600">⚠ No scheduled events found. Select "Other Event" to enter a custom event name.</p>
              )}
              {isValidEvent && !isOtherEvent && (
                <p className="text-sm text-green-600">✓ Valid event selected</p>
              )}
              {formData.eventName && !isValidEvent && !eventsLoading && !isOtherEvent && (
                <p className="text-sm text-red-600">✗ Please select a valid event</p>
              )}
            </div>

            {isOtherEvent && (
              <div className="space-y-2">
                <Label htmlFor="customEventName">Event Name</Label>
                <Input
                  id="customEventName"
                  type="text"
                  value={customEventName}
                  onChange={(e) => setCustomEventName(e.target.value)}
                  required
                  placeholder="Enter event name"
                  className="h-12"
                  data-testid="input-custom-event-name"
                />
                {customEventName.trim().length > 0 && (
                  <p className="text-sm text-green-600">✓ Event name entered</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                placeholder="Enter your full name"
                className="h-12"
                data-testid="input-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                placeholder="your.email@company.com"
                className="h-12"
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegramUsername">Telegram Username</Label>
              <Input
                id="telegramUsername"
                type="text"
                value={formData.telegramUsername}
                onChange={(e) => handleInputChange("telegramUsername", e.target.value)}
                placeholder="@username (optional)"
                className="h-12"
                data-testid="input-telegram"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                type="text"
                value={formData.organization}
                onChange={(e) => handleInputChange("organization", e.target.value)}
                required
                placeholder="Company or organization name"
                className="h-12"
                data-testid="input-organization"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-white"
              disabled={registerMutation.isPending || !isValidEvent || eventsLoading}
              data-testid="button-submit"
            >
              {registerMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <Ticket className="mr-2 h-4 w-4" />
                  Join Event Network
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
