import { useState } from "react";
import { useLocation } from "wouter";
import { 
  ArrowLeft, Building2, User, Users, Upload, X, PartyPopper, Link as LinkIcon, Bookmark, Coffee,
  Briefcase, Code, Palette, Music, Camera, Heart, Star, Zap, Globe, Rocket,
  Cpu, Database, Shield, Target, Lightbulb, Award, Crown, Gem, Flame, Leaf,
  Sun, Moon, Cloud, Umbrella, Anchor, Compass, Map, Flag, Gift, Bell,
  Book, Gamepad2, Headphones, Mic, Radio, Tv, Monitor, Smartphone, Tablet, Watch,
  Car, Plane, Train, Ship, Bike, Home, Store, Factory, Warehouse, Hospital,
  GraduationCap, School, Library, Microscope, Atom, Dna, Pill, Stethoscope,
  Utensils, Pizza, Wine, Beer, IceCream, Cake, Apple, Carrot, Fish, Egg,
  Bot, Sofa,
  type LucideIcon
} from "lucide-react";
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

type ListingType = "company" | "person" | "community" | "amenity";

export const AVAILABLE_ICONS: { name: string; icon: LucideIcon; category: string }[] = [
  { name: "Building2", icon: Building2, category: "Business" },
  { name: "Briefcase", icon: Briefcase, category: "Business" },
  { name: "Store", icon: Store, category: "Business" },
  { name: "Factory", icon: Factory, category: "Business" },
  { name: "Warehouse", icon: Warehouse, category: "Business" },
  { name: "Code", icon: Code, category: "Tech" },
  { name: "Cpu", icon: Cpu, category: "Tech" },
  { name: "Database", icon: Database, category: "Tech" },
  { name: "Monitor", icon: Monitor, category: "Tech" },
  { name: "Smartphone", icon: Smartphone, category: "Tech" },
  { name: "Globe", icon: Globe, category: "Tech" },
  { name: "Rocket", icon: Rocket, category: "Tech" },
  { name: "Zap", icon: Zap, category: "Tech" },
  { name: "Shield", icon: Shield, category: "Tech" },
  { name: "Bot", icon: Bot, category: "Tech" },
  { name: "Lightbulb", icon: Lightbulb, category: "Creative" },
  { name: "Palette", icon: Palette, category: "Creative" },
  { name: "Camera", icon: Camera, category: "Creative" },
  { name: "Music", icon: Music, category: "Creative" },
  { name: "Headphones", icon: Headphones, category: "Creative" },
  { name: "Mic", icon: Mic, category: "Creative" },
  { name: "Gamepad2", icon: Gamepad2, category: "Creative" },
  { name: "User", icon: User, category: "People" },
  { name: "Users", icon: Users, category: "People" },
  { name: "Heart", icon: Heart, category: "People" },
  { name: "Star", icon: Star, category: "General" },
  { name: "Award", icon: Award, category: "General" },
  { name: "Crown", icon: Crown, category: "General" },
  { name: "Gem", icon: Gem, category: "General" },
  { name: "Target", icon: Target, category: "General" },
  { name: "Flag", icon: Flag, category: "General" },
  { name: "Gift", icon: Gift, category: "General" },
  { name: "Bell", icon: Bell, category: "General" },
  { name: "Flame", icon: Flame, category: "Nature" },
  { name: "Leaf", icon: Leaf, category: "Nature" },
  { name: "Sun", icon: Sun, category: "Nature" },
  { name: "Moon", icon: Moon, category: "Nature" },
  { name: "Cloud", icon: Cloud, category: "Nature" },
  { name: "Compass", icon: Compass, category: "Travel" },
  { name: "Map", icon: Map, category: "Travel" },
  { name: "Plane", icon: Plane, category: "Travel" },
  { name: "Car", icon: Car, category: "Travel" },
  { name: "Bike", icon: Bike, category: "Travel" },
  { name: "Home", icon: Home, category: "Places" },
  { name: "Hospital", icon: Hospital, category: "Places" },
  { name: "School", icon: School, category: "Places" },
  { name: "Library", icon: Library, category: "Places" },
  { name: "Sofa", icon: Sofa, category: "Places" },
  { name: "GraduationCap", icon: GraduationCap, category: "Education" },
  { name: "Book", icon: Book, category: "Education" },
  { name: "Microscope", icon: Microscope, category: "Science" },
  { name: "Atom", icon: Atom, category: "Science" },
  { name: "Dna", icon: Dna, category: "Science" },
  { name: "Stethoscope", icon: Stethoscope, category: "Health" },
  { name: "Pill", icon: Pill, category: "Health" },
  { name: "Coffee", icon: Coffee, category: "Food" },
  { name: "Utensils", icon: Utensils, category: "Food" },
  { name: "Pizza", icon: Pizza, category: "Food" },
  { name: "Wine", icon: Wine, category: "Food" },
  { name: "Beer", icon: Beer, category: "Food" },
  { name: "Cake", icon: Cake, category: "Food" },
  { name: "Apple", icon: Apple, category: "Food" },
  { name: "PartyPopper", icon: PartyPopper, category: "Events" },
];

