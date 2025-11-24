import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Building2, MapPin, Phone, Mail, Globe, MessageCircle, Plus, ArrowLeft, ChevronDown, User, Users, Search, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  const [sortMode, setSortMode] = useState<"name-asc" | "name-desc" | "floor-asc" | "floor-desc">("name-asc");
  const [selectedTypes, setSelectedTypes] = useState<Set<"company" | "person" | "community">>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const { data, isLoading } = useQuery<{ success: boolean; listings: DirectoryListing[] }>({
    queryKey: ["/api/directory"],
  });

  const allListings = data?.listings || [];
  
  const toggleFilterType = (type: "company" | "person" | "community") => {
    setSelectedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
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
  
  // Filter listings by search query and type
  const rawListings = useMemo(() => {
    let filtered = allListings;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(listing => {
        const name = getDisplayName(listing).toLowerCase();
        const description = (listing.description || "").toLowerCase();
        const contactPerson = (listing.contactPerson || "").toLowerCase();
        const floor = (listing.floor || "").toLowerCase();
        const officeNumber = (listing.officeNumber || "").toLowerCase();
        
        return name.includes(query) || 
               description.includes(query) ||
               contactPerson.includes(query) ||
               floor.includes(query) ||
               officeNumber.includes(query);
      });
    }
    
    // Apply type filter
    if (selectedTypes.size > 0) {
      filtered = filtered.filter(listing => selectedTypes.has(listing.type as "company" | "person" | "community"));
    }
    
    return filtered;
  }, [allListings, selectedTypes, searchQuery]);
  
  const listings = useMemo(() => {
    if (sortMode === "name-asc" || sortMode === "name-desc") {
      return [...rawListings].sort((a, b) => {
        const nameA = a.companyName || a.communityName || `${a.lastName}, ${a.firstName}` || "";
        const nameB = b.companyName || b.communityName || `${b.lastName}, ${b.firstName}` || "";
        return sortMode === "name-asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
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
          return sortMode === "floor-asc" ? floorA - floorB : floorB - floorA;
        }
        
        // If same floor, sort by office number
        const officeA = getOfficeNumber(a.officeNumber);
        const officeB = getOfficeNumber(b.officeNumber);
        return sortMode === "floor-asc" ? officeA - officeB : officeB - officeA;
      });
    }
  }, [rawListings, sortMode]);
  
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
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                data-testid="button-back-home"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Building Directory
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Find companies, communities, and members in Frontier Tower
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <Button
              variant={selectedTypes.has("company") ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilterType("company")}
              data-testid="button-filter-companies"
            >
              <Building2 className="mr-2 h-4 w-4" />
              Company
            </Button>
            <Button
              variant={selectedTypes.has("community") ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilterType("community")}
              data-testid="button-filter-communities"
            >
              <Users className="mr-2 h-4 w-4" />
              Community
            </Button>
            <Button
              variant={selectedTypes.has("person") ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilterType("person")}
              data-testid="button-filter-people"
            >
              <User className="mr-2 h-4 w-4" />
              Citizen
            </Button>
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={sortMode === "name-asc" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortMode("name-asc")}
              data-testid="button-sort-name-asc"
            >
              Name A-Z
            </Button>
            <Button
              variant={sortMode === "name-desc" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortMode("name-desc")}
              data-testid="button-sort-name-desc"
            >
              Name Z-A
            </Button>
            <Button
              variant={sortMode === "floor-asc" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortMode("floor-asc")}
              data-testid="button-sort-floor-asc"
            >
              Floors 1-16
            </Button>
            <Button
              variant={sortMode === "floor-desc" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortMode("floor-desc")}
              data-testid="button-sort-floor-desc"
            >
              Floors 16-1
            </Button>
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
                          {listing.type === 'company' && <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-300" />}
                          {listing.type === 'community' && <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />}
                          {listing.type === 'person' && <User className="h-5 w-5 text-blue-600 dark:text-blue-300" />}
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
                          {listing.type === 'company' && <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-300" />}
                          {listing.type === 'community' && <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />}
                          {listing.type === 'person' && <User className="h-6 w-6 text-blue-600 dark:text-blue-300" />}
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
                        {listing.description && !isExpanded && (
                          <div className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none line-clamp-2">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {listing.description}
                            </ReactMarkdown>
                          </div>
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
                      {/* Show full description when expanded */}
                      {listing.description && (
                        <div className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {listing.description}
                          </ReactMarkdown>
                        </div>
                      )}

                      {(listing.type === "company" || listing.type === "community") && listing.contactPerson && (
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

                          {listing.linkedinUrl && (
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Linkedin className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                              <a
                                href={listing.linkedinUrl.startsWith('http') ? listing.linkedinUrl : `https://${listing.linkedinUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-600 dark:hover:text-blue-400 break-all"
                                data-testid={`link-linkedin-${listing.id}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {listing.linkedinUrl}
                              </a>
                            </div>
                          )}

                          {listing.twitterHandle && (
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Twitter className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                              <a
                                href={`https://twitter.com/${listing.twitterHandle.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-600 dark:hover:text-blue-400 break-words"
                                data-testid={`link-twitter-${listing.id}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                @{listing.twitterHandle.replace('@', '')}
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

        {/* Add Listing Button at Bottom */}
        <div className="mt-8 flex justify-center">
          <Link href="/addlisting">
            <Button
              size="lg"
              data-testid="button-add-listing"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Listing
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
