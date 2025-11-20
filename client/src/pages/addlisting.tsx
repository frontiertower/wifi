import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Building2, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type ListingType = "company" | "person" | "community";

export default function AddListing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [listingType, setListingType] = useState<ListingType>("company");
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    communityName: "",
    firstName: "",
    lastName: "",
    floor: "",
    officeNumber: "",
    phone: "",
    telegramUsername: "",
    email: "",
    website: "",
    logoUrl: "",
    description: "",
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/directory", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/directory"] });
      toast({
        title: "Success",
        description: "Directory listing added successfully",
      });
      setLocation("/directory");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add directory listing",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const listingData = {
      type: listingType,
      companyName: listingType === "company" ? formData.companyName : null,
      contactPerson: listingType === "company" ? (formData.contactPerson || null) : null,
      communityName: listingType === "community" ? formData.communityName : null,
      firstName: listingType === "person" ? formData.firstName : null,
      lastName: listingType === "person" ? formData.lastName : null,
      floor: formData.floor || null,
      officeNumber: formData.officeNumber || null,
      phone: formData.phone || null,
      telegramUsername: formData.telegramUsername || null,
      email: formData.email || null,
      website: formData.website || null,
      logoUrl: formData.logoUrl || null,
      description: formData.description || null,
    };

    createListingMutation.mutate(listingData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    if (listingType === "company") {
      return formData.companyName.trim().length > 0;
    }
    if (listingType === "community") {
      return formData.communityName.trim().length > 0;
    }
    return formData.firstName.trim().length > 0 && formData.lastName.trim().length > 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-2xl mx-auto">
        <Button
          onClick={() => setLocation("/directory")}
          variant="ghost"
          size="sm"
          className="mb-4"
          data-testid="button-back-directory"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Directory
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Add Directory Listing</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add a new company, community, or person to the building directory
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label>Listing Type</Label>
                <RadioGroup
                  value={listingType}
                  onValueChange={(value) => setListingType(value as ListingType)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="company" id="type-company" data-testid="radio-type-company" />
                    <Label htmlFor="type-company" className="font-normal cursor-pointer flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Company
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="community" id="type-community" data-testid="radio-type-community" />
                    <Label htmlFor="type-community" className="font-normal cursor-pointer flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Community
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="person" id="type-person" data-testid="radio-type-person" />
                    <Label htmlFor="type-person" className="font-normal cursor-pointer flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Person
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {listingType === "company" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name *</Label>
                    <Input
                      id="company-name"
                      type="text"
                      placeholder="Enter company name"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      required
                      data-testid="input-company-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-person">Contact Person</Label>
                    <Input
                      id="contact-person"
                      type="text"
                      placeholder="Enter contact person name"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                      data-testid="input-contact-person"
                    />
                  </div>
                </>
              ) : listingType === "community" ? (
                <div className="space-y-2">
                  <Label htmlFor="community-name">Community Name *</Label>
                  <Input
                    id="community-name"
                    type="text"
                    placeholder="Enter community name"
                    value={formData.communityName}
                    onChange={(e) => handleInputChange("communityName", e.target.value)}
                    required
                    data-testid="input-community-name"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name *</Label>
                    <Input
                      id="first-name"
                      type="text"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                      data-testid="input-first-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name *</Label>
                    <Input
                      id="last-name"
                      type="text"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="logo-url">Logo / Avatar URL</Label>
                <Input
                  id="logo-url"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={formData.logoUrl}
                  onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                  data-testid="input-logo-url"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enter a URL to an image that represents {listingType === "company" ? "your company" : listingType === "community" ? "your community" : "yourself"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder={listingType === "company" 
                    ? "Tell us about your company..." 
                    : listingType === "community"
                    ? "Tell us about your community..."
                    : "Tell us about yourself..."}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  data-testid="input-description"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Location (choose one)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="floor">Floor</Label>
                    <Input
                      id="floor"
                      type="text"
                      placeholder="e.g., 15th Floor"
                      value={formData.floor}
                      onChange={(e) => handleInputChange("floor", e.target.value)}
                      data-testid="input-floor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="office-number">Office Number</Label>
                    <Input
                      id="office-number"
                      type="text"
                      placeholder="e.g., 233"
                      value={formData.officeNumber}
                      onChange={(e) => handleInputChange("officeNumber", e.target.value)}
                      data-testid="input-office-number"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Contact Information (optional)
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      data-testid="input-phone"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      data-testid="input-email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telegram">Telegram Username</Label>
                    <Input
                      id="telegram"
                      type="text"
                      placeholder="@username"
                      value={formData.telegramUsername}
                      onChange={(e) => handleInputChange("telegramUsername", e.target.value)}
                      data-testid="input-telegram"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://example.com"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      data-testid="input-website"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/directory")}
                  className="flex-1"
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormValid() || createListingMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-submit"
                >
                  {createListingMutation.isPending ? "Adding..." : "Add Listing"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
