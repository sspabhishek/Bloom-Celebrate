import { users, galleryImages, contactMessages, type User, type InsertUser, type InsertGalleryImage, type GalleryImage, type InsertContactMessage, type ContactMessage } from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, or } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Gallery methods
  getAllImages(): Promise<GalleryImage[]>;
  getImagesByCategory(category: string): Promise<GalleryImage[]>;
  getImageById(designId: string): Promise<GalleryImage | undefined>;
  createImage(image: InsertGalleryImage): Promise<GalleryImage>;
  deleteImage(designId: string): Promise<void>;
  searchImages(query: string): Promise<GalleryImage[]>;
  generateDesignId(category: string): Promise<string>;
  
  // Contact methods
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getAllContactMessages(): Promise<ContactMessage[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllImages(): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages).orderBy(desc(galleryImages.createdAt));
  }

  async getImagesByCategory(category: string): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages)
      .where(eq(galleryImages.category, category))
      .orderBy(desc(galleryImages.createdAt));
  }

  async getImageById(designId: string): Promise<GalleryImage | undefined> {
    const [image] = await db.select().from(galleryImages).where(eq(galleryImages.designId, designId));
    return image || undefined;
  }

  async createImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const [newImage] = await db
      .insert(galleryImages)
      .values(image)
      .returning();
    return newImage;
  }

  async deleteImage(designId: string): Promise<void> {
    await db.delete(galleryImages).where(eq(galleryImages.designId, designId));
  }

  async searchImages(query: string): Promise<GalleryImage[]> {
    const searchTerm = `%${query}%`;
    return await db.select().from(galleryImages)
      .where(
        or(
          like(galleryImages.designId, searchTerm),
          like(galleryImages.title, searchTerm),
          like(galleryImages.keywords, searchTerm)
        )
      )
      .orderBy(desc(galleryImages.createdAt));
  }

  async generateDesignId(category: string): Promise<string> {
    const prefix = (category === 'weddings' || category === 'corporate') ? 'FLORAL' : 'BALLOON';
    
    // Get the highest number for this prefix
    const existingImages = await db.select().from(galleryImages)
      .where(like(galleryImages.designId, `${prefix}-%`));
    
    let maxNumber = 0;
    existingImages.forEach(image => {
      const match = image.designId.match(new RegExp(`${prefix}-(\\d+)`));
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    });
    
    const nextNumber = maxNumber + 1;
    return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db
      .insert(contactMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }
}

export const storage = new DatabaseStorage();
