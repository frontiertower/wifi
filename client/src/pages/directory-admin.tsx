import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Save, Trash2, X, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DirectoryListing } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DirectoryAdmin() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<DirectoryListing>>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ success: boolean; listings: DirectoryListing[] }>({
    queryKey: ["/api/directory"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<DirectoryListing> }) => {
      return apiRequest("PATCH", `/api/directory/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/directory"] });
      setEditingId(null);
      setEditForm({});
      toast({
        title: "Success",
        description: "Directory listing updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update listing",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/directory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/directory"] });
      setDeleteId(null);
      toast({
        title: "Success",
        description: "Directory listing deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete listing",
        variant: "destructive",
      });
    },
  });

  const listings = data?.listings || [];

  const startEdit = (listing: DirectoryListing) => {
    setEditingId(listing.id);
    setEditForm({ ...listing });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleUpdate = () => {
    if (editingId !== null) {
      // Filter out read-only fields
      const { id, createdAt, ...updateData } = editForm;
      updateMutation.mutate({ id: editingId, data: updateData });
    }
  };

  const handleDelete = () => {
    if (deleteId !== null) {
      deleteMutation.mutate(deleteId);
    }
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
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

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Directory Admin
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage all directory listings
              </p>
            </div>

            <Link href="/addlisting">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-add-new-listing"
              >
                Add New Listing
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <Card className="p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No listings yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Add your first directory listing to get started
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => {
              const isEditing = editingId === listing.id;
              const currentData = isEditing ? editForm : listing;

              return (
                <Card key={listing.id} data-testid={`card-admin-listing-${listing.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {isEditing ? "Editing: " : ""}{getDisplayName(listing)}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {!isEditing ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(listing)}
                              data-testid={`button-edit-${listing.id}`}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteId(listing.id)}
                              data-testid={`button-delete-${listing.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={handleUpdate}
                              disabled={updateMutation.isPending}
                              data-testid={`button-save-${listing.id}`}
                            >
                              <Save className="mr-2 h-4 w-4" />
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelEdit}
                              data-testid={`button-cancel-${listing.id}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`type-${listing.id}`}>Type</Label>
                        <Input
                          id={`type-${listing.id}`}
                          value={currentData.type || ""}
                          disabled
                          className="bg-gray-100 dark:bg-gray-800"
                        />
                      </div>

                      {listing.type === "company" && (
                        <div>
                          <Label htmlFor={`companyName-${listing.id}`}>Company Name</Label>
                          <Input
                            id={`companyName-${listing.id}`}
                            value={currentData.companyName || ""}
                            onChange={(e) =>
                              isEditing &&
                              setEditForm({ ...editForm, companyName: e.target.value })
                            }
                            disabled={!isEditing}
                            data-testid={`input-companyName-${listing.id}`}
                          />
                        </div>
                      )}

                      {listing.type === "person" && (
                        <>
                          <div>
                            <Label htmlFor={`firstName-${listing.id}`}>First Name</Label>
                            <Input
                              id={`firstName-${listing.id}`}
                              value={currentData.firstName || ""}
                              onChange={(e) =>
                                isEditing &&
                                setEditForm({ ...editForm, firstName: e.target.value })
                              }
                              disabled={!isEditing}
                              data-testid={`input-firstName-${listing.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`lastName-${listing.id}`}>Last Name</Label>
                            <Input
                              id={`lastName-${listing.id}`}
                              value={currentData.lastName || ""}
                              onChange={(e) =>
                                isEditing &&
                                setEditForm({ ...editForm, lastName: e.target.value })
                              }
                              disabled={!isEditing}
                              data-testid={`input-lastName-${listing.id}`}
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <Label htmlFor={`floor-${listing.id}`}>Floor</Label>
                        <Input
                          id={`floor-${listing.id}`}
                          value={currentData.floor || ""}
                          onChange={(e) =>
                            isEditing && setEditForm({ ...editForm, floor: e.target.value })
                          }
                          disabled={!isEditing}
                          placeholder="e.g., 5th Floor"
                          data-testid={`input-floor-${listing.id}`}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`officeNumber-${listing.id}`}>Office Number</Label>
                        <Input
                          id={`officeNumber-${listing.id}`}
                          value={currentData.officeNumber || ""}
                          onChange={(e) =>
                            isEditing &&
                            setEditForm({ ...editForm, officeNumber: e.target.value })
                          }
                          disabled={!isEditing}
                          data-testid={`input-officeNumber-${listing.id}`}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`phone-${listing.id}`}>Phone</Label>
                        <Input
                          id={`phone-${listing.id}`}
                          value={currentData.phone || ""}
                          onChange={(e) =>
                            isEditing && setEditForm({ ...editForm, phone: e.target.value })
                          }
                          disabled={!isEditing}
                          data-testid={`input-phone-${listing.id}`}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`email-${listing.id}`}>Email</Label>
                        <Input
                          id={`email-${listing.id}`}
                          type="email"
                          value={currentData.email || ""}
                          onChange={(e) =>
                            isEditing && setEditForm({ ...editForm, email: e.target.value })
                          }
                          disabled={!isEditing}
                          data-testid={`input-email-${listing.id}`}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`telegramUsername-${listing.id}`}>
                          Telegram Username
                        </Label>
                        <Input
                          id={`telegramUsername-${listing.id}`}
                          value={currentData.telegramUsername || ""}
                          onChange={(e) =>
                            isEditing &&
                            setEditForm({ ...editForm, telegramUsername: e.target.value })
                          }
                          disabled={!isEditing}
                          placeholder="@username"
                          data-testid={`input-telegram-${listing.id}`}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`website-${listing.id}`}>Website</Label>
                        <Input
                          id={`website-${listing.id}`}
                          value={currentData.website || ""}
                          onChange={(e) =>
                            isEditing && setEditForm({ ...editForm, website: e.target.value })
                          }
                          disabled={!isEditing}
                          data-testid={`input-website-${listing.id}`}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`logoUrl-${listing.id}`}>Logo URL</Label>
                        <Input
                          id={`logoUrl-${listing.id}`}
                          value={currentData.logoUrl || ""}
                          onChange={(e) =>
                            isEditing && setEditForm({ ...editForm, logoUrl: e.target.value })
                          }
                          disabled={!isEditing}
                          data-testid={`input-logoUrl-${listing.id}`}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor={`description-${listing.id}`}>Description</Label>
                        <Textarea
                          id={`description-${listing.id}`}
                          value={currentData.description || ""}
                          onChange={(e) =>
                            isEditing &&
                            setEditForm({ ...editForm, description: e.target.value })
                          }
                          disabled={!isEditing}
                          rows={3}
                          data-testid={`input-description-${listing.id}`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this directory listing. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
