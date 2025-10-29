import Navigation from "@/components/Navigation";
import InstagramModal from "@/components/InstagramModal";
import HeroSlideshow from "@/components/HeroSlideshow";
import MostPopular from "@/components/MostPopular";
import OurChoice from "@/components/OurChoice";
import CustomOrderForm from "@/components/CustomOrderForm";
import CatalogSection from "@/components/CatalogSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Site-wide aesthetic background overlays */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <Navigation />
      <InstagramModal />
      <HeroSlideshow />
      <MostPopular />
      <OurChoice />
      <CustomOrderForm />
      <CatalogSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
