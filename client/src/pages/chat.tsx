import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const chatInviteRequestFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required").min(1, "Email is required"),
  telegram: z.string().optional(),
  linkedIn: z.string().optional(),
  message: z.string().max(1000, "Message must be 1000 characters or less").optional(),
});

type ChatInviteRequestFormValues = z.infer<typeof chatInviteRequestFormSchema>;

export default function Chat() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<ChatInviteRequestFormValues>({
    resolver: zodResolver(chatInviteRequestFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      telegram: "",
      linkedIn: "",
      message: "",
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (data: ChatInviteRequestFormValues) => {
      return apiRequest("POST", "/api/chat-invite-requests", data);
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted!",
        description: "Thank you! We'll send you a text message with the Telegram group invite link shortly.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ChatInviteRequestFormValues) => {
    requestMutation.mutate(data);
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
                <MessageCircle className="text-primary-600 dark:text-primary-300 h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">Chat with Us</CardTitle>
            </div>
            <CardDescription>
              Join our Telegram community to connect with members, stay updated on events, and engage in discussions about AI, Agents, and LLMs.
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
                      <FormDescription>
                        We'll send you a text message with the Telegram invite link
                      </FormDescription>
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
                  name="telegram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telegram Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="@username"
                          {...field}
                          data-testid="input-telegram"
                        />
                      </FormControl>
                      <FormDescription>
                        Optional - Your Telegram username
                      </FormDescription>
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
                      <FormDescription>
                        Optional - Help us get to know you better
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Send Us a Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us a bit about yourself or what you're interested in..."
                          className="min-h-[120px] resize-none"
                          maxLength={1000}
                          {...field}
                          data-testid="input-message"
                        />
                      </FormControl>
                      <FormDescription>
                        Optional - Max 1000 characters ({field.value?.length || 0}/1000)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={requestMutation.isPending}
                  data-testid="button-request-invite"
                >
                  {requestMutation.isPending ? (
                    <>Submitting Request...</>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Request Invite
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
