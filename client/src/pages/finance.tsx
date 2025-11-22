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
            Join Frontier Tower in Building a Sustainable Future
          </p>
        </div>

        {/* Info Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Our Mission</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              We're pioneering regenerative ecosystem practices integrated into next-generation network infrastructure. Our mission extends beyond innovation to environmental stewardship and community renewal.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Our Approach</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• <span className="font-semibold">Regenerative Design</span> — Systems that heal</li>
              <li>• <span className="font-semibold">Community First</span> — Justice-centered</li>
              <li>• <span className="font-semibold">Scalable Impact</span> — Global transformation</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Core Values</h3>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Regeneration — Systems that improve over time</li>
              <li>• Equity — Justice-centered approach</li>
              <li>• Transparency — Open source, open data</li>
              <li>• Collaboration — Cross-sector partnerships</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Impact Areas</h3>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Climate Solutions — Tech for climate action</li>
              <li>• Biodiversity — Ecosystem preservation</li>
              <li>• Communities — Local restoration</li>
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
              {/* Section A: Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="flex items-center justify-center w-6 h-6 bg-primary rounded-full text-white text-sm mr-3">1</span>
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} data-testid="input-name" />
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
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="San Francisco, CA" {...field} data-testid="input-location" />
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

              {/* Section B: Experience */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="flex items-center justify-center w-6 h-6 bg-primary rounded-full text-white text-sm mr-3">2</span>
                  Professional Experience
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <FormField
                    control={form.control}
                    name="minimumCompensation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Annual Compensation</FormLabel>
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
                        <FormLabel>Years in Startup Environment</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="3" {...field} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} data-testid="input-startup-years" />
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
                      <FormLabel>Contract Interpretation Level (1-5)</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <Slider min={1} max={5} step={1} value={[field.value || 1]} onValueChange={(vals) => field.onChange(vals[0])} data-testid="slider-contract-level" />
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Beginner</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{contractLevel || 1}</span>
                            <span>Expert</span>
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
                        <FormLabel>Payment & Banking Systems Experience</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your experience with payment systems..." className="min-h-[100px]" {...field} value={field.value || ""} data-testid="textarea-payment-systems" />
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
                        <FormLabel>Tax Coordination Experience</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your tax experience..." className="min-h-[100px]" {...field} value={field.value || ""} data-testid="textarea-tax-advisor" />
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
                        <FormLabel>Investor Relations & Fundraising</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your fundraising experience..." className="min-h-[100px]" {...field} value={field.value || ""} data-testid="textarea-investor-relations" />
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
                        <FormLabel>Executive & Board Experience</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your experience with C-suite..." className="min-h-[100px]" {...field} value={field.value || ""} data-testid="textarea-executive-collaboration" />
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
                  Your Story
                </h3>

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
                          <FormLabel>I align with our core values</FormLabel>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Focus on mission • Bias to action • Ship fast • Own outcomes • Radical candor
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
