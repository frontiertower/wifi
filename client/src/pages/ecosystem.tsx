import { useState, useEffect } from "react";
import { ExternalLink, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { DirectoryListing, Event } from "@shared/schema";

interface DirectoryListingsResponse {
  success: boolean;
  listings: DirectoryListing[];
}

interface EventsResponse {
  success: boolean;
  events: Event[];
}

interface App {
  name: string;
  url: string;
  description: string;
  icon?: string;
  isDirectoryCompany?: boolean;
}

const featuredApps: App[] = [
  {
    name: "Omi.me",
    url: "https://omi.me",
    description: "Pioneering AI memory and wearable technology for human augmentation",
  },
  {
    name: "GetBuddi.ai",
    url: "https://getbuddi.ai",
    description: "AI-powered personal finance and budgeting assistant",
  },
  {
    name: "OpenDroid",
    url: "https://opendroid.ai",
    description: "Open-source robotics and automation platform",
  },
  {
    name: "UFB.GG",
    url: "https://ufb.gg",
    description: "Ultra-fast blockchain gaming network",
  },
  {
    name: "LeRobot",
    url: "https://lerobot.io",
    description: "Collaborative robotics platform for AI-powered automation",
  },
  {
    name: "Ethereum Foundation",
    url: "https://ethereum.org",
    description: "Building the future of decentralized technology",
  },
  {
    name: "Ethereum House",
    url: "https://ethereumhouse.com",
    description: "Community hub for Ethereum builders and developers",
  },
  {
    name: "DeveloperCamp",
    url: "#",
    description: "Developer education and community building at Frontier Tower",
  },
  {
    name: "Tea Tribe",
    url: "#",
    description: "Community gathering and wellness space",
  },
  {
    name: "Cookbook",
    url: "#",
    description: "Culinary innovation and shared kitchen space",
  },
  {
    name: "Cline",
    url: "#",
    description: "AI-powered development and collaboration tools",
  },
  {
    name: "Dabl Club",
    url: "#",
    description: "Community space for music, art, and culture",
  },
  {
    name: "SensAI Hackademy",
    url: "#",
    description: "AI and sensor technology education program",
  },
];

const partners: App[] = [
  {
    name: "ETHGlobal",
    url: "https://ethglobal.com",
    description: "Leading platform for Ethereum hackathons and events",
  },
  {
    name: "Sui",
    url: "https://sui.io",
    description: "High-performance blockchain platform and technology partner",
  },
  {
    name: "Polygon",
    url: "https://polygon.technology",
    description: "Ethereum scaling solution and ecosystem partner",
  },
  {
    name: "Luma",
    url: "https://luma.com",
    description: "Event hosting and community platform for tech events",
  },
  {
    name: "Base",
    url: "https://base.org",
    description: "Smart contract platform built on Ethereum",
  },
  {
    name: "Optimism",
    url: "https://optimism.io",
    description: "Ethereum layer 2 scaling solution and partner",
  },
  {
    name: "Safe",
    url: "https://safe.global",
    description: "Smart contract wallet for asset management",
  },
  {
    name: "Chainlink",
    url: "https://chain.link",
    description: "Decentralized oracle network and infrastructure",
  },
  {
    name: "Aave",
    url: "https://aave.com",
    description: "Leading decentralized lending protocol",
  },
  {
    name: "Uniswap",
    url: "https://uniswap.org",
    description: "Decentralized exchange protocol",
  },
  {
    name: "MakerDAO",
    url: "https://makerdao.com",
    description: "Decentralized stablecoin platform",
  },
  {
    name: "OpenAI",
    url: "https://openai.com",
    description: "Artificial intelligence and large language models",
  },
  {
    name: "Stripe",
    url: "https://stripe.com",
    description: "Payment processing and financial infrastructure",
  },
];

export default function EcosystemPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [allApps, setAllApps] = useState<App[]>(featuredApps);
  const [dynamicPartners, setDynamicPartners] = useState<App[]>([]);

  const { data: dirListings } = useQuery<DirectoryListingsResponse>({
    queryKey: ["/api/directory/listings"],
  });

  const { data: eventsData } = useQuery<EventsResponse>({
    queryKey: ["/api/events"],
  });

  // Extract company names from event titles and descriptions
  const extractCompanyNamesFromEvents = (events: Event[]): App[] => {
    const companyNameSet = new Set<string>();
    
    // List of known companies to look for in events
    const knownCompanies = [
      // DeFi Protocols
      "ETHGlobal", "Sui", "Polygon", "Luma", "Base", "Optimism", "Safe", 
      "Chainlink", "Aave", "Uniswap", "MakerDAO", "Curve", "Balancer", 
      "1inch", "dYdX", "Compound", "Lido", "Rocket Pool", "Yearn",
      // Layer 1 Blockchains
      "Ethereum", "Bitcoin", "Solana", "Arbitrum", "Avalanche", "Cosmos",
      "Cosmos Hub", "Osmosis", "Tendermint", "IBC", "Stargaze", "Juno",
      "Near", "Aptos", "Sui", "Cardano", "Polkadot", "Algorand",
      // Infrastructure
      "The Graph", "Arweave", "IPFS", "Filecoin", "Livepeer", "Thegraph",
      "Helium", "Stripe", "Twilio", "AWS", "Google Cloud",
      // AI & ML
      "OpenAI", "Hugging Face", "Anthropic", "Cohere", "Replicate", "RunwayML",
      "Midjourney", "Stable Diffusion", "LLaMA", "Claude", "GPT", "DALL-E",
      // Gaming & Metaverse
      "Decentraland", "The Sandbox", "Axie Infinity", "Gala Games", "Sky Mavis",
      // Dev Tools & Platforms
      "Hardhat", "Truffle", "Foundry", "Brownie", "Web3.py", "Web3.js",
      "Ethers.js", "Wagmi", "Viem", "thirdweb", "Moralis",
      // Wallets & Auth
      "MetaMask", "Ledger", "Trezor", "Phantom", "Brave", "Coinbase",
      // Venture & Accelerators
      "Y Combinator", "Techstars", "500 Startups", "Sequoia", "Andreessen Horowitz",
      "Paradigm", "Polychain", "a16z", "a16z crypto",
      // Traditional Tech
      "Google", "Microsoft", "Apple", "Meta", "Amazon", "Facebook",
      "Twitter", "Discord", "Slack", "Notion", "Figma",
      // Community & Events
      "Devcon", "EthCC", "Consensus", "NFT NYC", "Web3 Summit", "Founder Collective"
    ];
    
    events.forEach((event) => {
      const fullText = `${event.name} ${event.description || ""}`;
      knownCompanies.forEach((company) => {
        const regex = new RegExp(`\\b${company}\\b`, "i");
        if (regex.test(fullText)) {
          companyNameSet.add(company);
        }
      });
    });

    // Convert to App objects, excluding those already in partners
    const existingPartnerNames = partners.map(p => p.name.toLowerCase());
    const newPartners = Array.from(companyNameSet)
      .filter(name => !existingPartnerNames.includes(name.toLowerCase()))
      .map(name => ({
        name,
        url: "#",
        description: `Community partner mentioned in Frontier Tower events`,
      }));

    return newPartners;
  };

  useEffect(() => {
    if (eventsData?.events) {
      const extracted = extractCompanyNamesFromEvents(eventsData.events);
      setDynamicPartners(extracted);
    }
  }, [eventsData]);

  useEffect(() => {
    let apps = [...featuredApps];

    // Add directory companies as apps
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

      apps = [...apps, ...companyApps];
    }

    setAllApps(apps);
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

        {/* Partners Section */}
        <div className="mt-16 mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
            Technology Partners
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...partners, ...dynamicPartners].map((partner, index) => (
              <Card
                key={`${partner.name}-${index}`}
                className="hover:shadow-lg transition-shadow overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20"
                data-testid={`card-partner-${partner.name.replace(/\s+/g, "-").toLowerCase()}`}
              >
                <div className="p-6 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      {partner.icon && (
                        <div className="text-3xl flex-shrink-0">{partner.icon}</div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">
                          {partner.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                    {partner.description}
                  </p>

                  {partner.url !== "#" && (
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="w-full"
                      data-testid={`button-visit-partner-${partner.name.replace(/\s+/g, "-").toLowerCase()}`}
                    >
                      <a
                        href={partner.url}
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
        </div>

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
