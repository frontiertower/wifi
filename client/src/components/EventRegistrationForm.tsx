import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface EventRegistrationFormProps {
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    eventId: string;
    customEventName?: string;
  }) => void;
  onBack: () => void;
}

export default function EventRegistrationForm({ onSubmit, onBack }: EventRegistrationFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    eventId: "",
    customEventName: ""
  });

  const events = [
    { id: "tech-summit-2025", name: "Tech Summit 2025", date: "Nov 15, 2025" },
    { id: "startup-mixer", name: "Startup Networking Mixer", date: "Nov 20, 2025" },
    { id: "web3-workshop", name: "Web3 Workshop", date: "Nov 22, 2025" },
    { id: "other", name: "Other Event", date: "" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Event form submitted:', formData);
    onSubmit(formData);
  };

  return (
    <Card className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-2">Event Registration</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Register for WiFi access during your event
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="mb-3 block">Select Your Event</Label>
          <RadioGroup
            value={formData.eventId}
            onValueChange={(value) => setFormData({ ...formData, eventId: value })}
            required
          >
            {events.map((event) => (
              <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg border hover-elevate">
                <RadioGroupItem value={event.id} id={event.id} data-testid={`radio-event-${event.id}`} />
                <Label htmlFor={event.id} className="flex-1 cursor-pointer">
                  <div className="font-medium">{event.name}</div>
                  {event.date && <div className="text-xs text-muted-foreground">{event.date}</div>}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {formData.eventId === "other" && (
          <div className="animate-accordion-down">
            <Label htmlFor="customEventName">Event Name</Label>
            <Input
              id="customEventName"
              data-testid="input-custom-event-name"
              placeholder="Enter event name"
              value={formData.customEventName}
              onChange={(e) => setFormData({ ...formData, customEventName: e.target.value })}
              required
            />
          </div>
        )}

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
