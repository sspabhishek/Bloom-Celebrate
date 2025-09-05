import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGalleryImageSchema, insertContactMessageSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  }, express.static(uploadDir));

  // Gallery routes
  app.get("/api/gallery", async (req, res) => {
    try {
      const { category, search } = req.query;
      
      let images;
      if (search && typeof search === 'string') {
        images = await storage.searchImages(search);
      } else if (category && typeof category === 'string' && category !== 'all') {
        images = await storage.getImagesByCategory(category);
      } else {
        images = await storage.getAllImages();
      }
      
      res.json(images);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  app.get("/api/gallery/:designId", async (req, res) => {
    try {
      const { designId } = req.params;
      const image = await storage.getImageById(designId);
      
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      res.json(image);
    } catch (error) {
      console.error('Error fetching image:', error);
      res.status(500).json({ message: "Failed to fetch image" });
    }
  });

  app.post("/api/gallery", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const { category, title, keywords } = req.body;
      
      if (!category || !title || !keywords) {
        return res.status(400).json({ message: "Category, title, and keywords are required" });
      }

      const designId = await storage.generateDesignId(category);
      const imagePath = `/uploads/${req.file.filename}`;

      const imageData = {
        designId,
        title,
        category,
        keywords,
        imagePaths: [imagePath]
      };

      const validatedData = insertGalleryImageSchema.parse(imageData);
      const newImage = await storage.createImage(validatedData);
      
      res.status(201).json(newImage);
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  app.delete("/api/gallery/:designId", async (req, res) => {
    try {
      const { designId } = req.params;
      
      const image = await storage.getImageById(designId);
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }

      // Delete the files from disk
      image.imagePaths.forEach(imagePath => {
        const filePath = path.join(process.cwd(), imagePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      await storage.deleteImage(designId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({ message: "Failed to delete image" });
    }
  });

  // Contact routes
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error('Error creating contact message:', error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/contact", async (req, res) => {
    try {
      const messages = await storage.getAllContactMessages();
      res.json(messages);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Admin auth route (simple password check)
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = req.body;
      
      // Simple password check - in production, use proper authentication
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      
      if (password === adminPassword) {
        res.json({ success: true, message: "Login successful" });
      } else {
        res.status(401).json({ success: false, message: "Invalid password" });
      }
    } catch (error) {
      console.error('Error during admin login:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
