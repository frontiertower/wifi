import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertBookingSchema, type InsertBooking, type Event } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, User, Phone, Mail, Linkedin, Twitter, Briefcase } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

export default function BookingPage() {
  const { toast } = useToast();
  const [bookingType, setBookingType] = useState<"existing" | "custom">("existing");

  const { data: eventsData } = useQuery<{ success: boolean; events: Event[] }>({
    queryKey: ['/api/events'],
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(12, 0, 0, 0);

  const form = useForm<InsertBooking>({
    resolver: zodResolver(insertBookingSchema),
    mode: "onChange",
    defaultValues: {
      eventId: undefined,
      eventName: "",
      eventDescription: "",
      startDate: tomorrow,
      endDate: tomorrowEnd,
      location: "",
      organizerName: "",
      organizerPhone: "",
      organizerLinkedIn: "",
      organizerTwitter: "",
      organizerEmail: "",
      organizerCompany: "",
      notes: "",
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: InsertBooking) => {
      return await apiRequest("POST", "/api/bookings", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Booking created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertBooking) => {
    createBookingMutation.mutate(data);
  };

  const upcomingEvents = eventsData?.events?.filter(
    event => new Date(event.endDate) >= new Date()
  ) || [];

  const handleEventSelection = (eventId: string) => {
    const selectedEvent = upcomingEvents.find(e => e.id === parseInt(eventId));
    if (selectedEvent) {
      form.setValue("eventId", selectedEvent.id);
      form.setValue("eventName", selectedEvent.name);
      form.setValue("eventDescription", selectedEvent.description || "");
      form.setValue("startDate", new Date(selectedEvent.startDate));
      form.setValue("endDate", new Date(selectedEvent.endDate));
      form.setValue("location", selectedEvent.originalLocation || "Frontier Tower");
    }
  };

  const handleBookingTypeChange = (type: "existing" | "custom") => {
    setBookingType(type);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Book an Event or Meeting</h1>
          <p className="text-muted-foreground">
            Reserve a space for your event or meeting at Frontier Tower
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Event Details
            </CardTitle>
            <CardDescription>
              Choose an existing event or create a custom booking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={bookingType === "existing" ? "default" : "outline"}
                      onClick={() => handleBookingTypeChange("existing")}
                      className="flex-1"
                      data-testid="button-existing-event"
                    >
                      Existing Event
                    </Button>
                    <Button
                      type="button"
                      variant={bookingType === "custom" ? "default" : "outline"}
                      onClick={() => handleBookingTypeChange("custom")}
                      className="flex-1"
                      data-testid="button-custom-event"
                    >
                      Custom Event
                    </Button>
                  </div>

                  {bookingType === "existing" && (
                    <FormField
                      control={form.control}
                      name="eventId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Event *</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(parseInt(value));
                              handleEventSelection(value);
                            }}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-event">
                                <SelectValue placeholder="Choose an event" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {upcomingEvents.map((event) => (
                                <SelectItem key={event.id} value={event.id.toString()}>
                                  {event.name} - {format(new Date(event.startDate), "MMM d, yyyy")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="eventName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter event name"
                            {...field}
                            disabled={bookingType === "existing"}
                            data-testid="input-event-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of the event"
                            {...field}
                            value={field.value || ""}
                            disabled={bookingType === "existing"}
                            data-testid="input-event-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => {
                        const dateValue = field.value ? new Date(field.value) : null;
                        const isValidDate = dateValue && !isNaN(dateValue.getTime());
                        return (
                          <FormItem>
                            <FormLabel>Start Date *</FormLabel>
                            <FormControl>
                              <Input
                                type="datetime-local"
                                value={isValidDate ? dateValue.toISOString().slice(0, 16) : ""}
                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                disabled={bookingType === "existing"}
                                data-testid="input-start-date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => {
                        const dateValue = field.value ? new Date(field.value) : null;
                        const isValidDate = dateValue && !isNaN(dateValue.getTime());
                        return (
                          <FormItem>
                            <FormLabel>End Date *</FormLabel>
                            <FormControl>
                              <Input
                                type="datetime-local"
                                value={isValidDate ? dateValue.toISOString().slice(0, 16) : ""}
                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                disabled={bookingType === "existing"}
                                data-testid="input-end-date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Frontier Tower"
                            {...field}
                            value={field.value || ""}
                            disabled={bookingType === "existing"}
                            data-testid="input-location"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Organizer Information
                  </h3>

                  <FormField
                    control={form.control}
                    name="organizerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                            data-testid="input-organizer-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="organizerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                type="email"
                                placeholder="john@example.com"
                                className="pl-10"
                                {...field}
                                data-testid="input-organizer-email"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="organizerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                placeholder="+1 (555) 123-4567"
                                className="pl-10"
                                {...field}
                                value={field.value || ""}
                                data-testid="input-organizer-phone"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="organizerCompany"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="Company Name"
                              className="pl-10"
                              {...field}
                              value={field.value || ""}
                              data-testid="input-organizer-company"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="organizerLinkedIn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn Profile</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                placeholder="linkedin.com/in/johndoe"
                                className="pl-10"
                                {...field}
                                value={field.value || ""}
                                data-testid="input-organizer-linkedin"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="organizerTwitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter Handle</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                placeholder="@johndoe"
                                className="pl-10"
                                {...field}
                                value={field.value || ""}
                                data-testid="input-organizer-twitter"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special requirements or additional information"
                            {...field}
                            value={field.value || ""}
                            data-testid="input-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createBookingMutation.isPending}
                  data-testid="button-submit-booking"
                >
                  {createBookingMutation.isPending ? "Creating Booking..." : "Create Booking"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
