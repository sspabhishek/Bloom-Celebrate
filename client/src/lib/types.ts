export interface GalleryImage {
  id: string;
  designId: string;
  title: string;
  category: 'birthdays' | 'weddings' | 'corporate';
  keywords: string;
  imagePath: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  eventDate?: string;
  designId?: string;
  message: string;
  createdAt: string;
}

export type CategoryFilter = 'all' | 'birthdays' | 'weddings' | 'corporate';
