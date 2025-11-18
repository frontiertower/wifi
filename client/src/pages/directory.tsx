import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Building2, MapPin, Phone, Mail, Globe, MessageCircle, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import type { DirectoryListing } from "@shared/schema";

export default function Directory() {
  const { data, isLoading } = useQuery<{ success: boolean; listings: DirectoryListing[] }>({
    queryKey: ["/api/directory"],
  });

  const listings = data?.listings || [];

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
                Find companies and residents in Frontier Tower
              </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <Card
                key={listing.id}
                className="hover-elevate"
                data-testid={`card-listing-${listing.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100 break-words">
                          {getDisplayName(listing)}
                        </CardTitle>
                        {getLocationText(listing) && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="break-words">{getLocationText(listing)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-2">
                  {listing.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <a
                        href={`tel:${listing.phone}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400 break-words"
                        data-testid={`link-phone-${listing.id}`}
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
                      >
                        {listing.website}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
