import { useLocation } from "wouter";

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
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
      data-testid="button-white-rabbit-home"
      aria-label="Follow the white rabbit or go home"
    >
      <span className="text-lg">🐰</span>
    </button>
  );
}
