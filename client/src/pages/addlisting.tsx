import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Building2, User, Users, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DirectoryListing } from "@shared/schema";

type ListingType = "company" | "person" | "community";

export default function AddListing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [listingType, setListingType] = useState<ListingType>("company");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    communityName: "",
    firstName: "",
    lastName: "",
    parentCommunityId: "",
    floor: "",
    officeNumber: "",
    phone: "",
    telegramUsername: "",
    email: "",
    website: "",
    linkedinUrl: "",
    twitterHandle: "",
    logoUrl: "",
    description: "",
  });

  // Fetch all directory listings to get communities
  const { data: allListingsData } = useQuery<{ success: boolean; listings: DirectoryListing[] }>({
    queryKey: ["/api/directory"],
  });

  const communities = (allListingsData?.listings || []).filter(listing => listing.type === "community");

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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Logo must be smaller than 2MB",
          variant: "destructive",
        });
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return null;

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("logo", logoFile);

      const response = await fetch("/api/upload/logo", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        return data.logoUrl;
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload logo",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let logoUrl = formData.logoUrl || null;

    // Upload logo if a new file was selected
    if (logoFile) {
      const uploadedUrl = await uploadLogo();
      if (uploadedUrl) {
        logoUrl = uploadedUrl;
      } else {
        return; // Stop if upload failed
      }
    }

    const listingData = {
      type: listingType,
      companyName: listingType === "company" ? formData.companyName : null,
      contactPerson: (listingType === "company" || listingType === "community") ? (formData.contactPerson || null) : null,
      communityName: listingType === "community" ? formData.communityName : null,
      firstName: listingType === "person" ? formData.firstName : null,
      lastName: listingType === "person" ? formData.lastName : null,
      parentCommunityId: formData.parentCommunityId ? parseInt(formData.parentCommunityId) : null,
      floor: formData.floor || null,
      officeNumber: formData.officeNumber || null,
      phone: formData.phone || null,
      telegramUsername: formData.telegramUsername || null,
      email: formData.email || null,
      website: formData.website || null,
      logoUrl,
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
                <>
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
                  <div className="space-y-2">
                    <Label htmlFor="contact-person-community">Contact Person(s)</Label>
                    <Input
                      id="contact-person-community"
                      type="text"
                      placeholder="e.g., John Doe, Jane Smith"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                      data-testid="input-contact-person-community"
                    />
                  </div>
                </>
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
                <Label htmlFor="logo">Logo / Avatar Image (Max 2MB)</Label>
                <div className="space-y-4">
                  {logoPreview && (
                    <div className="relative inline-block">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-32 w-32 object-contain border rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={removeLogo}
                        data-testid="button-remove-logo"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleLogoChange}
                      className="flex-1"
                      data-testid="input-logo"
                    />
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Upload an image that represents {listingType === "company" ? "your company" : listingType === "community" ? "your community" : "yourself"} (JPEG, PNG, GIF, WebP - Max 2MB)
                  </p>
                </div>
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

              <div className="space-y-2">
                <Label htmlFor="parent-community">Parent Community (optional)</Label>
                <Select
                  value={formData.parentCommunityId}
                  onValueChange={(value) => handleInputChange("parentCommunityId", value)}
                >
                  <SelectTrigger id="parent-community" data-testid="select-parent-community">
                    <SelectValue placeholder="Select a community" />
                  </SelectTrigger>
                  <SelectContent>
                    {communities.length === 0 ? (
                      <SelectItem value="none" disabled>No communities available</SelectItem>
                    ) : (
                      communities.map((community) => (
                        <SelectItem key={community.id} value={community.id.toString()}>
                          {community.communityName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select a community this listing belongs to
                </p>
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
                  disabled={!isFormValid() || createListingMutation.isPending || isUploadingLogo}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-submit"
                >
                  {isUploadingLogo ? "Uploading..." : createListingMutation.isPending ? "Adding..." : "Add Listing"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
