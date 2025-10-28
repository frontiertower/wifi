import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface MemberRegistrationFormProps {
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    membershipId: string;
  }) => void;
  onBack: () => void;
}

export default function MemberRegistrationForm({ onSubmit, onBack }: MemberRegistrationFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    membershipId: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Member form submitted:', formData);
    onSubmit(formData);
  };

  return (
    <Card className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-2">Member Registration</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Please provide your member details to access the network
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              data-testid="input-first-name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              data-testid="input-last-name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            data-testid="input-email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            data-testid="input-phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="membershipId">Membership ID</Label>
          <Input
            id="membershipId"
            data-testid="input-membership-id"
            value={formData.membershipId}
            onChange={(e) => setFormData({ ...formData, membershipId: e.target.value })}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Found on your membership card
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
            data-testid="button-back"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1"
            data-testid="button-submit"
          >
            Connect to WiFi
          </Button>
        </div>
      </form>
    </Card>
  );
}
