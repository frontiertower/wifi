import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, X, Image as ImageIcon, Camera } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  caption: string;
  dateCreated: string;
}

interface GalleryResponse {
  photos: Photo[];
  albumTitle: string;
}

export default function GalleryPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery<GalleryResponse>({
    queryKey: ["/api/gallery/photos"],
  });

  const photos = data?.photos || [];
  const albumTitle = data?.albumTitle || "Photo Gallery";

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
    if (e.key === "Escape") closeLightbox();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3" data-testid="text-gallery-title">
                <Camera className="w-8 h-8 text-primary" />
                {albumTitle}
              </h1>
              <p className="text-muted-foreground mt-1">
                Life at Frontier Tower
              </p>
            </div>
          </div>
          {photos.length > 0 && (
            <p className="text-sm text-muted-foreground" data-testid="text-photo-count">
              {photos.length} photos
            </p>
          )}
        </div>

        {error && (
          <Card className="p-8 text-center">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground" data-testid="text-error">
              Unable to load photos. Please try again later.
            </p>
          </Card>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        )}

        {!isLoading && !error && photos.length === 0 && (
          <Card className="p-8 text-center">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground" data-testid="text-empty">
              No photos available yet.
            </p>
          </Card>
        )}

        {!isLoading && !error && photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <button
                key={photo.id || index}
                onClick={() => openLightbox(index)}
                className="group relative aspect-square overflow-hidden rounded-lg bg-muted hover-elevate focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                data-testid={`button-photo-${index}`}
              >
                <img
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.caption || `Photo ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm truncate">{photo.caption}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && closeLightbox()}>
          <DialogContent
            className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
            onKeyDown={handleKeyDown}
          >
            <DialogTitle className="sr-only">
              Photo {selectedIndex !== null ? selectedIndex + 1 : 0} of {photos.length}
            </DialogTitle>
            {selectedIndex !== null && photos[selectedIndex] && (
              <div className="relative flex items-center justify-center w-full h-[90vh]">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                  onClick={closeLightbox}
                  data-testid="button-close-lightbox"
                >
                  <X className="w-6 h-6" />
                </Button>

                {selectedIndex > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 z-10 text-white hover:bg-white/20 h-12 w-12"
                    onClick={goToPrevious}
                    data-testid="button-prev-photo"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </Button>
                )}

                {selectedIndex < photos.length - 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 z-10 text-white hover:bg-white/20 h-12 w-12"
                    onClick={goToNext}
                    data-testid="button-next-photo"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </Button>
                )}

                <img
                  src={photos[selectedIndex].url}
                  alt={photos[selectedIndex].caption || `Photo ${selectedIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                  data-testid="img-lightbox"
                />

                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-white/80 text-sm">
                    {selectedIndex + 1} / {photos.length}
                  </p>
                  {photos[selectedIndex].caption && (
                    <p className="text-white mt-2 text-lg">{photos[selectedIndex].caption}</p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
