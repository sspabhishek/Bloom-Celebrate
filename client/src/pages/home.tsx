import Navigation from "@/components/navigation";
import HeroSlider from "@/components/hero-slider";
import Gallery from "@/components/gallery";
import Contact from "@/components/contact";
import Footer from "@/components/footer";
import AdminPanel from "@/components/admin-panel";
import Lightbox from "@/components/lightbox";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Home() {
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    images: string[];
    designId: string;
    title: string;
  }>({
    isOpen: false,
    images: [],
    designId: '',
    title: ''
  });

  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [selectedDesignId, setSelectedDesignId] = useState('');

  const openLightbox = (images: string[], designId: string, title: string) => {
    setLightboxData({
      isOpen: true,
      images,
      designId,
      title
    });
  };

  const closeLightbox = () => {
    setLightboxData(prev => ({ ...prev, isOpen: false }));
  };

  const openRequestForm = (designId: string) => {
    setSelectedDesignId(designId);
    closeLightbox();
    // Scroll to contact section
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const openWhatsApp = () => {
    const phoneNumber = "1234567890"; // Replace with actual phone number
    const message = "Hi! I'm interested in your decoration services. Can you help me with my event?";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navigation onToggleAdmin={() => setIsAdminPanelOpen(!isAdminPanelOpen)} />
      
      <main>
        <HeroSlider />
        <Gallery onOpenLightbox={openLightbox} onRequestDesign={openRequestForm} />
        <Contact selectedDesignId={selectedDesignId} onClearDesignId={() => setSelectedDesignId('')} />
      </main>
      
      <Footer />
      
      <Lightbox
        isOpen={lightboxData.isOpen}
        images={lightboxData.images}
        designId={lightboxData.designId}
        title={lightboxData.title}
        onClose={closeLightbox}
        onRequestDesign={openRequestForm}
      />
      
      <AdminPanel 
        isOpen={isAdminPanelOpen} 
        onClose={() => setIsAdminPanelOpen(false)} 
      />
      
      {/* WhatsApp Floating Button */}
      <Button
        onClick={openWhatsApp}
        data-testid="whatsapp-button"
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-2xl p-0 transition-all duration-300 hover:scale-105 animate-pulse"
      >
        <i className="fab fa-whatsapp text-2xl"></i>
      </Button>
    </div>
  );
}
