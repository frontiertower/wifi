import { useState, useEffect } from "react";
import { ArrowLeft, CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
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
import step1Image from '@assets/step 1_1763765971195.jpeg';
import step2Image from '@assets/step 2_1763765971195.jpeg';
import step3Image from '@assets/step 3_1763765971195.jpeg';
import step4Image from '@assets/step 4_1763765971195.jpeg';

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

type GuestType = "member" | "event" | "tower_member" | "visitor" | null;

interface FormData {
  name: string;
  email: string;
  telegramUsername: string;
  phone: string;
  host: string;
  eventName: string;
  floor: string;
  tourInterest: "yes" | "maybe" | "no" | "";
}

type FlowStep = 'form' | 'password' | 'congrats';

export default function UnifiedGuestForm({ onBack, onSuccess, unifiParams }: UnifiedGuestFormProps) {
  const [flowStep, setFlowStep] = useState<FlowStep>('form');
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [guestType, setGuestType] = useState<GuestType>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [requirePassword, setRequirePassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    telegramUsername: "",
    phone: "",
    host: "",
    eventName: "",
    floor: "",
    tourInterest: "",
  });
  const [pendingRegistrationData, setPendingRegistrationData] = useState<any>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    return new Date();
  });

  const [customEventName, setCustomEventName] = useState<string>("");
  const [isOtherEvent, setIsOtherEvent] = useState<boolean>(false);

  const { toast } = useToast();

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ['/api/admin/settings'],
  });

  useEffect(() => {
    if (settings) {
      setRequirePassword(settings.password_required === 'true');
    }
  }, [settings]);

  // Hide rabbit and theme toggle when showing the form
  useEffect(() => {
    if (flowStep === 'form') {
      document.body.classList.add('hide-app-header');
      return () => {
        document.body.classList.remove('hide-app-header');
      };
    }
  }, [flowStep]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const passwordParam = urlParams.get('password');
    if (passwordParam) {
      setPasswordInput(passwordParam);
    }
  }, []);

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
    } else if (pendingRegistrationData.type === "tower_member") {
      registerTowerMemberMutation.mutate(pendingRegistrationData.data);
    } else if (pendingRegistrationData.type === "visitor") {
      registerVisitorMutation.mutate(pendingRegistrationData.data);
    }
  };

  const timezoneOffset = new Date().getTimezoneOffset();
  const dateString = format(selectedDate, "yyyy-MM-dd");

  const { data: eventsData, isLoading: eventsLoading } = useQuery<{ success: boolean; events: Array<{ id: number; name: string }> }>({
    queryKey: [`/api/events/today?offset=${timezoneOffset}&date=${dateString}`],
    enabled: guestType === "event",
  });

  const { data: directoryData } = useQuery<{ success: boolean; listings: Array<{ floor: string | null }> }>({
    queryKey: ["/api/directory"],
    enabled: guestType === "tower_member",
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
  
  const availableFloors = directoryData?.listings
    .map(listing => listing.floor)
    .filter((floor): floor is string => floor !== null && floor !== "")
    .filter((floor, index, self) => self.indexOf(floor) === index)
    .sort((a, b) => {
      const numA = parseInt(a.match(/(\d+)/)?.[1] || "999");
      const numB = parseInt(b.match(/(\d+)/)?.[1] || "999");
      return numA - numB;
    }) || [];
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

  const registerTowerMemberMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/register/member", {
        role: "member",
        name: data.name,
        email: data.email,
        telegramUsername: data.telegramUsername,
        phone: data.phone || undefined,
        floor: data.floor,
        tourInterest: data.tourInterest || undefined,
        unifiParams: unifiParams,
      });
      return response.json();
    },
    onSuccess: (data) => {
      onSuccess({
        message: "Welcome! You are now connected to Frontier Tower WiFi.",
        networkName: "FrontierTower",
        duration: "30 days",
        speedLimit: "Full-speed"
      });
    },
    onError: (error) => {
      setFlowStep('password');
      setPasswordInput("");
      setPasswordError("");
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register as tower member. Please try again.",
        variant: "destructive",
      });
    },
  });

  const registerVisitorMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/register/guest", {
        role: "guest",
        name: data.name,
        email: data.email,
        telegramUsername: data.telegramUsername,
        host: "Visitor",
        phone: data.phone || undefined,
        tourInterest: data.tourInterest || undefined,
        unifiParams: unifiParams,
      });
      return response.json();
    },
    onSuccess: (data) => {
      onSuccess({
        message: "Welcome! You are now connected to Frontier Tower WiFi.",
        networkName: "FrontierTower",
        duration: "24 hours",
        speedLimit: "Full-speed"
      });
    },
    onError: (error) => {
      setFlowStep('password');
      setPasswordInput("");
      setPasswordError("");
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register as visitor. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextStep = requirePassword ? 'password' : 'congrats';

    if (guestType === "member") {
      setPendingRegistrationData({
        type: "member",
        data: formData
      });
      setFlowStep(nextStep);
    } else if (guestType === "tower_member") {
      if (!formData.floor) {
        toast({
          title: "Floor Required",
          description: "Please select your community floor.",
          variant: "destructive",
        });
        return;
      }
      setPendingRegistrationData({
        type: "tower_member",
        data: formData
      });
      setFlowStep(nextStep);
    } else if (guestType === "visitor") {
      setPendingRegistrationData({
        type: "visitor",
        data: formData
      });
      setFlowStep(nextStep);
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
      setFlowStep(nextStep);
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

  const isSubmitting = registerMemberGuestMutation.isPending || registerEventGuestMutation.isPending || registerTowerMemberMutation.isPending || registerVisitorMutation.isPending;

  // Show password verification screen after form submission
  if (flowStep === 'password') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <div className="max-w-lg mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6">
              <Button
                onClick={() => setFlowStep('form')}
                variant="ghost"
                size="sm"
                className="mb-4"
                data-testid="button-back"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-xl font-bold">WiFi Password</h1>
              <p className="text-muted-foreground text-sm mt-1">Almost done! Just ask your host for the password for the WiFi</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Almost done! Please ask your host for the password to the WiFi! Enter the password below.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">WiFi Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError("");
                  }}
                  required
                  placeholder="Enter WiFi password"
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
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden p-8">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2" data-testid="heading-registration-complete">
                Configure Secure Wi-Fi
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Now connect to WiFi using one of the methods below
              </p>
            </div>
            
            {isSubmitting ? (
              <div className="flex justify-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-300 dark:border-gray-700 rounded-lg">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
                    Option 1: Manual Connection (All Devices)
                  </p>
                  <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-2 mb-3">
                    <li>1. <strong>Disconnect</strong> from the Guest network</li>
                    <li>2. <strong>Connect</strong> to the secure network "FrontierTower"</li>
                    <li>3. Enter the password below when prompted</li>
                  </ol>
                  <div className="bg-white dark:bg-gray-900/50 rounded p-3 text-sm">
                    <p className="text-gray-900 dark:text-gray-100">
                      <strong>Network Name:</strong> FrontierTower
                    </p>
                    <p className="text-gray-900 dark:text-gray-100">
                      <strong>Password:</strong> frontiertower995
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg">
                  <p className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-3">
                    Option 2: Quick Setup (iOS/Mac)
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                    Install this profile to automatically connect to FrontierTower WiFi
                  </p>
                  <Button
                    asChild
                    variant="default"
                    className="w-full mb-4"
                    data-testid="button-install-wifi-profile"
                  >
                    <a href="/api/wifi-profile">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Install WiFi Profile
                    </a>
                  </Button>
                  
                  <Button
                    onClick={() => setShowInstructions(!showInstructions)}
                    variant="ghost"
                    className="w-full flex items-center justify-between text-left p-2 h-auto"
                    data-testid="button-toggle-instructions"
                  >
                    <div className="text-left">
                      <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">How to Install WiFi Profile</h4>
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        Step-by-step installation guide
                      </p>
                    </div>
                    {showInstructions ? (
                      <ChevronUp className="w-4 h-4 text-blue-800 dark:text-blue-200 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-blue-800 dark:text-blue-200 flex-shrink-0" />
                    )}
                  </Button>

                  {showInstructions && (
                    <div className="mt-4 space-y-4" data-testid="wifi-instructions">
                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold" data-testid="badge-step-1">
                      1
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Profile Downloaded</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        After downloading, you'll see this confirmation. Tap "Close" to continue.
                      </p>
                      <img 
                        src={step1Image} 
                        alt="Step 1: Profile Downloaded screen" 
                        className="rounded-lg border w-full max-w-sm mx-auto"
                        data-testid="img-step-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold" data-testid="badge-step-2">
                      2
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Open Settings</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Go to Settings app and look for "Profile Downloaded" notification.
                      </p>
                      <img 
                        src={step2Image} 
                        alt="Step 2: Settings showing Profile Downloaded notification" 
                        className="rounded-lg border w-full max-w-sm mx-auto"
                        data-testid="img-step-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold" data-testid="badge-step-3">
                      3
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Review Profile Details</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Review the WiFi Configuration profile and tap "Install" in the top right.
                      </p>
                      <img 
                        src={step3Image} 
                        alt="Step 3: Install Profile screen with WiFi Configuration details" 
                        className="rounded-lg border w-full max-w-sm mx-auto"
                        data-testid="img-step-3"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold" data-testid="badge-step-4">
                      4
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Confirm Installation</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        You'll see a warning about unsigned profile. This is normal - tap "Install" to complete the setup.
                      </p>
                      <img 
                        src={step4Image} 
                        alt="Step 4: Warning screen about unsigned profile" 
                        className="rounded-lg border w-full max-w-sm mx-auto"
                        data-testid="img-step-4"
                      />
                    </div>
                  </div>
                </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-2">
                        <p className="text-sm text-blue-700 dark:text-blue-200">
                          <strong>Note:</strong> Once installed, your device will automatically connect to FrontierTower WiFi whenever you're in the building!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
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
      <div className="max-w-lg mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 pb-3">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="mb-4"
              data-testid="button-back"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold">Get WiFi Access</h1>
            <p className="text-muted-foreground text-sm mt-1">Welcome! Please provide your information</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pb-6 pt-3 space-y-4">
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
              <div className="pt-2">
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
                    <span className="font-semibold">Event Guest</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                    onClick={() => setGuestType("tower_member")}
                    data-testid="button-tower-member"
                  >
                    <span className="font-semibold">Tower Member</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                    onClick={() => setGuestType("visitor")}
                    data-testid="button-visitor"
                  >
                    <span className="font-semibold">Visitor</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Tower Member - Floor Selection */}
            {guestType === "tower_member" && (
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
                  <Label htmlFor="floor">Community Floor</Label>
                  <Select value={formData.floor} onValueChange={(value) => handleInputChange("floor", value)}>
                    <SelectTrigger className="h-12" data-testid="select-floor">
                      <SelectValue placeholder="Select your floor" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFloors.map((floor) => (
                        <SelectItem key={floor} value={floor}>
                          {floor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
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

            {/* Event Guest - Event Details */}
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
