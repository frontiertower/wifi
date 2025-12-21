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
import { ArrowRight, ChevronLeft, Shield, Wifi } from "lucide-react";
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
        title: "✓ TRANSMISSION SUCCESSFUL",
        description: "Your application has been received",
      });
      
      setIsSubmitted(true);
      form.reset();
    } catch (error: any) {
      toast({
        title: "✗ TRANSMISSION FAILED",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contractLevel = form.watch("contractInterpretationLevel");

  if (isSubmitted) {
    return (
      <div className="min-h-screen p-4" style={{
        backgroundColor: '#003d82',
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255, 255, 255, 0.03) 49px, rgba(255, 255, 255, 0.03) 50px),
          repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(255, 255, 255, 0.03) 49px, rgba(255, 255, 255, 0.03) 50px)
        `,
      }}>
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-screen">
          <div style={{
            backgroundColor: '#003d82',
            border: '3px solid #ffffff',
            padding: '3rem',
            textAlign: 'center',
          }}>
            <h2 className="text-3xl font-bold mb-4" style={{
              color: '#ffffff',
              fontFamily: 'monospace',
              letterSpacing: '2px',
            }}>
              ✓ TRANSMISSION COMPLETE
            </h2>
            <p style={{
              color: '#ffffff',
              fontFamily: 'monospace',
              marginBottom: '2rem',
            }}>
              Your application has been received for processing
            </p>
            <Link href="/">
              <Button style={{
                backgroundColor: '#003d82',
                borderColor: '#ffffff',
                color: '#ffffff',
              }} variant="outline" data-testid="button-return-home">
                <ChevronLeft className="w-4 h-4 mr-2" />
                RETURN TO PORTAL
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{
      backgroundColor: '#003d82',
      backgroundImage: `
        repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255, 255, 255, 0.03) 49px, rgba(255, 255, 255, 0.03) 50px),
        repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(255, 255, 255, 0.03) 49px, rgba(255, 255, 255, 0.03) 50px)
      `,
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" style={{
              color: '#ffffff',
              borderColor: '#ffffff',
              fontSize: '12px',
              fontFamily: 'monospace',
            }} data-testid="button-back">
              &lt; BACK TO PORTAL
            </Button>
          </Link>
        </div>

        {/* Blueprint Title Block */}
        <div className="mb-8" style={{
          backgroundColor: '#003d82',
          border: '3px solid #ffffff',
        }}>
          <div className="p-8" style={{
            borderBottom: '2px solid #ffffff',
          }}>
            <h1 className="text-5xl md:text-6xl font-bold mb-2" style={{
              color: '#ffffff',
              fontFamily: 'monospace',
              letterSpacing: '2px',
            }}>
              HEAD OF FINANCE
            </h1>
            <div style={{
              height: '2px',
              backgroundColor: '#ffffff',
              marginBottom: '12px',
            }}></div>
            <p className="text-lg" style={{
              color: '#ffffff',
              fontFamily: 'monospace',
              letterSpacing: '1px',
            }}>
              @ FRONTIER TOWER (REMOTE OR HYBRID)
            </p>
          </div>

          {/* Technical Title Block */}
          <div className="flex" style={{
            backgroundColor: '#003d82',
          }}>
            <div className="flex-1 p-4" style={{
              borderRight: '2px solid #ffffff',
              color: '#ffffff',
              fontFamily: 'monospace',
              fontSize: '11px',
            }}>
              <div className="mb-2">Project: FRONTIER TOWER</div>
              <div className="mb-2">Position: HEAD OF FINANCE</div>
              <div>Revision: A</div>
            </div>
            <div className="w-32 p-4" style={{
              borderLeft: '2px solid #ffffff',
              color: '#ffffff',
              fontFamily: 'monospace',
              fontSize: '10px',
              textAlign: 'center',
            }}>
              <div className="mb-1 border-b border-white pb-1">RECRUITMENT</div>
              <div style={{ fontSize: '9px' }}>2069</div>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          <Link
            href="/code-of-conduct"
            className="p-4 border-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-left group block"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}
            data-testid="button-code-of-conduct"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 group-hover:bg-white/20" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                <Shield className="text-white" />
              </div>
              <div>
                <div className="font-medium" style={{ color: '#ffffff', fontFamily: 'monospace' }}>Code of Conduct</div>
                <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'monospace' }}>Our rules & guidelines</div>
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="p-4 border-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-left group block"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}
            data-testid="button-connect-wifi"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 group-hover:bg-white/20" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                <Wifi className="text-white" />
              </div>
              <div>
                <div className="font-medium" style={{ color: '#ffffff', fontFamily: 'monospace' }}>Connect to WiFi</div>
                <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'monospace' }}>Get online access</div>
              </div>
            </div>
          </Link>
        </div>

        {/* About Section */}
        <div className="mb-8" style={{
          backgroundColor: '#003d82',
          border: '2px solid #ffffff',
          padding: '1.5rem',
          color: '#ffffff',
          fontFamily: 'monospace',
          fontSize: '13px',
          lineHeight: '1.6',
        }}>
          <h2 className="font-bold mb-3" style={{ fontSize: '14px', letterSpacing: '1px' }}>ABOUT FRONTIER TOWER</h2>
          <p className="mb-3">
            We are the world's fastest-growing network society. Our capital is San Francisco, and our citadel is a 16-story vertical village for frontier tech, arts & music on Market Street. Our mission is to design a governance model that is flexible and organic enough for communities worldwide to adopt and join.
          </p>
          <p>
            Our goals are bold: 9 additional towers by the end of 2069 and 100 towers by 2072. We're growing double-digit % MOM while building the technological backbone to govern the next era of society in a post-labor world.
          </p>
        </div>

        {/* Why Us Grid */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div style={{
            backgroundColor: '#003d82',
            border: '2px solid #ffffff',
            padding: '1.5rem',
            color: '#ffffff',
            fontFamily: 'monospace',
            fontSize: '12px',
            lineHeight: '1.5',
          }}>
            <h3 className="font-bold mb-2" style={{ fontSize: '13px', letterSpacing: '1px' }}>FRONTIER TECH ONLY</h3>
            <p style={{ fontSize: '11px', opacity: 0.9 }}>Work at the bleeding edge of innovation. Nothing is too new, every thought can be challenged.</p>
          </div>

          <div style={{
            backgroundColor: '#003d82',
            border: '2px solid #ffffff',
            padding: '1.5rem',
            color: '#ffffff',
            fontFamily: 'monospace',
            fontSize: '12px',
            lineHeight: '1.5',
          }}>
            <h3 className="font-bold mb-2" style={{ fontSize: '13px', letterSpacing: '1px' }}>CRYPTO NATIVE</h3>
            <p style={{ fontSize: '11px', opacity: 0.9 }}>Decentralization, permissionlessness & censorship resistance is what we breathe.</p>
          </div>

          <div style={{
            backgroundColor: '#003d82',
            border: '2px solid #ffffff',
            padding: '1.5rem',
            color: '#ffffff',
            fontFamily: 'monospace',
            fontSize: '12px',
            lineHeight: '1.5',
          }}>
            <h3 className="font-bold mb-2" style={{ fontSize: '13px', letterSpacing: '1px' }}>MOMENTUM</h3>
            <p style={{ fontSize: '11px', opacity: 0.9 }}>16-floor installation crowded with frontier citizens, yet barely 7 months in.</p>
          </div>
        </div>

        {/* The Role */}
        <div className="mb-8" style={{
          backgroundColor: '#003d82',
          border: '2px solid #ffffff',
          padding: '1.5rem',
          color: '#ffffff',
          fontFamily: 'monospace',
          fontSize: '13px',
          lineHeight: '1.6',
        }}>
          <h2 className="font-bold mb-3" style={{ fontSize: '14px', letterSpacing: '1px' }}>THE ROLE</h2>
          <p className="mb-3">You'll be our head of finance, overseeing multiple companies which are either holding real estate, operating companies, or working on creating the tech which runs it all. You'll be operating all bank accounts, paying the team and vendors, speaking to tax advisors and preparing financials for our investors.</p>
          <p>You'll be working closely with the CEO to ensure contracts are signed and important deadlines are not missed. You will work on financial models and support in the fundraise by engaging with investors.</p>
        </div>

        {/* Requirements Grid */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <div style={{
            backgroundColor: '#003d82',
            border: '2px solid #ffffff',
            padding: '1.5rem',
            color: '#ffffff',
            fontFamily: 'monospace',
            fontSize: '12px',
          }}>
            <h3 className="font-bold mb-3" style={{ fontSize: '13px', letterSpacing: '1px' }}>MUST-HAVE</h3>
            <ul className="space-y-2" style={{ fontSize: '11px', opacity: 0.9 }}>
              <li>• 3+ years in fast-pace startups</li>
              <li>• Focus on mission & Bias to action & Ship fast & Own outcome</li>
              <li>• Banking & Payments experience</li>
              <li>• Tax Knowledge & collaboration</li>
              <li>• Contract reading ability</li>
              <li>• Willingness to learn and adapt</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: '#003d82',
            border: '2px solid #ffffff',
            padding: '1.5rem',
            color: '#ffffff',
            fontFamily: 'monospace',
            fontSize: '12px',
          }}>
            <h3 className="font-bold mb-3" style={{ fontSize: '13px', letterSpacing: '1px' }}>NICE-TO-HAVE</h3>
            <ul className="space-y-2" style={{ fontSize: '11px', opacity: 0.9 }}>
              <li>• Investor Relations experience</li>
              <li>• Equity/debt raise support</li>
              <li>• C-Level/Founder collaboration</li>
              <li>• Strategic planning experience</li>
            </ul>
          </div>
        </div>

        {/* Application Form */}
        <div style={{
          backgroundColor: '#003d82',
          border: '3px solid #ffffff',
        }}>
          <div className="p-8" style={{
            borderBottom: '2px solid #ffffff',
            color: '#ffffff',
            fontFamily: 'monospace',
            fontSize: '14px',
            letterSpacing: '1px',
            fontWeight: 'bold',
          }}>
            APPLICATION FORM
          </div>

          <div className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h3 style={{
                    color: '#ffffff',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    letterSpacing: '1px',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                  }}>YOUR INFORMATION</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '11px' }}>NAME</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} style={{
                              backgroundColor: '#001f4d',
                              borderColor: '#ffffff',
                              color: '#ffffff',
                              fontFamily: 'monospace',
                            }} data-testid="input-name" />
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
                          <FormLabel style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '11px' }}>LOCATION</FormLabel>
                          <FormControl>
                            <Input placeholder="City, Country" {...field} style={{
                              backgroundColor: '#001f4d',
                              borderColor: '#ffffff',
                              color: '#ffffff',
                              fontFamily: 'monospace',
                            }} data-testid="input-location" />
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
                          <FormLabel style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '11px' }}>EMAIL</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} style={{
                              backgroundColor: '#001f4d',
                              borderColor: '#ffffff',
                              color: '#ffffff',
                              fontFamily: 'monospace',
                            }} data-testid="input-email" />
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
                          <FormLabel style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '11px' }}>PHONE</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+1 (555) 000-0000" {...field} style={{
                              backgroundColor: '#001f4d',
                              borderColor: '#ffffff',
                              color: '#ffffff',
                              fontFamily: 'monospace',
                            }} data-testid="input-phone" />
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
                          <FormLabel style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '11px' }}>LINKEDIN (OPT)</FormLabel>
                          <FormControl>
                            <Input placeholder="linkedin.com/in/..." {...field} value={field.value || ""} style={{
                              backgroundColor: '#001f4d',
                              borderColor: '#ffffff',
                              color: '#ffffff',
                              fontFamily: 'monospace',
                            }} data-testid="input-linkedin" />
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
                          <FormLabel style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '11px' }}>RESUME (OPT)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} value={field.value || ""} style={{
                              backgroundColor: '#001f4d',
                              borderColor: '#ffffff',
                              color: '#ffffff',
                              fontFamily: 'monospace',
                            }} data-testid="input-resume" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Experience Section */}
                <div style={{ borderTop: '1px solid #ffffff', paddingTop: '1.5rem' }}>
                  <h3 style={{
                    color: '#ffffff',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    letterSpacing: '1px',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                  }}>YOUR EXPERIENCE</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <FormField
                      control={form.control}
                      name="minimumCompensation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '11px' }}>MIN COMPENSATION</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="150000" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} style={{
                              backgroundColor: '#001f4d',
                              borderColor: '#ffffff',
                              color: '#ffffff',
                              fontFamily: 'monospace',
                            }} data-testid="input-compensation" />
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
                          <FormLabel style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '11px' }}>NOTICE (WEEKS)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="2" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} style={{
                              backgroundColor: '#001f4d',
                              borderColor: '#ffffff',
                              color: '#ffffff',
                              fontFamily: 'monospace',
                            }} data-testid="input-notice-period" />
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
                          <FormLabel style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '11px' }}>STARTUP YEARS</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="3+" {...field} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} style={{
                              backgroundColor: '#001f4d',
                              borderColor: '#ffffff',
                              color: '#ffffff',
                              fontFamily: 'monospace',
                            }} data-testid="input-startup-years" />
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
                        <FormLabel style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '11px' }}>CONTRACT READING (1-5)</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <Slider min={1} max={5} step={1} value={[field.value || 1]} onValueChange={(vals) => field.onChange(vals[0])} data-testid="slider-contract-level" />
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffffff', fontFamily: 'monospace', fontSize: '10px' }}>
                              <span>BASIC</span>
                              <span>{contractLevel || 1}</span>
                              <span>ADVANCED</span>
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
                          <FormLabel style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '11px' }}>BANKING & PAYMENTS</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Your experience..." className="min-h-[80px]" {...field} value={field.value || ""} style={{
                              backgroundColor: '#001f4d',
                              borderColor: '#ffffff',
                              color: '#ffffff',
                              fontFamily: 'monospace',
                            }} data-testid="textarea-payment-systems" />
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
                          <FormLabel style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '11px' }}>TAX KNOWLEDGE</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Your experience..." className="min-h-[80px]" {...field} value={field.value || ""} style={{
                              backgroundColor: '#001f4d',
                              borderColor: '#ffffff',
                              color: '#ffffff',
                              fontFamily: 'monospace',
                            }} data-testid="textarea-tax-advisor" />
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
                          <FormLabel style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '11px' }}>INVESTOR RELATIONS (NICE-TO-HAVE)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Your experience..." className="min-h-[80px]" {...field} value={field.value || ""} style={{
                              backgroundColor: '#001f4d',
                              borderColor: '#ffffff',
                              color: '#ffffff',
                              fontFamily: 'monospace',
                            }} data-testid="textarea-investor-relations" />
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
                          <FormLabel style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '11px' }}>C-LEVEL EXPERIENCE (NICE-TO-HAVE)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Your experience..." className="min-h-[80px]" {...field} value={field.value || ""} style={{
                              backgroundColor: '#001f4d',
                              borderColor: '#ffffff',
                              color: '#ffffff',
                              fontFamily: 'monospace',
                            }} data-testid="textarea-executive-collaboration" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Motivation Section */}
                <div style={{ borderTop: '1px solid #ffffff', paddingTop: '1.5rem' }}>
                  <h3 style={{
                    color: '#ffffff',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    letterSpacing: '1px',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                  }}>YOUR STORY</h3>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="motivationStatement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '11px' }}>WHY FRONTIER TOWER?</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Your motivation..." className="min-h-[100px]" {...field} style={{
                              backgroundColor: '#001f4d',
                              borderColor: '#ffffff',
                              color: '#ffffff',
                              fontFamily: 'monospace',
                            }} data-testid="textarea-motivation" />
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
                          <FormLabel style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '11px' }}>HOW DID YOU HEAR?</FormLabel>
                          <Select value={field.value || ""} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger style={{
                                backgroundColor: '#001f4d',
                                borderColor: '#ffffff',
                                color: '#ffffff',
                                fontFamily: 'monospace',
                              }}>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent style={{ backgroundColor: '#003d82', borderColor: '#ffffff' }}>
                              <SelectItem value="referral">Referral</SelectItem>
                              <SelectItem value="social">Social Media</SelectItem>
                              <SelectItem value="job_board">Job Board</SelectItem>
                              <SelectItem value="conference">Conference</SelectItem>
                              <SelectItem value="directly">Direct</SelectItem>
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
                          <FormLabel style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '11px' }}>PORTFOLIO (OPT)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} value={field.value || ""} style={{
                              backgroundColor: '#001f4d',
                              borderColor: '#ffffff',
                              color: '#ffffff',
                              fontFamily: 'monospace',
                            }} data-testid="input-portfolio" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="valuesAlignment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3" style={{
                          border: '1px solid #ffffff',
                          backgroundColor: '#001f4d',
                        }}>
                          <FormControl>
                            <Checkbox checked={field.value || false} onCheckedChange={field.onChange} data-testid="checkbox-values" />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '11px' }}>CORE VALUES ALIGNMENT</FormLabel>
                            <p style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '10px', opacity: 0.8 }}>
                              Focus on mission • Bias to action • Ship fast • Own outcome
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-6" style={{ borderTop: '1px solid #ffffff' }}>
                  <Link href="/" className="flex-1">
                    <Button variant="outline" className="w-full" style={{
                      backgroundColor: '#003d82',
                      borderColor: '#ffffff',
                      color: '#ffffff',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                    }} data-testid="button-cancel">
                      CANCEL
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting} className="flex-1" style={{
                    backgroundColor: '#003d82',
                    borderColor: '#ffffff',
                    color: '#ffffff',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    border: '2px solid #ffffff',
                  }} data-testid="button-submit-application">
                    {isSubmitting ? "TRANSMITTING..." : "SUBMIT APPLICATION"}
                    {!isSubmitting && <ArrowRight className="ml-2 w-4 h-4" />}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
