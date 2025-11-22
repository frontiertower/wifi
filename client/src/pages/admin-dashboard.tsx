import { useState, useEffect } from "react";
import { Building, Users, Ticket, Calendar, TrendingUp, Plus, Filter, Sparkles, Settings, Eye, EyeOff, Download, ClipboardList, Menu, ExternalLink, Building2, Save, Trash2, X, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { TourBooking, EventHostBooking, MembershipApplication, ChatInviteRequest, Booking, DirectoryListing } from "@shared/schema";

type Tab = "users" | "events" | "analytics" | "leads" | "directory" | "settings";

// Helper function to generate URL slugs from listing names
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

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

interface UsersResponse {
  users?: any[];
}

interface EventsResponse {
  events?: any[];
}

interface FloorStatsResponse {
  floorStats?: Record<string, { count: number; names: string[] }>;
}

interface TourBookingsResponse {
  bookings?: TourBooking[];
}

interface EventHostBookingsResponse {
  bookings?: EventHostBooking[];
}

interface MembershipApplicationsResponse {
  applications?: MembershipApplication[];
}

interface ChatInviteRequestsResponse {
  requests?: ChatInviteRequest[];
}

interface BookingsResponse {
  bookings?: Booking[];
}

interface DirectoryListingsResponse {
  success: boolean;
  listings: DirectoryListing[];
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("analytics");
  const [showEventForm, setShowEventForm] = useState(false);
  const [bulkEventText, setBulkEventText] = useState("");
  const [eventFilter, setEventFilter] = useState<"upcoming" | "past">("upcoming");
  const [editingDirectoryId, setEditingDirectoryId] = useState<number | null>(null);
  const [editDirectoryForm, setEditDirectoryForm] = useState<Partial<DirectoryListing>>({});
  const [deleteDirectoryId, setDeleteDirectoryId] = useState<number | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<number | null>(null);
  const { toast } = useToast();

  const cleanHostName = (host: string | null): string | null => {
    if (!host) return null;
    
    return host
      .replace(/Frontier Tower \| San Francisco/gi, '')
      .replace(/^[\s,&]+|[\s,&]+$/g, '')
      .trim() || null;
  };

  // Support URL hash navigation (e.g., /admin#settings)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the # symbol
      if (hash && ['users', 'events', 'analytics', 'leads', 'directory', 'settings'].includes(hash)) {
        setActiveTab(hash as Tab);
      } else if (hash === 'location') {
        // Redirect old location tab to analytics
        setActiveTab('analytics');
        window.location.hash = 'analytics';
      } else if (hash === 'bookings') {
        // Redirect old bookings tab to leads
        setActiveTab('leads');
        window.location.hash = 'leads';
      }
    };
    
    // Check hash on mount
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Update URL hash when tab changes
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  const { data: stats } = useQuery<StatsResponse>({
    queryKey: ['/api/admin/stats'],
  });

  const { data: allUsers } = useQuery<UsersResponse>({
    queryKey: ['/api/admin/users'],
    enabled: activeTab === "users",
  });

  const { data: events } = useQuery<EventsResponse>({
    queryKey: ['/api/admin/events'],
    enabled: activeTab === "events",
  });

  const { data: floorStats } = useQuery<FloorStatsResponse>({
    queryKey: ['/api/admin/floor-stats'],
    enabled: activeTab === "analytics",
  });

  const { data: tourBookings } = useQuery<TourBookingsResponse>({
    queryKey: ['/api/tour-bookings'],
    enabled: activeTab === "leads",
  });

  const { data: eventHostBookings } = useQuery<EventHostBookingsResponse>({
    queryKey: ['/api/event-host-bookings'],
    enabled: activeTab === "leads",
  });

  const { data: membershipApplications } = useQuery<MembershipApplicationsResponse>({
    queryKey: ['/api/membership-applications'],
    enabled: activeTab === "leads",
  });

  const { data: chatInviteRequests } = useQuery<ChatInviteRequestsResponse>({
    queryKey: ['/api/admin/chat-invite-requests'],
    enabled: activeTab === "leads",
  });

  const { data: bookings } = useQuery<BookingsResponse>({
    queryKey: ['/api/bookings'],
    enabled: activeTab === "leads",
  });

  const { data: directoryData } = useQuery<DirectoryListingsResponse>({
    queryKey: ["/api/directory"],
    enabled: activeTab === "directory",
  });

  const updateDirectoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<DirectoryListing> }) => {
      return apiRequest("PATCH", `/api/directory/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/directory"] });
      setEditingDirectoryId(null);
      setEditDirectoryForm({});
      toast({
        title: "Success",
        description: "Directory listing updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update listing",
        variant: "destructive",
      });
    },
  });

  const deleteDirectoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/directory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/directory"] });
      setDeleteDirectoryId(null);
      toast({
        title: "Success",
        description: "Directory listing deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete listing",
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setDeleteEventId(null);
      toast({
        title: "Success",
        description: "Event hidden successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to hide event",
        variant: "destructive",
      });
    },
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

  const scrapeImagesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/events/scrape-images", {});
      return response.json();
    },
    onSuccess: (data) => {
      const scrapedCount = data.scrapedCount || 0;
      const failedCount = data.failedCount || 0;
      const totalAttempted = scrapedCount + failedCount;
      
      if (scrapedCount === 0 && failedCount > 0) {
        // All scrapes failed
        toast({
          title: "Image Scraping Failed",
          description: `Failed to scrape images from all ${failedCount} event${failedCount !== 1 ? 's' : ''}. External site may be rate limiting requests.`,
          variant: "destructive",
        });
        console.error('Failed scrapes:', data.failedScrapes);
      } else if (failedCount > 0 && scrapedCount > 0) {
        // Partial success
        toast({
          title: "Images Partially Scraped",
          description: `Successfully scraped ${scrapedCount} image${scrapedCount !== 1 ? 's' : ''}, ${failedCount} failed. Check console for details.`,
          variant: "default",
        });
        console.error('Failed scrapes:', data.failedScrapes);
      } else if (scrapedCount > 0) {
        // All successful
        toast({
          title: "Images Scraped Successfully",
          description: `Successfully scraped ${scrapedCount} event image${scrapedCount !== 1 ? 's' : ''}`,
        });
      } else {
        // No events to scrape
        toast({
          title: "No Images to Scrape",
          description: "No events with URLs found to scrape images from",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Scrape Images",
        description: error.message || "An error occurred while scraping event images",
        variant: "destructive",
      });
    },
  });

  const syncEventsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/events/sync", {});
      return response.json();
    },
    onSuccess: (data) => {
      const count = data.events?.length || 0;
      const deletedCount = data.deletedCount || 0;
      const failedCount = data.failedEvents?.length || 0;
      
      let description = `Synced ${count} event${count !== 1 ? 's' : ''}`;
      if (deletedCount > 0) {
        description += `, cleaned up ${deletedCount} duplicate${deletedCount !== 1 ? 's' : ''}`;
      }
      if (failedCount > 0) {
        description += `, ${failedCount} failed`;
      }
      
      if (failedCount > 0) {
        toast({
          title: "Events Partially Synced",
          description: description + ". Check console for details.",
          variant: "default",
        });
        console.error('Failed events:', data.failedEvents);
      } else {
        toast({
          title: "Events Synced",
          description,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Sync Events",
        description: error instanceof Error ? error.message : "Could not sync events from external feed",
        variant: "destructive",
      });
    },
  });

  const deduplicateEventsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/events/cleanup", {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Events Deduplicated",
        description: data.message || `Merged ${data.mergedCount} event${data.mergedCount !== 1 ? 's' : ''}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Deduplicate Events",
        description: error instanceof Error ? error.message : "Could not deduplicate events",
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

  const handleExportUsers = () => {
    // Create a link to download the CSV file
    const timestamp = new Date().toISOString().split('T')[0];
    const link = document.createElement('a');
    link.href = '/api/admin/users/export';
    link.download = `frontier-tower-users-${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Started",
      description: "Your CSV file is being downloaded",
    });
  };

  const tabs = [
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "users", label: "Users", icon: Users },
    { id: "events", label: "Events", icon: Calendar },
    { id: "leads", label: "Leads", icon: ClipboardList },
    { id: "directory", label: "Directory", icon: Building2 },
    { id: "settings", label: "WiFi", icon: Wifi },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Building className="text-primary-600 dark:text-primary-400 text-xl mr-2" />
                <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100">
                  <span className="hidden sm:inline">Frontier Tower Admin</span>
                  <span className="sm:hidden">FT Admin</span>
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <ThemeToggle />
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden md:block">Last login: Today, 2:30 PM</div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-menu-toggle">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <DropdownMenuItem
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        data-testid={`menu-item-${tab.id}`}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{tab.label}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Desktop Tabs - Hidden on mobile */}
        <div className="mb-6 -mx-4 sm:mx-0 hidden md:block">
          <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 px-4 sm:px-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                    } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center flex-shrink-0`}
                    data-testid={`tab-${tab.id}`}
                  >
                    <Icon className="mr-1.5 sm:mr-2 h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {activeTab === "users" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">All Connected Users</h2>
                <div className="flex gap-2">
                  <Input placeholder="Search users..." className="flex-1 sm:w-64" data-testid="input-search-users" />
                  <Button variant="outline" size="sm" data-testid="button-filter">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExportUsers}
                    data-testid="button-export-users"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name / Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Event / Details</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!allUsers?.users || allUsers.users.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
                {allUsers?.users?.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name || "N/A"}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
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
                      <div className="text-sm">
                        {user.role === "event" && (
                          <>
                            {user.eventName && <div className="font-medium">{user.eventName}</div>}
                            {user.organization && <div className="text-gray-500 dark:text-gray-400">{user.organization}</div>}
                            <div className="text-gray-500 dark:text-gray-400">{user.floor ? `Floor ${user.floor}` : "-"}</div>
                          </>
                        )}
                        {user.role === "guest" && (
                          <>
                            {user.host && <div className="text-gray-600 dark:text-gray-400">Host: {user.host}</div>}
                            <div className="text-gray-500 dark:text-gray-400">{user.floor ? `Floor ${user.floor}` : "-"}</div>
                          </>
                        )}
                        {user.role === "member" && (
                          <div className="text-gray-500 dark:text-gray-400">
                            {user.floor ? `Floor ${user.floor}` : "-"}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">{user.phone || "-"}</TableCell>
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
          </div>
        )}

        {activeTab === "events" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Event Management</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button 
                    onClick={() => syncEventsMutation.mutate()}
                    disabled={syncEventsMutation.isPending}
                    variant="outline"
                    className="w-full sm:w-auto" 
                    data-testid="button-sync-events"
                  >
                    {syncEventsMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Syncing...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Sync Events
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => scrapeImagesMutation.mutate()}
                    disabled={scrapeImagesMutation.isPending}
                    variant="outline"
                    className="w-full sm:w-auto" 
                    data-testid="button-scrape-images"
                  >
                    {scrapeImagesMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Scraping...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Scrape Images
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => deduplicateEventsMutation.mutate()}
                    disabled={deduplicateEventsMutation.isPending}
                    variant="outline"
                    className="w-full sm:w-auto" 
                    data-testid="button-deduplicate-events"
                  >
                    {deduplicateEventsMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Deduplicating...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        De-duplicate
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => setShowEventForm(!showEventForm)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white w-full sm:w-auto" 
                    data-testid="button-create-event"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Import Events
                  </Button>
                </div>
              </div>
            </div>

            {showEventForm && (
              <Card className="m-4 sm:m-6 p-4 sm:p-6 bg-muted/30">
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

            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <Button
                  variant={eventFilter === "upcoming" ? "default" : "outline"}
                  onClick={() => setEventFilter("upcoming")}
                  data-testid="button-filter-upcoming"
                >
                  Upcoming
                </Button>
                <Button
                  variant={eventFilter === "past" ? "default" : "outline"}
                  onClick={() => setEventFilter("past")}
                  data-testid="button-filter-past"
                >
                  Past Events
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const now = new Date();
                  const allEvents = events?.events ?? [];
                  const filteredEvents = allEvents
                    .filter((event: any) => {
                      const endDate = new Date(event.endDate);
                      return eventFilter === "upcoming" ? endDate >= now : endDate < now;
                    })
                    .sort((a: any, b: any) => {
                      const aDate = new Date(a.startDate).getTime();
                      const bDate = new Date(b.startDate).getTime();
                      // Past events: reverse chronological (newest first)
                      // Upcoming events: chronological (earliest first)
                      return eventFilter === "past" ? bDate - aDate : aDate - bDate;
                    });

                  if (filteredEvents.length === 0) {
                    return (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No {eventFilter} events found.
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return filteredEvents.map((event: any) => {
                    const isHidden = event.isHidden === true;
                    const rowClassName = isHidden ? "opacity-50 bg-gray-100 dark:bg-gray-800" : "";
                    
                    return (
                      <TableRow key={event.id} className={rowClassName}>
                        <TableCell className="font-medium">
                          {event.name}
                          {isHidden && (
                            <Badge variant="secondary" className="ml-2">
                              Hidden
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate" title={event.description}>
                          {event.description || "-"}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {new Date(event.startDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {cleanHostName(event.host) || "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {event.originalLocation || "-"}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {event.createdAt ? new Date(event.createdAt).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {event.url && !isHidden && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                asChild
                                data-testid={`button-details-event-${event.id}`}
                              >
                                <a href={event.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Details
                                </a>
                              </Button>
                            )}
                            {event.url && isHidden && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                disabled
                                data-testid={`button-details-event-${event.id}`}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                            )}
                            {!isHidden && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600" 
                                onClick={() => setDeleteEventId(event.id)}
                                data-testid={`button-delete-event-${event.id}`}
                              >
                                Hide Event
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  });
                })()}
              </TableBody>
            </Table>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-6">Analytics Dashboard</h2>
            
            <div className="mb-8">
              <h3 className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-4">Today's Activity</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-members-today">{stats?.stats?.membersToday || 0}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Members Today</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Ticket className="text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-guests-today">{stats?.stats?.guestsToday || 0}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Guests Today</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-event-guests-today">{stats?.stats?.eventGuestsToday || 0}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Event Guests Today</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Calendar className="text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-events-today">{stats?.stats?.eventsToday || 0}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Events Today</p>
                    </div>
                  </div>
                </div>

                
              </div>
            </div>

            <h3 className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-4">Lifetime Totals</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg p-4 sm:p-6 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Members</p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2" data-testid="text-total-members">
                      {stats?.stats?.totalMembers || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                    <Building className="text-purple-700 dark:text-purple-300" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg p-4 sm:p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Guests</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-100 mt-2" data-testid="text-total-guests">
                      {stats?.stats?.totalGuests || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-lg flex items-center justify-center">
                    <Ticket className="text-green-700 dark:text-green-300" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 rounded-lg p-4 sm:p-6 border border-pink-200 dark:border-pink-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-pink-600 dark:text-pink-400">Total Event Guests</p>
                    <p className="text-2xl sm:text-3xl font-bold text-pink-900 dark:text-pink-100 mt-2" data-testid="text-total-event-users">
                      {stats?.stats?.totalEventUsers || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-pink-200 dark:bg-pink-800 rounded-lg flex items-center justify-center">
                    <Calendar className="text-pink-700 dark:text-pink-300" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg p-4 sm:p-6 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Total Events</p>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2" data-testid="text-total-events">
                      {stats?.stats?.totalEvents || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-200 dark:bg-orange-800 rounded-lg flex items-center justify-center">
                    <Calendar className="text-orange-700 dark:text-orange-300" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Users</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2" data-testid="text-total-users">
                      {stats?.stats?.totalUsers || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                    <Users className="text-blue-700 dark:text-blue-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Building Location Map */}
            <div className="mt-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">Building Location Map</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                Frontier Tower - 16 Story Office Building (Floor 13 omitted)
              </p>
              
              <div className="flex justify-center py-8">
                <div className="w-full max-w-2xl">
                  {/* Building floors - displayed from top to bottom */}
                  {['16', '15', '14', '12', '11', '10', '9', '8', '7', '6', '5', '4', '3', '2'].map((floor, index) => {
                    const floorData = floorStats?.floorStats?.[floor] || { count: 0, names: [] };
                    const userCount = floorData.count;
                    const userNames = floorData.names || [];
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
                        className={`mb-1 border-2 border-gray-400 dark:border-gray-600 ${
                          isTop ? 'rounded-t-lg' : ''
                        } ${isBottom ? 'rounded-b-lg' : ''} bg-gradient-to-r ${getFloorColor(userCount)} shadow-sm`}
                        data-testid={`floor-${floor}`}
                      >
                        {/* Floor number and user count */}
                        <div className="flex items-center justify-between px-4 sm:px-6 py-2">
                          <div className="flex items-center gap-2 sm:gap-4">
                            <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100" data-testid={`text-floor-label-${floor}`}>
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
                        
                        {/* User names */}
                        {userNames.length > 0 && (
                          <div className="px-4 sm:px-6 pb-2">
                            <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300" data-testid={`text-floor-names-${floor}`}>
                              {userNames.join(', ')}
                              {userCount > 5 && <span className="text-gray-500 dark:text-gray-400"> +{userCount - 5} more</span>}
                            </div>
                          </div>
                        )}
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
          </div>
        )}

        {activeTab === "leads" && (
          <div className="space-y-6">
            {/* Tour Leads */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Tour Leads ({tourBookings?.bookings?.length || 0})
              </h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Tour Type</TableHead>
                      <TableHead>Tour Info</TableHead>
                      <TableHead>Private Office Interest</TableHead>
                      <TableHead>People</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tourBookings?.bookings?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500 dark:text-gray-400">
                          No tour leads yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      tourBookings?.bookings?.map((booking) => (
                        <TableRow key={booking.id} data-testid={`tour-booking-${booking.id}`}>
                          <TableCell className="font-medium">{booking.name}</TableCell>
                          <TableCell>{booking.email}</TableCell>
                          <TableCell>{booking.phone}</TableCell>
                          <TableCell>
                            {booking.tourType === "custom" ? (
                              <Badge variant="outline">Custom Time</Badge>
                            ) : (
                              <Badge variant="default">Group Tour</Badge>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            {booking.tourType === "custom" ? (
                              booking.tourDate && booking.tourTime 
                                ? `${new Date(booking.tourDate).toLocaleDateString()} ${booking.tourTime}`
                                : 'N/A'
                            ) : (
                              <div className="space-y-1">
                                {booking.groupTourSelection && (
                                  <div className="text-sm">{booking.groupTourSelection}</div>
                                )}
                                {booking.groupTourUrl && (
                                  <a
                                    href={booking.groupTourUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline"
                                  >
                                    View on Luma
                                  </a>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {booking.interestedInPrivateOffice ? (
                              <Badge variant="default">Yes</Badge>
                            ) : (
                              <Badge variant="secondary">No</Badge>
                            )}
                          </TableCell>
                          <TableCell>{booking.numberOfPeople || 'N/A'}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Event Host Leads */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Event Host Leads ({eventHostBookings?.bookings?.length || 0})
              </h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventHostBookings?.bookings?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400">
                          No event host leads yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      eventHostBookings?.bookings?.map((booking) => (
                        <TableRow key={booking.id} data-testid={`event-host-booking-${booking.id}`}>
                          <TableCell className="font-medium">{booking.name}</TableCell>
                          <TableCell>{booking.email}</TableCell>
                          <TableCell>{booking.phone}</TableCell>
                          <TableCell>
                            {booking.eventType ? (
                              <span className="font-medium">{booking.eventType}</span>
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{booking.eventDescription || 'N/A'}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Membership Inquiries */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Membership Inquiries ({membershipApplications?.applications?.length || 0})
              </h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Telegram</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>LinkedIn</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {membershipApplications?.applications?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500 dark:text-gray-400">
                          No membership inquiries yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      membershipApplications?.applications?.map((app) => (
                        <TableRow key={app.id} data-testid={`membership-application-${app.id}`}>
                          <TableCell className="font-medium">{app.name}</TableCell>
                          <TableCell>{app.email}</TableCell>
                          <TableCell>{app.phone}</TableCell>
                          <TableCell>{app.telegram || 'N/A'}</TableCell>
                          <TableCell>{app.company || 'N/A'}</TableCell>
                          <TableCell>
                            {app.linkedIn ? (
                              <a 
                                href={app.linkedIn} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                View
                              </a>
                            ) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={app.status === 'pending' ? 'secondary' : 'default'}>
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {app.createdAt ? new Date(app.createdAt).toLocaleString() : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Chat Invite Requests */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Chat Invite Requests ({chatInviteRequests?.requests?.length || 0})
              </h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>LinkedIn</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chatInviteRequests?.requests?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500 dark:text-gray-400">
                          No chat invite requests yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      chatInviteRequests?.requests?.map((request) => (
                        <TableRow key={request.id} data-testid={`chat-request-${request.id}`}>
                          <TableCell className="font-medium">{request.name}</TableCell>
                          <TableCell>{request.email}</TableCell>
                          <TableCell>{request.phone}</TableCell>
                          <TableCell className="text-sm max-w-xs truncate" title={request.message || undefined}>
                            {request.message || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {request.linkedIn ? (
                              <a 
                                href={request.linkedIn} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                View
                              </a>
                            ) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={request.status === 'pending' ? 'secondary' : 'default'}>
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {request.createdAt ? new Date(request.createdAt).toLocaleString() : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Regular Event/Meeting Leads */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Event/Meeting Leads ({bookings?.bookings?.length || 0})
              </h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organizer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>LinkedIn</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings?.bookings?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400">
                          No event/meeting leads yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      bookings?.bookings?.map((booking) => (
                        <TableRow key={booking.id} data-testid={`booking-${booking.id}`}>
                          <TableCell className="font-medium">{booking.organizerName}</TableCell>
                          <TableCell>{booking.organizerEmail}</TableCell>
                          <TableCell>{booking.organizerPhone || 'N/A'}</TableCell>
                          <TableCell>
                            {booking.eventId ? (
                              <Badge variant="default">Event #{booking.eventId}</Badge>
                            ) : (
                              <span className="font-medium">{booking.eventName}</span>
                            )}
                          </TableCell>
                          <TableCell>{booking.organizerLinkedIn || 'N/A'}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "directory" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Directory Management
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Manage all directory listings
                  </p>
                </div>
                <Button
                  onClick={() => window.location.href = "/addlisting"}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-add-new-listing"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Listing
                </Button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {!directoryData?.listings ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading listings...</p>
                </div>
              ) : directoryData.listings.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No listings yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Add your first directory listing to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {directoryData.listings.map((listing) => {
                    const isEditing = editingDirectoryId === listing.id;
                    const currentData = isEditing ? editDirectoryForm : listing;
                    const displayName = listing.type === "company" && listing.companyName ? listing.companyName :
                                       listing.type === "community" && listing.communityName ? listing.communityName :
                                       listing.type === "person" && listing.lastName && listing.firstName ? `${listing.lastName}, ${listing.firstName}` :
                                       "Unknown";
                    
                    // Generate slug for edit page URL
                    const slug = slugify(displayName);
                    const editPageUrl = `/directory/edit/${slug}`;

                    return (
                      <Card key={listing.id} data-testid={`card-admin-listing-${listing.id}`}>
                        <div className="p-4 sm:p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {isEditing ? "Editing: " : ""}{displayName}
                            </h3>
                            <div className="flex items-center gap-2">
                              {!isEditing ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    data-testid={`button-view-edit-page-${listing.id}`}
                                  >
                                    <a href={editPageUrl}>
                                      <ExternalLink className="mr-2 h-4 w-4" />
                                      Edit Page
                                    </a>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingDirectoryId(listing.id);
                                      setEditDirectoryForm({ ...listing });
                                    }}
                                    data-testid={`button-edit-${listing.id}`}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteDirectoryId(listing.id)}
                                    data-testid={`button-delete-${listing.id}`}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => {
                                      if (editingDirectoryId !== null) {
                                        const { id, createdAt, ...updateData } = editDirectoryForm;
                                        updateDirectoryMutation.mutate({ id: editingDirectoryId, data: updateData });
                                      }
                                    }}
                                    disabled={updateDirectoryMutation.isPending}
                                    data-testid={`button-save-${listing.id}`}
                                  >
                                    <Save className="mr-2 h-4 w-4" />
                                    Save
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingDirectoryId(null);
                                      setEditDirectoryForm({});
                                    }}
                                    data-testid={`button-cancel-${listing.id}`}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`type-${listing.id}`}>Type</Label>
                              <Input
                                id={`type-${listing.id}`}
                                value={currentData.type || ""}
                                disabled
                                className="bg-gray-100 dark:bg-gray-800"
                              />
                            </div>

                            {listing.type === "company" && (
                              <div>
                                <Label htmlFor={`companyName-${listing.id}`}>Company Name</Label>
                                <Input
                                  id={`companyName-${listing.id}`}
                                  value={currentData.companyName || ""}
                                  onChange={(e) =>
                                    isEditing &&
                                    setEditDirectoryForm({ ...editDirectoryForm, companyName: e.target.value })
                                  }
                                  disabled={!isEditing}
                                  data-testid={`input-companyName-${listing.id}`}
                                />
                              </div>
                            )}

                            {listing.type === "community" && (
                              <div>
                                <Label htmlFor={`communityName-${listing.id}`}>Community Name</Label>
                                <Input
                                  id={`communityName-${listing.id}`}
                                  value={currentData.communityName || ""}
                                  onChange={(e) =>
                                    isEditing &&
                                    setEditDirectoryForm({ ...editDirectoryForm, communityName: e.target.value })
                                  }
                                  disabled={!isEditing}
                                  data-testid={`input-communityName-${listing.id}`}
                                />
                              </div>
                            )}

                            {listing.type === "person" && (
                              <>
                                <div>
                                  <Label htmlFor={`firstName-${listing.id}`}>First Name</Label>
                                  <Input
                                    id={`firstName-${listing.id}`}
                                    value={currentData.firstName || ""}
                                    onChange={(e) =>
                                      isEditing &&
                                      setEditDirectoryForm({ ...editDirectoryForm, firstName: e.target.value })
                                    }
                                    disabled={!isEditing}
                                    data-testid={`input-firstName-${listing.id}`}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`lastName-${listing.id}`}>Last Name</Label>
                                  <Input
                                    id={`lastName-${listing.id}`}
                                    value={currentData.lastName || ""}
                                    onChange={(e) =>
                                      isEditing &&
                                      setEditDirectoryForm({ ...editDirectoryForm, lastName: e.target.value })
                                    }
                                    disabled={!isEditing}
                                    data-testid={`input-lastName-${listing.id}`}
                                  />
                                </div>
                              </>
                            )}

                            <div>
                              <Label htmlFor={`floor-${listing.id}`}>Floor</Label>
                              <Input
                                id={`floor-${listing.id}`}
                                value={currentData.floor || ""}
                                onChange={(e) =>
                                  isEditing && setEditDirectoryForm({ ...editDirectoryForm, floor: e.target.value })
                                }
                                disabled={!isEditing}
                                placeholder="e.g., 5th Floor"
                                data-testid={`input-floor-${listing.id}`}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`officeNumber-${listing.id}`}>Office Number</Label>
                              <Input
                                id={`officeNumber-${listing.id}`}
                                value={currentData.officeNumber || ""}
                                onChange={(e) =>
                                  isEditing &&
                                  setEditDirectoryForm({ ...editDirectoryForm, officeNumber: e.target.value })
                                }
                                disabled={!isEditing}
                                data-testid={`input-officeNumber-${listing.id}`}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`phone-${listing.id}`}>Phone</Label>
                              <Input
                                id={`phone-${listing.id}`}
                                value={currentData.phone || ""}
                                onChange={(e) =>
                                  isEditing && setEditDirectoryForm({ ...editDirectoryForm, phone: e.target.value })
                                }
                                disabled={!isEditing}
                                data-testid={`input-phone-${listing.id}`}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`email-${listing.id}`}>Email</Label>
                              <Input
                                id={`email-${listing.id}`}
                                type="email"
                                value={currentData.email || ""}
                                onChange={(e) =>
                                  isEditing && setEditDirectoryForm({ ...editDirectoryForm, email: e.target.value })
                                }
                                disabled={!isEditing}
                                data-testid={`input-email-${listing.id}`}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`telegramUsername-${listing.id}`}>
                                Telegram Username
                              </Label>
                              <Input
                                id={`telegramUsername-${listing.id}`}
                                value={currentData.telegramUsername || ""}
                                onChange={(e) =>
                                  isEditing &&
                                  setEditDirectoryForm({ ...editDirectoryForm, telegramUsername: e.target.value })
                                }
                                disabled={!isEditing}
                                placeholder="@username"
                                data-testid={`input-telegram-${listing.id}`}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`website-${listing.id}`}>Website</Label>
                              <Input
                                id={`website-${listing.id}`}
                                value={currentData.website || ""}
                                onChange={(e) =>
                                  isEditing && setEditDirectoryForm({ ...editDirectoryForm, website: e.target.value })
                                }
                                disabled={!isEditing}
                                data-testid={`input-website-${listing.id}`}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`linkedinUrl-${listing.id}`}>LinkedIn URL</Label>
                              <Input
                                id={`linkedinUrl-${listing.id}`}
                                value={currentData.linkedinUrl || ""}
                                onChange={(e) =>
                                  isEditing && setEditDirectoryForm({ ...editDirectoryForm, linkedinUrl: e.target.value })
                                }
                                disabled={!isEditing}
                                data-testid={`input-linkedin-${listing.id}`}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`twitterHandle-${listing.id}`}>Twitter Handle</Label>
                              <Input
                                id={`twitterHandle-${listing.id}`}
                                value={currentData.twitterHandle || ""}
                                onChange={(e) =>
                                  isEditing && setEditDirectoryForm({ ...editDirectoryForm, twitterHandle: e.target.value })
                                }
                                disabled={!isEditing}
                                placeholder="@username"
                                data-testid={`input-twitter-${listing.id}`}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`logoUrl-${listing.id}`}>Logo URL</Label>
                              <Input
                                id={`logoUrl-${listing.id}`}
                                value={currentData.logoUrl || ""}
                                onChange={(e) =>
                                  isEditing && setEditDirectoryForm({ ...editDirectoryForm, logoUrl: e.target.value })
                                }
                                disabled={!isEditing}
                                data-testid={`input-logoUrl-${listing.id}`}
                              />
                            </div>

                            <div className="md:col-span-2">
                              <Label htmlFor={`description-${listing.id}`}>Description</Label>
                              <Textarea
                                id={`description-${listing.id}`}
                                value={currentData.description || ""}
                                onChange={(e) =>
                                  isEditing &&
                                  setEditDirectoryForm({ ...editDirectoryForm, description: e.target.value })
                                }
                                disabled={!isEditing}
                                rows={3}
                                data-testid={`input-description-${listing.id}`}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && <SettingsTab />}
      </div>

      <AlertDialog open={deleteDirectoryId !== null} onOpenChange={() => setDeleteDirectoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this directory listing. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDirectoryId !== null) {
                  deleteDirectoryMutation.mutate(deleteDirectoryId);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteEventId !== null} onOpenChange={() => setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hide Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide this event from the admin page. The event will still exist in the database and will be shown grayed out.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-event">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteEventId !== null) {
                  deleteEventMutation.mutate(deleteEventId);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete-event"
            >
              Hide Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile Floating Bottom Dock - Visible only on small screens */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-50">
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <nav className="flex justify-around items-center px-2 py-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-gray-500 dark:text-gray-400"
                  } flex flex-col items-center justify-center transition-colors hover-elevate active-elevate-2 rounded-lg p-2 min-w-[60px]`}
                  data-testid={`mobile-tab-${tab.id}`}
                >
                  <Icon className={`h-6 w-6 ${activeTab === tab.id ? "mb-1" : "mb-0.5"}`} />
                  {activeTab === tab.id && (
                    <div className="w-1 h-1 rounded-full bg-primary-600 dark:bg-primary-400 mt-1"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  const { toast } = useToast();
  const [guestPassword, setGuestPassword] = useState('makesomething');
  const [showGuestPassword, setShowGuestPassword] = useState(false);
  const [apiType, setApiType] = useState<'modern' | 'legacy' | 'none'>('none');
  const [controllerUrl, setControllerUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [site, setSite] = useState('default');

  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ['/api/admin/settings'],
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const response = await apiRequest("POST", "/api/admin/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      toast({
        title: "Settings Saved",
        description: "UniFi controller settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Load settings when data is available
  useEffect(() => {
    if (settings) {
      setGuestPassword(settings.guest_password || 'makesomething');
      setApiType((settings.unifi_api_type as any) || 'none');
      setControllerUrl(settings.unifi_controller_url || '');
      setApiKey(settings.unifi_api_key || '');
      setUsername(settings.unifi_username || '');
      setPassword(settings.unifi_password || '');
      setSite(settings.unifi_site || 'default');
    }
  }, [settings]);

  const handleSave = () => {
    const data: Record<string, string> = {
      guest_password: guestPassword,
      unifi_api_type: apiType,
      unifi_controller_url: controllerUrl,
      unifi_site: site,
    };

    if (apiType === 'modern') {
      data.unifi_api_key = apiKey;
    } else if (apiType === 'legacy') {
      data.unifi_username = username;
      data.unifi_password = password;
    }

    saveSettingsMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Guest Password Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">WiFi Access Password</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Configure the password guests need to enter before accessing the WiFi
          </p>
        </div>

        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="guest-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Guest Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="guest-password"
                  data-testid="input-guest-password-setting"
                  type={showGuestPassword ? "text" : "password"}
                  placeholder="makesomething"
                  value={guestPassword}
                  onChange={(e) => setGuestPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowGuestPassword(!showGuestPassword)}
                  data-testid="button-toggle-guest-password"
                >
                  {showGuestPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Guests will need to enter this password before they can access the registration form
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* UniFi Controller Settings Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">UniFi Controller Settings</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Configure your UniFi controller to enable guest authorization
          </p>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
        <div>
          <Label htmlFor="api-type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Controller Connection
          </Label>
          <RadioGroup value={apiType} onValueChange={(value: any) => setApiType(value)} className="mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="api-none" data-testid="radio-api-none" />
              <Label htmlFor="api-none" className="font-normal cursor-pointer">
                None (Mock Mode) - For testing without a real controller
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="modern" id="api-modern" data-testid="radio-api-modern" />
              <Label htmlFor="api-modern" className="font-normal cursor-pointer">
                Modern API (Network Application 9.1.105+) - Recommended
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="legacy" id="api-legacy" data-testid="radio-api-legacy" />
              <Label htmlFor="api-legacy" className="font-normal cursor-pointer">
                Legacy API - For older controllers
              </Label>
            </div>
          </RadioGroup>
        </div>

        {apiType !== 'none' && (
          <>
            <div>
              <Label htmlFor="controller-url" className="text-sm font-medium text-gray-700">
                Controller URL
              </Label>
              <Input
                id="controller-url"
                data-testid="input-controller-url"
                type="text"
                placeholder="https://192.168.1.1 or https://your-cloud-gateway"
                value={controllerUrl}
                onChange={(e) => setControllerUrl(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                The URL of your UniFi controller (without /api path)
              </p>
            </div>

            <div>
              <Label htmlFor="site" className="text-sm font-medium text-gray-700">
                Site ID
              </Label>
              <Input
                id="site"
                data-testid="input-site"
                type="text"
                placeholder="default"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Usually "default" unless you have multiple sites
              </p>
            </div>

            {apiType === 'modern' && (
              <div>
                <Label htmlFor="api-key" className="text-sm font-medium text-gray-700">
                  API Key
                </Label>
                <Input
                  id="api-key"
                  data-testid="input-api-key"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Generate in Network → Control Plane → Integrations
                </p>
              </div>
            )}

            {apiType === 'legacy' && (
              <>
                <div>
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Username
                  </Label>
                  <Input
                    id="username"
                    data-testid="input-username"
                    type="text"
                    placeholder="Admin username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    data-testid="input-password"
                    type="password"
                    placeholder="Admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </>
            )}
          </>
        )}

        {apiType !== 'none' && (
          <div className="mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">Setup Instructions</h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-2">
              {apiType === 'modern' ? (
                <>
                  <p><strong>Modern API Setup:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Open UniFi Network Application</li>
                    <li>Navigate to <strong>Network → Control Plane → Integrations</strong></li>
                    <li>Generate a new API key</li>
                    <li>Copy the key and paste it above</li>
                    <li>Enter your controller URL and site ID</li>
                  </ol>
                </>
              ) : (
                <>
                  <p><strong>Legacy API Setup:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Enter your UniFi controller URL (e.g., https://192.168.1.1:8443)</li>
                    <li>Provide admin username and password</li>
                    <li>Enter site name (usually "default")</li>
                  </ol>
                </>
              )}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Save Button for All Settings */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saveSettingsMutation.isPending}
          data-testid="button-save-all-settings"
          className="w-full sm:w-auto"
        >
          {saveSettingsMutation.isPending ? "Saving..." : "Save All Settings"}
        </Button>
      </div>
    </div>
  );
}
