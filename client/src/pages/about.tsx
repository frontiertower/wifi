import { Link } from "wouter";
import { ArrowLeft, Building2, MapPin, Users, Zap, Palette, Brain, Heart, Dumbbell, Rocket, Code, Lightbulb, Home, Calendar, Phone, Mail, ExternalLink, ChevronDown, ChevronUp, Globe, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import frontierVideo from "@assets/WhatsApp_Video_2025-12-02_at_09.27.20_1764705445697.mp4";

interface DirectoryListing {
  id: number;
  type: 'company' | 'community' | 'citizen' | 'amenity';
  companyName?: string;
  communityName?: string;
  personName?: string;
  floor?: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  iconName?: string;
}

const floors = [
  { floor: "16", name: "d/acc Lounge", description: "Cross-pollination space for all communities to mingle. Host friends, investors, or enjoy panoramic city views.", icon: Users },
  { floor: "15", name: "Coworking & The Library", description: "Deep work sessions with noise-cancelling environment. Perfect for focused execution.", icon: Code },
  { floor: "14", name: "Human Flourishing", description: "Exploring alignment of flourishing, sense-making, and coordination powered by frontier tech.", icon: Heart },
  { floor: "12", name: "Ethereum & Decentralized Tech", description: "Shape the future of finance with blockchain, DeFi, Layer 2 solutions, and Real World Assets.", icon: Zap },
  { floor: "11", name: "Health & Longevity", description: "Aging research, longevity biotech, and optimized health habits with cutting-edge biomarker tracking.", icon: Heart },
  { floor: "10", name: "Frontier @ Accelerate", description: "Collaborate with top talent, build relationships with investors, and kickstart projects.", icon: Rocket },
  { floor: "9", name: "AI & Autonomous Systems", description: "Multi-agent models to transformer architectures. Build, experiment, and redefine intelligence.", icon: Brain },
  { floor: "8", name: "Neuro & Biotech", description: "BSL-2 lab for gene editing, synthetic biology, and personalized medicine breakthroughs.", icon: Lightbulb },
  { floor: "7", name: "Frontier Maker Space", description: "Lasercutters, CNC machines, woodwork, 3D printers, and microelectronics workshop.", icon: Code },
  { floor: "6", name: "Arts & Music", description: "Creative expression through immersive experiences, digital installations, and cross-disciplinary projects.", icon: Palette },
  { floor: "5", name: "Movement & Fitness", description: "Gym, yoga, sauna, and cold plunge for mental and physical well-being.", icon: Dumbbell },
  { floor: "4", name: "Robotics & Hard Tech", description: "Next-gen robotics, advanced hardware, and breakthrough materials development.", icon: Zap },
  { floor: "3", name: "Private Offices", description: "For when ideas evolve into businesses. Offices for teams up to 20 people.", icon: Building2 },
  { floor: "2", name: "Event & Hackathon Space", description: "300-person industrial space with high ceilings and top-tier AV equipment.", icon: Calendar },
  { floor: "G", name: "Entrance", description: "Welcome to the heart of it all. Where your journey begins.", icon: Building2 },
];

const pricingPlans = [
  {
    name: "Citizen",
    price: "$190",
    period: "month",
    billing: "Monthly",
    features: [
      "1 sub-community membership included",
      "Use of all common areas",
      "Fair use of conference rooms",
      "Fair use of event space"
    ]
  },
  {
    name: "Globetrotter",
    price: "$500",
    period: "month",
    billing: "Monthly",
    features: [
      "All citizen benefits",
      "Special voting rights",
      "58% hotel discount",
      "Standard rate: $120/night → $50/night"
    ]
  },
  {
    name: "Founding Citizen",
    price: "$150",
    period: "month",
    billing: "Annual ($1,800)",
    featured: true,
    features: [
      "All citizen benefits",
      "Priority access to events",
      "Special voting rights",
      "Founding member status"
    ]
  }
];

function getFloorSortValue(floor?: string): number {
  if (!floor) return -1;
  if (floor.toLowerCase() === 'g' || floor.toLowerCase() === 'ground') return 0;
  if (floor.toLowerCase() === 'm' || floor.toLowerCase() === 'mezzanine') return 0.5;
  const num = parseInt(floor);
  return isNaN(num) ? -1 : num;
}

function ListingCard({ listing, type }: { listing: DirectoryListing; type: 'amenity' | 'community' }) {
  const [isOpen, setIsOpen] = useState(false);
  const name = type === 'amenity' ? listing.companyName : listing.communityName;
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="hover-elevate transition-all" data-testid={`card-${type}-${listing.id}`}>
        <CollapsibleTrigger asChild>
          <CardContent className="py-4 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {listing.logoUrl ? (
                  <img 
                    src={listing.logoUrl} 
                    alt={name || ''} 
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{name}</h3>
                  {listing.floor && (
                    <p className="text-sm text-muted-foreground">Floor {listing.floor}</p>
                  )}
                </div>
              </div>
              {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </div>
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 border-t">
            {listing.description && (
              <p className="text-sm text-muted-foreground mt-3 mb-3">{listing.description}</p>
            )}
            {listing.website && (
              <a 
                href={listing.website.startsWith('http') ? listing.website : `https://${listing.website}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" data-testid={`link-${type}-website-${listing.id}`}>
                  <Globe className="w-4 h-4 mr-2" />
                  Visit Website
                </Button>
              </a>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export default function AboutPage() {
  const { data: directoryData, isLoading } = useQuery<{ success: boolean; listings?: DirectoryListing[]; data?: DirectoryListing[] }>({
    queryKey: ['/api/directory'],
  });

  const listings = directoryData?.listings || directoryData?.data || [];
  
  const amenities = listings
    .filter((l: DirectoryListing) => l.type === 'amenity')
    .sort((a: DirectoryListing, b: DirectoryListing) => getFloorSortValue(b.floor) - getFloorSortValue(a.floor));
  
  const communities = listings
    .filter((l: DirectoryListing) => l.type === 'community')
    .sort((a: DirectoryListing, b: DirectoryListing) => getFloorSortValue(b.floor) - getFloorSortValue(a.floor));

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
          <h1 className="text-lg font-semibold">About Frontier Tower</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <section className="mb-12">
          <div className="text-center mb-8">
            <Badge className="mb-4">A Vertical Village for Frontier Technologies</Badge>
            <h1 className="text-4xl font-bold mb-4" data-testid="text-about-title">Frontier Tower</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Sixteen floors in the heart of San Francisco filled with people advancing deep tech and frontier technologies — all within a relaxed and inspiring environment.
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">More Than a Place — It's a Protocol</h2>
                  <p className="text-muted-foreground mb-4">
                    We are transforming a 92,000 sqft, 16-floor tower in the heart of SF to give frontier-tech communities the space to build, grow, and thrive. This is a citizen-only vertical village, the first node in a network state spanning multiple cities.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Existing AI, biotech, crypto, longevity, deep tech, human coordination, neuroscience, music & art communities each receive a 4,250 sqft floor — a blank canvas for pioneers to shape the future.
                  </p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-5 h-5" />
                    <span className="font-medium">995 Market St, San Francisco, CA 94103</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 overflow-hidden">
            <CardContent className="p-0">
              <video 
                className="w-full aspect-video object-cover"
                controls
                autoPlay
                muted
                loop
                playsInline
                data-testid="video-frontier-tour"
              >
                <source src={frontierVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Floor by Floor</h2>
          <div className="grid gap-3">
            {floors.map((floor) => {
              const IconComponent = floor.icon;
              return (
                <Card key={floor.floor} className="hover-elevate transition-all">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary">{floor.floor}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <IconComponent className="w-4 h-4 text-muted-foreground" />
                          <h3 className="font-semibold">{floor.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{floor.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Amenities</h2>
          {isLoading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : amenities.length > 0 ? (
            <div className="grid gap-3">
              {amenities.map((listing) => (
                <ListingCard key={listing.id} listing={listing} type="amenity" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No amenities listed yet.</p>
              </CardContent>
            </Card>
          )}
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Communities</h2>
          {isLoading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : communities.length > 0 ? (
            <div className="grid gap-3">
              {communities.map((listing) => (
                <ListingCard key={listing.id} listing={listing} type="community" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No communities listed yet.</p>
              </CardContent>
            </Card>
          )}
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-2 text-center">Membership Plans</h2>
          <p className="text-muted-foreground text-center mb-6">Join 300 founding members setting the right vibe</p>
          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <Card key={plan.name} className={plan.featured ? "border-primary ring-2 ring-primary/20" : ""}>
                {plan.featured && (
                  <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                    Best Value
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.billing}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Scholarships available for university students, researchers, and builders under 25
          </p>
        </section>

        <section className="mb-12">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">Taking Berlin as a Blueprint</h2>
              <p className="text-muted-foreground mb-4">
                In the 1990s, after the fall of the Berlin Wall, tens of thousands of people left East Berlin, leaving hundreds of buildings unoccupied. This vacancy gave rise to vibrant communities that created clubs, art spaces, collectives, and hacker houses which make Berlin so special.
              </p>
              <p className="text-muted-foreground">
                Today, a similar opportunity is emerging in downtowns worldwide, where empty office spaces are becoming the new frontier. Now is our chance to reclaim these spaces, redefine urban living, and foster deeper connections in our cities.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">The Endgame: Inter-City Network State</h2>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
                Frontier Tower is more than a building — it's the first node in a network state spanning multiple cities. We're building community-centric digital infrastructure to foster frontier technology innovation and cross-pollination.
              </p>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Powered by Berlinhouse, we're on a mission to create self-governing vertical villages where free thinkers, builders, founders, entrepreneurs, and visionaries come together to shape the future of how our society will live in a post AI-singularity world.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Tech Infrastructure</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Zap className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Gigabit WiFi</h3>
                <p className="text-sm text-muted-foreground">Fiber internet backhaul with WiFi 7 handling thousands of devices</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Building2 className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Premium Furnishings</h3>
                <p className="text-sm text-muted-foreground">High-end furniture, velvet couches, live-edge tables, marble counters</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Lightbulb className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">AV Ready</h3>
                <p className="text-sm text-muted-foreground">Projectors, speakers, wired/wireless mics, sound engineering support</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Contact & Location</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Get in Touch</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">General Inquiries</p>
                        <a href="mailto:support@frontiertower.io" className="text-primary hover:underline">support@frontiertower.io</a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Private Offices</p>
                        <a href="mailto:katia@berlinhouse.com" className="text-primary hover:underline">katia@berlinhouse.com</a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Event Bookings</p>
                        <a href="tel:+17134091257" className="text-primary hover:underline">+1 713-409-1257 (Colin)</a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Community Lead</p>
                        <a href="mailto:jakob@frontiertower.io" className="text-primary hover:underline">jakob@frontiertower.io</a>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Location</h3>
                  <div className="flex items-start gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">995 Market St</p>
                      <p className="text-muted-foreground">San Francisco, CA 94103</p>
                      <p className="text-sm text-muted-foreground mt-2">Central SF, accessible via BART, Muni, and ride-share</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a href="https://frontiertower.io" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" data-testid="link-website">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Website
                      </Button>
                    </a>
                    <a href="https://t.me/+M0KxFTd3LnJkNzky" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" data-testid="link-telegram">
                        Telegram
                      </Button>
                    </a>
                    <a href="https://luma.com/frontiertower" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" data-testid="link-events">
                        Events
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="text-center pb-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Join?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Become a Founding Citizen and be part of our innovative Vertical Village
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://frontiertower.io/membership" target="_blank" rel="noopener noreferrer">
              <Button size="lg" data-testid="button-apply-membership">
                Apply for Membership
              </Button>
            </a>
            <Link href="/tour">
              <Button variant="outline" size="lg" data-testid="button-book-tour">
                Book a Tour
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© 2025 Frontier Tower. All Rights Reserved.</p>
        <p className="mt-1">Powered by Berlinhouse</p>
      </footer>
    </div>
  );
}
