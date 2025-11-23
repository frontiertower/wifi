import { useState, useEffect } from "react";
import { ExternalLink, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { DirectoryListing } from "@shared/schema";

interface DirectoryListingsResponse {
  success: boolean;
  listings: DirectoryListing[];
}

interface App {
  name: string;
  url: string;
  description: string;
  icon?: string;
  isDirectoryCompany?: boolean;
}

export default function EcosystemPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [allApps, setAllApps] = useState<App[]>([]);

  const { data: dirListings } = useQuery<DirectoryListingsResponse>({
    queryKey: ["/api/directory"],
  });

  useEffect(() => {
    // Only show directory companies
    if (dirListings?.listings) {
      const companyApps = dirListings.listings
        .filter((listing) => listing.type === "company")
        .map((listing) => ({
          name: listing.companyName || "",
          url: listing.website || `#`,
          description: listing.description || "Building innovation at Frontier Tower",
          isDirectoryCompany: true,
        }))
        .filter((app) => app.name);

      setAllApps(companyApps);
    } else {
      setAllApps([]);
    }
  }, [dirListings]);

  const filteredApps = allApps.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-blue-900 dark:text-white">
            Ecosystem
          </h1>
          <p className="text-lg text-blue-700 dark:text-blue-200 mb-8">
            Discover the innovative applications and projects built within Frontier Tower
          </p>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-base border-2 border-blue-300 dark:border-blue-700"
              data-testid="input-search-apps"
            />
          </div>
        </div>

        {/* Featured Apps Grid */}
        {filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app, index) => (
              <Card
                key={`${app.name}-${index}`}
                className="hover:shadow-lg transition-shadow overflow-hidden"
                data-testid={`card-app-${app.name.replace(/\s+/g, "-").toLowerCase()}`}
              >
                <div className="p-6 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      {app.icon && (
                        <div className="text-3xl flex-shrink-0">{app.icon}</div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">
                          {app.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                    {app.description}
                  </p>

                  {app.url !== "#" && (
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="w-full"
                      data-testid={`button-visit-app-${app.name.replace(/\s+/g, "-").toLowerCase()}`}
                    >
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <span>Visit</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No apps found matching your search.
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 bg-white dark:bg-slate-800 rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Build Your App Here
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Frontier Tower is home to cutting-edge companies and projects. If you're building
            something innovative, list it in our directory to join the ecosystem.
          </p>
          <Button asChild variant="default">
            <a href="/addlisting" data-testid="button-add-listing">
              Add Your Company
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
