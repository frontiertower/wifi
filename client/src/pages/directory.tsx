import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Building2, MapPin, Phone, Mail, Globe, MessageCircle, Plus, ArrowLeft, ChevronDown, ArrowUpDown, Settings, Edit, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import type { DirectoryListing } from "@shared/schema";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

export default function Directory() {
  const [expandedListings, setExpandedListings] = useState<Set<number>>(new Set());
  const [nameSortAsc, setNameSortAsc] = useState<boolean>(true);
  const [floorSortAsc, setFloorSortAsc] = useState<boolean>(true);
  const [activeSortMode, setActiveSortMode] = useState<"name" | "floor">("name");
  const [filterType, setFilterType] = useState<"all" | "company" | "person" | "community">("all");
  
  const { data, isLoading } = useQuery<{ success: boolean; listings: DirectoryListing[] }>({
    queryKey: ["/api/directory"],
  });

  const allListings = data?.listings || [];
  
  // Filter listings by type
  const rawListings = useMemo(() => {
    if (filterType === "all") return allListings;
    return allListings.filter(listing => listing.type === filterType);
  }, [allListings, filterType]);
  
  const listings = useMemo(() => {
    if (activeSortMode === "name") {
      return [...rawListings].sort((a, b) => {
        const nameA = a.companyName || a.communityName || `${a.lastName}, ${a.firstName}` || "";
        const nameB = b.companyName || b.communityName || `${b.lastName}, ${b.firstName}` || "";
        return nameSortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
    } else {
      // Sort by floor first, then by office number within each floor
      return [...rawListings].sort((a, b) => {
        const getFloorNumber = (floor: string | null) => {
          if (!floor) return 999; // Put items without floor at the end
          const match = floor.match(/(\d+)/);
          return match ? parseInt(match[1]) : 999;
        };
        
        const getOfficeNumber = (officeNumber: string | null) => {
          if (!officeNumber) return 0; // No office number
          const match = officeNumber.match(/(\d+)/);
          return match ? parseInt(match[1]) : 0;
        };
        
        const floorA = getFloorNumber(a.floor);
        const floorB = getFloorNumber(b.floor);
        
        // First sort by floor
        if (floorA !== floorB) {
          return floorSortAsc ? floorA - floorB : floorB - floorA;
        }
        
        // If same floor, sort by office number
        const officeA = getOfficeNumber(a.officeNumber);
        const officeB = getOfficeNumber(b.officeNumber);
        return floorSortAsc ? officeA - officeB : officeB - officeA;
      });
    }
  }, [rawListings, activeSortMode, nameSortAsc, floorSortAsc]);
  
  const toggleListing = (id: number) => {
    setExpandedListings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getDisplayName = (listing: DirectoryListing) => {
    if (listing.type === "company" && listing.companyName) {
      return listing.companyName;
    }
    if (listing.type === "community" && listing.communityName) {
      return listing.communityName;
    }
    if (listing.type === "person" && listing.lastName && listing.firstName) {
      return `${listing.lastName}, ${listing.firstName}`;
    }
    return "Unknown";
  };

  const getLocationText = (listing: DirectoryListing) => {
    if (listing.floor) {
      return listing.floor;
    }
    if (listing.officeNumber) {
      return listing.officeNumber;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Link href="/directory/admin">
          <Button
            variant="ghost"
            size="icon"
            data-testid="button-admin"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
        <ThemeToggle />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4"
              data-testid="button-back-home"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Building Directory
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Find companies, communities, and members in Frontier Tower
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <Button
              variant={filterType === "company" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("company")}
              data-testid="button-filter-companies"
            >
              <Building2 className="mr-2 h-4 w-4" />
              Companies
            </Button>
            <Button
              variant={filterType === "community" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("community")}
              data-testid="button-filter-communities"
            >
              <Users className="mr-2 h-4 w-4" />
              Communities
            </Button>
            <Button
              variant={filterType === "person" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("person")}
              data-testid="button-filter-people"
            >
              <User className="mr-2 h-4 w-4" />
              People
            </Button>
          </div>

          {/* Sort and Add Buttons */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={activeSortMode === "name" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (activeSortMode === "name") {
                    setNameSortAsc(!nameSortAsc);
                  } else {
                    setActiveSortMode("name");
                  }
                }}
                data-testid="button-sort-name"
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                {nameSortAsc ? "Sort A-Z" : "Sort Z-A"}
              </Button>
              <Button
                variant={activeSortMode === "floor" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (activeSortMode === "floor") {
                    setFloorSortAsc(!floorSortAsc);
                  } else {
                    setActiveSortMode("floor");
                  }
                }}
                data-testid="button-sort-floor"
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                {floorSortAsc ? "Sort 1-15" : "Sort 15-1"}
              </Button>
            </div>
            <Link href="/addlisting">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-add-listing"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Listing
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading directory...</p>
          </div>
        ) : listings.length === 0 ? (
          <Card className="p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No listings yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Be the first to add a listing to the building directory
            </p>
            <Link href="/addlisting">
              <Button data-testid="button-add-first-listing">
                <Plus className="mr-2 h-4 w-4" />
                Add First Listing
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => {
              const isExpanded = expandedListings.has(listing.id);
              return (
                <Card
                  key={listing.id}
                  className="hover-elevate cursor-pointer"
                  data-testid={`card-listing-${listing.id}`}
                  onClick={() => toggleListing(listing.id)}
                >
                  <CardHeader className="pb-3 pt-4">
                    {/* Mobile Layout - Vertical */}
                    <div className="flex md:hidden items-center justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {listing.logoUrl ? (
                          <img 
                            src={listing.logoUrl} 
                            alt={getDisplayName(listing)}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 bg-blue-100 dark:bg-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0 ${listing.logoUrl ? 'hidden' : ''}`}>
                          <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                        </div>
                        <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100 break-words flex-1 min-w-0 leading-none">
                          {getDisplayName(listing)}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getLocationText(listing) && (
                          <div className="flex items-center gap-1 text-base font-semibold text-gray-600 dark:text-gray-400 leading-none">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">{getLocationText(listing)}</span>
                          </div>
                        )}
                        <ChevronDown 
                          className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {/* Desktop Layout - Horizontal */}
                    <div className="hidden md:flex items-start gap-6">
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {listing.logoUrl ? (
                          <img 
                            src={listing.logoUrl} 
                            alt={getDisplayName(listing)}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-12 h-12 bg-blue-100 dark:bg-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0 ${listing.logoUrl ? 'hidden' : ''}`}>
                          <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                            {getDisplayName(listing)}
                          </CardTitle>
                          {getLocationText(listing) && (
                            <div className="flex items-center gap-1 text-base font-semibold text-gray-600 dark:text-gray-400 leading-none">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="whitespace-nowrap">{getLocationText(listing)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {listing.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-2">
                            {listing.description}
                          </p>
                        )}
                      </div>

                      <ChevronDown 
                        className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform flex-shrink-0 mt-1 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0 space-y-3">
                      {/* Show description on mobile only (desktop shows it in header) */}
                      {listing.description && (
                        <p className="md:hidden text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {listing.description}
                        </p>
                      )}

                      {listing.type === "company" && listing.contactPerson && (
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 pt-2 border-t md:border-t-0 md:pt-0">
                          <User className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                          <span><span className="text-gray-500 dark:text-gray-400">Contact:</span> {listing.contactPerson}</span>
                        </div>
                      )}

                      {listing.parentCommunityId && (
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 pt-2 border-t md:border-t-0 md:pt-0">
                          <Users className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                          <span>
                            <span className="text-gray-500 dark:text-gray-400">Part of:</span>{" "}
                            {allListings.find(l => l.id === listing.parentCommunityId)?.communityName || "Unknown Community"}
                          </span>
                        </div>
                      )}

                      {(listing.phone || listing.email || listing.telegramUsername || listing.website) && (
                        <div className="space-y-2 pt-2 border-t md:border-t-0 md:pt-0">
                          {listing.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                              <a
                                href={`tel:${listing.phone}`}
                                className="hover:text-blue-600 dark:hover:text-blue-400 break-words"
                                data-testid={`link-phone-${listing.id}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {listing.phone}
                              </a>
                            </div>
                          )}

                          {listing.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                              <a
                                href={`mailto:${listing.email}`}
                                className="hover:text-blue-600 dark:hover:text-blue-400 break-all"
                                data-testid={`link-email-${listing.id}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {listing.email}
                              </a>
                            </div>
                          )}

                          {listing.telegramUsername && (
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <MessageCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                              <a
                                href={`https://t.me/${listing.telegramUsername.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-600 dark:hover:text-blue-400 break-words"
                                data-testid={`link-telegram-${listing.id}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                @{listing.telegramUsername.replace('@', '')}
                              </a>
                            </div>
                          )}

                          {listing.website && (
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                              <a
                                href={listing.website.startsWith('http') ? listing.website : `https://${listing.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-600 dark:hover:text-blue-400 break-all"
                                data-testid={`link-website-${listing.id}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {listing.website}
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="pt-3 border-t">
                        <Link 
                          href={`/directory/edit/${slugify(getDisplayName(listing))}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            data-testid={`button-edit-listing-${listing.id}`}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Listing
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
