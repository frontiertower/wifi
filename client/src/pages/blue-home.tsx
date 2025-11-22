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

export default function BlueHome() {
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
    <>
      {selectedRole === "member" && (
        <MemberForm onBack={handleBack} onSuccess={handleSuccess} unifiParams={unifiParams} />
      )}

      {selectedRole === "guest" && (
        <UnifiedGuestForm onBack={handleBack} onSuccess={handleSuccess} unifiParams={unifiParams} />
      )}

      {!selectedRole && (
        <div className="min-h-screen bg-blueprint-dark p-4" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(74, 144, 226, 0.03) 35px, rgba(74, 144, 226, 0.03) 70px), repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(74, 144, 226, 0.03) 35px, rgba(74, 144, 226, 0.03) 70px)',
        }}>
          <div className="max-w-2xl mx-auto">
            {/* Header with Blueprint style */}
            <div className="mb-8 text-center border-2 border-blueprint-line p-6" style={{
              backgroundImage: 'linear-gradient(135deg, rgba(74, 144, 226, 0.05) 0%, transparent 100%)',
            }}>
              <h1 className="text-4xl md:text-5xl font-bold text-blueprint-text blueprint-text mb-2">
                FRONTIER TOWER
              </h1>
              <p className="text-blueprint-text text-sm md:text-base font-mono">
                NETWORK INFRASTRUCTURE PORTAL
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <div className="w-3 h-3 bg-blueprint-accent"></div>
                <div className="w-3 h-3 bg-blueprint-accent"></div>
                <div className="w-3 h-3 bg-blueprint-accent"></div>
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid gap-4 md:grid-cols-2 mb-8">
              <button
                onClick={() => handleRoleSelect("guest")}
                className="blueprint-card hover:shadow-lg transition-all duration-200 text-left group"
                data-testid="button-select-guest"
              >
                <div className="flex items-start">
                  <div className="text-blueprint-accent mr-3 flex-shrink-0 mt-1">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blueprint-text blueprint-text">NETWORK ACCESS</h3>
                    <p className="text-blueprint-secondary text-xs mt-1 font-mono">Connect to WiFi network</p>
                  </div>
                </div>
              </button>

              <Link
                href="/directory"
                className="blueprint-card hover:shadow-lg transition-all duration-200 text-left group block"
                data-testid="button-view-directory"
              >
                <div className="flex items-start">
                  <div className="text-blueprint-accent mr-3 flex-shrink-0 mt-1">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blueprint-text blueprint-text">DIRECTORY INDEX</h3>
                    <p className="text-blueprint-secondary text-xs mt-1 font-mono">Tenant information system</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/events"
                className="blueprint-card hover:shadow-lg transition-all duration-200 text-left group block"
                data-testid="button-view-events"
              >
                <div className="flex items-start">
                  <div className="text-blueprint-accent mr-3 flex-shrink-0 mt-1">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blueprint-text blueprint-text">EVENTS SCHEDULE</h3>
                    <p className="text-blueprint-secondary text-xs mt-1 font-mono">Upcoming activities</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/rent-office"
                className="blueprint-card hover:shadow-lg transition-all duration-200 text-left group block"
                data-testid="button-rent-office"
              >
                <div className="flex items-start">
                  <div className="text-blueprint-accent mr-3 flex-shrink-0 mt-1">
                    <DoorOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blueprint-text blueprint-text">OFFICE RENTAL</h3>
                    <p className="text-blueprint-secondary text-xs mt-1 font-mono">Space availability</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/tour"
                className="blueprint-card hover:shadow-lg transition-all duration-200 text-left group block"
                data-testid="button-book-tour"
              >
                <div className="flex items-start">
                  <div className="text-blueprint-accent mr-3 flex-shrink-0 mt-1">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blueprint-text blueprint-text">FACILITY TOUR</h3>
                    <p className="text-blueprint-secondary text-xs mt-1 font-mono">Building orientation</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/apply-to-join"
                className="blueprint-card hover:shadow-lg transition-all duration-200 text-left group block"
                data-testid="button-apply-to-join"
              >
                <div className="flex items-start">
                  <div className="text-blueprint-accent mr-3 flex-shrink-0 mt-1">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blueprint-text blueprint-text">MEMBERSHIP</h3>
                    <p className="text-blueprint-secondary text-xs mt-1 font-mono">Join our community</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/event-host-booking"
                className="blueprint-card hover:shadow-lg transition-all duration-200 text-left group block"
                data-testid="button-host-event"
              >
                <div className="flex items-start">
                  <div className="text-blueprint-accent mr-3 flex-shrink-0 mt-1">
                    <PartyPopper className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blueprint-text blueprint-text">EVENT HOSTING</h3>
                    <p className="text-blueprint-secondary text-xs mt-1 font-mono">Reserve facilities</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/chat"
                className="blueprint-card hover:shadow-lg transition-all duration-200 text-left group block"
                data-testid="button-join-discussion"
              >
                <div className="flex items-start">
                  <div className="text-blueprint-accent mr-3 flex-shrink-0 mt-1">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blueprint-text blueprint-text">SUPPORT CHANNEL</h3>
                    <p className="text-blueprint-secondary text-xs mt-1 font-mono">Get assistance</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* QR Code with Blueprint styling */}
            <div className="blueprint-card text-center">
              <p className="text-blueprint-text font-bold blueprint-text text-sm mb-4">DISTRIBUTION CODE</p>
              <div className="flex justify-center mb-4">
                <div className="bg-blueprint-bg p-4 border-2 border-blueprint-accent rounded">
                  <img 
                    src={frontierTowerQR}
                    alt="QR Code"
                    className="w-40 h-40"
                    data-testid="qr-code-share"
                  />
                </div>
              </div>
              <p className="text-blueprint-secondary text-xs font-mono">Scan to access thefrontiertower.com</p>
            </div>

            {/* Exit Link */}
            <div className="text-center mt-6">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blueprint-secondary hover:text-blueprint-accent font-mono"
                  data-testid="button-exit"
                >
                  EXIT SYSTEM
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
