import { useState, useEffect } from "react";
import { Wifi, Building2, Calendar, DoorOpen, UserPlus, PartyPopper, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
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

export default function GreenHome() {
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
  }, []);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleBack = () => {
    setSelectedRole(null);
  };

  const handleSuccess = async (data: SuccessData) => {
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
        if (unifiParams.url) {
          window.location.href = decodeURIComponent(unifiParams.url);
          return;
        }
      }
    } catch (error) {
      console.error('Authorization error:', error);
    }
  };

  return (
    <div className="terminal-force-dark">
      {selectedRole === "member" && (
        <MemberForm onBack={handleBack} onSuccess={handleSuccess} unifiParams={unifiParams} />
      )}

      {selectedRole === "guest" && (
        <UnifiedGuestForm onBack={handleBack} onSuccess={handleSuccess} unifiParams={unifiParams} />
      )}

      {!selectedRole && (
        <div className="min-h-screen terminal-bg p-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="terminal-header mb-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-center text-terminal-green terminal-glow mb-2">
                <div>FRONTIER</div>
                <div>TOWER</div>
              </h1>
              <p className="text-center text-terminal-dim text-sm md:text-base">
                WELCOME TO THE NETWORK • SELECT YOUR ACCESS PROTOCOL
              </p>
            </div>

            {/* Menu Grid */}
            <div className="grid gap-4 md:grid-cols-2 mb-8">
              <button
                onClick={() => handleRoleSelect("guest")}
                className="terminal-card hover:border-terminal-green transition-all duration-200 text-left group"
                data-testid="button-select-guest"
              >
                <div className="flex items-start">
                  <Wifi className="text-terminal-green mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-terminal-green">CONNECT TO WIFI</h3>
                    <p className="text-terminal-dim text-xs mt-1">Access high-speed internet</p>
                  </div>
                </div>
              </button>

              <Link
                href="/directory"
                className="terminal-card hover:border-terminal-green transition-all duration-200 text-left group block"
                data-testid="button-view-directory"
              >
                <div className="flex items-start">
                  <Building2 className="text-terminal-green mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-terminal-green">BUILDING DIRECTORY</h3>
                    <p className="text-terminal-dim text-xs mt-1">Browse companies & members</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/events"
                className="terminal-card hover:border-terminal-green transition-all duration-200 text-left group block"
                data-testid="button-view-events"
              >
                <div className="flex items-start">
                  <Calendar className="text-terminal-green mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-terminal-green">EVENTS CALENDAR</h3>
                    <p className="text-terminal-dim text-xs mt-1">Discover what's happening</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/rent-office"
                className="terminal-card hover:border-terminal-green transition-all duration-200 text-left group block"
                data-testid="button-rent-office"
              >
                <div className="flex items-start">
                  <DoorOpen className="text-terminal-green mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-terminal-green">RENT OFFICE</h3>
                    <p className="text-terminal-dim text-xs mt-1">Private workspace options</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/tour"
                className="terminal-card hover:border-terminal-green transition-all duration-200 text-left group block"
                data-testid="button-book-tour"
              >
                <div className="flex items-start">
                  <UserPlus className="text-terminal-green mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-terminal-green">BOOK A TOUR</h3>
                    <p className="text-terminal-dim text-xs mt-1">Explore the building</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/apply-to-join"
                className="terminal-card hover:border-terminal-green transition-all duration-200 text-left group block"
                data-testid="button-apply-to-join"
              >
                <div className="flex items-start">
                  <UserPlus className="text-terminal-green mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-terminal-green">MEMBERSHIP</h3>
                    <p className="text-terminal-dim text-xs mt-1">Become a member</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/event-host-booking"
                className="terminal-card hover:border-terminal-green transition-all duration-200 text-left group block"
                data-testid="button-host-event"
              >
                <div className="flex items-start">
                  <PartyPopper className="text-terminal-green mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-terminal-green">HOST EVENT</h3>
                    <p className="text-terminal-dim text-xs mt-1">Setup your event</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/chat"
                className="terminal-card hover:border-terminal-green transition-all duration-200 text-left group block"
                data-testid="button-join-discussion"
              >
                <div className="flex items-start">
                  <MessageCircle className="text-terminal-green mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-terminal-green">CHAT WITH US</h3>
                    <p className="text-terminal-dim text-xs mt-1">Ask anything</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* QR Code */}
            <div className="terminal-card text-center">
              <p className="text-terminal-green font-bold text-sm mb-4">SHARE WITH YOUR NETWORK</p>
              <div className="flex justify-center mb-4">
                <div className="bg-terminal-dim/20 p-4 border border-terminal-green rounded">
                  <img 
                    src={frontierTowerQR}
                    alt="QR Code"
                    className="w-40 h-40"
                    data-testid="qr-code-share"
                  />
                </div>
              </div>
              <p className="text-terminal-dim text-xs">Scan to visit thefrontiertower.com</p>
            </div>

            {/* Exit Link */}
            <div className="text-center mt-6">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-terminal-dim hover:text-terminal-green"
                  data-testid="button-exit"
                >
                  EXIT PROTOCOL
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
