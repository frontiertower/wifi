import { useState } from "react";
import { ArrowLeft, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";

interface UniFiParams {
  id?: string;
  ap?: string;
  t?: string;
  url?: string;
  ssid?: string;
  mac?: string;
}

interface MemberFormProps {
  onBack: () => void;
  onSuccess: (data: { message: string; networkName: string; duration: string; speedLimit: string }) => void;
  unifiParams: UniFiParams;
}

interface MemberFormData {
  name: string;
  email: string;
  phone: string;
  telegramUsername: string;
  floor: string;
}

export default function MemberForm({ onBack, onSuccess, unifiParams }: MemberFormProps) {
  const [formData, setFormData] = useState<MemberFormData>({
    name: "",
    email: "",
    phone: "",
    telegramUsername: "",
    floor: "",
  });
  const { toast } = useToast();

  const registerMutation = useMutation({
    mutationFn: async (data: MemberFormData) => {
      const response = await apiRequest("POST", "/api/register/member", {
        role: "member",
        name: data.name,
        email: data.email,
        phone: data.phone,
        telegramUsername: data.telegramUsername,
        floor: data.floor,
        unifiParams: unifiParams,
      });
      return response.json();
    },
    onSuccess: (data) => {
      onSuccess({
        message: "You are now connected to Frontier Tower WiFi network.",
        networkName: "Frontier-Member",
        duration: "24 hours",
        speedLimit: "Unlimited"
      });
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register member",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof MemberFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-lg mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-primary text-primary-foreground p-6">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="mb-4 text-primary-foreground hover:text-primary-foreground/80 hover:bg-white/10 p-0"
              data-testid="button-back"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold">Member Access</h1>
            <p className="text-primary-foreground/80 text-sm mt-1">Please provide your member details</p>
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
                placeholder="John Doe"
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
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+1-555-123-4567 (optional)"
                className="h-12"
                data-testid="input-phone"
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
              <Label htmlFor="floor">Floor Number</Label>
              <Select value={formData.floor} onValueChange={(value) => handleInputChange("floor", value)} required>
                <SelectTrigger className="h-12" data-testid="select-floor">
                  <SelectValue placeholder="Select your floor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unknown">I don't know</SelectItem>
                  <SelectItem value="2">2nd Floor - Private Offices</SelectItem>
                  <SelectItem value="3">3rd Floor - Private Offices</SelectItem>
                  <SelectItem value="4">4th Floor - Robotics</SelectItem>
                  <SelectItem value="6">6th Floor - Arts & Music</SelectItem>
                  <SelectItem value="7">7th Floor - Makerspace</SelectItem>
                  <SelectItem value="8">8th Floor - Biotech & Neurotech</SelectItem>
                  <SelectItem value="9">9th Floor - AI</SelectItem>
                  <SelectItem value="10">10th Floor - Accelerate</SelectItem>
                  <SelectItem value="11">11th Floor - Longevity</SelectItem>
                  <SelectItem value="12">12th Floor - Ethereum House</SelectItem>
                  <SelectItem value="14">14th Floor - Human Flourishing</SelectItem>
                  <SelectItem value="15">15th Floor - Poly-floorous</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-white"
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
                  <Wifi className="mr-2 h-4 w-4" />
                  Connect to Network
                </>
              )}
            </Button>

            <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
              By connecting, you agree to our terms of service
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
