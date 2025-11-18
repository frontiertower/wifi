import { useState } from "react";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface UnifiedGuestFormProps {
  onBack: () => void;
  onSuccess: (data: { message: string; networkName: string; duration: string; speedLimit: string }) => void;
  unifiParams: UniFiParams;
}

type GuestType = "member" | "event" | null;

interface FormData {
  name: string;
  email: string;
  telegramUsername: string;
  phone: string;
  host: string;
  eventName: string;
  tourInterest: "yes" | "maybe" | "no" | "";
}

type FlowStep = 'form' | 'password' | 'congrats';

export default function UnifiedGuestForm({ onBack, onSuccess, unifiParams }: UnifiedGuestFormProps) {
  const [flowStep, setFlowStep] = useState<FlowStep>('form');
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [guestType, setGuestType] = useState<GuestType>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    telegramUsername: "",
    phone: "",
    host: "",
    eventName: "",
    tourInterest: "",
  });
  const [pendingRegistrationData, setPendingRegistrationData] = useState<any>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    return new Date();
  });

  const [customEventName, setCustomEventName] = useState<string>("");
  const [isOtherEvent, setIsOtherEvent] = useState<boolean>(false);

  const { toast } = useToast();

  const verifyPasswordMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await apiRequest("POST", "/api/verify-guest-password", { password });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setPasswordError("");
        setFlowStep('congrats');
        // Complete the registration after showing congrats
        setTimeout(() => {
          completeRegistration();
        }, 100);
      } else {
        setPasswordError("Incorrect password. Please try again.");
      }
    },
    onError: () => {
      setPasswordError("Failed to verify password. Please try again.");
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim()) {
      verifyPasswordMutation.mutate(passwordInput);
    }
  };

  const completeRegistration = () => {
    if (!pendingRegistrationData) return;
    
    if (pendingRegistrationData.type === "member") {
      registerMemberGuestMutation.mutate(pendingRegistrationData.data);
    } else if (pendingRegistrationData.type === "event") {
      registerEventGuestMutation.mutate(pendingRegistrationData.data);
    }
  };

  const timezoneOffset = new Date().getTimezoneOffset();
  const dateString = format(selectedDate, "yyyy-MM-dd");

  const { data: eventsData, isLoading: eventsLoading } = useQuery<{ success: boolean; events: Array<{ id: number; name: string }> }>({
    queryKey: [`/api/events/today?offset=${timezoneOffset}&date=${dateString}`],
    enabled: guestType === "event",
  });

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setSelectedDate(newDate);
      setFormData(prev => ({ ...prev, eventName: "" }));
      setIsOtherEvent(false);
      setCustomEventName("");
    }
  };

  const availableEvents = eventsData?.events || [];
  const availableEventNames = availableEvents.map((event) => event.name);

  const isValidEvent = 
    availableEvents.length === 0 
      ? customEventName.trim().length > 0 
      : (isOtherEvent ? customEventName.trim().length > 0 : availableEventNames.includes(formData.eventName));

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

  const registerMemberGuestMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/register/guest", {
        role: "guest",
        name: data.name,
        email: data.email,
        telegramUsername: data.telegramUsername,
        host: data.host,
        phone: data.phone || undefined,
        tourInterest: data.tourInterest || undefined,
        unifiParams: unifiParams,
      });
      return response.json();
    },
    onSuccess: (data) => {
      onSuccess({
        message: "You are now connected to Frontier Tower Guest WiFi.",
        networkName: "Frontier-Guest",
        duration: "8 hours",
        speedLimit: "10 Mbps"
      });
    },
    onError: (error) => {
      setFlowStep('password');
      setPasswordInput("");
      setPasswordError("");
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register guest. Please try again.",
        variant: "destructive",
      });
    },
  });

  const registerEventGuestMutation = useMutation({
    mutationFn: async (data: FormData & { eventName: string }) => {
      const response = await apiRequest("POST", "/api/register/event", {
        role: "event",
        name: data.name,
        email: data.email,
        telegramUsername: data.telegramUsername,
        eventName: data.eventName,
        organization: "",
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
      setFlowStep('password');
      setPasswordInput("");
      setPasswordError("");
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register for event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (guestType === "member") {
      setPendingRegistrationData({
        type: "member",
        data: formData
      });
      setFlowStep('password');
    } else if (guestType === "event") {
      if (!isValidEvent) {
        toast({
          title: "Invalid Event Name",
          description: availableEvents.length === 0 || isOtherEvent 
            ? "Please enter a custom event name." 
            : "Please select a valid event from the list.",
          variant: "destructive",
        });
        return;
      }

      const finalEventName = (availableEvents.length === 0 || isOtherEvent) ? customEventName : formData.eventName;

      setPendingRegistrationData({
        type: "event",
        data: {
          ...formData,
          eventName: finalEventName
        }
      });
      setFlowStep('password');
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
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

  const isSubmitting = registerMemberGuestMutation.isPending || registerEventGuestMutation.isPending;

  // Show password verification screen after form submission
  if (flowStep === 'password') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="max-w-lg mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-blue-600 text-white p-6">
              <Button
                onClick={() => setFlowStep('form')}
                variant="ghost"
                size="sm"
                className="mb-4 text-white hover:text-white/80 hover:bg-white/10 p-0"
                data-testid="button-back"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-xl font-bold">Guest WiFi Password</h1>
              <p className="text-white/90 text-sm mt-1">Please enter the guest password to complete your connection</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Connect to WiFi:</strong><br /><br />
                  Network Name: <strong>FrontierTower</strong><br />
                  Password: <strong>frontiertower995</strong>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Guest Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError("");
                  }}
                  required
                  placeholder="Enter guest password"
                  className="h-12"
                  data-testid="input-guest-password"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-sm text-red-600 dark:text-red-400" data-testid="text-password-error">
                    {passwordError}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12"
                disabled={verifyPasswordMutation.isPending || !passwordInput.trim()}
                data-testid="button-verify-password"
              >
                {verifyPasswordMutation.isPending ? "Verifying..." : "Complete Connection"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Show congratulations screen after password verification
  if (flowStep === 'congrats') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 flex items-center justify-center">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="max-w-lg mx-auto w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden text-center p-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Congratulations!
              </h1>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
                One more step!
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Your registration is being processed. Please wait a moment...
              </p>
            </div>
            
            {isSubmitting ? (
              <div className="flex justify-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100 font-semibold mb-2">
                  Quick Setup for iOS/Mac Users
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  Install this profile to automatically connect to FrontierTower WiFi
                </p>
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="w-full"
                  data-testid="button-install-wifi-profile"
                >
                  <a href="/wifi-frontiertower_1763457398454.mobileconfig" download="FrontierTower-WiFi.mobileconfig">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Install WiFi Profile
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show form (default)
  if (flowStep === 'form') {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-lg mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white p-6">
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
            <h1 className="text-xl font-bold">Guest Login</h1>
            <p className="text-white/90 text-sm mt-1">Welcome! Please provide your information</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Basic Information - Always Visible */}
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
                placeholder="your.email@example.com"
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
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+1 (555) 123-4567 (optional)"
                className="h-12"
                data-testid="input-phone"
              />
            </div>

            {/* Guest Type Selection */}
            {!guestType && (
              <div className="pt-4 space-y-3">
                <Label className="text-base">I am a:</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300"
                    onClick={() => setGuestType("member")}
                    data-testid="button-guest-of-member"
                  >
                    <span className="font-semibold">Guest of a Member</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    onClick={() => setGuestType("event")}
                    data-testid="button-guest-at-event"
                  >
                    <span className="font-semibold">Guest at Event</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Guest of a Member - Host Contact */}
            {guestType === "member" && (
              <>
                <div className="pt-2 pb-2 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setGuestType(null)}
                    className="text-muted-foreground hover:text-foreground"
                    data-testid="button-change-guest-type"
                  >
                    ← Change guest type
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="host">Host Contact</Label>
                  <Input
                    id="host"
                    type="text"
                    value={formData.host}
                    onChange={(e) => handleInputChange("host", e.target.value)}
                    required
                    placeholder="Person you're visiting"
                    className="h-12"
                    data-testid="input-host"
                  />
                </div>
              </>
            )}

            {/* Guest at Event - Event Details */}
            {guestType === "event" && (
              <>
                <div className="pt-2 pb-2 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setGuestType(null)}
                    className="text-muted-foreground hover:text-foreground"
                    data-testid="button-change-guest-type"
                  >
                    ← Change guest type
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Event Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
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
                  <Label htmlFor="eventName">Event Name</Label>
                  {eventsLoading ? (
                    <div className="h-12 rounded-md border border-input bg-muted animate-pulse" />
                  ) : availableEvents.length > 0 ? (
                    <>
                      <Select value={isOtherEvent ? "Other Event" : formData.eventName} onValueChange={handleEventChange}>
                        <SelectTrigger className="h-12" data-testid="select-event-name">
                          <SelectValue placeholder="Select event" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableEvents.map((event) => (
                            <SelectItem key={event.id} value={event.name}>
                              {event.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="Other Event">Other Event</SelectItem>
                        </SelectContent>
                      </Select>
                      {isOtherEvent && (
                        <Input
                          type="text"
                          value={customEventName}
                          onChange={(e) => setCustomEventName(e.target.value)}
                          placeholder="Enter event name"
                          className="h-12 mt-2"
                          data-testid="input-custom-event-name"
                        />
                      )}
                    </>
                  ) : (
                    <Input
                      type="text"
                      value={customEventName}
                      onChange={(e) => setCustomEventName(e.target.value)}
                      placeholder="Enter event name"
                      className="h-12"
                      required
                      data-testid="input-event-name"
                    />
                  )}
                </div>
              </>
            )}

            {/* Tour Interest Question */}
            {guestType && (
              <div className="space-y-3 pt-2 border-t">
                <Label className="text-base">Are you interested in a tour of Frontier Tower?</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className={`h-12 toggle-elevate ${formData.tourInterest === "yes" ? "toggle-elevated" : ""}`}
                    onClick={() => handleInputChange("tourInterest", "yes")}
                    data-testid="button-tour-yes"
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={`h-12 toggle-elevate ${formData.tourInterest === "maybe" ? "toggle-elevated" : ""}`}
                    onClick={() => handleInputChange("tourInterest", "maybe")}
                    data-testid="button-tour-maybe"
                  >
                    Maybe
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={`h-12 toggle-elevate ${formData.tourInterest === "no" ? "toggle-elevated" : ""}`}
                    onClick={() => handleInputChange("tourInterest", "no")}
                    data-testid="button-tour-no"
                  >
                    No
                  </Button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            {guestType && (
              <Button 
                type="submit" 
                className="w-full h-12" 
                disabled={isSubmitting}
                data-testid="button-submit"
              >
                {isSubmitting ? "Connecting..." : "Connect to WiFi"}
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
  }
  
  return null;
}
