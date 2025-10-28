import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Wifi } from "lucide-react";
import successImage from '@assets/generated_images/WiFi_connection_success_illustration_501db2d5.png';

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
  redirectUrl = "https://ft0.sh/"
}: SuccessPageProps) {
  const [countdown, setCountdown] = useState(5);

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full text-center">
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
    </div>
  );
}
