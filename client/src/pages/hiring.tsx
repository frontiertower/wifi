import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertJobApplicationSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Power } from "lucide-react";
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
      <div className="min-h-screen terminal-bg terminal-force-dark">
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
    <div className="min-h-screen terminal-bg terminal-force-dark">
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
          <h1 className="text-2xl md:text-5xl font-bold text-center text-terminal-green terminal-glow mb-2 terminal-text">
            <div>HEAD OF FINANCE</div>
            <div>@ FRONTIER TOWER</div>
          </h1>
          <p className="text-center text-terminal-dim text-sm md:text-base">
            INITIATE PERSONNEL DATA INPUT PROTOCOL • REMOTE OR HYBRID
          </p>
        </div>

        {/* Role Description Grid */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Card 1: Mission Overview */}
          <div className="terminal-card">
            <h3 className="text-terminal-green font-bold mb-3 terminal-text text-lg break-words whitespace-normal">SEEK YOUR FORTUNE: JOIN THE FRONTIER INITIATIVE</h3>
            <p className="text-terminal-dim text-sm mb-4">
              We are the world's fastest-growing network society. Our capital is San Francisco, and our citadel is a 16-story vertical village for frontier tech, arts & music on Market Street.
            </p>
            <p className="text-terminal-dim text-xs">
              Building a true federation where each tower retains its own rules while benefiting from the joined economic layer, portable citizenship rights and tech infrastructure.
            </p>
          </div>

          {/* Card 2: Why Us */}
          <div className="terminal-card">
            <h3 className="text-terminal-green font-bold mb-4 terminal-text text-lg">WHY US?</h3>
            <ul className="space-y-2">
              <li className="text-terminal-dim text-sm"><span className="text-terminal-bright">Frontier Tech Only</span> — Bleeding edge innovation</li>
              <li className="text-terminal-dim text-sm"><span className="text-terminal-bright">Crypto Native</span> — Decentralized & borderless</li>
              <li className="text-terminal-dim text-sm"><span className="text-terminal-bright">Early Momentum</span> — Barely 7 months in, plenty of space</li>
            </ul>
          </div>

          {/* Card 3: The Role */}
          <div className="terminal-card">
            <h3 className="text-terminal-green font-bold mb-3 terminal-text text-lg">THE ROLE</h3>
            <p className="text-terminal-dim text-sm">
              Remote-first job overseeing multiple companies. Operating all bank accounts, paying team and vendors, speaking to tax advisors, preparing financials for investors. Working closely with CEO on contracts, financial models, and fundraising support.
            </p>
          </div>

          {/* Card 4: Requirements */}
          <div className="terminal-card">
            <h3 className="text-terminal-green font-bold mb-3 terminal-text text-lg">MUST-HAVE</h3>
            <ul className="space-y-1">
              <li className="text-terminal-dim text-xs">• <span className="text-terminal-bright">3+ years</span> startup experience</li>
              <li className="text-terminal-dim text-xs">• <span className="text-terminal-bright">Values alignment</span> mission-focused</li>
              <li className="text-terminal-dim text-xs">• <span className="text-terminal-bright">Banking & Payments</span> track record</li>
              <li className="text-terminal-dim text-xs">• <span className="text-terminal-bright">Tax Knowledge</span> collaboration</li>
              <li className="text-terminal-dim text-xs">• <span className="text-terminal-bright">Contracts</span> reading ability</li>
            </ul>
          </div>

          {/* Card 5: Nice to Have */}
          <div className="terminal-card">
            <h3 className="text-terminal-green font-bold mb-3 terminal-text text-lg">NICE-TO-HAVE</h3>
            <ul className="space-y-1">
              <li className="text-terminal-dim text-xs">• <span className="text-terminal-bright">Investor Relations</span> experience</li>
              <li className="text-terminal-dim text-xs">• <span className="text-terminal-bright">C-Level/Founder</span> collaboration</li>
            </ul>
          </div>

          {/* Card 6: Interview Process */}
          <div className="terminal-card">
            <h3 className="text-terminal-green font-bold mb-3 terminal-text text-lg">INTERVIEW PROCESS</h3>
            <ol className="space-y-1">
              <li className="text-terminal-dim text-xs"><span className="text-terminal-bright">1. Initial Call</span> (30 min)</li>
              <li className="text-terminal-dim text-xs"><span className="text-terminal-bright">2. Deep Dive</span> (60 min)</li>
              <li className="text-terminal-dim text-xs"><span className="text-terminal-bright">3. Team Interviews</span> (30 min)</li>
              <li className="text-terminal-dim text-xs"><span className="text-terminal-bright">4. Final Chat</span> (30 min)</li>
            </ol>
          </div>
        </div>

        <div className="terminal-card mb-8 text-center">
          <p className="text-terminal-green font-bold terminal-text text-sm mb-2">READY TO BUILD THE FUTURE?</p>
          <p className="text-terminal-dim text-xs">Submit your personnel file below. We review applications on a rolling basis and contact promising candidates within 2-3 business days.</p>
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
                      <FormLabel className="terminal-label text-terminal-green">NAME (LAST, FIRST)</FormLabel>
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
                      <FormLabel className="terminal-label text-terminal-green">CURRENT LOCATION (CITY/TOWER)</FormLabel>
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
                      <FormLabel className="terminal-label text-terminal-green">CONTACT FREQUENCY (EMAIL)</FormLabel>
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
                      <FormLabel className="terminal-label text-terminal-green">DIRECT COMM (PHONE)</FormLabel>
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
                      <FormLabel className="terminal-label text-terminal-green">LINKEDIN PROFILE URL</FormLabel>
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
                      <FormLabel className="terminal-label text-terminal-green">RESUME/CV DATAPACK</FormLabel>
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
                      <FormLabel className="terminal-label text-terminal-green">YIELD (MINIMUM ANNUAL COMPENSATION REQUIRED)</FormLabel>
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
                      <FormLabel className="terminal-label text-terminal-green">NOTICE PERIOD (WEEKS REQUIRED BEFORE INTEGRATION)</FormLabel>
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
                      <FormLabel className="terminal-label text-terminal-green">YEARS IN STARTUP ENVIRONMENT (FAST-PACED FIRMS)</FormLabel>
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
                        <FormLabel className="terminal-label text-terminal-green text-sm">
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
                      <FormLabel className="terminal-label text-terminal-green">
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
                      <FormLabel className="terminal-label text-terminal-green">
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
                      <FormLabel className="terminal-label text-terminal-green">
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
                      <FormLabel className="terminal-label text-terminal-green">
                        INVESTOR RELATIONS (EQUITY/DEBT RAISE SUPPORT) [OPTIONAL]
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          className="terminal-textarea min-h-[100px]" 
                          placeholder="Your experience with investor relations..."
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
                      <FormLabel className="terminal-label text-terminal-green">
                        C-LEVEL/FOUNDER COLLABORATION [OPTIONAL]
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          className="terminal-textarea min-h-[100px]" 
                          placeholder="Your experience working with senior leadership..."
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-executive-collaboration"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section C: Candidate Manifesto */}
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
                      <FormLabel className="terminal-label text-terminal-green">
                        MISSION ALIGNMENT STATEMENT
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          className="terminal-textarea min-h-[120px]" 
                          placeholder="Why are you interested in this opportunity with Frontier Tower?"
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
                      <FormLabel className="terminal-label text-terminal-green">DISCOVERY VECTOR</FormLabel>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="terminal-select">
                            <SelectValue placeholder="How did you find us?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="terminal-select-content">
                          <SelectItem value="referral">Referral from Team Member</SelectItem>
                          <SelectItem value="social">Social Media</SelectItem>
                          <SelectItem value="job_board">Job Board</SelectItem>
                          <SelectItem value="conference">Conference / Event</SelectItem>
                          <SelectItem value="directly">Directly Approached</SelectItem>
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
                      <FormLabel className="terminal-label text-terminal-green">PORTFOLIO / WORK SAMPLES [OPTIONAL]</FormLabel>
                      <FormControl>
                        <Input 
                          className="terminal-input" 
                          placeholder="https://your-portfolio.com" 
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

            {/* Submit Button */}
            <div className="flex gap-3 pt-6">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full terminal-button-secondary" data-testid="button-cancel">
                  CANCEL TRANSMISSION
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} className="flex-1 terminal-button-primary" data-testid="button-submit-application">
                {isSubmitting ? "TRANSMITTING..." : "SUBMIT APPLICATION"}
                {!isSubmitting && <ArrowRight className="ml-2 w-4 h-4" />}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
