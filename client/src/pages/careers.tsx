import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertJobListingSchema, type JobListing } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, MapPin, Building2, Plus, Clock, ExternalLink, Star, Shield } from "lucide-react";
import { Link } from "wouter";

type JobListingFormData = z.infer<typeof insertJobListingSchema>;

export default function CareersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Set page title for SEO
  useEffect(() => {
    document.title = "Careers - Frontier Tower | Join Our Team";
  }, []);

  const { data, isLoading } = useQuery<{ success: boolean; listings: JobListing[] }>({
    queryKey: ["/api/job-listings"],
  });

  const form = useForm<JobListingFormData>({
    resolver: zodResolver(insertJobListingSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      type: "",
      description: "",
      requirements: undefined,
      salary: undefined,
      applyUrl: undefined,
      contactEmail: undefined,
      createdBy: undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: JobListingFormData) => {
      return await apiRequest("POST", "/api/job-listings", data);
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-listings"] });
      toast({
        title: "Success!",
        description: response.message || "Your job listing has been submitted for approval.",
      });
      form.reset();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post job listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JobListingFormData) => {
    createMutation.mutate(data);
  };

  const listings = data?.listings || [];
  const featuredListings = listings.filter(l => l.isFeatured);
  const regularListings = listings.filter(l => !l.isFeatured);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" data-testid="button-back-home" className="mb-4">
                Back to Home
              </Button>
            </Link>
            <h1 className="text-4xl font-bold mb-2" data-testid="text-careers-title">
              Careers at Frontier Tower
            </h1>
            <p className="text-muted-foreground text-lg">
              Join the frontier of innovation and build the future with us
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" data-testid="button-post-job">
                  <Plus className="w-4 h-4" />
                  Post a Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-post-job">
              <DialogHeader>
                <DialogTitle data-testid="text-dialog-title">Post a Job Listing</DialogTitle>
                <DialogDescription>
                  Fill out the form below to add a new job opportunity to the careers board.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Senior Software Engineer" 
                            {...field} 
                            data-testid="input-job-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Frontier Tower" 
                            {...field} 
                            data-testid="input-company"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., San Francisco, CA" 
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
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-job-type">
                                <SelectValue placeholder="Select job type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Full-time">Full-time</SelectItem>
                              <SelectItem value="Part-time">Part-time</SelectItem>
                              <SelectItem value="Contract">Contract</SelectItem>
                              <SelectItem value="Internship">Internship</SelectItem>
                              <SelectItem value="Freelance">Freelance</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide a detailed description of the role, responsibilities, and what makes this opportunity exciting..."
                            rows={6}
                            maxLength={2000}
                            {...field}
                            data-testid="input-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requirements (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List key qualifications, skills, and experience required..."
                            rows={4}
                            maxLength={1000}
                            {...field}
                            value={field.value || ""}
                            data-testid="input-requirements"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary Range (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., $100k - $150k" 
                            {...field}
                            value={field.value || ""}
                            data-testid="input-salary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="applyUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application URL (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="url"
                            placeholder="https://..." 
                            {...field}
                            value={field.value || ""}
                            data-testid="input-apply-url"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="jobs@company.com" 
                            {...field}
                            value={field.value || ""}
                            data-testid="input-contact-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="createdBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Posted By (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your name or company recruiter name" 
                            {...field}
                            value={field.value || ""}
                            data-testid="input-created-by"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      data-testid="button-submit-job"
                    >
                      {createMutation.isPending ? "Posting..." : "Post Job"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
            </Dialog>
            <Button 
              variant="outline" 
              className="gap-2" 
              asChild 
              data-testid="button-gigs-jobs"
            >
              <a href="https://fxchange.io/maker/open" target="_blank" rel="noopener noreferrer">
                <Briefcase className="w-4 h-4" />
                Gigs & Bounties
              </a>
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading job listings...</p>
          </div>
        )}

        {/* Job Listings */}
        {!isLoading && (
          <div className="space-y-8">
            {/* Featured Jobs */}
            {featuredListings.length > 0 && (
              <div data-testid="section-featured-jobs">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" data-testid="text-featured-title">
                  <Star className="w-6 h-6 text-primary" />
                  Featured Opportunities
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {featuredListings.map((listing) => (
                    <JobListingCard key={listing.id} listing={listing} featured />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Jobs */}
            {regularListings.length > 0 && (
              <div data-testid="section-all-jobs">
                <h2 className="text-2xl font-bold mb-4" data-testid="text-all-title">All Opportunities</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {regularListings.map((listing) => (
                    <JobListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {listings.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-lg">
                    No job listings available at the moment.
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Be the first to post a job opportunity!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function JobListingCard({ listing, featured = false }: { listing: JobListing; featured?: boolean }) {
  return (
    <Card className={featured ? "border-primary" : ""} data-testid={`card-job-${listing.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl mb-1" data-testid={`text-job-title-${listing.id}`}>
              {listing.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {listing.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {listing.location}
              </span>
            </CardDescription>
          </div>
          {featured && (
            <Badge variant="default" className="shrink-0">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            {listing.type}
          </Badge>
          {listing.salary && (
            <Badge variant="outline">{listing.salary}</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {listing.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          {listing.createdBy && `Posted by ${listing.createdBy}`}
        </div>
        <div className="flex gap-2">
          {listing.applyUrl ? (
            <a href={listing.applyUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" data-testid={`button-apply-${listing.id}`}>
                Learn More
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </a>
          ) : listing.contactEmail ? (
            <a href={`mailto:${listing.contactEmail}`}>
              <Button size="sm" data-testid={`button-contact-${listing.id}`}>
                Contact
              </Button>
            </a>
          ) : (
            <Button size="sm" disabled data-testid={`button-apply-${listing.id}`}>
              No application method
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
