import { useState } from "react";
import { ArrowLeft, Ticket, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { format } from "date-fns";

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

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    return new Date();
  });

  const [customEventName, setCustomEventName] = useState<string>("");
  const [selectedEventName, setSelectedEventName] = useState<string>("");

  const { toast } = useToast();

  const timezoneOffset = new Date().getTimezoneOffset();
  const dateString = format(selectedDate, "yyyy-MM-dd");

  const { data: eventsData, isLoading: eventsLoading } = useQuery<{ success: boolean; events: Array<{ id: number; name: string }> }>({
    queryKey: [`/api/events/today?offset=${timezoneOffset}&date=${dateString}`],
  });

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setSelectedDate(newDate);
      setFormData(prev => ({ ...prev, eventName: "" }));
      setSelectedEventName("");
      setCustomEventName("");
    }
  };

  const availableEvents = eventsData?.events || [];

  const handleEventSelection = (eventName: string) => {
    if (selectedEventName === eventName) {
      setSelectedEventName("");
      setFormData(prev => ({ ...prev, eventName: "" }));
      if (eventName === "Other") {
        setCustomEventName("");
      }
    } else {
      setSelectedEventName(eventName);
      if (eventName === "Other") {
        setFormData(prev => ({ ...prev, eventName: "" }));
      } else {
        setFormData(prev => ({ ...prev, eventName }));
        setCustomEventName("");
      }
    }
  };

  const isOtherSelected = selectedEventName === "Other";
  const isValidEvent = availableEvents.length === 0 
    ? customEventName.trim().length > 0 
    : (isOtherSelected ? customEventName.trim().length > 0 : selectedEventName.length > 0);

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
        description: availableEvents.length === 0 || isOtherSelected 
          ? "Please enter a custom event name." 
          : "Please select a valid event from the list.",
        variant: "destructive",
      });
      return;
    }

    const finalEventName = (availableEvents.length === 0 || isOtherSelected) ? customEventName : formData.eventName;

    registerMutation.mutate({
      ...formData,
      eventName: finalEventName
    });
  };

  const handleInputChange = (field: keyof EventFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getFormattedDate = (date: Date) => {
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
              <Label className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Event Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 justify-start text-left font-normal"
                    data-testid="button-select-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-sm text-muted-foreground">
                Showing events for {getFormattedDate(selectedDate)}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Event Name</Label>
              {eventsLoading ? (
                <p className="text-sm text-muted-foreground">Loading events...</p>
              ) : availableEvents.length === 0 ? (
                <>
                  <Input
                    id="eventName"
                    type="text"
                    value={customEventName}
                    onChange={(e) => setCustomEventName(e.target.value)}
                    required
                    placeholder="Enter event name"
                    className="h-12"
                    data-testid="input-event-name"
                  />
                  {customEventName.trim().length > 0 && (
                    <p className="text-sm text-green-600 dark:text-green-400">✓ Event name entered</p>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  {availableEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start space-x-3 p-3 rounded-lg border hover-elevate cursor-pointer"
                      onClick={() => handleEventSelection(event.name)}
                      data-testid={`event-checkbox-${event.id}`}
                    >
                      <Checkbox
                        checked={selectedEventName === event.name}
                        onCheckedChange={() => handleEventSelection(event.name)}
                        id={`event-${event.id}`}
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor={`event-${event.id}`}
                        className="flex-1 cursor-pointer font-medium"
                      >
                        {event.name}
                      </Label>
                    </div>
                  ))}
                  <div
                    className="flex items-start space-x-3 p-3 rounded-lg border hover-elevate cursor-pointer"
                    onClick={() => handleEventSelection("Other")}
                    data-testid="event-checkbox-other"
                  >
                    <Checkbox
                      checked={selectedEventName === "Other"}
                      onCheckedChange={() => handleEventSelection("Other")}
                      id="event-other"
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor="event-other"
                      className="flex-1 cursor-pointer font-medium"
                    >
                      Other
                    </Label>
                  </div>
                  {isValidEvent && !isOtherSelected && (
                    <p className="text-sm text-green-600 dark:text-green-400">✓ Valid event selected</p>
                  )}
                </div>
              )}
            </div>

            {isOtherSelected && (
              <div className="space-y-2">
                <Label htmlFor="customEventName">Custom Event Name</Label>
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
                  <p className="text-sm text-green-600 dark:text-green-400">✓ Event name entered</p>
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
