import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function BluePage() {
  return (
    <div className="min-h-screen blueprint-bg">
      {/* Blueprint Header */}
      <div className="border-b-2 border-blueprint-dark bg-blueprint-light py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back-home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Pill Selection
              </Button>
            </Link>
          </div>
          <div className="text-blueprint-dark font-bold blueprint-text text-sm">
            FRONTIER TOWER MASTER BLUEPRINT | REVISION 3.1
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Title Block */}
        <div className="blueprint-section mb-12 text-center">
          <h1 className="text-5xl font-bold text-blueprint-dark mb-2 blueprint-text">
            FRONTIER TOWER PROJECT BLUEPRINTS
          </h1>
          <p className="text-blueprint-dark/70 blueprint-text text-sm tracking-wider">
            MASTER DOCUMENT | TECHNICAL SPECIFICATIONS FOR NETWORK SOCIETY CONSTRUCTION
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Card 1: Project Overview */}
          <div className="blueprint-card">
            <h2 className="text-blueprint-dark font-bold blueprint-text text-lg mb-4 pb-3 border-b-2 border-blueprint-dark/30">
              PROJECT FRONTIER TOWER MANDATE
            </h2>
            <p className="text-blueprint-dark/80 text-sm leading-relaxed mb-4">
              We are constructing the world's fastest-growing network society. Our capital installation spans 16 stories on Market Street, San Francisco - a vertical village for frontier tech, arts & music.
            </p>
            <p className="text-blueprint-dark/80 text-sm leading-relaxed">
              This master blueprint documents the integration of autonomous financial operations into our multi-tower federation model. By 2029, we will unite 100 towers across the globe, connected through shared economic infrastructure, portable citizenship protocols, and decentralized governance systems.
            </p>
          </div>

          {/* Card 2: Operational Parameters */}
          <div className="blueprint-card">
            <h2 className="text-blueprint-dark font-bold blueprint-text text-lg mb-4 pb-3 border-b-2 border-blueprint-dark/30">
              CURRENT OPERATIONAL STATUS
            </h2>
            <ul className="space-y-2 text-blueprint-dark/80 text-sm">
              <li className="flex items-start">
                <span className="mr-3 text-blueprint-primary font-bold">•</span>
                <span><strong>Status:</strong> Active Construction (7 months operational)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-blueprint-primary font-bold">•</span>
                <span><strong>Growth Rate:</strong> Double-digit MOM expansion</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-blueprint-primary font-bold">•</span>
                <span><strong>Next Phase:</strong> 112-bed residency opening December 2024</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-blueprint-primary font-bold">•</span>
                <span><strong>Vision:</strong> 100 towers by 2029, 10M frontier citizens</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Section A: Personnel Requirements */}
        <div className="blueprint-section mb-12">
          <h2 className="text-2xl font-bold text-blueprint-dark mb-6 pb-3 border-b-4 border-blueprint-dark blueprint-text">
            SECTION A: HEAD OF FINANCE REQUISITION
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-blueprint-dark font-bold mb-3 blueprint-text">DESIGNATION SPECIFICATIONS</h3>
              <p className="text-blueprint-dark/80 text-sm mb-4 leading-relaxed">
                Chief Financial Officer — Responsible for overseeing multiple corporate entities including real estate holdings, operating companies, and technology infrastructure systems. This position manages all banking operations, vendor payments, tax compliance across jurisdictions, and investor relations for fundraising rounds.
              </p>
              <p className="text-blueprint-dark/80 text-sm leading-relaxed">
                Remote-first deployment with optional San Francisco headquarters access. Direct reporting to Lead Architect (CEO). Compensation: $120K–$250K+ annually plus meaningful equity stake.
              </p>
            </div>

            <div>
              <h3 className="text-blueprint-dark font-bold mb-3 blueprint-text">REQUIRED OPERATIONAL SPECS</h3>
              <ul className="space-y-2">
                <li className="text-blueprint-dark/80 text-sm flex items-start">
                  <span className="mr-2 text-blueprint-primary">✓</span>
                  <span><strong>3+ years</strong> in high-velocity startup environments</span>
                </li>
                <li className="text-blueprint-dark/80 text-sm flex items-start">
                  <span className="mr-2 text-blueprint-primary">✓</span>
                  <span><strong>Banking & Payments</strong> — Proven track record managing significant transaction volumes</span>
                </li>
                <li className="text-blueprint-dark/80 text-sm flex items-start">
                  <span className="mr-2 text-blueprint-primary">✓</span>
                  <span><strong>Tax Knowledge</strong> — Direct collaboration with multi-jurisdiction tax advisors</span>
                </li>
                <li className="text-blueprint-dark/80 text-sm flex items-start">
                  <span className="mr-2 text-blueprint-primary">✓</span>
                  <span><strong>Contract Analysis</strong> — Ability to interpret and negotiate complex agreements</span>
                </li>
                <li className="text-blueprint-dark/80 text-sm flex items-start">
                  <span className="mr-2 text-blueprint-primary">✓</span>
                  <span><strong>Core Values Alignment</strong> — Mission-focus, bias to action, radical candor</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section B: Enhanced Specifications */}
        <div className="blueprint-section mb-12">
          <h2 className="text-2xl font-bold text-blueprint-dark mb-6 pb-3 border-b-4 border-blueprint-dark blueprint-text">
            SECTION B: ADVANCED COMPETENCY MATRIX
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-blueprint-dark font-bold mb-4 blueprint-text">NICE-TO-HAVE ENHANCEMENTS</h3>
              <ul className="space-y-3">
                <li className="text-blueprint-dark/80 text-sm border-l-2 border-blueprint-primary pl-3">
                  <strong>Investor Relations</strong> — Experience supporting equity/debt fundraising rounds and investor communications
                </li>
                <li className="text-blueprint-dark/80 text-sm border-l-2 border-blueprint-primary pl-3">
                  <strong>Executive Collaboration</strong> — Worked closely with C-suite founders and leadership teams
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-blueprint-dark font-bold mb-4 blueprint-text">CULTURAL INTEGRATION PROTOCOL</h3>
              <p className="text-blueprint-dark/80 text-sm mb-3 leading-relaxed">
                This role exists within Project Utopia — a mission to design governance models flexible enough for communities worldwide to adopt. You must align with our core operational values:
              </p>
              <p className="text-blueprint-dark/80 text-xs italic">
                Focus on the mission • Bias to action • Do whatever it takes • Ship fast • Own the outcome • Radical candor
              </p>
            </div>
          </div>
        </div>

        {/* Section C: Acquisition Sequence */}
        <div className="blueprint-section mb-12">
          <h2 className="text-2xl font-bold text-blueprint-dark mb-6 pb-3 border-b-4 border-blueprint-dark blueprint-text">
            SECTION C: PERSONNEL ACQUISITION & INTEGRATION PROTOCOL
          </h2>

          <div className="space-y-4">
            <div className="border-l-4 border-blueprint-primary pl-4">
              <h4 className="text-blueprint-dark font-bold text-sm blueprint-text mb-1">PHASE 1: INITIAL CONSULTATION (30 MIN)</h4>
              <p className="text-blueprint-dark/80 text-sm">Background discussion and introduction with Lead Architect Jakob</p>
            </div>

            <div className="border-l-4 border-blueprint-primary pl-4">
              <h4 className="text-blueprint-dark font-bold text-sm blueprint-text mb-1">PHASE 2: DESIGN REVIEW & SIMULATION (60 MIN)</h4>
              <p className="text-blueprint-dark/80 text-sm">Deep technical discussion about financial operations, experience, and strategic approach — with Lead Architect Jakob</p>
            </div>

            <div className="border-l-4 border-blueprint-primary pl-4">
              <h4 className="text-blueprint-dark font-bold text-sm blueprint-text mb-1">PHASE 3: TEAM ASSEMBLY (30 MIN)</h4>
              <p className="text-blueprint-dark/80 text-sm">Meet the co-founder unit and broader leadership team for cultural alignment assessment</p>
            </div>

            <div className="border-l-4 border-blueprint-primary pl-4">
              <h4 className="text-blueprint-dark font-bold text-sm blueprint-text mb-1">PHASE 4: FINAL CONTRACT & DEPLOYMENT (30 MIN)</h4>
              <p className="text-blueprint-dark/80 text-sm">Offer discussion, contract review, questions, and integration timeline planning with Lead Architect Jakob</p>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="blueprint-section text-center mb-12 bg-blueprint-light/50">
          <h3 className="text-blueprint-dark font-bold mb-4 blueprint-text">READY TO REVIEW FULL SPECIFICATIONS?</h3>
          <p className="text-blueprint-dark/80 text-sm mb-6">
            Access the complete personnel requisition form and submit your technical data package
          </p>
          <Link href="/green">
            <Button className="bg-blueprint-primary hover:bg-blueprint-primary/90 text-white font-bold px-8" data-testid="button-apply-cfo">
              ACCESS FULL REQUISITION FORM
            </Button>
          </Link>
          <p className="text-blueprint-dark/60 text-xs mt-6">
            For technical inquiries: architecture@frontiertower.com
          </p>
        </div>

        {/* Document Footer */}
        <div className="text-center pt-8 border-t-2 border-blueprint-dark/30">
          <p className="text-blueprint-dark/60 blueprint-text text-xs">
            FRONTIER TOWER PROJECT BLUEPRINTS | MASTER DOCUMENT | REVISION 3.1
          </p>
          <p className="text-blueprint-dark/60 blueprint-text text-xs mt-2">
            All specifications subject to evolution as Project Utopia develops
          </p>
        </div>
      </div>
    </div>
  );
}
