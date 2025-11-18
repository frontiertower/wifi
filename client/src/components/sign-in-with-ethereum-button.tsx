import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ethers } from "ethers";
import { SiweMessage } from "siwe";
import { useToast } from "@/hooks/use-toast";

interface SignInWithEthereumButtonProps {
  onSuccess: (address: string) => void;
  disabled?: boolean;
}

export default function SignInWithEthereumButton({
  onSuccess,
  disabled,
}: SignInWithEthereumButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async () => {
    try {
      setIsConnecting(true);

      // Check if MetaMask is installed
      if (!window.ethereum) {
        toast({
          title: "Wallet Not Found",
          description: "Please install MetaMask or another Ethereum wallet to continue.",
          variant: "destructive",
        });
        return;
      }

      // Request account access
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const chainId = Number((await provider.getNetwork()).chainId);

      // Get nonce from backend
      const nonceResponse = await fetch("/api/auth/ethereum/nonce");
      if (!nonceResponse.ok) {
        throw new Error("Failed to get nonce");
      }
      const { nonce } = await nonceResponse.json();

      // Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to Frontier Tower WiFi Portal with Ethereum",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce,
        issuedAt: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      });

      // Sign the message
      const signature = await signer.signMessage(message.prepareMessage());

      // Verify signature with backend
      const verifyResponse = await fetch("/api/auth/ethereum/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message.toMessage(),
          signature,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error("Signature verification failed");
      }

      const { verified } = await verifyResponse.json();

      if (verified) {
        toast({
          title: "Success",
          description: "Successfully signed in with Ethereum wallet",
        });
        onSuccess(address);
      } else {
        throw new Error("Signature verification failed");
      }
    } catch (error: any) {
      console.error("Sign in with Ethereum error:", error);
      
      // Handle user rejection
      if (error.code === 4001 || error.code === "ACTION_REJECTED") {
        toast({
          title: "Request Rejected",
          description: "You rejected the signature request",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Authentication Failed",
          description: error.message || "Failed to sign in with Ethereum",
          variant: "destructive",
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSignIn}
      disabled={disabled || isConnecting}
      className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-medium py-6"
      data-testid="button-sign-in-ethereum"
    >
      <div className="flex items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 320 512"
            className="w-4 h-4 fill-white"
          >
            <path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z" />
          </svg>
        </div>
        <span className="text-base">
          {isConnecting ? "Connecting..." : "Sign-In with Ethereum Wallet"}
        </span>
      </div>
    </Button>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
