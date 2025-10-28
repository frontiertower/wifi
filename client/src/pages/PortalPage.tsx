import { useState } from "react";
import Header from "@/components/Header";
import RoleSelectionCard from "@/components/RoleSelectionCard";
import MemberRegistrationForm from "@/components/MemberRegistrationForm";
import GuestRegistrationForm from "@/components/GuestRegistrationForm";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import SuccessPage from "@/components/SuccessPage";
import { Users, UserPlus, Calendar } from "lucide-react";

type UserRole = "member" | "guest" | "event" | null;
type PageState = "selection" | "form" | "success";

export default function PortalPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [pageState, setPageState] = useState<PageState>("selection");
  const [userData, setUserData] = useState<any>(null);

  const handleRoleSelect = (role: UserRole) => {
    console.log('Role selected:', role);
    setSelectedRole(role);
    setPageState("form");
  };

  const handleBack = () => {
    setPageState("selection");
    setSelectedRole(null);
  };

  const handleSubmit = (data: any) => {
    console.log('Form submitted:', data);
    setUserData(data);
    setPageState("success");
  };

  const getNetworkName = () => {
    switch (selectedRole) {
      case "member": return "Frontier-Member";
      case "guest": return "Frontier-Guest";
      case "event": return "Frontier-Event";
      default: return "Frontier-WiFi";
    }
  };

  const getDuration = () => {
    switch (selectedRole) {
      case "member": return "30 days";
      case "guest": return "8 hours";
      case "event": return "24 hours";
      default: return "";
    }
  };

  if (pageState === "success" && userData) {
    return (
      <SuccessPage
        userName={`${userData.firstName} ${userData.lastName}`}
        networkName={getNetworkName()}
        duration={getDuration()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        {pageState === "selection" && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-3">Welcome to Frontier Tower</h1>
              <p className="text-lg text-muted-foreground">
                Select your access type to connect to WiFi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <RoleSelectionCard
                icon={Users}
                title="Member Access"
                description="For Frontier Tower members with full network access"
                duration="30 days access"
                onClick={() => handleRoleSelect("member")}
                selected={selectedRole === "member"}
              />
              <RoleSelectionCard
                icon={UserPlus}
                title="Guest Access"
                description="For visitors and guests requiring temporary access"
                duration="8 hours access"
                onClick={() => handleRoleSelect("guest")}
                selected={selectedRole === "guest"}
              />
              <RoleSelectionCard
                icon={Calendar}
                title="Event Access"
                description="For event attendees with extended access"
                duration="24 hours access"
                onClick={() => handleRoleSelect("event")}
                selected={selectedRole === "event"}
              />
            </div>
          </div>
        )}

        {pageState === "form" && (
          <div className="max-w-2xl mx-auto">
            {selectedRole === "member" && (
              <MemberRegistrationForm
                onSubmit={handleSubmit}
                onBack={handleBack}
              />
            )}
            {selectedRole === "guest" && (
              <GuestRegistrationForm
                onSubmit={handleSubmit}
                onBack={handleBack}
              />
            )}
            {selectedRole === "event" && (
              <EventRegistrationForm
                onSubmit={handleSubmit}
                onBack={handleBack}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
