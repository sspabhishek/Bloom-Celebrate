export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-serif font-bold text-primary mb-4" data-testid="footer-logo">
              <i className="fas fa-heart text-yellow-300 mr-2"></i>Bloom & Celebrate
            </h3>
            <p className="text-muted-foreground mb-4" data-testid="footer-description">
              Creating magical moments with stunning balloon arches and exquisite floral arrangements for every celebration.
            </p>
            <div className="flex space-x-4" data-testid="footer-social-links">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-instagram">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-whatsapp">
                <i className="fab fa-whatsapp text-xl"></i>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-facebook">
                <i className="fab fa-facebook text-xl"></i>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4" data-testid="footer-services-title">Services</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-birthdays">Birthday Decorations</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-weddings">Wedding Arrangements</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-corporate">Corporate Events</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-custom">Custom Designs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4" data-testid="footer-contact-title">Contact Info</h4>
            <div className="space-y-2 text-muted-foreground">
              <p data-testid="footer-phone"><i className="fas fa-phone mr-2"></i>(555) 123-4567</p>
              <p data-testid="footer-email"><i className="fas fa-envelope mr-2"></i>hello@bloomcelebrate.com</p>
              <p data-testid="footer-address"><i className="fas fa-map-marker-alt mr-2"></i>123 Celebration Avenue, Event City</p>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-8 mt-8 text-center text-muted-foreground" data-testid="footer-copyright">
          <p>&copy; 2024 Bloom & Celebrate. All rights reserved. | Designed with <i className="fas fa-heart text-primary"></i> for your special moments.</p>
        </div>
      </div>
    </footer>
  );
}
