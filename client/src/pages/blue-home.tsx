import { useState, useEffect } from "react";
import { Wifi, Building2, Calendar, DoorOpen, UserPlus, PartyPopper, MessageCircle, Zap, Rocket, Home, Briefcase, Shield, Link2, Wrench, Trophy, Laptop, GraduationCap, ClipboardList, FileText, MapPin } from "lucide-react";
import { SiDiscord, SiYoutube } from "react-icons/si";
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
        <div className="min-h-screen p-4" style={{
          backgroundColor: '#003d82',
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255, 255, 255, 0.03) 49px, rgba(255, 255, 255, 0.03) 50px),
            repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(255, 255, 255, 0.03) 49px, rgba(255, 255, 255, 0.03) 50px)
          `,
        }}>
          <div className="max-w-4xl mx-auto">
            {/* Blueprint Title Block */}
            <div className="mb-8" style={{
              backgroundColor: '#003d82',
              border: '3px solid #ffffff',
            }}>
              {/* Main content area with header */}
              <div className="p-8" style={{
                borderBottom: '2px solid #ffffff',
              }}>
                <h1 className="text-5xl md:text-6xl font-bold mb-2" style={{
                  color: '#ffffff',
                  fontFamily: 'monospace',
                  letterSpacing: '2px',
                }}>
                  FRONTIER TOWER
                </h1>
                <div style={{
                  height: '2px',
                  backgroundColor: '#ffffff',
                  marginBottom: '12px',
                }}></div>
                <p className="text-lg" style={{
                  color: '#ffffff',
                  fontFamily: 'monospace',
                  letterSpacing: '1px',
                }}>
                  FACILITY PORTAL SYSTEM
                </p>
              </div>

              {/* Blueprint Title Block (Technical Drawing Style) */}
              <div className="flex" style={{
                backgroundColor: '#003d82',
              }}>
                <div className="flex-1 p-4" style={{
                  borderRight: '2px solid #ffffff',
                  color: '#ffffff',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}>
                  <div className="mb-2">Project: FRONTIER TOWER</div>
                  <div className="mb-2">Sheet: Portal System</div>
                  <div>Revision: A</div>
                </div>
                <div className="w-32 p-4" style={{
                  borderLeft: '2px solid #ffffff',
                  color: '#ffffff',
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  textAlign: 'center',
                }}>
                  <div className="mb-1 border-b border-white pb-1">APPROVED</div>
                  <div style={{ fontSize: '9px' }}>2069</div>
                </div>
              </div>
            </div>

            {/* Menu Grid - Blueprint Style */}
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <button
                onClick={() => handleRoleSelect("guest")}
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-select-guest"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">NETWORK ACCESS</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Connect to WiFi network</p>
                  </div>
                </div>
              </button>

              <Link
                href="/code-of-conduct"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-code-of-conduct"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">CODE OF CONDUCT</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Rules & guidelines</p>
                  </div>
                </div>
              </Link>

              <a
                href="https://discord.com/invite/Bwk5qm53sc"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-join-discord"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <SiDiscord className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">JOIN SENSAI DISCORD</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Connect with community</p>
                  </div>
                </div>
              </a>

              <a
                href="https://sensaihack.notion.site/How-to-Prepare-Learning-Resources-Workshops-22ad7964cb7c81838c6cff5e275dbecc"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-dev-kits"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">DEV KITS & RESOURCES</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Learning resources</p>
                  </div>
                </div>
              </a>

              <a
                href="https://bit.ly/sensaiYT"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-youtube-workshops"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <SiYoutube className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">YOUTUBE WORKSHOPS</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Watch video tutorials</p>
                  </div>
                </div>
              </a>

              <a
                href="https://start-developer-competition.devpost.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-meta-competition"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">META DEVELOPER COMPETITION</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Join the competition</p>
                  </div>
                </div>
              </a>

              <Link
                href="/coworking"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-book-coworking"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">BOOK COWORKING</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Reserve a workspace</p>
                  </div>
                </div>
              </Link>

              <a
                href="https://sensaihackademy.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-sensai-hackademy"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">JOIN SENSAI HACKADEMY</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Learn & build with AI</p>
                  </div>
                </div>
              </a>

              <a
                href="https://sensai-hack-san-francisco.devpost.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-register-devpost"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">REGISTER ON DEVPOST</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Join the hackathon</p>
                  </div>
                </div>
              </a>

              <a
                href="https://sensaihack.notion.site/SensAI-Hack-in-San-Francisco-27dd7964cb7c80eebd4af085a55b7832"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-hackathon-notion"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">HACKATHON NOTION</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Event details & info</p>
                  </div>
                </div>
              </a>

              <a
                href="https://sensaihack.space"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-room-finder"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">ROOM FINDER</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Find rooms & spaces</p>
                  </div>
                </div>
              </a>
            </div>

            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-white/30"></div>
              <span className="text-sm font-bold font-mono text-white">FRONTIER TOWER</span>
              <div className="flex-1 h-px bg-white/30"></div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <Link
                href="/about"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-about-tower"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">ABOUT FRONTIER</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Building information</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/ecosystem"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-view-ecosystem"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">ECOSYSTEM</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Apps & projects</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/directory"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-view-directory"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">DIRECTORY INDEX</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Tenant information system</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/events"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-view-events"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">EVENTS SCHEDULE</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Upcoming activities</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/rent-office"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-rent-office"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <DoorOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">OFFICE RENTAL</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Space availability</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/tour"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-book-tour"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">FACILITY TOUR</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Building orientation</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/residency"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-superhero-residency"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">SUPERHERO RESIDENCY</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Luxury living program</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/membership"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-membership-inquiry"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">MEMBERSHIP</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Join our community</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/careers"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-careers"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">CAREERS</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Career opportunities</p>
                  </div>
                </div>
              </Link>

              <a
                href="https://fxchange.io/maker/open"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-gigs-jobs"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">GIGS & BOUNTIES</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Work opportunities</p>
                  </div>
                </div>
              </a>

              <Link
                href="/hosting"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-host-event"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <PartyPopper className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">EVENT HOSTING</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Reserve facilities</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/chat"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-join-discussion"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">SUPPORT CHANNEL</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Get assistance</p>
                  </div>
                </div>
              </Link>

              <a
                href="http://ft0.sh"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 transition-all duration-200 text-left hover:bg-white hover:bg-opacity-10 block"
                style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                }}
                data-testid="button-important-links"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <Link2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm">IMPORTANT LINKS</h3>
                    <p className="text-xs mt-1 font-mono opacity-75">Essential resources</p>
                  </div>
                </div>
              </a>
            </div>

            {/* QR Code with Blueprint styling */}
            <div className="p-6 text-center" style={{
              backgroundColor: '#003d82',
              border: '2px solid #ffffff',
              color: '#ffffff',
            }}>
              <p className="font-bold font-mono text-sm mb-4">DISTRIBUTION CODE</p>
              <div className="flex justify-center mb-4">
                <div className="p-4" style={{
                  backgroundColor: '#003d82',
                  border: '2px solid #ffffff',
                }}>
                  <img 
                    src={frontierTowerQR}
                    alt="QR Code"
                    className="w-40 h-40"
                    data-testid="qr-code-share"
                  />
                </div>
              </div>
              <p className="text-xs font-mono opacity-75">Scan to access thefrontiertower.com</p>
            </div>

            {/* Exit Link */}
            <div className="text-center mt-6">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="font-mono"
                  style={{ color: '#ffffff' }}
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
