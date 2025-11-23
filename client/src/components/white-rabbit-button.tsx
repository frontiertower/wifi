import { useLocation } from "wouter";
import rabbitImage from "@assets/FuzzyNop_logo_pink_1763832812948.png";

interface WhiteRabbitButtonProps {
  onHomeClick?: () => void;
}

export function WhiteRabbitButton({ onHomeClick }: WhiteRabbitButtonProps) {
  const [location, setLocation] = useLocation();

  const handleClick = () => {
    // On home page, trigger the modal callback if provided
    if (location === "/" && onHomeClick) {
      onHomeClick();
    } else {
      // Otherwise, navigate to home
      setLocation("/");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 hover:opacity-80 transition-opacity"
      data-testid="button-white-rabbit-home"
      aria-label="Follow the white rabbit or go home"
    >
      <img 
        src={rabbitImage} 
        alt="White rabbit" 
        className="w-8 h-8 object-contain"
        style={{ filter: "brightness(0) invert(1)" }}
      />
    </button>
  );
}
