import { useState } from "react";
import { Building, Users, Ticket, Calendar, TrendingUp, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

type Tab = "users" | "vouchers" | "events" | "analytics";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("vouchers");

  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  const { data: vouchers } = useQuery({
    queryKey: ['/api/admin/vouchers'],
    enabled: activeTab === "vouchers",
  });

  const { data: sessions } = useQuery({
    queryKey: ['/api/admin/sessions'],
    enabled: activeTab === "users",
  });

  const { data: events } = useQuery({
    queryKey: ['/api/admin/events'],
    enabled: activeTab === "events",
  });

  const tabs = [
    { id: "users", label: "Users", icon: Users },
    { id: "vouchers", label: "Vouchers", icon: Ticket },
    { id: "events", label: "Events", icon: Calendar },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Building className="text-primary-600 text-xl mr-2" />
                <span className="font-bold text-lg text-gray-900">Frontier Tower Admin</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">Last login: Today, 2:30 PM</div>
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">AD</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Users className="text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats?.activeUsers || 0}</p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Ticket className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats?.activeVouchers || 0}</p>
                <p className="text-sm text-gray-600">Active Vouchers</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats?.activeEvents || 0}</p>
                <p className="text-sm text-gray-600">Active Events</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats?.dataUsage || "0TB"}</p>
                <p className="text-sm text-gray-600">Data Usage Today</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center`}
                    data-testid={`tab-${tab.id}`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {activeTab === "vouchers" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Voucher Management</h2>
                <Button className="bg-primary-500 hover:bg-primary-600" data-testid="button-create-voucher">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Vouchers
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voucher Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers?.vouchers?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No vouchers found. Create your first voucher to get started.
                    </TableCell>
                  </TableRow>
                )}
                {vouchers?.vouchers?.map((voucher: any) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-mono">{voucher.code}</TableCell>
                    <TableCell>
                      <Badge variant={voucher.type === "guest" ? "secondary" : voucher.type === "event" ? "default" : "outline"}>
                        {voucher.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{voucher.duration} hours</TableCell>
                    <TableCell>
                      <Badge variant={voucher.isUsed ? "destructive" : "default"}>
                        {voucher.isUsed ? "Used" : "Available"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(voucher.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Active User Sessions</h2>
                <div className="flex space-x-2">
                  <Input placeholder="Search users..." className="w-64" data-testid="input-search-users" />
                  <Button variant="outline" size="sm" data-testid="button-filter">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Session Start</TableHead>
                  <TableHead>Data Usage</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions?.sessions?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No active user sessions found.
                    </TableCell>
                  </TableRow>
                )}
                {sessions?.sessions?.map((session: any) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{session.user?.name || session.user?.email}</div>
                        <div className="text-sm text-gray-500">{session.user?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{session.user?.role}</Badge>
                    </TableCell>
                    <TableCell>{new Date(session.startTime).toLocaleString()}</TableCell>
                    <TableCell>{Math.round((session.bytesIn + session.bytesOut) / 1024 / 1024)} MB</TableCell>
                    <TableCell>{session.user?.floor || "N/A"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        Disconnect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === "events" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Event Management</h2>
                <Button className="bg-primary-500 hover:bg-primary-600" data-testid="button-create-event">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events?.events?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No events found. Create your first event to get started.
                    </TableCell>
                  </TableRow>
                )}
                {events?.events?.map((event: any) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell className="font-mono">{event.code}</TableCell>
                    <TableCell>
                      {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{event.currentAttendees}/{event.maxAttendees || "∞"}</TableCell>
                    <TableCell>
                      <Badge variant={event.isActive ? "default" : "secondary"}>
                        {event.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics Dashboard</h2>
            <div className="text-center py-12 text-gray-500">
              Analytics features coming soon...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
