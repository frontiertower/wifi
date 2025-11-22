import { useLocation } from "wouter";

export function WhiteRabbitButton() {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setLocation("/");
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
      data-testid="button-white-rabbit-home"
      aria-label="Go home"
    >
      <span className="text-lg">🐰</span>
    </button>
  );
}
