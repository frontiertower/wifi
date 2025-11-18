import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessModalProps {
  message: string;
  networkName: string;
  duration: string;
  speedLimit: string;
  onClose: () => void;
}

export default function SuccessModal({
  message,
  networkName,
  duration,
  speedLimit,
  onClose
}: SuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="text-green-600 text-2xl" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Connected Successfully!</h2>
        <p className="text-gray-600 mb-6">{message}</p>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="text-sm text-gray-600 space-y-1">
            <div>Network: <span className="font-medium text-gray-900">{networkName}</span></div>
            <div>Session Duration: <span className="font-medium text-gray-900">{duration}</span></div>
            <div>Speed Limit: <span className="font-medium text-gray-900">{speedLimit}</span></div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            We need an API key for the Guest WiFi to work, please find the person who invited you to the event and ask them for the password to the FrontierTower network
          </p>
        </div>

        <Button
          onClick={onClose}
          className="w-full bg-primary-500 hover:bg-primary-600 h-12 text-white"
          data-testid="button-close"
        >
          Continue Browsing
        </Button>
      </div>
    </div>
  );
}
