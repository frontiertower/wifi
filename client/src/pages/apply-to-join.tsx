import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Send, UserPlus } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

const membershipApplicationFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required").min(1, "Email is required"),
  phone: z.string().min(1, "Phone number is required"),
  telegram: z.string().optional(),
  linkedIn: z.string().optional(),
  company: z.string().optional(),
  website: z.string().optional(),
});

type MembershipApplicationFormValues = z.infer<typeof membershipApplicationFormSchema>;

export default function ApplyToJoin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<MembershipApplicationFormValues>({
    resolver: zodResolver(membershipApplicationFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      telegram: "",
      linkedIn: "",
      company: "",
      website: "",
    },
  });

  const applicationMutation = useMutation({
    mutationFn: async (data: MembershipApplicationFormValues) => {
      return apiRequest("POST", "/api/membership-applications", data);
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest in joining Frontier Tower. We'll review your application and be in touch soon.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MembershipApplicationFormValues) => {
    applicationMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Link href="/">
          <Button
            variant="ghost"
            className="mb-4 hover-elevate active-elevate-2"
            data-testid="button-back-home"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <Card className="shadow-lg">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-500/30 rounded-lg flex items-center justify-center">
                <UserPlus className="text-primary-600 dark:text-primary-300 h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">Apply to Join Frontier Tower</CardTitle>
            </div>
            <CardDescription>
              Become part of our community focused on AI, Agents, and LLMs. Fill out the form below to submit your membership application.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
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
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
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
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your company name"
                          {...field}
                          data-testid="input-company"
                        />
                      </FormControl>
                      <FormDescription>
                        Optional - Enter your company or organization name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="telegram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telegram</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="@username"
                            {...field}
                            data-testid="input-telegram"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="linkedIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="linkedin.com/in/username"
                            {...field}
                            data-testid="input-linkedin"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://yourwebsite.com"
                          {...field}
                          data-testid="input-website"
                        />
                      </FormControl>
                      <FormDescription>
                        Optional - Your personal or company website
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={applicationMutation.isPending}
                  data-testid="button-submit-application"
                >
                  {applicationMutation.isPending ? (
                    <>Submitting Application...</>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>* Required fields</p>
          <p className="mt-2">
            Questions? Contact us at{" "}
            <a
              href="mailto:jakob@berlinhouse.com"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              jakob@berlinhouse.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
