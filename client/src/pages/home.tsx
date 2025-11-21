import { useState, useEffect } from "react";
import { Brain, Calendar, UserPlus, Wifi, Briefcase, MessageCircle, Building2, Camera, Link2, DoorOpen, PartyPopper, LogIn } from "lucide-react";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import MemberForm from "@/components/member-form";
import UnifiedGuestForm from "@/components/unified-guest-form";
import SlidingWelcome from "@/components/SlidingWelcome";
import frontierTowerQR from "@assets/frontier-tower-qr.png";

type Role = "member" | "guest" | null;

interface SuccessData {
  message: string;
  networkName: string;
  duration: string;
  speedLimit: string;
}

interface UniFiParams {
  id?: string;
  ap?: string;
  t?: string;
  url?: string;
  ssid?: string;
  mac?: string;
}

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [unifiParams, setUnifiParams] = useState<UniFiParams>({});

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const params: UniFiParams = {
      id: urlParams.get('id') || undefined,
      ap: urlParams.get('ap') || undefined,
      t: urlParams.get('t') || undefined,
      url: urlParams.get('url') || undefined,
      ssid: urlParams.get('ssid') || undefined,
      mac: urlParams.get('mac') || undefined,
    };
    setUnifiParams(params);
    console.log('UniFi Parameters:', params);
  }, []);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleBack = () => {
    setSelectedRole(null);
  };

  const handleMemberLogin = () => {
    window.location.href = '/api/auth/login';
  };

  const handleSuccess = async (data: SuccessData) => {
    // Call authorize-guest endpoint to grant internet access
    try {
      const authResponse = await fetch('/api/authorize-guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          acceptTou: "true",
          accessPointMacAddress: unifiParams.ap || "unknown",
          macAddress: unifiParams.id || unifiParams.mac || "unknown",
        }),
      });

      const authData = await authResponse.json();
      
      if (authData.payload?.valid) {
        console.log('✓ Guest authorized for internet access');
        
        // UniFi Captive Portal: Redirect to original URL if provided
        if (unifiParams.url) {
          console.log('→ Redirecting to original URL:', unifiParams.url);
          window.location.href = decodeURIComponent(unifiParams.url);
          return;
        }
      } else {
        console.warn('⚠️ Authorization response:', authData);
      }
    } catch (error) {
      console.error('✗ Authorization error:', error);
    }
    
    // Registration complete - no modal needed
  };

  return (
    <>
      {selectedRole === "member" && (
        <MemberForm onBack={handleBack} onSuccess={handleSuccess} unifiParams={unifiParams} />
      )}

      {selectedRole === "guest" && (
        <UnifiedGuestForm onBack={handleBack} onSuccess={handleSuccess} unifiParams={unifiParams} />
      )}

      {!selectedRole && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-primary dark:bg-primary text-primary-foreground p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">
              <SlidingWelcome speed={2000} />
            </h1>
          </div>

          <div className="p-6">
            <button
              onClick={handleMemberLogin}
              className="w-full mb-3 p-4 border-2 border-green-200 dark:border-green-600 rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 text-left group bg-green-50 dark:bg-green-900/10"
              data-testid="button-member-login"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-500/30 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 dark:group-hover:bg-green-500/40">
                  <LogIn className="text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">Member Login</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Sign in with your Frontier Tower account</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect("guest")}
              className="w-full mb-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 text-left group"
              data-testid="button-select-guest"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/30 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-500/40">
                  <Wifi className="text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">WiFi Access</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Connect to super fast Internet</div>
                </div>
              </div>
            </button>

            <Link
              href="/directory"
              className="w-full mb-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 text-left group block"
              data-testid="button-view-directory"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/30 rounded-lg flex items-center justify-center mr-3 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-500/40">
                  <Building2 className="text-indigo-600 dark:text-indigo-300" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">Building Directory</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Browse companies and members</div>
                </div>
              </div>
            </Link>

            <Link
              href="/events"
              className="w-full mb-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 text-left group block"
              data-testid="button-view-events"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/30 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-500/40">
                  <Calendar className="text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">Events Calendar</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Discover what's happening</div>
                </div>
              </div>
            </Link>

            <Link
              href="/rent-office"
              className="w-full mb-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200 text-left group block"
              data-testid="button-rent-office"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/30 rounded-lg flex items-center justify-center mr-3 group-hover:bg-amber-200 dark:group-hover:bg-amber-500/40">
                  <DoorOpen className="text-amber-600 dark:text-amber-300" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">Rent a Private Office</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Explore private office spaces</div>
                </div>
              </div>
            </Link>

            <Link
              href="/tour"
              className="w-full mb-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 text-left group block"
              data-testid="button-book-tour"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/30 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-200 dark:group-hover:bg-orange-500/40">
                  <UserPlus className="text-orange-600 dark:text-orange-300" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">Book an Office Tour</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">See the offices and amenities</div>
                </div>
              </div>
            </Link>

            <Link
              href="/apply-to-join"
              className="w-full mb-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 text-left group block"
              data-testid="button-apply-to-join"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/30 rounded-lg flex items-center justify-center mr-3 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/40">
                  <UserPlus className="text-emerald-600 dark:text-emerald-300" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">Membership Inquiry</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Become a Frontier Tower member</div>
                </div>
              </div>
            </Link>

            <Link
              href="/event-host-booking"
              className="w-full mb-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-200 text-left group block"
              data-testid="button-host-event"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-500/30 rounded-lg flex items-center justify-center mr-3 group-hover:bg-pink-200 dark:group-hover:bg-pink-500/40">
                  <PartyPopper className="text-pink-600 dark:text-pink-300" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">Host Your Event</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Setup a call to discuss an event</div>
                </div>
              </div>
            </Link>

            <Link
              href="/chat"
              className="w-full mb-4 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all duration-200 text-left group block"
              data-testid="button-join-discussion"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-500/30 rounded-lg flex items-center justify-center mr-3 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-500/40">
                  <MessageCircle className="text-cyan-600 dark:text-cyan-300" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">Chat with Us</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Ask us anything or share feedback</div>
                </div>
              </div>
            </Link>

            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Share with your friends
              </p>
              <div className="flex justify-center">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600">
                  <img 
                    src={frontierTowerQR}
                    alt="QR Code for thefrontiertower.com"
                    className="w-40 h-40"
                    data-testid="qr-code-share"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Scan to visit thefrontiertower.com
              </p>
            </div>
          </div>
        </div>
        </div>
      )}
    </>
  );
}