export function getIconByName(name: string): LucideIcon | null {
  const found = AVAILABLE_ICONS.find(i => i.name === name);
  return found ? found.icon : null;
}

export default function AddListing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showSuccess, setShowSuccess] = useState(false);
  const [createdListing, setCreatedListing] = useState<DirectoryListing | null>(null);
  const [listingType, setListingType] = useState<ListingType>("person");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [visualType, setVisualType] = useState<"logo" | "icon">("logo");
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
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
    const logoUrl = visualType === "logo" ? (logoPreview || null) : null;
    const iconName = visualType === "icon" ? selectedIcon : null;

    const listingData = {
      type: listingType,
      companyName: (listingType === "company" || listingType === "amenity") ? formData.companyName : null,
      contactPerson: (listingType === "company" || listingType === "community" || listingType === "amenity") ? (formData.contactPerson || null) : null,
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
      iconName,
      description: formData.description || null,
    };

    createListingMutation.mutate(listingData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    if (listingType === "company" || listingType === "amenity") {
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
                    setVisualType("logo");
                    setSelectedIcon(null);
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
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="amenity" id="type-amenity" data-testid="radio-type-amenity" />
                    <Label htmlFor="type-amenity" className="font-normal cursor-pointer flex items-center gap-2">
                      <Coffee className="h-4 w-4" />
                      Amenity
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
              ) : listingType === "amenity" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="amenity-name">Amenity Name *</Label>
                    <Input
                      id="amenity-name"
                      type="text"
                      placeholder="Enter amenity name"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      required
                      data-testid="input-amenity-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-person-amenity">Contact Person</Label>
                    <Input
                      id="contact-person-amenity"
                      type="text"
                      placeholder="Enter contact person name"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                      data-testid="input-contact-person-amenity"
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

              <div className="space-y-4">
                <Label>Logo / Avatar</Label>
                
                {/* Toggle between Logo Upload and Icon Selection */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={visualType === "logo" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setVisualType("logo");
                      setSelectedIcon(null);
                    }}
                    data-testid="button-visual-logo"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                  <Button
                    type="button"
                    variant={visualType === "icon" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setVisualType("icon");
                      setLogoFile(null);
                      setLogoPreview(null);
                    }}
                    data-testid="button-visual-icon"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Select Icon
                  </Button>
                </div>

                {visualType === "logo" ? (
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
                      Upload an image (JPEG, PNG, GIF, WebP - Max 2MB)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedIcon && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                          {(() => {
                            const IconComponent = getIconByName(selectedIcon);
                            return IconComponent ? <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" /> : null;
                          })()}
                        </div>
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Selected: {selectedIcon}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedIcon(null)}
                          className="ml-auto"
                          data-testid="button-clear-icon"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg bg-gray-50 dark:bg-gray-800">
                      {AVAILABLE_ICONS.map(({ name, icon: IconComponent }) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setSelectedIcon(name)}
                          className={`p-2 rounded-md transition-colors flex items-center justify-center ${
                            selectedIcon === name
                              ? "bg-blue-500 text-white"
                              : "bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300"
                          }`}
                          title={name}
                          data-testid={`icon-${name}`}
                        >
                          <IconComponent className="h-5 w-5" />
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Select an icon to represent your listing
                    </p>
                  </div>
                )}
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
