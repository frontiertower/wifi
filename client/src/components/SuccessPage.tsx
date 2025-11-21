import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Wifi, ChevronDown, ChevronUp } from "lucide-react";
import successImage from '@assets/generated_images/WiFi_connection_success_illustration_501db2d5.png';
import step1Image from '@assets/step 1_1763765971195.jpeg';
import step2Image from '@assets/step 2_1763765971195.jpeg';
import step3Image from '@assets/step 3_1763765971195.jpeg';
import step4Image from '@assets/step 4_1763765971195.jpeg';

interface SuccessPageProps {
  userName: string;
  networkName: string;
  duration: string;
  redirectUrl?: string;
}

export default function SuccessPage({
  userName,
  networkName,
  duration,
  redirectUrl = "https://frontiertower.io/"
}: SuccessPageProps) {
  const [countdown, setCountdown] = useState(5);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          console.log('Redirecting to:', redirectUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [redirectUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="max-w-2xl w-full space-y-6">
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <img src={successImage} alt="Success" className="w-32 h-32" />
          </div>
          
          <div className="mb-6">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">You're Connected!</h2>
            <p className="text-muted-foreground">
              Welcome, {userName}
            </p>
          </div>

          <div className="bg-muted rounded-lg p-4 mb-6 space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm">
              <Wifi className="w-4 h-4 text-primary" />
              <span className="font-medium">Network: {networkName}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Access Duration: {duration}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Redirecting in {countdown} seconds...
            </p>
            <Button
              onClick={() => {
                console.log('Manual redirect to:', redirectUrl);
              }}
              className="w-full"
              data-testid="button-continue"
            >
              Continue Now
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <Button
            onClick={() => setShowInstructions(!showInstructions)}
            variant="ghost"
            className="w-full flex items-center justify-between text-left p-4 h-auto"
            data-testid="button-toggle-instructions"
          >
            <div className="text-left">
              <h3 className="font-semibold text-lg">How to Install WiFi Profile (iOS)</h3>
              <p className="text-sm text-muted-foreground">
                Follow these steps to automatically connect in the future
              </p>
            </div>
            {showInstructions ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            )}
          </Button>

          {showInstructions && (
            <div className="mt-6 space-y-6" data-testid="wifi-instructions">
              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">Profile Downloaded</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      After downloading, you'll see this confirmation. Tap "Close" to continue.
                    </p>
                    <img 
                      src={step1Image} 
                      alt="Step 1: Profile Downloaded screen" 
                      className="rounded-lg border w-full max-w-sm mx-auto"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">Open Settings</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Go to Settings app and look for "Profile Downloaded" notification.
                    </p>
                    <img 
                      src={step2Image} 
                      alt="Step 2: Settings showing Profile Downloaded notification" 
                      className="rounded-lg border w-full max-w-sm mx-auto"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">Review Profile Details</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Review the WiFi Configuration profile and tap "Install" in the top right.
                    </p>
                    <img 
                      src={step3Image} 
                      alt="Step 3: Install Profile screen with WiFi Configuration details" 
                      className="rounded-lg border w-full max-w-sm mx-auto"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    4
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">Confirm Installation</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      You'll see a warning about unsigned profile. This is normal - tap "Install" to complete the setup.
                    </p>
                    <img 
                      src={step4Image} 
                      alt="Step 4: Warning screen about unsigned profile" 
                      className="rounded-lg border w-full max-w-sm mx-auto"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4 mt-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Once installed, your device will automatically connect to FrontierTower WiFi whenever you're in the building!
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
