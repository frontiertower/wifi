import RoleSelectionCard from '../RoleSelectionCard';
import { Users } from 'lucide-react';

export default function RoleSelectionCardExample() {
  return (
    <div className="p-8 max-w-sm">
      <RoleSelectionCard
        icon={Users}
        title="Member Access"
        description="For Frontier Tower members with full network access"
        duration="30 days access"
        onClick={() => console.log('Member selected')}
        selected={false}
      />
    </div>
  );
}
