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
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle2, Calendar, Users, Sparkles, DollarSign } from "lucide-react";
import { Link } from "wouter";

type JobApplicationFormData = z.infer<typeof insertJobApplicationSchema>;

export default function CommunityEventsPage() {
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
      motivationStatement: "",
      referralSource: undefined,
      portfolioUrl: undefined,
    },
  });

  const onSubmit = async (data: JobApplicationFormData) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/job-applications", {
        ...data,
        position: "Community & Events Manager",
      });
      
      toast({
        title: "Application Submitted",
        description: "We've received your application and will be in touch soon!",
      });
      
      setIsSubmitted(true);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-screen">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4 text-white">
              Application Received!
            </h2>
            <p className="text-white/80 mb-8 max-w-md">
              Thank you for your interest in the Community & Events Manager role. We'll review your application and get back to you soon.
            </p>
            <Link href="/careers">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" data-testid="button-return-careers">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Careers
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/careers">
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Careers
            </Button>
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden mb-8">
          <div className="p-8 md:p-12 border-b border-white/10">
            <div className="flex items-center gap-2 text-amber-300 text-sm font-medium mb-4">
              <span className="px-3 py-1 bg-amber-500/20 rounded-full">Part-time Contract</span>
              <span className="px-3 py-1 bg-amber-500/20 rounded-full">San Francisco (Hybrid)</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Community & Events Manager
            </h1>
            <p className="text-xl text-white/70">
              Turn our venue into a thriving, profitable ecosystem
            </p>
          </div>

          <div className="p-8 md:p-12 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">About the Role</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                We are seeking a Community & Events Manager to take full ownership of our third-party and internal event operations. Your mission is to turn our venue and community activities into a thriving, profitable ecosystem—driving engagement, partnerships, and recurring sponsorship revenue.
              </p>
              <p className="text-white/80 leading-relaxed">
                This role combines event production, community engagement, and sponsorship management. You'll coordinate logistics, oversee event calendars to avoid overlaps, produce seasonal gatherings (Xmas, NYE, etc.), and manage relationships with sponsors and vendors.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 flex items-start gap-4">
                <Calendar className="w-8 h-8 text-amber-400 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-white mb-1">Event Production</h3>
                  <p className="text-white/60 text-sm">Plan and execute high-quality internal and third-party events</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 flex items-start gap-4">
                <Users className="w-8 h-8 text-amber-400 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-white mb-1">Community Building</h3>
                  <p className="text-white/60 text-sm">Organize holiday events, social clubs, and hackathons</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 flex items-start gap-4">
                <DollarSign className="w-8 h-8 text-amber-400 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-white mb-1">Sponsorship Sales</h3>
                  <p className="text-white/60 text-sm">Pitch, close, and maintain partner satisfaction</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 flex items-start gap-4">
                <Sparkles className="w-8 h-8 text-amber-400 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-white mb-1">Major Events Support</h3>
                  <p className="text-white/60 text-sm">GDC, JPM HealthTech Week, and more</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Key Responsibilities</h2>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>Plan and execute internal and third-party events with high-quality production</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>Manage all sponsorship relationships—pitch, close, and maintain partner satisfaction</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>Maintain a master calendar and prevent scheduling conflicts</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>Oversee a monthly event operations budget of $5K for supplies, helpers, and logistics</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>Organize community experiences (holiday events, social clubs, hackathons)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>Support major external events such as GDC and JPM HealthTech Week</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>Strategize ways to convert event operations into a sustainable profit center</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">What Success Looks Like</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-400/20">
                  <p className="text-white/90 text-sm">Profitable and well-attended events that reflect community values</p>
                </div>
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-400/20">
                  <p className="text-white/90 text-sm">Increased sponsorship revenue and recurring partnerships</p>
                </div>
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-400/20">
                  <p className="text-white/90 text-sm">A vibrant calendar of consistent weekly/monthly gatherings</p>
                </div>
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-400/20">
                  <p className="text-white/90 text-sm">Clear operational systems for event logistics and tools</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Requirements</h3>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li>• 3+ years in event planning, operations, or community management</li>
                  <li>• Experience with sponsorship sales or partnership management</li>
                  <li>• Strong organizational skills and ability to juggle multiple priorities</li>
                  <li>• Creative and resourceful mindset; comfortable with startup-style budgets</li>
                  <li>• Excellent communication and interpersonal skills</li>
                  <li>• Comfortable with light logistics setup and coordinating helpers</li>
                  <li>• Passionate about cultivating thriving, community-oriented spaces</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl p-6 border border-amber-400/30">
                <h3 className="text-lg font-bold text-white mb-4">Compensation</h3>
                <ul className="space-y-3 text-white/90">
                  <li className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold">$5,000/month base</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>+ 20% of sponsorship revenue</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    <span>+ $5K/month event budget</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">Apply Now</h2>
            <p className="text-white/60 mt-1">Fill out the form below to apply for this position</p>
          </div>

          <div className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Full Name *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                            placeholder="Your full name"
                            data-testid="input-name"
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
                        <FormLabel className="text-white/80">Email *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                            placeholder="your@email.com"
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Phone</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                            placeholder="+1 (555) 000-0000"
                            data-testid="input-phone"
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
                        <FormLabel className="text-white/80">Location *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                            placeholder="City, Country"
                            data-testid="input-location"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="linkedinUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">LinkedIn URL</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            value={field.value || ""}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                            placeholder="https://linkedin.com/in/..."
                            data-testid="input-linkedin"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="portfolioUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Portfolio / Event Examples</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            value={field.value || ""}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                            placeholder="https://..."
                            data-testid="input-portfolio"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="resumeUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Resume/CV URL</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                          placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                          data-testid="input-resume"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startupYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Years of Event/Community Experience</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white" data-testid="select-experience">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1-2">1-2 years</SelectItem>
                            <SelectItem value="3-5">3-5 years</SelectItem>
                            <SelectItem value="5-10">5-10 years</SelectItem>
                            <SelectItem value="10+">10+ years</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="noticePeriodWeeks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Availability to Start</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value?.toString() || ""}>
                          <FormControl>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white" data-testid="select-notice">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="immediate">Immediate</SelectItem>
                            <SelectItem value="2-weeks">2 weeks</SelectItem>
                            <SelectItem value="4-weeks">4 weeks</SelectItem>
                            <SelectItem value="8-weeks">8+ weeks</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="motivationStatement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Tell us about a memorable event you organized *</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-[120px]"
                          placeholder="Describe an event you're proud of—what made it successful, how you handled challenges, and what you learned..."
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
                      <FormLabel className="text-white/80">How did you hear about us?</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                          placeholder="LinkedIn, referral, etc."
                          data-testid="input-referral"
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
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                          className="border-white/30 data-[state=checked]:bg-amber-500"
                          data-testid="checkbox-values"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-white/80 text-sm">
                          I'm passionate about building vibrant communities and creating memorable experiences
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white h-12"
                  data-testid="button-submit"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
