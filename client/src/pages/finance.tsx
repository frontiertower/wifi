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
import { ArrowRight, CheckCircle, ChevronLeft } from "lucide-react";
import { Link } from "wouter";

type JobApplicationFormData = z.infer<typeof insertJobApplicationSchema>;

export default function FinancePage() {
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
        title: "Application Submitted",
        description: "Your application has been received. We'll review it and be in touch soon!",
      });
      
      setIsSubmitted(true);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contractLevel = form.watch("contractInterpretationLevel");

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Application Submitted
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Thank you for applying! We'll review your application and contact you if there's a good fit.
          </p>
          <Link href="/">
            <Button className="w-full">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        {/* Title Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Head of Regenerative Finance
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Frontier Tower Recruitment • Join Our Team
          </p>
        </div>

        {/* Info Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Regenerative Ecosystems: Build Sustainable Futures</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              We are pioneering regenerative ecosystem practices integrated into next-generation network infrastructure. Our mission extends beyond innovation to environmental stewardship and community renewal.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Building interconnected systems that improve both human flourishing and ecological health. Join us in creating technological solutions that heal the planet.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Our Approach</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><span className="font-semibold">Regenerative Design</span> — Systems that heal, not extract</li>
              <li><span className="font-semibold">Community First</span> — Environmental justice at core</li>
              <li><span className="font-semibold">Scalable Impact</span> — From local to global transformation</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Get Involved</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Join us in developing and implementing regenerative ecosystem solutions. Whether in policy, technology, community engagement, or resource management, we're building the infrastructure for a sustainable future. Remote-friendly with flexible collaboration models.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Our Values</h3>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• <span className="font-semibold">Regeneration</span> — Systems that improve over time</li>
              <li>• <span className="font-semibold">Equity</span> — Justice-centered approach</li>
              <li>• <span className="font-semibold">Transparency</span> — Open source, open data</li>
              <li>• <span className="font-semibold">Collaboration</span> — Cross-sector partnerships</li>
              <li>• <span className="font-semibold">Innovation</span> — Reimagining what's possible</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Impact Areas</h3>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• <span className="font-semibold">Climate Solutions</span> — Tech for climate action</li>
              <li>• <span className="font-semibold">Biodiversity</span> — Ecosystem preservation</li>
              <li>• <span className="font-semibold">Communities</span> — Local restoration</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Get Started</h3>
            <ol className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li><span className="font-semibold">1. Learn</span> about our initiatives</li>
              <li><span className="font-semibold">2. Connect</span> with our community</li>
              <li><span className="font-semibold">3. Contribute</span> your skills</li>
              <li><span className="font-semibold">4. Scale</span> regenerative impact</li>
            </ol>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-8 text-center">
          <p className="font-bold text-gray-900 dark:text-white mb-2">Ready to Join the Regenerative Movement?</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Share your interest and how you want to contribute. We're building a global community focused on healing our world.
          </p>
        </div>

        {/* Application Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Apply Now
          </h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Section A: Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="flex items-center justify-center w-6 h-6 bg-primary rounded-full text-white text-sm mr-3">1</span>
                  Personnel Identification File
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (Last, First)</FormLabel>
                        <FormControl>
                          <Input placeholder="DOE, JOHN" {...field} data-testid="input-name" />
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
                        <FormLabel>Current Location (City/Tower)</FormLabel>
                        <FormControl>
                          <Input placeholder="SAN FRANCISCO, CA" {...field} data-testid="input-location" />
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
                        <FormLabel>Contact Frequency (Email)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="operative@domain.com" {...field} data-testid="input-email" />
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
                        <FormLabel>Direct Comm (Phone)</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+1 (555) 000-0000" {...field} data-testid="input-phone" />
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
                        <FormLabel>LinkedIn Profile URL</FormLabel>
                        <FormControl>
                          <Input placeholder="linkedin.com/in/username" {...field} value={field.value || ""} data-testid="input-linkedin" />
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
                        <FormLabel>Resume/CV Datapack</FormLabel>
                        <FormControl>
                          <Input placeholder="https://drive.google.com/..." {...field} value={field.value || ""} data-testid="input-resume" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section B: Experience */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="flex items-center justify-center w-6 h-6 bg-primary rounded-full text-white text-sm mr-3">2</span>
                  Operational Experience Matrix
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <FormField
                    control={form.control}
                    name="minimumCompensation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yield (Minimum Annual Compensation Required)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="150000" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} data-testid="input-compensation" />
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
                        <FormLabel>Notice Period (Weeks Required Before Integration)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} data-testid="input-notice-period" />
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
                        <FormLabel>Years in Startup Environment (Fast-Paced Firms)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="3+" {...field} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} data-testid="input-startup-years" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="contractInterpretationLevel"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel>Contract Interpretation Familiarity (Level of Comfort)</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <Slider min={1} max={5} step={1} value={[field.value || 1]} onValueChange={(vals) => field.onChange(vals[0])} data-testid="slider-contract-level" />
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>1 - BASIC</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{contractLevel || 1}</span>
                            <span>5 - EXPERT</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paymentSystemsExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proven Track Record in Payment/Banking Systems</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe complexity of funds handled, payment systems managed, and scale of operations..." className="min-h-[100px]" {...field} value={field.value || ""} data-testid="textarea-payment-systems" />
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
                        <FormLabel>Tax Advisor Coordination Experience</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe scale and jurisdictions handled..." className="min-h-[100px]" {...field} value={field.value || ""} data-testid="textarea-tax-advisor" />
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
                        <FormLabel>Investor Relations & Fundraising Experience</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe fundraising rounds managed, investor base size, and communication strategies..." className="min-h-[100px]" {...field} value={field.value || ""} data-testid="textarea-investor-relations" />
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
                        <FormLabel>Executive Collaboration & Board Experience</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe experience working with C-suite, board interactions, and strategic planning..." className="min-h-[100px]" {...field} value={field.value || ""} data-testid="textarea-executive-collaboration" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section C: Motivation */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="flex items-center justify-center w-6 h-6 bg-primary rounded-full text-white text-sm mr-3">3</span>
                  Candidate Manifesto
                </h3>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="motivationStatement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Why Frontier Tower? What Drives You?</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell us about your motivation, what excites you about this opportunity, and what you want to build..." className="min-h-[120px]" {...field} data-testid="textarea-motivation" />
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
                        <FormLabel>How Did You Hear About Us?</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="referral">Referral from Team Member</SelectItem>
                            <SelectItem value="social">Social Media</SelectItem>
                            <SelectItem value="job_board">Job Board</SelectItem>
                            <SelectItem value="conference">Conference / Event</SelectItem>
                            <SelectItem value="directly">Directly Approached You</SelectItem>
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
                        <FormLabel>Portfolio / Work Samples (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://your-portfolio.com or github.com/..." {...field} value={field.value || ""} data-testid="input-portfolio" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="valuesAlignment"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg">
                        <FormControl>
                          <Checkbox checked={field.value || false} onCheckedChange={field.onChange} data-testid="checkbox-values" />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Confirmation of Alignment with Core Operational Values</FormLabel>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Focus on the mission • Bias to action • Do whatever it takes • Ship fast • Own the outcome • Radical candor
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-6 border-t">
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full" data-testid="button-cancel">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting} className="flex-1" data-testid="button-submit-application">
                  {isSubmitting ? "Transmitting..." : "Submit Application"}
                  {!isSubmitting && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
