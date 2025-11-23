import { useState, useEffect } from "react";
import { Brain, Calendar, UserPlus, Wifi, Briefcase, MessageCircle, Building2, Camera, Link2, DoorOpen, PartyPopper } from "lucide-react";
import { Link, useLocation } from "wouter";
import MemberForm from "@/components/member-form";
import UnifiedGuestForm from "@/components/unified-guest-form";
import SlidingWelcome from "@/components/SlidingWelcome";
import frontierTowerQR from "@assets/frontier-tower-qr.png";
import { translations, Language } from "@/lib/translations";

type Role = "member" | "guest" | null;
type PillChoice = "green" | "blue" | null;

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

export default function HomeBase({ language = "en" }: { language?: Language }) {
  const t = translations[language];
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [unifiParams, setUnifiParams] = useState<UniFiParams>({});
  const [showPillModal, setShowPillModal] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [crackIntensity, setCrackIntensity] = useState(0);
  const [showTerminal, setShowTerminal] = useState(false);
  const [, setLocation] = useLocation();

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
        console.log('✓ Guest authorized for internet access');
        
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
  };

  const handleWhiteRabbit = () => {
    setIsFlashing(true);
    setTimeout(() => {
      setShowPillModal(true);
    }, 500);
  };

  useEffect(() => {
    (window as any).__whiteRabbitCallback = handleWhiteRabbit;
    return () => {
      delete (window as any).__whiteRabbitCallback;
    };
  }, []);

  useEffect(() => {
    if (!showPillModal) {
      setCrackIntensity(0);
      setShowTerminal(false);
      return;
    }

    const interval = setInterval(() => {
      setCrackIntensity((prev) => {
        if (prev >= 10) {
          clearInterval(interval);
          setTimeout(() => setShowTerminal(true), 2000);
          return 10;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showPillModal]);

  useEffect(() => {
    if (!showTerminal) return;

    let autoRebootTimer: NodeJS.Timeout | null = null;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (autoRebootTimer) clearTimeout(autoRebootTimer);
        window.location.reload();
      }
    };

    const handleClick = () => {
      if (autoRebootTimer) clearTimeout(autoRebootTimer);
      window.location.reload();
    };

    autoRebootTimer = setTimeout(() => {
      window.location.reload();
    }, 5000);

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("click", handleClick);

    return () => {
      if (autoRebootTimer) clearTimeout(autoRebootTimer);
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("click", handleClick);
    };
  }, [showTerminal]);

  const handlePillChoice = (choice: PillChoice) => {
    setShowPillModal(false);
    if (choice === "green") {
      setLocation("/Green");
    } else if (choice === "blue") {
      setLocation("/Blue");
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
        <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4 ${isFlashing ? 'screen-flash' : ''}`}
          onAnimationEnd={() => setIsFlashing(false)}
        >
        
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-primary dark:bg-primary text-primary-foreground p-6 text-center">
            <h1 className="text-lg font-bold max-w-xs mx-auto line-clamp-2 h-12 leading-tight flex items-center justify-center">
              <SlidingWelcome speed={2000} />
            </h1>
          </div>

          <div className="p-6">
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-600 flex justify-center gap-2 flex-wrap">
              <a href="/" className="text-2xl hover:scale-110 transition-transform" data-testid="language-en" title="English">🇺🇸</a>
              <a href="/de" className="text-2xl hover:scale-110 transition-transform" data-testid="language-de" title="Deutsch">🇩🇪</a>
              <a href="/es" className="text-2xl hover:scale-110 transition-transform" data-testid="language-es" title="Español">🇪🇸</a>
              <a href="/zh" className="text-2xl hover:scale-110 transition-transform" data-testid="language-zh" title="中文">🇨🇳</a>
              <a href="/ko" className="text-2xl hover:scale-110 transition-transform" data-testid="language-ko" title="한국어">🇰🇷</a>
              <a href="/ja" className="text-2xl hover:scale-110 transition-transform" data-testid="language-ja" title="日本語">🇯🇵</a>
              <a href="/fr" className="text-2xl hover:scale-110 transition-transform" data-testid="language-fr" title="Français">🇫🇷</a>
              <a href="/hi" className="text-2xl hover:scale-110 transition-transform" data-testid="language-hi" title="हिन्दी">🇮🇳</a>
              <a href="/ar" className="text-2xl hover:scale-110 transition-transform" data-testid="language-ar" title="العربية">🇦🇪</a>
              <a href="/sw" className="text-2xl hover:scale-110 transition-transform" data-testid="language-sw" title="Swahili">🇹🇿</a>
            </div>

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
                  <div className="font-medium text-gray-800 dark:text-gray-100">{t.connectToWiFi}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t.connectToWiFiDesc}</div>
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
                  <div className="font-medium text-gray-800 dark:text-gray-100">{t.buildingDirectory}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t.buildingDirectoryDesc}</div>
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
                  <div className="font-medium text-gray-800 dark:text-gray-100">{t.eventsCalendar}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t.eventsCalendarDesc}</div>
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
                  <div className="font-medium text-gray-800 dark:text-gray-100">{t.rentPrivateOffice}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t.rentPrivateOfficeDesc}</div>
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
                  <div className="font-medium text-gray-800 dark:text-gray-100">{t.bookOfficeTour}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t.bookOfficeTourDesc}</div>
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
                  <div className="font-medium text-gray-800 dark:text-gray-100">{t.membershipInquiry}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t.membershipInquiryDesc}</div>
                </div>
              </div>
            </Link>

            <Link
              href="/careers"
              className="w-full mb-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 text-left group block"
              data-testid="button-careers"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-500/30 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-200 dark:group-hover:bg-red-500/40">
                  <Briefcase className="text-red-600 dark:text-red-300" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">{t.careersAtFrontier}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t.careersAtFrontierDesc}</div>
                </div>
              </div>
            </Link>

            <a
              href="https://fxchange.io/maker/open"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mb-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all duration-200 text-left group block"
              data-testid="button-gigs-jobs"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-500/30 rounded-lg flex items-center justify-center mr-3 group-hover:bg-teal-200 dark:group-hover:bg-teal-500/40">
                  <Briefcase className="text-teal-600 dark:text-teal-300" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">{t.gigsAndBounties}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t.gigsAndBountiesDesc}</div>
                </div>
              </div>
            </a>

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
                  <div className="font-medium text-gray-800 dark:text-gray-100">{t.hostYourEvent}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t.hostYourEventDesc}</div>
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
                  <div className="font-medium text-gray-800 dark:text-gray-100">{t.chatWithUs}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t.chatWithUsDesc}</div>
                </div>
              </div>
            </Link>

            <div className="mt-6 text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t.shareWithFriends}
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
                {t.scanToVisit}
              </p>
            </div>

            <button
              onClick={handleWhiteRabbit}
              className="w-full mt-4 px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 border-t border-gray-200 dark:border-gray-600 pt-4"
              data-testid="button-white-rabbit"
            >
              {t.followWhiteRabbit}
            </button>
          </div>
        </div>

        {showPillModal && (
          <div className={`fixed inset-0 flex items-center justify-center p-4 z-50 overflow-hidden ${crackIntensity >= 9 ? 'black-hole-collapse' : 'bg-black bg-opacity-50 pill-modal-backdrop'} ${crackIntensity >= 6 ? 'shake-effect' : ''}`}>
            {crackIntensity > 0 && crackIntensity < 9 && (
              <>
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}>
                  {crackIntensity >= 1 && <line x1="50%" y1="0%" x2="45%" y2="100%" stroke="rgba(0,0,0,0.6)" strokeWidth="3" />}
                  {crackIntensity >= 2 && <line x1="30%" y1="20%" x2="70%" y2="80%" stroke="rgba(0,0,0,0.5)" strokeWidth="2" />}
                  {crackIntensity >= 3 && <line x1="70%" y1="10%" x2="20%" y2="90%" stroke="rgba(0,0,0,0.5)" strokeWidth="2" />}
                  {crackIntensity >= 4 && <line x1="50%" y1="0%" x2="40%" y2="60%" stroke="rgba(0,0,0,0.4)" strokeWidth="2" />}
                  {crackIntensity >= 5 && <line x1="60%" y1="30%" x2="30%" y2="70%" stroke="rgba(0,0,0,0.4)" strokeWidth="2" />}
                  
                  {crackIntensity >= 6 && <polygon points="0,0 100,0 100,50 0,40" fill="rgba(0,0,0,0.15)" />}
                  {crackIntensity >= 7 && <polygon points="0,100 100,100 100,60 0,70" fill="rgba(0,0,0,0.15)" />}
                  {crackIntensity >= 8 && <polygon points="0,0 30,0 25,50 0,45" fill="rgba(0,0,0,0.2)" />}
                  
                  {crackIntensity >= 5 && <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="rgba(0,0,0,0.3)" strokeWidth="1" className="zigzag-line" strokeDasharray="5,5" />}
                  {crackIntensity >= 6 && <line x1="20%" y1="0%" x2="20%" y2="100%" stroke="rgba(0,0,0,0.25)" strokeWidth="1" className="zigzag-line" strokeDasharray="5,5" />}
                  {crackIntensity >= 7 && <line x1="80%" y1="0%" x2="80%" y2="100%" stroke="rgba(0,0,0,0.25)" strokeWidth="1" className="zigzag-line" strokeDasharray="5,5" />}
                  {crackIntensity >= 7 && <line x1="0%" y1="25%" x2="100%" y2="25%" stroke="rgba(0,0,0,0.2)" strokeWidth="1" className="zigzag-line" strokeDasharray="5,5" />}
                  {crackIntensity >= 8 && <line x1="0%" y1="75%" x2="100%" y2="75%" stroke="rgba(0,0,0,0.2)" strokeWidth="1" className="zigzag-line" strokeDasharray="5,5" />}
                  
                  {crackIntensity >= 7 && <line x1="35%" y1="0%" x2="45%" y2="100%" stroke="rgba(255,255,255,0.2)" strokeWidth="1" className="flicker-line" />}
                  {crackIntensity >= 8 && <line x1="55%" y1="0%" x2="65%" y2="100%" stroke="rgba(255,255,255,0.2)" strokeWidth="1" className="flicker-line" />}
                  {crackIntensity >= 8 && <line x1="25%" y1="50%" x2="75%" y2="50%" stroke="rgba(255,255,255,0.15)" strokeWidth="1" className="flicker-line" />}
                  
                  {crackIntensity >= 8 && (
                    <>
                      <polygon points="10,10 40,5 35,40 5,35" fill="rgba(0,0,0,0.1)" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
                      <polygon points="90,90 60,95 65,60 95,65" fill="rgba(0,0,0,0.1)" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
                      <circle cx="30%" cy="70%" r="8%" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                      <circle cx="70%" cy="30%" r="10%" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                    </>
                  )}
                </svg>
                
                {crackIntensity >= 6 && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: "drop-shadow(0 0 5px rgba(0,0,0,0.5))" }}>
                    {Array.from({ length: Math.min(crackIntensity - 5, 15) }).map((_, i) => {
                      const angle = (i / (crackIntensity - 5)) * Math.PI * 2;
                      const distance = 100 + i * 20;
                      const tx = Math.cos(angle) * distance;
                      const ty = Math.sin(angle) * distance;
                      return (
                        <circle
                          key={`spark-${i}`}
                          cx="50%"
                          cy="50%"
                          r="2"
                          fill="rgba(0,0,0,0.6)"
                          style={{
                            '--tx': `${tx}px`,
                            '--ty': `${ty}px`,
                          } as React.CSSProperties}
                          className="spark"
                        />
                      );
                    })}
                  </svg>
                )}
              </>
            )}
            
            {crackIntensity >= 9 && (
              <>
                <div className="absolute inset-0 black-hole-vortex" />
                <div className="absolute inset-0 black-hole-singularity" />
              </>
            )}
            
            {!showTerminal && (
              <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative ${crackIntensity >= 9 ? 'black-hole-pull' : 'z-10'}`}>
                <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                  {t.choiceIsYours}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  {t.choosePathForward}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handlePillChoice("green")}
                    className="flex flex-col items-center justify-center p-6 border-2 border-green-500 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors duration-200 group"
                    data-testid="button-green-pill-choice"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {t.green}
                    </span>
                  </button>
                  <button
                    onClick={() => handlePillChoice("blue")}
                    className="flex flex-col items-center justify-center p-6 border-2 border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors duration-200 group"
                    data-testid="button-blue-pill-choice"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {t.blue}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {showTerminal && (
              <div className="absolute inset-0 bg-black flex items-center justify-center z-20 cursor-pointer" onClick={() => window.location.reload()} data-testid="terminal-reboot-screen">
                <div className="text-center font-mono text-2xl md:text-4xl">
                  <span className="terminal-text typing-reboot">reboot</span>
                  <span className="terminal-cursor">_</span>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      )}
    </>
  );
}
