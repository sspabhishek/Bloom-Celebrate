import Navigation from "@/components/navigation";
import HeroSlider from "@/components/hero-slider";
import Gallery from "@/components/gallery";
import Contact from "@/components/contact";
import Footer from "@/components/footer";
import AdminPanel from "@/components/admin-panel";
import Lightbox from "@/components/lightbox";
import { useState } from "react";

export default function Home() {
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    imageSrc: string;
    designId: string;
    title: string;
  }>({
    isOpen: false,
    imageSrc: '',
    designId: '',
    title: ''
  });

  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [selectedDesignId, setSelectedDesignId] = useState('');

  const openLightbox = (imageSrc: string, designId: string, title: string) => {
    setLightboxData({
      isOpen: true,
      imageSrc,
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
        imageSrc={lightboxData.imageSrc}
        designId={lightboxData.designId}
        title={lightboxData.title}
        onClose={closeLightbox}
        onRequestDesign={openRequestForm}
      />
      
      <AdminPanel 
        isOpen={isAdminPanelOpen} 
        onClose={() => setIsAdminPanelOpen(false)} 
      />
    </div>
  );
}
