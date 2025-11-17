import { useState } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Info } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface UniFiParams {
  id?: string;
  ap?: string;
  t?: string;
  url?: string;
  ssid?: string;
  mac?: string;
}

interface GuestFormProps {
  onBack: () => void;
  onSuccess: (data: { message: string; networkName: string; duration: string; speedLimit: string }) => void;
  unifiParams: UniFiParams;
}

interface GuestFormData {
  name: string;
  email: string;
  telegramUsername: string;
  host: string;
  phone: string;
  tourInterest?: "yes" | "maybe" | "no";
}

export default function GuestForm({ onBack, onSuccess, unifiParams }: GuestFormProps) {
  const [formData, setFormData] = useState<GuestFormData>({
    name: "",
    email: "",
    telegramUsername: "",
    host: "",
    phone: "",
    tourInterest: undefined,
  });
  const { toast } = useToast();

  const registerMutation = useMutation({
    mutationFn: async (data: GuestFormData) => {
      const response = await apiRequest("POST", "/api/register/guest", {
        role: "guest",
        name: data.name,
        email: data.email,
        telegramUsername: data.telegramUsername,
        host: data.host,
        phone: data.phone || undefined,
        tourInterest: data.tourInterest,
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
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register guest",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof GuestFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-lg mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-green-600 text-white p-6">
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
            <h1 className="text-xl font-bold">Guest Access</h1>
            <p className="text-white/90 text-sm mt-1">Welcome! Please provide your information</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

            <div className="space-y-3">
              <Label>Are you interested in a tour of Frontier Tower?</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={formData.tourInterest === "yes" ? "default" : "outline"}
                  className="h-12"
                  onClick={() => setFormData(prev => ({ ...prev, tourInterest: "yes" }))}
                  data-testid="button-tour-yes"
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={formData.tourInterest === "maybe" ? "default" : "outline"}
                  className="h-12"
                  onClick={() => setFormData(prev => ({ ...prev, tourInterest: "maybe" }))}
                  data-testid="button-tour-maybe"
                >
                  Maybe
                </Button>
                <Button
                  type="button"
                  variant={formData.tourInterest === "no" ? "default" : "outline"}
                  className="h-12"
                  onClick={() => setFormData(prev => ({ ...prev, tourInterest: "no" }))}
                  data-testid="button-tour-no"
                >
                  No
                </Button>
              </div>
            </div>

            <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-300">
                <strong>Guest Access Policy:</strong> Access is limited to 8 hours. Download speeds are limited to 10 Mbps.
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 h-12 text-white"
              disabled={registerMutation.isPending}
              data-testid="button-submit"
            >
              {registerMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Get 8-Hour Access
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
