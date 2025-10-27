import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "./ImageUpload";
import { Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SlideshowImage } from "@shared/schema";

export default function SlideshowManager() {
  const { toast } = useToast();
  const { data: images, isLoading } = useQuery<SlideshowImage[]>({
    queryKey: ["/api/slideshow"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return apiRequest("POST", "/api/slideshow", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slideshow"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiRequest("PATCH", `/api/slideshow/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slideshow"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/slideshow/${id}`, {}),
    onSuccess: () => {
      toast({ title: "Image deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/slideshow"] });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Slideshow Image</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            onUpload={(file) => uploadMutation.mutateAsync(file)}
            accept="image/*"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Slideshow Images</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : images && images.length > 0 ? (
            <div className="space-y-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover-elevate"
                  data-testid={`slideshow-image-${image.id}`}
                >
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                  <img
                    src={image.imageUrl}
                    alt="Slideshow"
                    className="w-24 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">
                      Order: {image.order}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={image.isActive}
                      onCheckedChange={(checked) =>
                        toggleMutation.mutate({ id: image.id, isActive: checked })
                      }
                      data-testid={`switch-active-${image.id}`}
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(image.id)}
                      data-testid={`button-delete-${image.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No slideshow images yet. Upload your first image above.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
