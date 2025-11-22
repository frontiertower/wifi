import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertJobApplicationSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Power, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

type JobApplicationFormData = z.infer<typeof insertJobApplicationSchema>;

export default function HiringPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<JobApplicationFormData>({
    resolver: zodResolver(insertJobApplicationSchema),
    defaultValues: {
      name: "",
      location: "",
      email: "",
      phone: "",
      linkedinUrl: undefined,
      resumeUrl: undefined,
      minimumCompensation: undefined,
      noticePeriodWeeks: undefined,
      valuesAlignment: false,
      startupYears: undefined,
      paymentSystemsExperience: undefined,
      taxAdvisorExperience: undefined,
      contractInterpretationLevel: undefined,
      investorRelationsExperience: undefined,
      executiveCollaboration: undefined,
      motivationStatement: "",
      referralSource: undefined,
      portfolioUrl: undefined,
    },
  });

  const onSubmit = async (data: JobApplicationFormData) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/job-applications", data);
      
      toast({
        title: "✓ DATA TRANSMISSION SUCCESSFUL",
        description: "Your application has been received. Initiating review protocol...",
      });
      
      setIsSubmitted(true);
      form.reset();
    } catch (error: any) {
      toast({
        title: "✗ TRANSMISSION FAILED",
        description: error.message || "Failed to submit application. Please retry.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contractLevel = form.watch("contractInterpretationLevel");

  if (isSubmitted) {
    return (
      <div className="min-h-screen terminal-bg">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="terminal-panel p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-terminal-green bg-terminal-green/10 mb-6">
              <Power className="h-10 w-10 text-terminal-green" />
            </div>
            <h2 className="text-3xl font-bold text-terminal-green mb-4 terminal-text">
              ✓ TRANSMISSION COMPLETE
            </h2>
            <p className="text-terminal-dim text-lg mb-8">
              Your personnel data package has been successfully transmitted to Frontier Tower HQ.
              Our review team will process your application and contact you if your profile matches
              our operational requirements.
            </p>
            <div className="inline-block border-2 border-terminal-green bg-terminal-green/5 p-6 rounded-lg mb-8">
              <p className="text-terminal-green font-mono text-sm">
                STATUS: <span className="text-terminal-bright">PENDING REVIEW</span><br />
                PRIORITY: <span className="text-terminal-bright">HIGH</span><br />
                ETA: <span className="text-terminal-bright">2-3 BUSINESS DAYS</span>
              </p>
            </div>
            <Link href="/">
              <Button 
                variant="outline" 
                className="terminal-button-secondary"
                data-testid="button-return-home"
              >
                RETURN TO MAIN TERMINAL
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen terminal-bg">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="terminal-header mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="status-indicator status-active"></div>
              <div className="status-indicator status-active"></div>
              <div className="status-indicator status-inactive"></div>
            </div>
            <Link href="/">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-terminal-dim hover:text-terminal-green"
                data-testid="button-exit"
              >
                EXIT
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-center text-terminal-green terminal-glow mb-2 terminal-text">
            HEAD OF FINANCE HIRING
          </h1>
          <p className="text-center text-terminal-dim text-sm md:text-base">
            FRONTIER TOWER RECRUITMENT • JOIN OUR TEAM
          </p>
        </div>

        {/* Role Description Grid */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Card 1: Mission Overview */}
          <div className="terminal-card">
            <h3 className="text-terminal-green font-bold mb-3 terminal-text text-lg">REGENERATIVE ECOSYSTEMS: BUILD SUSTAINABLE FUTURES</h3>
            <p className="text-terminal-dim text-sm mb-4">
              We are pioneering regenerative ecosystem practices integrated into next-generation network infrastructure. Our mission extends beyond innovation to environmental stewardship and community renewal.
            </p>
            <p className="text-terminal-dim text-xs">
              Building interconnected systems that improve both human flourishing and ecological health. Join us in creating technological solutions that heal the planet.
            </p>
          </div>

          {/* Card 2: Why Us */}
          <div className="terminal-card">
            <h3 className="text-terminal-green font-bold mb-4 terminal-text text-lg">OUR APPROACH</h3>
            <ul className="space-y-2">
              <li className="text-terminal-dim text-sm"><span className="text-terminal-bright">Regenerative Design</span> — Systems that heal, not extract</li>
              <li className="text-terminal-dim text-sm"><span className="text-terminal-bright">Community First</span> — Environmental justice at core</li>
              <li className="text-terminal-dim text-sm"><span className="text-terminal-bright">Scalable Impact</span> — From local to global transformation</li>
            </ul>
          </div>

          {/* Card 3: Getting Involved */}
          <div className="terminal-card">
            <h3 className="text-terminal-green font-bold mb-3 terminal-text text-lg">GET INVOLVED</h3>
            <p className="text-terminal-dim text-sm">
              Join us in developing and implementing regenerative ecosystem solutions. Whether in policy, technology, community engagement, or resource management, we're building the infrastructure for a sustainable future. Remote-friendly with flexible collaboration models.
            </p>
          </div>

          {/* Card 4: Values */}
          <div className="terminal-card">
            <h3 className="text-terminal-green font-bold mb-3 terminal-text text-lg">OUR VALUES</h3>
            <ul className="space-y-1">
              <li className="text-terminal-dim text-xs">• <span className="text-terminal-bright">Regeneration</span> — Systems that improve over time</li>
              <li className="text-terminal-dim text-xs">• <span className="text-terminal-bright">Equity</span> — Justice-centered approach</li>
              <li className="text-terminal-dim text-xs">• <span className="text-terminal-bright">Transparency</span> — Open source, open data</li>
              <li className="text-terminal-dim text-xs">• <span className="text-terminal-bright">Collaboration</span> — Cross-sector partnerships</li>
              <li className="text-terminal-dim text-xs">• <span className="text-terminal-bright">Innovation</span> — Reimagining what's possible</li>
            </ul>
          </div>

          {/* Card 5: Impact Areas */}
          <div className="terminal-card">
            <h3 className="text-terminal-green font-bold mb-3 terminal-text text-lg">IMPACT AREAS</h3>
            <ul className="space-y-1">
              <li className="text-terminal-dim text-xs">• <span className="text-terminal-bright">Climate Solutions</span> — Tech for climate action</li>
              <li className="text-terminal-dim text-xs">• <span className="text-terminal-bright">Biodiversity</span> — Ecosystem preservation</li>
              <li className="text-terminal-dim text-xs">• <span className="text-terminal-bright">Communities</span> — Local restoration</li>
            </ul>
          </div>

          {/* Card 6: Get Started */}
          <div className="terminal-card">
            <h3 className="text-terminal-green font-bold mb-3 terminal-text text-lg">GET STARTED</h3>
            <ol className="space-y-1">
              <li className="text-terminal-dim text-xs"><span className="text-terminal-bright">1. Learn</span> about our initiatives</li>
              <li className="text-terminal-dim text-xs"><span className="text-terminal-bright">2. Connect</span> with our community</li>
              <li className="text-terminal-dim text-xs"><span className="text-terminal-bright">3. Contribute</span> your skills</li>
              <li className="text-terminal-dim text-xs"><span className="text-terminal-bright">4. Scale</span> regenerative impact</li>
            </ol>
          </div>
        </div>

        <div className="terminal-card mb-8 text-center">
          <p className="text-terminal-green font-bold terminal-text text-sm mb-2">READY TO JOIN THE REGENERATIVE MOVEMENT?</p>
          <p className="text-terminal-dim text-xs">Share your interest and how you want to contribute. We're building a global community focused on healing our world.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Section A: Identity & Credentials */}
            <div className="terminal-section">
              <h2 className="text-2xl font-bold text-terminal-green mb-6 terminal-text border-l-4 border-terminal-green pl-4">
                SECTION A: PERSONNEL IDENTIFICATION FILE
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="terminal-label">NAME (LAST, FIRST)</FormLabel>
                      <FormControl>
                        <Input 
                          className="terminal-input" 
                          placeholder="DOE, JOHN" 
                          {...field}
                          data-testid="input-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="terminal-label">CURRENT LOCATION (CITY/TOWER)</FormLabel>
                      <FormControl>
                        <Input 
                          className="terminal-input" 
                          placeholder="SAN FRANCISCO, CA" 
                          {...field}
                          data-testid="input-location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="terminal-label">CONTACT FREQUENCY (EMAIL)</FormLabel>
                      <FormControl>
                        <Input 
                          className="terminal-input" 
                          type="email" 
                          placeholder="operative@domain.com" 
                          {...field}
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="terminal-label">DIRECT COMM (PHONE)</FormLabel>
                      <FormControl>
                        <Input 
                          className="terminal-input" 
                          type="tel" 
                          placeholder="+1 (555) 000-0000" 
                          {...field}
                          data-testid="input-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="terminal-label">LINKEDIN PROFILE URL</FormLabel>
                      <FormControl>
                        <Input 
                          className="terminal-input" 
                          placeholder="linkedin.com/in/username" 
                          {...field}
                          value={field.value || ""}
                          data-testid="input-linkedin"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resumeUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="terminal-label">RESUME/CV DATAPACK</FormLabel>
                      <FormControl>
                        <Input 
                          className="terminal-input" 
                          placeholder="https://drive.google.com/..." 
                          {...field}
                          value={field.value || ""}
                          data-testid="input-resume"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section B: Experience & Classification */}
            <div className="terminal-section">
              <h2 className="text-2xl font-bold text-terminal-green mb-6 terminal-text border-l-4 border-terminal-green pl-4">
                SECTION B: OPERATIONAL EXPERIENCE MATRIX
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <FormField
                  control={form.control}
                  name="minimumCompensation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="terminal-label">YIELD (MINIMUM ANNUAL COMPENSATION REQUIRED)</FormLabel>
                      <FormControl>
                        <Input 
                          className="terminal-input" 
                          type="number" 
                          placeholder="150000" 
                          {...field}
                          value={field.value || ""}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          data-testid="input-compensation"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="noticePeriodWeeks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="terminal-label">NOTICE PERIOD (WEEKS REQUIRED BEFORE INTEGRATION)</FormLabel>
                      <FormControl>
                        <Input 
                          className="terminal-input" 
                          type="number" 
                          placeholder="2" 
                          {...field}
                          value={field.value || ""}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          data-testid="input-notice-period"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startupYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="terminal-label">YEARS IN STARTUP ENVIRONMENT (FAST-PACED FIRMS)</FormLabel>
                      <FormControl>
                        <Input 
                          className="terminal-input" 
                          type="number" 
                          placeholder="3+" 
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          data-testid="input-startup-years"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valuesAlignment"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border border-terminal-green/30 rounded-lg">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                          className="border-terminal-green data-[state=checked]:bg-terminal-green data-[state=checked]:text-black"
                          data-testid="checkbox-values"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="terminal-label text-sm">
                          CONFIRMATION OF ALIGNMENT WITH CORE OPERATIONAL VALUES
                        </FormLabel>
                        <p className="text-xs text-terminal-dim">
                          Focus on the mission • Bias to action • Do whatever it takes • Ship fast • Own the outcome • Radical candor
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="mb-6">
                <FormField
                  control={form.control}
                  name="contractInterpretationLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="terminal-label">
                        CONTRACT INTERPRETATION FAMILIARITY (LEVEL OF COMFORT)
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <Slider
                            min={1}
                            max={5}
                            step={1}
                            value={[field.value || 1]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                            className="terminal-slider"
                            data-testid="slider-contract-level"
                          />
                          <div className="flex justify-between text-xs text-terminal-dim">
                            <span>1 - BASIC</span>
                            <span className="text-terminal-green font-bold">{contractLevel || 1}</span>
                            <span>5 - EXPERT</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="paymentSystemsExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="terminal-label">
                        PROVEN TRACK RECORD IN PAYMENT/BANKING SYSTEMS
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          className="terminal-textarea min-h-[100px]" 
                          placeholder="Describe complexity of funds handled, payment systems managed, and scale of operations..."
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-payment-systems"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxAdvisorExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="terminal-label">
                        TAX ADVISOR COORDINATION EXPERIENCE
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          className="terminal-textarea min-h-[100px]" 
                          placeholder="Describe scale and jurisdictions handled..."
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-tax-advisor"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="investorRelationsExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="terminal-label">
                        INVESTOR RELATIONS (EQUITY/DEBT RAISE SUPPORT) [OPTIONAL]
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          className="terminal-textarea min-h-[100px]" 
                          placeholder="Describe your experience supporting fundraising efforts..."
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-investor-relations"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="executiveCollaboration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="terminal-label">
                        C-LEVEL/FOUNDER COLLABORATION HISTORY [OPTIONAL]
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          className="terminal-textarea min-h-[100px]" 
                          placeholder="Describe your experience working directly with executives and founders..."
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-executive-collab"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section C: Mission Statement */}
            <div className="terminal-section">
              <h2 className="text-2xl font-bold text-terminal-green mb-6 terminal-text border-l-4 border-terminal-green pl-4">
                SECTION C: CANDIDATE MANIFESTO
              </h2>
              
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="motivationStatement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="terminal-label">
                        MISSION MOTIVATION (WHY FRONTIER TOWER? WHY THIS PROJECT?)
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          className="terminal-textarea min-h-[200px]" 
                          placeholder="Describe your motivation for joining Project Utopia, what drives you, and why you're the right operative for this mission..."
                          {...field}
                          data-testid="textarea-motivation"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referralSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="terminal-label">SOURCE OF REFERRAL (HOW DID YOU ACCESS THIS TERMINAL?)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger className="terminal-select" data-testid="select-referral">
                            <SelectValue placeholder="SELECT SOURCE..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="terminal-select-content">
                          <SelectItem value="tower-citizen">Tower Citizen</SelectItem>
                          <SelectItem value="recruitment-bot">Recruitment Bot</SelectItem>
                          <SelectItem value="job-board">Job Board</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="referral">Personal Referral</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="portfolioUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="terminal-label">LINK TO PORTFOLIO/CASE STUDIES [OPTIONAL]</FormLabel>
                      <FormControl>
                        <Input 
                          className="terminal-input" 
                          placeholder="https://..." 
                          {...field}
                          value={field.value || ""}
                          data-testid="input-portfolio"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Action Panel */}
            <div className="terminal-action-panel">
              <div className="flex items-start gap-3 mb-6 p-4 border-l-4 border-amber-500 bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-terminal-dim">
                  All data transmitted securely via encrypted channel. Submission confirms acceptance of all Frontier Tower recruitment protocols.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  className="terminal-button-secondary"
                  onClick={() => form.reset()}
                  disabled={isSubmitting}
                  data-testid="button-abort"
                >
                  ABORT TRANSMISSION
                </Button>
                <Button
                  type="submit"
                  className="terminal-button-primary"
                  disabled={isSubmitting}
                  data-testid="button-submit"
                >
                  {isSubmitting ? (
                    <>TRANSMITTING DATA...</>
                  ) : (
                    <>
                      TRANSMIT DATA PACKAGE & INITIATE REVIEW
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
