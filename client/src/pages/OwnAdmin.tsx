import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import AdminLogin from "@/components/admin/AdminLogin";
import SlideshowManager from "@/components/admin/SlideshowManager";
import ProductManager from "@/components/admin/ProductManager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Home } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function OwnAdmin() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      if (!cancelled) {
        setIsLoading(false);
        setIsAuthenticated(false);
      }
    }, 10000); // 10s max loading

    checkAuth().finally(() => {
      if (!cancelled) clearTimeout(t);
    });

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  const checkAuth = async () => {
    try {
      await apiRequest("GET", "/api/admin/check");
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/admin/logout", {});
      setIsAuthenticated(false);
      setLocation("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Owner Admin
            </h1>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
                data-testid="button-home"
              >
                <Home className="w-4 h-4 mr-2" />
                View Site
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="slideshow" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="slideshow" data-testid="tab-slideshow">
              Slideshow
            </TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">
              Photos &amp; Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="slideshow">
            <SlideshowManager />
          </TabsContent>

          <TabsContent value="products">
            <ProductManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}