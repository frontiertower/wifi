import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Building2, MapPin, Phone, Mail, Globe, MessageCircle, Plus, ArrowLeft, ChevronDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import type { DirectoryListing } from "@shared/schema";

export default function Directory() {
  const [expandedListings, setExpandedListings] = useState<Set<number>>(new Set());
  const [nameSortAsc, setNameSortAsc] = useState<boolean>(true);
  const [floorSortAsc, setFloorSortAsc] = useState<boolean>(true);
  const [activeSortMode, setActiveSortMode] = useState<"name" | "floor">("name");
  
  const { data, isLoading } = useQuery<{ success: boolean; listings: DirectoryListing[] }>({
    queryKey: ["/api/directory"],
  });

  const rawListings = data?.listings || [];
  
  const listings = useMemo(() => {
    if (activeSortMode === "name") {
      return [...rawListings].sort((a, b) => {
        const nameA = a.companyName || `${a.lastName}, ${a.firstName}` || "";
        const nameB = b.companyName || `${b.lastName}, ${b.firstName}` || "";
        return nameSortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
    } else {
      // Sort by floor
      return [...rawListings].sort((a, b) => {
        const getFloorNumber = (floor: string | null) => {
          if (!floor) return 999; // Put items without floor at the end
          const match = floor.match(/(\d+)/);
          return match ? parseInt(match[1]) : 999;
        };
        const diff = getFloorNumber(a.floor) - getFloorNumber(b.floor);
        return floorSortAsc ? diff : -diff;
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
      return `Office ${listing.officeNumber}`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
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

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Building Directory
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Find companies and members in Frontier Tower
              </p>
            </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => {
              const isExpanded = expandedListings.has(listing.id);
              return (
                <Card
                  key={listing.id}
                  className="hover-elevate cursor-pointer"
                  data-testid={`card-listing-${listing.id}`}
                  onClick={() => toggleListing(listing.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
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
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100 break-words">
                            {getDisplayName(listing)}
                          </CardTitle>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getLocationText(listing) && (
                          <div className="flex items-center gap-1 text-base text-gray-600 dark:text-gray-400">
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
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0 space-y-3">
                      {listing.description && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {listing.description}
                        </p>
                      )}

                      {(listing.phone || listing.email || listing.telegramUsername || listing.website) && (
                        <div className="space-y-2 pt-2 border-t">
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
