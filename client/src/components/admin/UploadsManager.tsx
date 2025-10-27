import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCcw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

type UploadItem = {
  name: string;
  size: number;
  modifiedAt: number;
  url: string;
  isVideo: boolean;
};

export default function UploadsManager() {
  const { data, isLoading, refetch, isFetching } = useQuery<UploadItem[]>({
    queryKey: ["/api/uploads"],
  });

  const delMutation = useMutation({
    mutationFn: (name: string) => apiRequest("DELETE", `/api/uploads/${encodeURIComponent(name)}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/uploads"] });
    },
  });

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Uploads</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-md bg-muted animate-pulse" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((f) => (
              <div key={f.name} className="border rounded-lg p-3 flex flex-col gap-2">
                <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
                  {f.isVideo ? (
                    <video src={f.url} className="w-full h-full object-cover" controls preload="metadata" />
                  ) : (
                    <img src={f.url} className="w-full h-full object-cover" alt={f.name} />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium truncate" title={f.name}>{f.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {(f.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => delMutation.mutate(f.name)}
                    disabled={delMutation.isPending}
                    title="Delete file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">
                  Open
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No uploads yet.</p>
        )}
      </CardContent>
    </Card>
  );
}