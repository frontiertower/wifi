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

// Static partners list - now empty to show only partners mentioned in events
const partners: App[] = [];

export default function EcosystemPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [allApps, setAllApps] = useState<App[]>(featuredApps);

  const { data: dirListings } = useQuery<DirectoryListingsResponse>({
    queryKey: ["/api/directory/listings"],
  });

  const { data: eventsData } = useQuery<EventsResponse>({
    queryKey: ["/api/events"],
  });

  // Domain to company name mapping
  const domainToCompany: Record<string, string> = {
    "ethglobal.com": "ETHGlobal",
    "sui.io": "Sui",
    "polygon.technology": "Polygon",
    "luma.com": "Luma",
    "base.org": "Base",
    "optimism.io": "Optimism",
    "safe.global": "Safe",
    "chain.link": "Chainlink",
    "aave.com": "Aave",
    "uniswap.org": "Uniswap",
    "makerdao.com": "MakerDAO",
    "curve.fi": "Curve",
    "balancer.fi": "Balancer",
    "1inch.io": "1inch",
    "dydx.trade": "dYdX",
    "compound.finance": "Compound",
    "lido.fi": "Lido",
    "rocket.pool": "Rocket Pool",
    "yearn.finance": "Yearn",
    "ethereum.org": "Ethereum",
    "bitcoin.org": "Bitcoin",
    "solana.com": "Solana",
    "arbitrum.io": "Arbitrum",
    "avalanche.org": "Avalanche",
    "cosmos.network": "Cosmos",
    "near.org": "Near",
    "aptos.dev": "Aptos",
    "cardano.org": "Cardano",
    "polkadot.network": "Polkadot",
    "algorand.com": "Algorand",
    "thegraph.com": "The Graph",
    "arweave.org": "Arweave",
    "filecoin.io": "Filecoin",
    "livepeer.org": "Livepeer",
    "helium.com": "Helium",
    "stripe.com": "Stripe",
    "twilio.com": "Twilio",
    "aws.amazon.com": "AWS",
    "cloud.google.com": "Google Cloud",
    "openai.com": "OpenAI",
    "huggingface.co": "Hugging Face",
    "anthropic.com": "Anthropic",
    "cohere.com": "Cohere",
    "replicate.com": "Replicate",
    "decentraland.org": "Decentraland",
    "sandbox.game": "The Sandbox",
    "axieinfinity.com": "Axie Infinity",
    "hardhat.org": "Hardhat",
    "trufflesuite.com": "Truffle",
    "foundry.paradigm.xyz": "Foundry",
    "metamask.io": "MetaMask",
    "ledger.com": "Ledger",
    "trezor.io": "Trezor",
    "phantom.app": "Phantom",
    "brave.com": "Brave",
    "coinbase.com": "Coinbase",
    "ycombinator.com": "Y Combinator",
    "techstars.com": "Techstars",
  };

  // Extract company names from event URLs and titles/descriptions
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
      // Check event title and description
      const fullText = `${event.name} ${event.description || ""}`;
      knownCompanies.forEach((company) => {
        const regex = new RegExp(`\\b${company}\\b`, "i");
        if (regex.test(fullText)) {
          companyNameSet.add(company);
        }
      });

      // Extract domain from event URL and map to company name
      if (event.url) {
        try {
          const urlObj = new URL(event.url);
          const hostname = urlObj.hostname.toLowerCase();
          const domain = hostname.replace("www.", "");
          
          // Try exact domain match
          if (domainToCompany[domain]) {
            companyNameSet.add(domainToCompany[domain]);
          } else {
            // Try domain variations (with and without www)
            Object.entries(domainToCompany).forEach(([key, value]) => {
              if (domain === key || domain === key.replace("www.", "")) {
                companyNameSet.add(value);
              }
            });
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }
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
