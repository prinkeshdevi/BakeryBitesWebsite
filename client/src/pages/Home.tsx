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
    <div className="min-h-screen bg-background">
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
