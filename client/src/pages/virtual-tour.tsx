import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building2, Coffee, Users, MapPin, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
type DirectoryListing = {
  id: number;
  type: string;
  companyName: string | null;
  communityName: string | null;
  floor: string | null;
  website: string | null;
  logoUrl: string | null;
  iconName: string | null;
  description: string | null;
};

function getListingName(listing: DirectoryListing): string {
  if (listing.type === "community") return listing.communityName || "Unnamed Community";
  if (listing.type === "amenity") return listing.companyName || listing.communityName || "Unnamed Amenity";
  return listing.companyName || "Unnamed";
}

const ICON_MAP: Record<string, string> = {
  "building-2": "Building2",
  "users": "Users",
  "coffee": "Coffee",
  "utensils": "Utensils",
  "dumbbell": "Dumbbell",
  "music": "Music",
  "palette": "Palette",
  "book-open": "BookOpen",
  "heart": "Heart",
  "zap": "Zap",
  "wifi": "Wifi",
  "monitor": "Monitor",
  "briefcase": "Briefcase",
  "home": "Home",
  "star": "Star",
  "globe": "Globe",
  "camera": "Camera",
  "mic": "Mic",
  "headphones": "Headphones",
  "gamepad-2": "Gamepad2",
  "flask-conical": "FlaskConical",
  "atom": "Atom",
  "brain": "Brain",
  "rocket": "Rocket",
  "sparkles": "Sparkles",
  "lightbulb": "Lightbulb",
  "target": "Target",
  "trophy": "Trophy",
  "award": "Award",
  "gift": "Gift",
  "calendar": "Calendar",
  "clock": "Clock",
  "map": "Map",
  "compass": "Compass",
  "sun": "Sun",
  "moon": "Moon",
  "cloud": "Cloud",
  "umbrella": "Umbrella",
  "leaf": "Leaf",
  "flower-2": "Flower2",
  "tree-pine": "TreePine",
  "mountain": "Mountain",
  "waves": "Waves",
  "anchor": "Anchor",
  "plane": "Plane",
  "car": "Car",
  "bike": "Bike",
  "train": "Train",
  "ship": "Ship",
  "coins": "Coins",
  "banknote": "Banknote",
  "credit-card": "CreditCard",
  "shopping-cart": "ShoppingCart",
  "shopping-bag": "ShoppingBag",
  "package": "Package",
  "box": "Box",
  "archive": "Archive",
  "folder": "Folder",
  "file-text": "FileText",
  "clipboard": "Clipboard",
  "pen-tool": "PenTool",
  "scissors": "Scissors",
  "hammer": "Hammer",
  "wrench": "Wrench",
  "settings": "Settings",
  "sliders": "Sliders",
  "tool": "Tool",
  "cpu": "Cpu",
  "hard-drive": "HardDrive",
  "server": "Server",
  "database": "Database",
  "terminal": "Terminal",
  "code": "Code",
  "git-branch": "GitBranch",
  "layers": "Layers",
  "layout": "Layout",
  "grid": "Grid",
  "list": "List",
  "table": "Table",
  "pie-chart": "PieChart",
  "bar-chart": "BarChart",
  "activity": "Activity",
  "trending-up": "TrendingUp",
  "fingerprint": "Fingerprint",
  "shield": "Shield",
  "lock": "Lock",
  "key": "Key",
  "eye": "Eye",
};

function ListingCard({ listing, isExpanded, onToggle }: { listing: DirectoryListing; isExpanded: boolean; onToggle: () => void }) {
  const isAmenity = listing.type === "amenity";
  const isCommunity = listing.type === "community";

  return (
    <Card 
      className="hover-elevate cursor-pointer transition-all"
      onClick={onToggle}
      data-testid={`card-listing-${listing.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
            {listing.logoUrl ? (
              <img 
                src={listing.logoUrl} 
                alt={getListingName(listing)}
                className="w-full h-full object-cover"
              />
            ) : listing.iconName && ICON_MAP[listing.iconName] ? (
              <div className="w-8 h-8 text-muted-foreground">
                {listing.iconName === "coffee" && <Coffee className="w-full h-full" />}
                {listing.iconName === "users" && <Users className="w-full h-full" />}
                {listing.iconName === "building-2" && <Building2 className="w-full h-full" />}
              </div>
            ) : (
              <div className="w-8 h-8 text-muted-foreground">
                {isAmenity ? <Coffee className="w-full h-full" /> : <Users className="w-full h-full" />}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-base leading-tight">{getListingName(listing)}</h3>
                {listing.floor && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>Floor {listing.floor}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isAmenity ? "secondary" : "outline"}>
                  {isAmenity ? "Amenity" : "Community"}
                </Badge>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
            
            {listing.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{listing.description}</p>
            )}
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-3" onClick={(e) => e.stopPropagation()}>
            {listing.description && (
              <p className="text-sm text-muted-foreground">{listing.description}</p>
            )}
            
            {listing.website && (
              <a 
                href={listing.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                Visit Website
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function VirtualTourPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<"all" | "amenity" | "community">("all");

  const { data: response, isLoading } = useQuery<{ success: boolean; data: DirectoryListing[] } | DirectoryListing[]>({
    queryKey: ['/api/directory'],
  });

  const listings = Array.isArray(response) 
    ? response 
    : (response && 'data' in response && Array.isArray(response.data)) 
      ? response.data 
      : [];

  const filteredListings = listings
    .filter(listing => {
      if (listing.type !== "amenity" && listing.type !== "community") return false;
      if (filterType === "all") return true;
      return listing.type === filterType;
    })
    .sort((a, b) => {
      const floorA = parseInt(a.floor || "0", 10) || 0;
      const floorB = parseInt(b.floor || "0", 10) || 0;
      return floorB - floorA;
    });

  const amenityCount = listings.filter(l => l.type === "amenity").length;
  const communityCount = listings.filter(l => l.type === "community").length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Virtual Tour</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2" data-testid="text-tour-title">Explore Frontier Tower</h2>
          <p className="text-muted-foreground">
            Discover the amenities and communities across our 16 floors
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
            data-testid="button-filter-all"
          >
            All ({amenityCount + communityCount})
          </Button>
          <Button
            variant={filterType === "amenity" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("amenity")}
            data-testid="button-filter-amenities"
          >
            <Coffee className="w-4 h-4 mr-1" />
            Amenities ({amenityCount})
          </Button>
          <Button
            variant={filterType === "community" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("community")}
            data-testid="button-filter-communities"
          >
            <Users className="w-4 h-4 mr-1" />
            Communities ({communityCount})
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Coffee className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No listings found</h3>
              <p className="text-sm text-muted-foreground">
                Check back soon for updates to our amenities and communities.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isExpanded={expandedId === listing.id}
                onToggle={() => setExpandedId(expandedId === listing.id ? null : listing.id)}
              />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Want to see the full directory including companies and citizens?
          </p>
          <Link href="/directory">
            <Button variant="outline" data-testid="button-view-full-directory">
              <Building2 className="w-4 h-4 mr-2" />
              View Full Directory
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
