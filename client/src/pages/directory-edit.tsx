import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DirectoryListing } from "@shared/schema";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

export default function DirectoryEdit() {
  const params = useParams();
  const slug = params.slug;
  const [, setLocation] = useLocation();
  const [editForm, setEditForm] = useState<Partial<DirectoryListing>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const { toast } = useToast();

  const { data: allListings, isLoading } = useQuery<{ success: boolean; listings: DirectoryListing[] }>({
    queryKey: ["/api/directory"],
  });

  const communities = (allListings?.listings || []).filter(l => l.type === "community");

  // Find listing by slug
  const listing = allListings?.listings.find((l) => {
    const name = l.type === "company" 
      ? l.companyName 
      : l.type === "community"
        ? l.communityName
        : l.lastName && l.firstName 
          ? `${l.lastName}, ${l.firstName}` 
          : null;
    return name && slugify(name) === slug;
  });

  useEffect(() => {
    if (listing) {
      setEditForm({ ...listing });
      if (listing.logoUrl) {
        setLogoPreview(listing.logoUrl);
      }
    }
  }, [listing]);

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
    setEditForm({ ...editForm, logoUrl: null });
  };

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<DirectoryListing>) => {
      if (!listing) throw new Error("Listing not found");
      const { id, createdAt, ...updateData } = data;
      return apiRequest("PATCH", `/api/directory/${listing.id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/directory"] });
      toast({
        title: "Success",
        description: "Directory listing updated successfully",
      });
      setLocation("/directory");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update listing",
        variant: "destructive",
      });
    },
  });

  const handleTypeChange = (newType: "company" | "community" | "person") => {
    const currentName = editForm.companyName || editForm.communityName || 
                       (editForm.firstName && editForm.lastName ? `${editForm.firstName} ${editForm.lastName}` : "");

    const updates: Partial<DirectoryListing> = { type: newType };

    // Transfer name to appropriate field based on new type
    if (newType === "company") {
      updates.companyName = currentName;
      updates.communityName = null;
      updates.firstName = null;
      updates.lastName = null;
    } else if (newType === "community") {
      updates.communityName = currentName;
      updates.companyName = null;
      // Keep contactPerson when switching to community
      updates.firstName = null;
      updates.lastName = null;
    } else if (newType === "person") {
      const nameParts = currentName.split(" ");
      updates.firstName = nameParts[0] || "";
      updates.lastName = nameParts.slice(1).join(" ") || "";
      updates.companyName = null;
      updates.contactPerson = null;
      updates.communityName = null;
    }

    setEditForm({ ...editForm, ...updates });
  };

  const handleUpdate = async () => {
    let updatedForm = { ...editForm };

    // Upload logo if a new file was selected
    if (logoFile) {
      const logoUrl = await uploadLogo();
      if (logoUrl) {
        updatedForm.logoUrl = logoUrl;
      } else {
        return; // Stop if upload failed
      }
    }

    updateMutation.mutate(updatedForm);
  };

  const getDisplayName = (listing: DirectoryListing) => {
    if (listing.type === "company" && listing.companyName) {
      return listing.companyName;
    }
    if (listing.type === "community" && listing.communityName) {
      return listing.communityName;
    }
    if (listing.type === "person" && listing.lastName && listing.firstName) {
      return `${listing.lastName}, ${listing.firstName}`;
    }
    return "Unknown";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Listing Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The listing you're looking for doesn't exist.
          </p>
          <Link href="/directory">
            <Button data-testid="button-back-directory">Back to Directory</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/directory">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4"
              data-testid="button-back-directory"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Directory
            </Button>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Edit: {getDisplayName(listing)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update listing information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={editForm.type || ""}
                  onValueChange={(value) => handleTypeChange(value as "company" | "community" | "person")}
                >
                  <SelectTrigger id="type" data-testid="select-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="person">Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editForm.type === "company" && (
                <>
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={editForm.companyName || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, companyName: e.target.value })
                      }
                      data-testid="input-companyName"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      value={editForm.contactPerson || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, contactPerson: e.target.value })
                      }
                      data-testid="input-contactPerson"
                    />
                  </div>
                </>
              )}

              {editForm.type === "community" && (
                <>
                  <div>
                    <Label htmlFor="communityName">Community Name</Label>
                    <Input
                      id="communityName"
                      value={editForm.communityName || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, communityName: e.target.value })
                      }
                      data-testid="input-communityName"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPerson">Contact Person(s)</Label>
                    <Input
                      id="contactPerson"
                      value={editForm.contactPerson || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, contactPerson: e.target.value })
                      }
                      placeholder="e.g., John Doe, Jane Smith"
                      data-testid="input-contactPerson"
                    />
                  </div>
                </>
              )}

              {editForm.type === "person" && (
                <>
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={editForm.firstName || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, firstName: e.target.value })
                      }
                      data-testid="input-firstName"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={editForm.lastName || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, lastName: e.target.value })
                      }
                      data-testid="input-lastName"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="parentCommunityId">Parent Community</Label>
                <Select
                  value={editForm.parentCommunityId?.toString() || "none"}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, parentCommunityId: value === "none" ? null : parseInt(value) })
                  }
                >
                  <SelectTrigger id="parentCommunityId" data-testid="select-parentCommunityId">
                    <SelectValue placeholder="Select a community" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {communities.map((community) => (
                      <SelectItem key={community.id} value={community.id.toString()}>
                        {community.communityName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  value={editForm.floor || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, floor: e.target.value })
                  }
                  placeholder="e.g., 900"
                  data-testid="input-floor"
                />
              </div>

              <div>
                <Label htmlFor="officeNumber">Office Number</Label>
                <Input
                  id="officeNumber"
                  value={editForm.officeNumber || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, officeNumber: e.target.value })
                  }
                  data-testid="input-officeNumber"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editForm.phone || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  data-testid="input-phone"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  data-testid="input-email"
                />
              </div>

              <div>
                <Label htmlFor="telegramUsername">Telegram Username</Label>
                <Input
                  id="telegramUsername"
                  value={editForm.telegramUsername || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, telegramUsername: e.target.value })
                  }
                  placeholder="@username"
                  data-testid="input-telegram"
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={editForm.website || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, website: e.target.value })
                  }
                  data-testid="input-website"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="logo">Logo Image (Max 2MB)</Label>
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
                  <p className="text-sm text-muted-foreground">
                    Accepted formats: JPEG, PNG, GIF, WebP (Max 2MB)
                  </p>
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editForm.description || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={4}
                  data-testid="input-description"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Link href="/directory">
                <Button variant="outline" data-testid="button-cancel">
                  Cancel
                </Button>
              </Link>
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending || isUploadingLogo}
                data-testid="button-save"
              >
                <Save className="mr-2 h-4 w-4" />
                {isUploadingLogo ? "Uploading..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
