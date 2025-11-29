import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Building2, User, Users, Upload, X, PartyPopper, Link as LinkIcon, Bookmark } from "lucide-react";
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
import { QRCodeSVG } from "qrcode.react";

type ListingType = "company" | "person" | "community";

export default function AddListing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showSuccess, setShowSuccess] = useState(false);
  const [createdListing, setCreatedListing] = useState<DirectoryListing | null>(null);
  const [listingType, setListingType] = useState<ListingType>("person");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    communityName: "",
    firstName: "",
    lastName: "",
    personCompany: "",
    personTitle: "",
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
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to add directory listing");
      }
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/directory"] });
      if (data.listing) {
        setCreatedListing(data.listing);
      }
      setShowSuccess(true);
    },
    onError: (error: any) => {
      console.error("Directory listing error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add directory listing",
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
        // Store base64 data URL directly - this persists in the database
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use base64 preview directly as logoUrl - stores in database, persists across deployments
    const logoUrl = logoPreview || null;

    const listingData = {
      type: listingType,
      companyName: listingType === "company" ? formData.companyName : null,
      contactPerson: (listingType === "company" || listingType === "community") ? (formData.contactPerson || null) : null,
      communityName: listingType === "community" ? formData.communityName : null,
      firstName: listingType === "person" ? formData.firstName : null,
      lastName: listingType === "person" ? formData.lastName : null,
      personCompany: listingType === "person" ? (formData.personCompany || null) : null,
      personTitle: listingType === "person" ? (formData.personTitle || null) : null,
      parentCommunityId: formData.parentCommunityId ? parseInt(formData.parentCommunityId) : null,
      floor: formData.floor || null,
      officeNumber: formData.officeNumber || null,
      phone: formData.phone || null,
      telegramUsername: formData.telegramUsername || null,
      email: formData.email || null,
      website: formData.website || null,
      linkedinUrl: formData.linkedinUrl || null,
      twitterHandle: formData.twitterHandle || null,
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

  // Get the full URL for the QR code
  const addListingUrl = `${window.location.origin}/addlisting`;

  // If showing success screen
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <PartyPopper className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Listing Added Successfully!</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Your listing has been added to the Frontier Tower directory.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Edit Link Section */}
              {createdListing?.editSlug && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bookmark className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                      Bookmark Your Edit Link
                    </h3>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                    Save this link to make changes to your listing in the future. Only people with this link can edit your listing.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded px-3 py-2 text-sm font-mono break-all" data-testid="text-edit-link">
                      {`${window.location.origin}/directory/edit/${createdListing.editSlug}`}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/directory/edit/${createdListing.editSlug}`);
                        toast({
                          title: "Link Copied",
                          description: "Edit link copied to clipboard",
                        });
                      }}
                      data-testid="button-copy-edit-link"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-center mb-2">
                  Help Build Our Community!
                </h3>
                <p className="text-center text-gray-700 dark:text-gray-300 mb-4">
                  Scan this QR code to invite 2 more people to create their listing
                </p>
                
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-4 rounded-lg shadow-md" data-testid="qr-code-container">
                    <QRCodeSVG 
                      value={addListingUrl}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                </div>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Share this QR code with colleagues and neighbors to grow our building directory!
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowSuccess(false);
                    setCreatedListing(null);
                    setFormData({
                      companyName: "",
                      contactPerson: "",
                      communityName: "",
                      firstName: "",
                      lastName: "",
                      personCompany: "",
                      personTitle: "",
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
                    setLogoFile(null);
                    setLogoPreview(null);
                  }}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-add-another"
                >
                  Add Another Listing
                </Button>
                <Button
                  onClick={() => setLocation("/directory")}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-view-directory"
                >
                  View Directory
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              Add a new company, community, or citizen to the building directory
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
                    <RadioGroupItem value="person" id="type-person" data-testid="radio-type-person" />
                    <Label htmlFor="type-person" className="font-normal cursor-pointer flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Citizen
                    </Label>
                  </div>
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
                <>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="person-company">Company</Label>
                      <Input
                        id="person-company"
                        type="text"
                        placeholder="Company name"
                        value={formData.personCompany}
                        onChange={(e) => handleInputChange("personCompany", e.target.value)}
                        data-testid="input-person-company"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="person-title">Title</Label>
                      <Input
                        id="person-title"
                        type="text"
                        placeholder="Job title"
                        value={formData.personTitle}
                        onChange={(e) => handleInputChange("personTitle", e.target.value)}
                        data-testid="input-person-title"
                      />
                    </div>
                  </div>
                </>
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

                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={formData.linkedinUrl}
                      onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                      data-testid="input-linkedin"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter Handle</Label>
                    <Input
                      id="twitter"
                      type="text"
                      placeholder="@username"
                      value={formData.twitterHandle}
                      onChange={(e) => handleInputChange("twitterHandle", e.target.value)}
                      data-testid="input-twitter"
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
