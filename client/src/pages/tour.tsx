import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Calendar as CalendarIcon, Clock, Send, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

const allGroupTours = [
  {
    id: "nov20",
    name: "Your Startup's Future HQ: Exclusive Tour of the Frontier Tower",
    date: "Thursday, November 20",
    time: "12:00 PM - 12:30 PM",
    url: "https://luma.com/your-startups-future-hq-exclusive-tour-o?tk=F2BbOy",
    datetime: new Date("2024-11-20T12:00:00"),
  },
  {
    id: "nov21",
    name: "Frontier Tower Tour for Aspiring Citizens",
    date: "Friday, November 21",
    time: "12:00 PM - 12:30 PM",
    url: "https://luma.com/frontier-tower-tour-for-aspiring-citizen-5338?tk=wVI3xj",
    datetime: new Date("2024-11-21T12:00:00"),
  },
  {
    id: "nov25",
    name: "Your Startup's Future HQ: Exclusive Tour of the Frontier Tower for Startup Founders",
    date: "Tuesday, November 25",
    time: "11:00 AM - 11:30 AM",
    url: "https://luma.com/your-startups-future-hq-exclusive-tour-o-b217",
    datetime: new Date("2024-11-25T11:00:00"),
  },
  {
    id: "dec3",
    name: "Your Startup's Future HQ: Exclusive Tour for Pre-Seed Founders of the Frontier Tower's Private Offices Floor",
    date: "Wednesday, December 3",
    time: "11:30 AM - 12:00 PM",
    url: "https://luma.com/your-startups-future-hq-exclusive-tour-f",
    datetime: new Date("2025-12-03T11:30:00"),
  },
];

// Filter out past tours
const groupTours = allGroupTours.filter(tour => tour.datetime > new Date());

const tourBookingFormSchema = z.object({
  tourType: z.string().min(1, "Please select a tour option"),
  groupTourSelection: z.string().optional(),
  groupTourUrl: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  company: z.string().optional(),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required").min(1, "Email is required"),
  linkedIn: z.string().optional(),
  referredBy: z.string().optional(),
  tourDate: z.date().optional(),
  tourTime: z.string().optional(),
  interestedInPrivateOffice: z.boolean().default(false),
  numberOfPeople: z.coerce.number().int().min(1, "Must be at least 1 person").optional(),
  notes: z.string().optional(),
}).refine(
  (data) => {
    if (data.tourType === "custom" && !data.tourDate) {
      return false;
    }
    return true;
  },
  {
    message: "Tour date is required for custom tours",
    path: ["tourDate"],
  }
).refine(
  (data) => {
    if (data.tourType === "custom" && !data.tourTime) {
      return false;
    }
    return true;
  },
  {
    message: "Tour time is required for custom tours",
    path: ["tourTime"],
  }
).refine(
  (data) => {
    if (data.interestedInPrivateOffice && !data.numberOfPeople) {
      return false;
    }
    return true;
  },
  {
    message: "Number of people is required when interested in private office",
    path: ["numberOfPeople"],
  }
);

type TourBookingFormValues = z.infer<typeof tourBookingFormSchema>;

const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

export default function TourBooking() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const form = useForm<TourBookingFormValues>({
    resolver: zodResolver(tourBookingFormSchema),
    defaultValues: {
      tourType: "",
      groupTourSelection: "",
      groupTourUrl: "",
      name: "",
      company: "",
      phone: "",
      email: "",
      linkedIn: "",
      referredBy: "",
      interestedInPrivateOffice: false,
      notes: "",
    },
  });

  const tourType = form.watch("tourType");
  const isInterestedInPrivateOffice = form.watch("interestedInPrivateOffice");

  const bookingMutation = useMutation({
    mutationFn: async (data: TourBookingFormValues) => {
      return apiRequest("POST", "/api/tour-bookings", data);
    },
    onSuccess: () => {
      toast({
        title: "Tour Booked!",
        description: "Your tour has been successfully scheduled. We'll contact you soon to confirm.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book tour. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TourBookingFormValues) => {
    bookingMutation.mutate(data);
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
            size="sm"
            className="mb-4"
            data-testid="button-back-home"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Book an Office Tour</CardTitle>
            <CardDescription>
              Schedule a guided tour of Frontier Tower and discover our community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="tourType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">Select Tour Option</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => {
                            field.onChange(value);
                            const selectedTour = groupTours.find(t => t.id === value);
                            if (selectedTour) {
                              form.setValue("groupTourSelection", selectedTour.name);
                              form.setValue("groupTourUrl", selectedTour.url);
                            } else if (value === "custom") {
                              form.setValue("groupTourSelection", "");
                              form.setValue("groupTourUrl", "");
                            }
                          }}
                          defaultValue={field.value}
                          className="space-y-3"
                        >
                          {groupTours.map((tour) => (
                            <FormItem
                              key={tour.id}
                              className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                            >
                              <FormControl>
                                <RadioGroupItem value={tour.id} data-testid={`radio-tour-${tour.id}`} />
                              </FormControl>
                              <div className="flex-1 space-y-1">
                                <FormLabel className="font-medium cursor-pointer">
                                  {tour.name}
                                </FormLabel>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <CalendarIcon className="h-3 w-3" />
                                    {tour.date}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {tour.time}
                                  </div>
                                </div>
                                <a
                                  href={tour.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View on Luma <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            </FormItem>
                          ))}
                          <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                            <FormControl>
                              <RadioGroupItem value="custom" data-testid="radio-tour-custom" />
                            </FormControl>
                            <FormLabel className="font-medium cursor-pointer">
                              Request a New Tour Time
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your full name"
                            data-testid="input-name"
                            {...field}
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
                            placeholder="Your company (optional)"
                            data-testid="input-company"
                            {...field}
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
                            placeholder="+1 (555) 123-4567"
                            data-testid="input-phone"
                            {...field}
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
                            data-testid="input-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="linkedIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your LinkedIn</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="linkedin.com/in/yourprofile"
                          data-testid="input-linkedin"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referredBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name of a Tower Member who referred you</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter member name"
                          data-testid="input-referred-by"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {tourType === "custom" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tourDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Tour Date *</FormLabel>
                          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className="w-full pl-3 text-left font-normal"
                                  data-testid="button-select-date"
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setIsCalendarOpen(false);
                                }}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tourTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tour Time *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-time">
                                <SelectValue placeholder="Select a time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time} data-testid={`time-option-${time}`}>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {time}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="interestedInPrivateOffice"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-private-office"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">
                            Interested in Private Office
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Check this if you're interested in learning about private office options
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  {isInterestedInPrivateOffice && (
                    <FormField
                      control={form.control}
                      name="numberOfPeople"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of People *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="How many people will use the office?"
                              data-testid="input-number-of-people"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                  <Link href="/" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={bookingMutation.isPending}
                    data-testid="button-submit"
                  >
                    {bookingMutation.isPending ? (
                      <>Booking...</>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Request a Tour
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
