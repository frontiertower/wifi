import { useState, useEffect } from "react";
import { Building } from "lucide-react";
import MemberForm from "@/components/member-form";
import GuestForm from "@/components/guest-form";
import EventForm from "@/components/event-form";
import SuccessModal from "@/components/success-modal";

type Role = "member" | "guest" | "event" | null;

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
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
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

  const handleSuccess = async (data: SuccessData) => {
    const redirectUrl = unifiParams.url || "https://frontiertower.io/";
    
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
          macAddress: unifiParams.mac || "unknown",
        }),
      });

      const authData = await authResponse.json();
      
      if (authData.payload?.valid) {
        console.log('✓ Guest authorized for internet access');
      } else {
        console.warn('⚠️ Authorization response:', authData);
      }
    } catch (error) {
      console.error('✗ Authorization error:', error);
    }
    
    // Redirect regardless of authorization result
    window.location.href = redirectUrl;
  };

  const handleCloseModal = () => {
    setSuccessData(null);
    setSelectedRole(null);
  };

  if (selectedRole === "member") {
    return <MemberForm onBack={handleBack} onSuccess={handleSuccess} unifiParams={unifiParams} />;
  }

  if (selectedRole === "guest") {
    return <GuestForm onBack={handleBack} onSuccess={handleSuccess} unifiParams={unifiParams} />;
  }

  if (selectedRole === "event") {
    return <EventForm onBack={handleBack} onSuccess={handleSuccess} unifiParams={unifiParams} />;
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-primary text-primary-foreground p-6 text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="text-2xl" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Frontier Tower</h1>
            <p className="text-primary-foreground/80">Welcome to our WiFi network</p>
          </div>

          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Select your access type</h2>

            <button
              onClick={() => handleRoleSelect("event")}
              className="w-full mb-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left group"
              data-testid="button-select-event"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-200">
                  <i className="fas fa-calendar text-orange-600"></i>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Event Access</div>
                  <div className="text-sm text-gray-500">Conference and event attendees</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect("guest")}
              className="w-full mb-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left group"
              data-testid="button-select-guest"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200">
                  <i className="fas fa-user text-green-600"></i>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Guest</div>
                  <div className="text-sm text-gray-500">Visitors and temporary users</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect("member")}
              className="w-full mb-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
              data-testid="button-select-member"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200">
                  <i className="fas fa-user-tie text-blue-600"></i>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Member</div>
                  <div className="text-sm text-gray-500">Building residents and employees</div>
                </div>
              </div>
            </button>

            <div className="text-center text-xs text-gray-500 mt-4">
              By connecting, you agree to our terms of service
            </div>
          </div>
        </div>
      </div>

      {successData && (
        <SuccessModal
          message={successData.message}
          networkName={successData.networkName}
          duration={successData.duration}
          speedLimit={successData.speedLimit}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
