import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Building2, MapPin, Phone, Mail, Globe, MessageCircle, Plus, ArrowLeft, ChevronDown, User, Users, Search, Linkedin, Twitter, Coffee, X, Pencil, ArrowUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThemeToggle } from "@/components/theme-toggle";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { DirectoryListing } from "@shared/schema";
import { getIconByName } from "./addlisting";

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
  const [selectedType, setSelectedType] = useState<"company" | "person" | "community" | "amenity" | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const { data, isLoading } = useQuery<{ success: boolean; listings: DirectoryListing[] }>({
    queryKey: ["/api/directory"],
  });
  
  // Check admin session for edit functionality
  const { data: sessionData } = useQuery<{ authenticated: boolean; role?: string }>({
    queryKey: ["/api/admin/session"],
  });
  
  const isAdmin = sessionData?.authenticated === true;

  const allListings = data?.listings || [];
  
  const selectFilterType = (type: "company" | "person" | "community" | "amenity") => {
    const newType = selectedType === type ? null : type;
    setSelectedType(newType);
    
    // Auto-set sort mode based on filter type
    if (newType === "company" || newType === "person") {
      setSortMode("name-asc");
    } else if (newType === "community") {
      setSortMode("floor-desc");
    } else if (newType === "amenity") {
      setSortMode("floor-asc");
    }
  };
  
  const clearFilter = () => {
    setSelectedType(null);
    setSortMode("name-asc");
  };

  const getDisplayName = (listing: DirectoryListing) => {
    if (listing.type === "company" && listing.companyName) {
      return listing.companyName;
    }
    if (listing.type === "amenity" && listing.companyName) {
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
    if (selectedType) {
      filtered = filtered.filter(listing => listing.type === selectedType);
    }
    
    return filtered;
  }, [allListings, selectedType, searchQuery]);
  
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

          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Building Directory
          </h1>

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

          {/* Desktop Filter and Sort Buttons */}
          <div className="hidden md:flex items-center gap-2 flex-wrap">
            <Button
              variant={selectedType === "company" ? "default" : "outline"}
              size="sm"
              onClick={() => selectFilterType("company")}
              className="flex flex-col items-center gap-0.5 h-auto py-1.5 px-2"
              data-testid="button-filter-companies"
            >
              <Building2 className="h-4 w-4" />
              <span className="text-xs">Companies</span>
            </Button>
            <Button
              variant={selectedType === "community" ? "default" : "outline"}
              size="sm"
              onClick={() => selectFilterType("community")}
              className="flex flex-col items-center gap-0.5 h-auto py-1.5 px-2"
              data-testid="button-filter-communities"
            >
              <Users className="h-4 w-4" />
              <span className="text-xs">Communities</span>
            </Button>
            <Button
              variant={selectedType === "person" ? "default" : "outline"}
              size="sm"
              onClick={() => selectFilterType("person")}
              className="flex flex-col items-center gap-0.5 h-auto py-1.5 px-2"
              data-testid="button-filter-people"
            >
              <User className="h-4 w-4" />
              <span className="text-xs">Citizens</span>
            </Button>
            <Button
              variant={selectedType === "amenity" ? "default" : "outline"}
              size="sm"
              onClick={() => selectFilterType("amenity")}
              className="flex flex-col items-center gap-0.5 h-auto py-1.5 px-2"
              data-testid="button-filter-amenities"
            >
              <Coffee className="h-4 w-4" />
              <span className="text-xs">Amenities</span>
            </Button>
            
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1" />
            
            <Button
              variant={sortMode === "name-asc" || sortMode === "name-desc" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortMode(sortMode === "name-asc" ? "name-desc" : "name-asc")}
              data-testid="button-sort-name"
            >
              Sort by Name {sortMode === "name-asc" ? "↑" : sortMode === "name-desc" ? "↓" : ""}
            </Button>
            <Button
              variant={sortMode === "floor-asc" || sortMode === "floor-desc" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortMode(sortMode === "floor-asc" ? "floor-desc" : "floor-asc")}
              data-testid="button-sort-floor"
            >
              Sort by Floor {sortMode === "floor-asc" ? "↑" : sortMode === "floor-desc" ? "↓" : ""}
            </Button>
            
            {selectedType && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilter}
                className="flex items-center gap-1"
                data-testid="button-clear-filter"
              >
                <X className="h-3 w-3" />
                <span className="text-xs">Clear filter</span>
              </Button>
            )}
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
          <div className="space-y-1">
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
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 bg-blue-100 dark:bg-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0 ${listing.logoUrl ? 'hidden' : ''}`}>
                          {(() => {
                            if (listing.iconName) {
                              const CustomIcon = getIconByName(listing.iconName);
                              if (CustomIcon) return <CustomIcon className="h-5 w-5 text-blue-600 dark:text-blue-300" />;
                            }
                            if (listing.type === 'company') return <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-300" />;
                            if (listing.type === 'community') return <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />;
                            if (listing.type === 'person') return <User className="h-5 w-5 text-blue-600 dark:text-blue-300" />;
                            if (listing.type === 'amenity') return <Coffee className="h-5 w-5 text-blue-600 dark:text-blue-300" />;
                            return <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-300" />;
                          })()}
                        </div>
                        <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100 break-words flex-1 min-w-0 leading-none">
                          {getDisplayName(listing)}
                        </CardTitle>
                      </div>
                      {getLocationText(listing) && (
                        <span className="text-base font-semibold text-gray-900 dark:text-gray-100 flex-shrink-0">{getLocationText(listing)}</span>
                      )}
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
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-12 h-12 bg-blue-100 dark:bg-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0 ${listing.logoUrl ? 'hidden' : ''}`}>
                          {(() => {
                            if (listing.iconName) {
                              const CustomIcon = getIconByName(listing.iconName);
                              if (CustomIcon) return <CustomIcon className="h-6 w-6 text-blue-600 dark:text-blue-300" />;
                            }
                            if (listing.type === 'company') return <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-300" />;
                            if (listing.type === 'community') return <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />;
                            if (listing.type === 'person') return <User className="h-6 w-6 text-blue-600 dark:text-blue-300" />;
                            if (listing.type === 'amenity') return <Coffee className="h-6 w-6 text-blue-600 dark:text-blue-300" />;
                            return <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-300" />;
                          })()}
                        </div>
                        <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                          {getDisplayName(listing)}
                        </CardTitle>
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

                      {getLocationText(listing) && (
                        <span className="text-base font-semibold text-gray-900 dark:text-gray-100 flex-shrink-0">{getLocationText(listing)}</span>
                      )}
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0 space-y-3 relative">
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
                      
                      {isAdmin && (
                        <Link 
                          href={`/directory/edit/${slugify(getDisplayName(listing))}`}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute bottom-2 right-2"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-edit-listing-${listing.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Add Listing Button at Bottom */}
        <div className="mt-8 mb-24 md:mb-8 flex justify-center">
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

      {/* Mobile App Dock */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-background border-t pt-2 pb-6 px-2 flex items-center justify-around">
          <Button
            variant={selectedType === "company" ? "default" : "ghost"}
            size="sm"
            onClick={() => selectFilterType("company")}
            className="flex flex-col items-center gap-0.5 h-auto py-2 px-3 flex-1"
            data-testid="button-filter-companies-mobile"
          >
            <Building2 className="h-5 w-5" />
            <span className="text-[10px]">Companies</span>
          </Button>
          <Button
            variant={selectedType === "community" ? "default" : "ghost"}
            size="sm"
            onClick={() => selectFilterType("community")}
            className="flex flex-col items-center gap-0.5 h-auto py-2 px-3 flex-1"
            data-testid="button-filter-communities-mobile"
          >
            <Users className="h-5 w-5" />
            <span className="text-[10px]">Communities</span>
          </Button>
          <Button
            variant={selectedType === "person" ? "default" : "ghost"}
            size="sm"
            onClick={() => selectFilterType("person")}
            className="flex flex-col items-center gap-0.5 h-auto py-2 px-3 flex-1"
            data-testid="button-filter-people-mobile"
          >
            <User className="h-5 w-5" />
            <span className="text-[10px]">Citizens</span>
          </Button>
          <Button
            variant={selectedType === "amenity" ? "default" : "ghost"}
            size="sm"
            onClick={() => selectFilterType("amenity")}
            className="flex flex-col items-center gap-0.5 h-auto py-2 px-3 flex-1"
            data-testid="button-filter-amenities-mobile"
          >
            <Coffee className="h-5 w-5" />
            <span className="text-[10px]">Amenities</span>
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex flex-col items-center gap-0.5 h-auto py-2 px-3 flex-1"
                data-testid="button-sort-mobile"
              >
                <ArrowUpDown className="h-5 w-5" />
                <span className="text-[10px]">Sort</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1" align="end" side="top">
              <div className="flex flex-col">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => setSortMode("name-asc")}
                  data-testid="button-sort-name-asc-mobile"
                >
                  {sortMode === "name-asc" && <Check className="h-4 w-4 mr-2" />}
                  <span className={sortMode === "name-asc" ? "" : "ml-6"}>Name A-Z</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => setSortMode("name-desc")}
                  data-testid="button-sort-name-desc-mobile"
                >
                  {sortMode === "name-desc" && <Check className="h-4 w-4 mr-2" />}
                  <span className={sortMode === "name-desc" ? "" : "ml-6"}>Name Z-A</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => setSortMode("floor-asc")}
                  data-testid="button-sort-floor-asc-mobile"
                >
                  {sortMode === "floor-asc" && <Check className="h-4 w-4 mr-2" />}
                  <span className={sortMode === "floor-asc" ? "" : "ml-6"}>Floor Low-High</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => setSortMode("floor-desc")}
                  data-testid="button-sort-floor-desc-mobile"
                >
                  {sortMode === "floor-desc" && <Check className="h-4 w-4 mr-2" />}
                  <span className={sortMode === "floor-desc" ? "" : "ml-6"}>Floor High-Low</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
