import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LightboxProps {
  isOpen: boolean;
  imageSrc: string;
  designId: string;
  title: string;
  onClose: () => void;
  onRequestDesign: (designId: string) => void;
}

export default function Lightbox({ 
  isOpen, 
  imageSrc, 
  designId, 
  title, 
  onClose, 
  onRequestDesign 
}: LightboxProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleRequestDesign = () => {
    onRequestDesign(designId);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 modal"
      onClick={handleBackdropClick}
      data-testid="lightbox-modal"
    >
      <Card className="relative max-w-4xl w-full rounded-2xl overflow-hidden">
        <Button
          variant="ghost"
          onClick={onClose}
          data-testid="button-close-lightbox"
          className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full w-10 h-10 flex items-center justify-center z-10 transition-colors p-0"
        >
          <i className="fas fa-times"></i>
        </Button>
        <img
          src={imageSrc}
          alt={`${title} ${designId}`}
          className="w-full h-auto max-h-[80vh] object-contain"
          data-testid="lightbox-image"
        />
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-serif font-bold text-foreground mb-2" data-testid="lightbox-title">
                {title}
              </h3>
              <Badge className="bg-accent text-accent-foreground px-4 py-2 rounded-full font-medium" data-testid="lightbox-design-id">
                {designId}
              </Badge>
            </div>
            <Button
              onClick={handleRequestDesign}
              data-testid="button-request-lightbox"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <i className="fas fa-heart mr-2"></i>Request This Design
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
