import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Home, MapPin, Users, Wifi, Shirt, ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { format, addDays, differenceInDays } from "date-fns";
import futuristicRoom from "@assets/2025-11-23 10.24.29_1763922401797.jpg";
import poolTableRoom from "@assets/2025-11-23 10.24.33_1763922401798.jpg";
import lobbyLounge from "@assets/2025-11-23 10.24.18_1763922401798.jpg";
import buildingExterior from "@assets/2025-11-23 10.24.25_1763922401798.jpg";

const residencyBookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  checkInDate: z.string().min(1, "Check-in date is required"),
  checkOutDate: z.string().min(1, "Check-out date is required"),
  numberOfGuests: z.string().refine(val => parseInt(val) > 0, "Must have at least 1 guest"),
  roomPreference: z.string().min(1, "Please select a room preference"),
  specialRequests: z.string().optional(),
});

type ResidencyBooking = z.infer<typeof residencyBookingSchema>;

export default function ResidencyPage() {
  const { toast } = useToast();
  const [totalCost, setTotalCost] = useState<number>(0);

  const form = useForm<ResidencyBooking>({
    resolver: zodResolver(residencyBookingSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      checkInDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
      checkOutDate: format(addDays(new Date(), 8), "yyyy-MM-dd"),
      numberOfGuests: "1",
      roomPreference: "king",
      specialRequests: "",
    },
  });

  // Watch date fields to calculate cost
  const checkInDate = form.watch("checkInDate");
  const checkOutDate = form.watch("checkOutDate");

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const nights = differenceInDays(checkOut, checkIn);
      
      if (nights > 0) {
        // $450/week = $64.29/day, $1800/month minimum
        const weeklyRate = 450;
        const weeks = Math.ceil(nights / 7);
        
        let cost = 0;
        if (weeks >= 4) {
          // Monthly rate
          cost = 1800;
        } else {
          // Weekly or daily rate
          cost = weeks * weeklyRate;
        }
        
        setTotalCost(cost);
      } else {
        setTotalCost(0);
      }
    }
  }, [checkInDate, checkOutDate]);

  const createResidencyMutation = useMutation({
    mutationFn: async (data: ResidencyBooking) => {
      return await apiRequest("POST", "/api/residency-bookings", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your residency booking request has been submitted! We'll contact you within 24 hours.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/residency-bookings'] });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit booking request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ResidencyBooking) => {
    const isValid = await form.trigger();
    
    if (!isValid || !form.formState.isValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive",
      });
      return;
    }
    
    createResidencyMutation.mutate(data);
  };

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const nights = differenceInDays(checkOut, checkIn);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
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

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Home className="w-8 h-8 text-violet-600 dark:text-violet-400" />
            <h1 className="text-3xl font-bold">SuperHero Residency</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Luxury accommodation at 825 Sutter St - 10 minutes from Frontier Tower
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shirt className="w-4 h-4" />
                Room Features
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div>✓ King-sized bed</div>
              <div>✓ En-suite bathroom</div>
              <div>✓ Fast internet</div>
              <div>✓ Bedding & towels</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Building Amenities
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div>✓ 110 rooms total</div>
              <div>✓ 7 floors</div>
              <div>✓ On-site laundry</div>
              <div>✓ Communal kitchen</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div>$450/week</div>
              <div>$1,800/month</div>
              <div className="text-xs text-muted-foreground">
                Members only pricing
              </div>
              <div className="text-xs text-muted-foreground">
                Minimum 1 week
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Booking Request
            </CardTitle>
            <CardDescription>
              Fill out your details below and we'll get in touch within 24 hours to confirm your booking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} data-testid="input-name" />
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
                          <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (415) 555-0000" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numberOfGuests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Guests *</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger data-testid="select-guests">
                              <SelectValue placeholder="Select number of guests" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Guest</SelectItem>
                              <SelectItem value="2">2 Guests</SelectItem>
                              <SelectItem value="3">3 Guests</SelectItem>
                              <SelectItem value="4">4+ Guests</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="checkInDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-In Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-checkin" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="checkOutDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-Out Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-checkout" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="roomPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Preference *</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-testid="select-room">
                            <SelectValue placeholder="Select room preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="king">King Bed</SelectItem>
                            <SelectItem value="quiet-floor">Quiet Floor</SelectItem>
                            <SelectItem value="high-floor">High Floor (View)</SelectItem>
                            <SelectItem value="low-floor">Low Floor (Convenience)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Requests</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Let us know if you have any special requests or requirements..."
                          {...field}
                          data-testid="textarea-requests"
                          className="min-h-24"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Check-in:</span>
                    <span className="font-medium">{format(checkIn, "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Check-out:</span>
                    <span className="font-medium">{format(checkOut, "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-violet-200 dark:border-violet-700 pt-2 mt-2">
                    <span>Number of nights:</span>
                    <span className="font-medium">{nights > 0 ? nights : 0} nights</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-violet-200 dark:border-violet-700 pt-2 mt-2">
                    <span>Estimated Total:</span>
                    <span className="text-violet-600 dark:text-violet-400">
                      ${totalCost.toFixed(0)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground italic">
                    Final price will be confirmed upon booking confirmation
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createResidencyMutation.isPending}
                  size="lg"
                  data-testid="button-submit-booking"
                >
                  {createResidencyMutation.isPending ? "Submitting..." : "Submit Booking Request"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-4">Property Gallery</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover-elevate">
              <img 
                src={futuristicRoom} 
                alt="Futuristic room with ambient lighting" 
                className="w-full h-64 object-cover"
                data-testid="gallery-futuristic-room"
              />
              <div className="p-3 bg-background">
                <p className="font-semibold text-sm">Modern Room Design</p>
                <p className="text-xs text-muted-foreground">Ambient lighting and contemporary aesthetic</p>
              </div>
            </div>
            
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover-elevate">
              <img 
                src={poolTableRoom} 
                alt="Communal lounge with pool table" 
                className="w-full h-64 object-cover"
                data-testid="gallery-pool-room"
              />
              <div className="p-3 bg-background">
                <p className="font-semibold text-sm">Recreation Lounge</p>
                <p className="text-xs text-muted-foreground">Pool table and social space</p>
              </div>
            </div>
            
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover-elevate">
              <img 
                src={lobbyLounge} 
                alt="Elegant lobby and lounge area" 
                className="w-full h-64 object-cover"
                data-testid="gallery-lobby"
              />
              <div className="p-3 bg-background">
                <p className="font-semibold text-sm">Lobby Lounge</p>
                <p className="text-xs text-muted-foreground">Elegant communal gathering space</p>
              </div>
            </div>
            
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover-elevate">
              <img 
                src={buildingExterior} 
                alt="825 Sutter St building exterior" 
                className="w-full h-64 object-cover"
                data-testid="gallery-building"
              />
              <div className="p-3 bg-background">
                <p className="font-semibold text-sm">825 Sutter Street</p>
                <p className="text-xs text-muted-foreground">Your new home in San Francisco</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              About the Property
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <p>
              Cool to hear that you are interested in our soon-to-be hotel on <strong>825 Sutter St</strong>, a ten minutes walk away from the Frontier Tower.
            </p>
            <p>
              We have a special offer for current Frontier Tower members while the building is still in its setup phase. The spacious rooms feature king-sized beds and en-suite bathrooms, plus fast internet and on-site laundry facilities. A temporary communal kitchen is set up while we build a proper one over the next few weeks.
            </p>
            <p>
              We're currently awaiting some furniture and bedding deliveries. All basic provisions will be sorted by your potential arrival with improvements rolling in over the next days and weeks.
            </p>
            <p>
              The hotel has <strong>110 rooms across seven floors</strong>. Joining us at this early stage offers you a unique opportunity to gain early and exclusive access to a developing community of interesting people connected with the Frontier Tower.
            </p>
            <p className="border-t border-blue-200 dark:border-blue-700 pt-3">
              If you wish to proceed, we can easily set up a simple contract via email. Please fill out the booking form above and we'll be in touch within 24 hours!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
