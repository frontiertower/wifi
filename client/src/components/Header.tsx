import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoImage from '@assets/generated_images/Frontier_Tower_WiFi_logo_bc6f89e2.png';
import SlidingWelcome from "@/components/SlidingWelcome";

interface UserInfo {
  id: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

interface AuthResponse {
  authenticated: boolean;
  user?: UserInfo;
}

export default function Header() {
  const { toast } = useToast();

  // Check authentication status
  const { data: auth, isLoading } = useQuery<AuthResponse>({
    queryKey: ["/api/auth/me"],
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/login");
      const data = await response.json();
      
      if (data.success && data.loginUrl) {
        window.location.href = data.loginUrl;
      } else {
        throw new Error(data.message || "Failed to initiate login");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    },
    onError: () => {
      toast({
        title: "Logout Failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <header className="w-full border-b bg-card" data-testid="header-main">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="Frontier Tower" className="h-10 w-10" />
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              <SlidingWelcome speed={2000} />
            </h1>
            <p className="text-xs text-muted-foreground">WiFi Portal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!isLoading && (
            auth?.authenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground hidden sm:inline">
                    {auth.user?.email || auth.user?.name || `User ${auth.user?.id}`}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => loginMutation.mutate()}
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Member Login
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
