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
            Head of Finance @ Frontier Tower
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Remote or Hybrid
          </p>
        </div>

        {/* About Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About Frontier Tower</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            We are the world's fastest-growing network society. Our capital is San Francisco, and our citadel is a 16-story vertical village for frontier tech, arts & music on Market Street. Our mission is to design a governance model that is flexible and organic enough for communities worldwide to adopt and join. We are building a true federation where each tower retains its own rules while benefiting from the joined economic layer, portable citizenship rights and tech infrastructure.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Our goals are bold: 9 additional towers by the end of 2026 and 100 towers by 2029. We're growing double-digit % MOM while building the technological backbone to govern the next era of society in a post-labor world. We are backed by leading visionaries and will raise a major round for a DAO next year. Ultimately, we aim to unite 10 million frontier citizens in a seamless inter-city network society. To scale this fast, we need the right tools: Imagine rebuilding nation-state governance from the ground up—with AI native to the system next to an App Store for governance, plug-and-play community Apps, and built-in payments with our own currency powering a new frontier economy.
          </p>
        </div>

        {/* Why Us Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Frontier Tech Only</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Work at the bleeding edge of innovation. Nothing is too new, every thought can be challenged, and the status quo is there to be disrupted.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Crypto Native</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Decentralization, permissionlessness & censorship resistance is what we breath. Think of the first names that come to mind in crypto whose identity is known: Those are our seed investors. Imagine societies of tomorrow: sovereign networks that transcend borders and nation-states: That's where we operate.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Momentum but Early Stage</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Our first 16-floor installation is already crowded with frontier citizens, the second a 112 bedroom residency is opening in December, yet we're barely seven months in and there is plenty of space to engrave your initials into the ground.
            </p>
          </div>
        </div>

        {/* The Role */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Role</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            This is a remote-first job. You'll be our head of finance, overseeing multiple companies which are either holding real estate, operating companies, or working on creating the tech which runs it all. You'll be operating all bank accounts, paying the team and vendors, speaking to tax advisors and preparing financials for our investors.
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            You'll be working closely with the CEO to make sure that new contracts are signed and that we don't miss important deadlines. You will work on financial models and support in the fundraise by engaging with investors who have committed to investing or have already signed the paperwork and need assistance to wire the funds.
          </p>
        </div>

        {/* What We're Looking For */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Must-Have</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• 3+ years in fast-pace startups</li>
              <li>• Focus on the mission & Bias to action & Do Whatever It Takes & Ship fast & Own the outcome & Be humble & Radical candor—alignment with core company values</li>
              <li>• Banking & Payments — Proven track record in handling a lot of payments</li>
              <li>• Tax Knowledge — Direct collaboration with tax advisors</li>
              <li>• Contracts — Ability to read basic contracts</li>
              <li>• Willingness to learn and adapt — Take feedback and iterate</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Nice-to-Have</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Investor Relations — Experience supporting equity/debt raises</li>
              <li>• Worked closely with C-Level/Founder before</li>
            </ul>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Apply Now
          </h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} data-testid="input-name" />
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
                        <FormLabel>Current Location</FormLabel>
                        <FormControl>
                          <Input placeholder="City, Country" {...field} data-testid="input-location" />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} data-testid="input-email" />
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
                        <FormLabel>Phone</FormLabel>
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
                        <FormLabel>LinkedIn Profile (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="linkedin.com/in/yourprofile" {...field} value={field.value || ""} data-testid="input-linkedin" />
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
                        <FormLabel>Resume Link (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://drive.google.com/..." {...field} value={field.value || ""} data-testid="input-resume" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Experience */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Experience</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <FormField
                    control={form.control}
                    name="minimumCompensation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Annual Compensation Expected</FormLabel>
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
                        <FormLabel>Notice Period (Weeks)</FormLabel>
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
                        <FormLabel>Years in Fast-Paced Startups</FormLabel>
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
                      <FormLabel>Ability to Read Contracts (1-5)</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <Slider min={1} max={5} step={1} value={[field.value || 1]} onValueChange={(vals) => field.onChange(vals[0])} data-testid="slider-contract-level" />
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Basic</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{contractLevel || 1}</span>
                            <span>Advanced</span>
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
                        <FormLabel>Banking & Payments Experience</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell us about your experience with banking systems and payment handling..." className="min-h-[100px]" {...field} value={field.value || ""} data-testid="textarea-payment-systems" />
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
                        <FormLabel>Tax Knowledge & Experience</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your experience with tax advisors and tax compliance..." className="min-h-[100px]" {...field} value={field.value || ""} data-testid="textarea-tax-advisor" />
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
                        <FormLabel>Investor Relations Experience (Nice-to-Have)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Have you supported equity/debt raises before?" className="min-h-[100px]" {...field} value={field.value || ""} data-testid="textarea-investor-relations" />
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
                        <FormLabel>C-Level/Founder Experience (Nice-to-Have)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Have you worked closely with C-Level or Founder before?" className="min-h-[100px]" {...field} value={field.value || ""} data-testid="textarea-executive-collaboration" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Motivation */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Story</h3>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="motivationStatement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Why Frontier Tower?</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell us what excites you about this opportunity..." className="min-h-[120px]" {...field} data-testid="textarea-motivation" />
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
                        <FormLabel>How did you hear about us?</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a source..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                        <FormLabel>Portfolio / Work Samples (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://your-portfolio.com" {...field} value={field.value || ""} data-testid="input-portfolio" />
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
                          <FormLabel>I align with your core values</FormLabel>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Focus on the mission • Bias to action • Do Whatever It Takes • Ship fast • Own the outcome • Be humble • Radical candor
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
                  {isSubmitting ? "Submitting..." : "Submit Application"}
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
