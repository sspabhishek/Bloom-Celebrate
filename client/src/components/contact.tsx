import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { API_BASE_URL } from "@/config";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  eventDate: z.string().optional(),
  designId: z.string().optional(),
  message: z.string().min(1, "Message is required"),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactProps {
  selectedDesignId: string;
  onClearDesignId: () => void;
}

export default function Contact({ selectedDesignId, onClearDesignId }: ContactProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      eventDate: "",
      designId: "",
      message: "",
    },
  });

  // Update form when selectedDesignId changes
  useEffect(() => {
    if (selectedDesignId) {
      form.setValue("designId", selectedDesignId);
      // Highlight the design ID field
      const designIdField = document.getElementById("designId");
      if (designIdField) {
        designIdField.classList.add("ring-2", "ring-accent");
        setTimeout(() => {
          designIdField.classList.remove("ring-2", "ring-accent");
        }, 2000);
      }
      onClearDesignId();
    }
  }, [selectedDesignId, form, onClearDesignId]);

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return apiRequest("POST", "/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "Thank you for your message! We'll get back to you soon.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/contact"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      console.error("Contact form error:", error);
    },
  });

  const onSubmit = (data: ContactFormData) => {
    contactMutation.mutate(data);
  };

  return (
    <section id="contact" className="py-16 bg-background" data-testid="contact-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4" data-testid="contact-title">
            Let's Create Magic Together
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="contact-subtitle">
            Ready to transform your celebration? Get in touch and let's bring your vision to life with our stunning decorations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="rounded-2xl shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-2xl font-serif font-semibold text-foreground mb-6" data-testid="form-title">
                Send Us a Message
              </h3>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="contact-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      data-testid="input-name"
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background"
                    />
                    {form.formState.errors.name && (
                      <p className="text-destructive text-sm mt-1" data-testid="error-name">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      data-testid="input-email"
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background"
                    />
                    {form.formState.errors.email && (
                      <p className="text-destructive text-sm mt-1" data-testid="error-email">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...form.register("phone")}
                      data-testid="input-phone"
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background"
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventDate" className="block text-sm font-medium text-foreground mb-2">
                      Event Date (Optional)
                    </Label>
                    <Input
                      id="eventDate"
                      type="date"
                      {...form.register("eventDate")}
                      data-testid="input-event-date"
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="designId" className="block text-sm font-medium text-foreground mb-2">
                    Design ID (if requesting specific design)
                  </Label>
                  <Input
                    id="designId"
                    {...form.register("designId")}
                    placeholder="e.g., BALLOON-001, FLORAL-005"
                    data-testid="input-design-id"
                    className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background"
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    rows={4}
                    {...form.register("message")}
                    placeholder="Tell us about your event and decoration preferences..."
                    data-testid="textarea-message"
                    className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background"
                  />
                  {form.formState.errors.message && (
                    <p className="text-destructive text-sm mt-1" data-testid="error-message">
                      {form.formState.errors.message.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={contactMutation.isPending}
                  data-testid="button-submit-contact"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-lg font-semibold text-lg transition-colors"
                >
                  {contactMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-2"></i>Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Contact Information and Map */}
          <div className="space-y-8">
            <Card className="rounded-2xl shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-serif font-semibold text-foreground mb-6" data-testid="contact-info-title">
                  Get In Touch
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center" data-testid="contact-address">
                    <i className="fas fa-map-marker-alt text-primary text-xl mr-4"></i>
                    <div>
                      <p className="font-medium text-foreground">Our Studio</p>
                      <p className="text-muted-foreground">123 Celebration Avenue, Event City, EC 12345</p>
                    </div>
                  </div>
                  <div className="flex items-center" data-testid="contact-phone">
                    <i className="fas fa-phone text-primary text-xl mr-4"></i>
                    <div>
                      <p className="font-medium text-foreground">Call Us</p>
                      <p className="text-muted-foreground">(555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center" data-testid="contact-email">
                    <i className="fas fa-envelope text-primary text-xl mr-4"></i>
                    <div>
                      <p className="font-medium text-foreground">Email Us</p>
                      <p className="text-muted-foreground">hello@bloomcelebrate.com</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h4 className="font-semibold text-foreground mb-4">Follow Us</h4>
                  <div className="flex space-x-4" data-testid="social-links">
                    <a 
                      href="#" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-full transition-colors"
                      data-testid="link-instagram"
                    >
                      <i className="fab fa-instagram"></i>
                    </a>
                    <a 
                      href="#" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-full transition-colors"
                      data-testid="link-whatsapp"
                    >
                      <i className="fab fa-whatsapp"></i>
                    </a>
                    <a 
                      href="#" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-full transition-colors"
                      data-testid="link-facebook"
                    >
                      <i className="fab fa-facebook"></i>
                    </a>
                    <a 
                      href="#" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-full transition-colors"
                      data-testid="link-tiktok"
                    >
                      <i className="fab fa-tiktok"></i>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Google Maps */}
            <Card className="rounded-2xl overflow-hidden shadow-lg h-64" data-testid="contact-map">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9476519598093!2d-73.99185368459418!3d40.74844797932881!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1634567890123!5m2!1sen!2sus" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Business Location"
              />
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
