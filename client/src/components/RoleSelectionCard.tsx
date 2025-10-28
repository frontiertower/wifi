import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface RoleSelectionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  duration: string;
  onClick: () => void;
  selected?: boolean;
}

export default function RoleSelectionCard({
  icon: Icon,
  title,
  description,
  duration,
  onClick,
  selected = false
}: RoleSelectionCardProps) {
  return (
    <Card
      className={`p-8 cursor-pointer transition-all hover-elevate active-elevate-2 ${
        selected ? 'border-primary border-2' : ''
      }`}
      onClick={onClick}
      data-testid={`card-role-${title.toLowerCase().replace(' ', '-')}`}
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="p-6 rounded-full bg-primary/10">
          <Icon className="w-12 h-12 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-1">{description}</p>
          <p className="text-xs font-medium text-primary">{duration}</p>
        </div>
      </div>
    </Card>
  );
}
