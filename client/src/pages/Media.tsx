import { useLocation } from "wouter";
import SlideshowManager from "@/components/admin/SlideshowManager";
import ProductManager from "@/components/admin/ProductManager";
import OrdersAndContacts from "@/components/admin/OrdersAndContacts";
import UploadsManager from "@/components/admin/UploadsManager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Images } from "lucide-react";

export default function Media() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
              <Images className="w-6 h-6" />
              Media Manager
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
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="slideshow" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="slideshow" data-testid="tab-slideshow">
              Slideshows
            </TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">
              Photos &amp; Products
            </TabsTrigger>
            <TabsTrigger value="uploads" data-testid="tab-uploads">
              Uploads
            </TabsTrigger>
            <TabsTrigger value="inquiries" data-testid="tab-inquiries">
              Orders &amp; Contacts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="slideshow">
            <SlideshowManager />
          </TabsContent>

          <TabsContent value="products">
            <ProductManager />
          </TabsContent>

          <TabsContent value="uploads">
            <UploadsManager />
          </TabsContent>

          <TabsContent value="inquiries">
            <OrdersAndContacts />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}