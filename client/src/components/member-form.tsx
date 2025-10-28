import { useState } from "react";
import { ArrowLeft, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  email: string;
  telegramUsername: string;
  floor: string;
  agreeToTerms: boolean;
}

export default function MemberForm({ onBack, onSuccess, unifiParams }: MemberFormProps) {
  const [formData, setFormData] = useState<MemberFormData>({
    email: "",
    telegramUsername: "",
    floor: "",
    agreeToTerms: false,
  });
  const { toast } = useToast();

  const registerMutation = useMutation({
    mutationFn: async (data: MemberFormData) => {
      const response = await apiRequest("POST", "/api/register/member", {
        role: "member",
        email: data.email,
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

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "You must agree to the network usage policy to continue.",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof MemberFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
              <Label htmlFor="floor">Floor Number</Label>
              <Select value={formData.floor} onValueChange={(value) => handleInputChange("floor", value)} required>
                <SelectTrigger className="h-12" data-testid="select-floor">
                  <SelectValue placeholder="Select your floor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B1">B1 - Basement</SelectItem>
                  <SelectItem value="G">G - Ground Floor</SelectItem>
                  <SelectItem value="1">1st Floor</SelectItem>
                  <SelectItem value="2">2nd Floor</SelectItem>
                  <SelectItem value="3">3rd Floor</SelectItem>
                  <SelectItem value="4">4th Floor</SelectItem>
                  <SelectItem value="5">5th Floor</SelectItem>
                  <SelectItem value="6">6th Floor</SelectItem>
                  <SelectItem value="7">7th Floor</SelectItem>
                  <SelectItem value="8">8th Floor</SelectItem>
                  <SelectItem value="9">9th Floor</SelectItem>
                  <SelectItem value="10">10th Floor</SelectItem>
                  <SelectItem value="11">11th Floor</SelectItem>
                  <SelectItem value="12">12th Floor</SelectItem>
                  <SelectItem value="14">14th Floor</SelectItem>
                  <SelectItem value="15">15th Floor</SelectItem>
                  <SelectItem value="16">16th Floor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => handleInputChange("agreeToTerms", !!checked)}
                required
                data-testid="checkbox-terms"
              />
              <Label htmlFor="terms" className="text-sm text-gray-600 leading-tight">
                I agree to the network usage policy and understand that my activity may be monitored for security purposes.
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary-500 hover:bg-primary-600 h-12 text-white"
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
          </form>
        </div>
      </div>
    </div>
  );
}
