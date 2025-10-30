import { useState } from "react";
import { Building, Users, Ticket, Calendar, TrendingUp, Plus, Filter, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Tab = "users" | "vouchers" | "events" | "analytics" | "location";

interface StatsResponse {
  stats?: {
    membersToday?: number;
    activeVouchers?: number;
    eventsToday?: number;
    eventGuestsToday?: number;
    guestsToday?: number;
    totalUsers?: number;
    totalMembers?: number;
    totalGuests?: number;
    totalEventUsers?: number;
    totalEvents?: number;
  };
}

interface VouchersResponse {
  vouchers?: any[];
}

interface UsersResponse {
  users?: any[];
}

interface EventsResponse {
  events?: any[];
}

interface FloorStatsResponse {
  floorStats?: Record<string, number>;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("vouchers");
  const [showEventForm, setShowEventForm] = useState(false);
  const [bulkEventText, setBulkEventText] = useState("");
  const { toast } = useToast();

  const { data: stats } = useQuery<StatsResponse>({
    queryKey: ['/api/admin/stats'],
  });

  const { data: vouchers } = useQuery<VouchersResponse>({
    queryKey: ['/api/admin/vouchers'],
    enabled: activeTab === "vouchers",
  });

  const { data: allUsers } = useQuery<UsersResponse>({
    queryKey: ['/api/admin/users'],
    enabled: activeTab === "users" || activeTab === "vouchers",
  });

  const { data: events } = useQuery<EventsResponse>({
    queryKey: ['/api/admin/events'],
    enabled: activeTab === "events",
  });

  const { data: floorStats } = useQuery<FloorStatsResponse>({
    queryKey: ['/api/admin/floor-stats'],
    enabled: activeTab === "location",
  });

  const createEventsMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/admin/events/bulk-import", { text });
      return response.json();
    },
    onSuccess: (data) => {
      const count = data.events?.length || 0;
      toast({
        title: "Events Imported",
        description: `Successfully imported ${count} event${count !== 1 ? 's' : ''} using AI`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setShowEventForm(false);
      setBulkEventText("");
    },
    onError: (error) => {
      toast({
        title: "Failed to Import Events",
        description: error instanceof Error ? error.message : "Could not process events with AI",
        variant: "destructive",
      });
    },
  });

  const handleSubmitBulkText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkEventText.trim()) {
      toast({
        title: "Text Required",
        description: "Please paste event information to import",
        variant: "destructive",
      });
      return;
    }
    createEventsMutation.mutate(bulkEventText);
  };

  const tabs = [
    { id: "users", label: "Users", icon: Users },
    { id: "vouchers", label: "Guests", icon: Ticket },
    { id: "events", label: "Events", icon: Calendar },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "location", label: "Location", icon: MapPin },
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
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900" data-testid="text-members-today">{stats?.stats?.membersToday || 0}</p>
                <p className="text-sm text-gray-600">Members Today</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Ticket className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900" data-testid="text-guests-today">{stats?.stats?.guestsToday || 0}</p>
                <p className="text-sm text-gray-600">Guests Today</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900" data-testid="text-events-today">{stats?.stats?.eventsToday || 0}</p>
                <p className="text-sm text-gray-600">Events Today</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900" data-testid="text-event-guests-today">{stats?.stats?.eventGuestsToday || 0}</p>
                <p className="text-sm text-gray-600">Event Guests Today</p>
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
                <h2 className="text-lg font-semibold text-gray-900">Guest & Event Access Users</h2>
                <div className="flex space-x-2">
                  <Input placeholder="Search guests..." className="w-64" data-testid="input-search-guests" />
                  <Button variant="outline" size="sm" data-testid="button-filter-guests">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name / Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Event / Details</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!allUsers?.users || allUsers.users.filter((u: any) => u.role === "guest" || u.role === "event").length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No guest or event users found.
                    </TableCell>
                  </TableRow>
                )}
                {allUsers?.users?.filter((user: any) => user.role === "guest" || user.role === "event").map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name || "N/A"}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          user.role === "guest" 
                            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" 
                            : "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.role === "event" && user.eventName && (
                        <div className="text-sm">
                          <div className="font-medium">{user.eventName}</div>
                          {user.organization && <div className="text-gray-500">{user.organization}</div>}
                        </div>
                      )}
                      {user.role === "guest" && (
                        <div className="text-sm text-gray-500">-</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{user.host || "-"}</TableCell>
                    <TableCell className="text-sm text-gray-600">{user.phone || "-"}</TableCell>
                    <TableCell className="text-sm">{new Date(user.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
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
                <h2 className="text-lg font-semibold text-gray-900">All Connected Users</h2>
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
                  <TableHead>Name / Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Event / Details</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!allUsers?.users || allUsers.users.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
                {allUsers?.users?.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name || "N/A"}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          user.role === "member" 
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                            : user.role === "guest" 
                            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" 
                            : "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.role === "event" && user.eventName && (
                        <div className="text-sm">
                          <div className="font-medium">{user.eventName}</div>
                          {user.organization && <div className="text-gray-500">{user.organization}</div>}
                        </div>
                      )}
                      {user.role === "guest" && (
                        <div className="text-sm">
                          <div className="text-gray-600">Host: {user.host}</div>
                        </div>
                      )}
                      {user.role === "member" && <span className="text-gray-500">-</span>}
                    </TableCell>
                    <TableCell>{user.floor || "N/A"}</TableCell>
                    <TableCell className="text-sm text-gray-600">{user.phone || "-"}</TableCell>
                    <TableCell className="text-sm">{new Date(user.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
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
                <Button 
                  onClick={() => setShowEventForm(!showEventForm)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white" 
                  data-testid="button-create-event"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </div>
            </div>

            {showEventForm && (
              <Card className="m-6 p-6 bg-muted/30">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-purple-500" />
                  Import Events with AI
                </h3>
                <form onSubmit={handleSubmitBulkText} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulkEventText">Paste Event Calendar or List</Label>
                    <Textarea
                      id="bulkEventText"
                      value={bulkEventText}
                      onChange={(e) => setBulkEventText(e.target.value)}
                      placeholder="Paste text from Luma calendar, event listings, or any text containing event information. AI will automatically extract and create events..."
                      className="min-h-[200px] font-mono text-sm"
                      data-testid="input-bulk-text"
                    />
                    <p className="text-sm text-muted-foreground">
                      💡 Paste content from event calendars, Luma pages, or any text with event details. AI will parse and create multiple events automatically.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={createEventsMutation.isPending}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      data-testid="button-submit-bulk"
                    >
                      {createEventsMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Import Events
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setShowEventForm(false);
                        setBulkEventText("");
                      }}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

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
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Analytics Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Users</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2" data-testid="text-total-users">
                      {stats?.stats?.totalUsers || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                    <Users className="text-blue-700 dark:text-blue-300" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Members</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2" data-testid="text-total-members">
                      {stats?.stats?.totalMembers || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                    <Building className="text-purple-700 dark:text-purple-300" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Guests</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2" data-testid="text-total-guests">
                      {stats?.stats?.totalGuests || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-lg flex items-center justify-center">
                    <Ticket className="text-green-700 dark:text-green-300" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 rounded-lg p-6 border border-pink-200 dark:border-pink-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-pink-600 dark:text-pink-400">Total Event Guests</p>
                    <p className="text-3xl font-bold text-pink-900 dark:text-pink-100 mt-2" data-testid="text-total-event-users">
                      {stats?.stats?.totalEventUsers || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-pink-200 dark:bg-pink-800 rounded-lg flex items-center justify-center">
                    <Calendar className="text-pink-700 dark:text-pink-300" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Total Events</p>
                    <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2" data-testid="text-total-events">
                      {stats?.stats?.totalEvents || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-200 dark:bg-orange-800 rounded-lg flex items-center justify-center">
                    <Calendar className="text-orange-700 dark:text-orange-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "location" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Building Location Map</h2>
            <p className="text-sm text-gray-600 mb-8">
              Frontier Tower - 16 Story Office Building (Floor 13 omitted)
            </p>
            
            <div className="flex justify-center py-8">
              <div className="w-full max-w-2xl">
                {/* Building floors - displayed from top to bottom */}
                {['16', '15', '14', '12', '11', '10', '9', '8', '7', '6', '5', '4', '3', '2'].map((floor, index) => {
                  const userCount = floorStats?.floorStats?.[floor] || 0;
                  const totalFloors = 14;
                  const isTop = index === 0;
                  const isBottom = index === totalFloors - 1;
                  
                  // Color based on user density
                  const getFloorColor = (count: number) => {
                    if (count === 0) return 'from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900';
                    if (count <= 2) return 'from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-950';
                    if (count <= 5) return 'from-green-100 to-green-200 dark:from-green-900 dark:to-green-950';
                    if (count <= 10) return 'from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-950';
                    return 'from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-950';
                  };
                  
                  return (
                    <div
                      key={floor}
                      className={`h-14 mb-1 border-2 border-gray-400 dark:border-gray-600 ${
                        isTop ? 'rounded-t-lg' : ''
                      } ${isBottom ? 'rounded-b-lg' : ''} bg-gradient-to-r ${getFloorColor(userCount)} shadow-sm`}
                      data-testid={`floor-${floor}`}
                    >
                      {/* Floor number and user count */}
                      <div className="flex items-center justify-between px-6 h-full">
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-lg text-gray-900 dark:text-gray-100" data-testid={`text-floor-label-${floor}`}>
                            Floor {floor}
                          </span>
                          {floor === '16' && (
                            <Badge variant="secondary" className="text-xs">
                              Guests
                            </Badge>
                          )}
                          {floor === '2' && (
                            <Badge variant="secondary" className="text-xs">
                              Events
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="font-semibold text-gray-900 dark:text-gray-100" data-testid={`text-floor-count-${floor}`}>
                            {userCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Building base/foundation */}
                <div className="mt-2 h-6 bg-gradient-to-b from-gray-600 to-gray-800 dark:from-gray-700 dark:to-gray-900 rounded-b-xl border-2 border-gray-700 dark:border-gray-800" />
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border border-gray-300" />
                <span className="text-sm text-gray-600 dark:text-gray-400">0 users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-950 border border-blue-300" />
                <span className="text-sm text-gray-600 dark:text-gray-400">1-2 users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-950 border border-green-300" />
                <span className="text-sm text-gray-600 dark:text-gray-400">3-5 users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-950 border border-yellow-300" />
                <span className="text-sm text-gray-600 dark:text-gray-400">6-10 users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-950 border border-orange-300" />
                <span className="text-sm text-gray-600 dark:text-gray-400">10+ users</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
