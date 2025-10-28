import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Users, Ticket, Calendar, TrendingUp } from "lucide-react";
import AdminUsersTable from "./AdminUsersTable";
import AdminVouchersTable from "./AdminVouchersTable";
import AdminEventsTable from "./AdminEventsTable";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");

  //todo: remove mock functionality
  const stats = [
    { label: "Active Users", value: "142", icon: Users, trend: "+12%" },
    { label: "Vouchers Used", value: "89", icon: Ticket, trend: "+5%" },
    { label: "Upcoming Events", value: "3", icon: Calendar, trend: "" },
    { label: "Network Usage", value: "78%", icon: TrendingUp, trend: "+3%" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage WiFi access for Frontier Tower
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
                {stat.trend && (
                  <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
                )}
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
          <TabsTrigger value="vouchers" data-testid="tab-vouchers">Vouchers</TabsTrigger>
          <TabsTrigger value="events" data-testid="tab-events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <AdminUsersTable />
        </TabsContent>

        <TabsContent value="vouchers" className="mt-6">
          <AdminVouchersTable />
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <AdminEventsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
