import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { GalleryImage } from "@/lib/types";

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

const uploadSchema = z.object({
  category: z.enum(["birthdays", "weddings", "corporate"]),
  title: z.string().min(1, "Title is required"),
  keywords: z.string().min(1, "Keywords are required"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type UploadFormData = z.infer<typeof uploadSchema>;

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: "" },
  });

  const uploadForm = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      category: "birthdays",
      title: "",
      keywords: "",
    },
  });

  const { data: images = [] } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
    enabled: isLoggedIn,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      return apiRequest("POST", "/api/admin/login", data);
    },
    onSuccess: () => {
      setIsLoggedIn(true);
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel!",
      });
      loginForm.reset();
    },
    onError: () => {
      toast({
        title: "Login Failed",
        description: "Invalid password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadFormData) => {
      if (!selectedFile) throw new Error("No file selected");
      
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("category", data.category);
      formData.append("title", data.title);
      formData.append("keywords", data.keywords);

      const response = await fetch("/api/gallery", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload Successful",
        description: "Image uploaded successfully!",
      });
      uploadForm.reset();
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (designId: string) => {
      return apiRequest("DELETE", `/api/gallery/${designId}`);
    },
    onSuccess: () => {
      toast({
        title: "Image Deleted",
        description: "Image deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const handleUpload = (data: UploadFormData) => {
    uploadMutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDelete = (designId: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      deleteMutation.mutate(designId);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex justify-end"
      onClick={handleBackdropClick}
      data-testid="admin-panel-backdrop"
    >
      <div 
        className="w-96 bg-card shadow-2xl transform transition-transform duration-300 admin-panel border-l border-border overflow-y-auto"
        data-testid="admin-panel"
      >
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-serif font-bold text-foreground" data-testid="admin-panel-title">
              Admin Panel
            </h2>
            <Button 
              variant="ghost" 
              onClick={onClose}
              data-testid="button-close-admin"
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <i className="fas fa-times text-xl"></i>
            </Button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {!isLoggedIn ? (
            /* Login Form */
            <div data-testid="admin-login">
              <h3 className="font-semibold text-foreground mb-4">Admin Login</h3>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div>
                  <Label htmlFor="adminPassword" className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    {...loginForm.register("password")}
                    placeholder="Enter admin password"
                    data-testid="input-admin-password"
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-destructive text-sm mt-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  disabled={loginMutation.isPending}
                  data-testid="button-admin-login"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-lg transition-colors"
                >
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
              </form>
            </div>
          ) : (
            /* Admin Dashboard */
            <div data-testid="admin-dashboard">
              {/* Upload Section */}
              <Card className="bg-muted rounded-lg">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-4" data-testid="upload-section-title">
                    Upload New Image
                  </h3>
                  <form onSubmit={uploadForm.handleSubmit(handleUpload)} className="space-y-4">
                    <div>
                      <Label className="block text-sm font-medium text-foreground mb-2">Category</Label>
                      <Select 
                        onValueChange={(value) => uploadForm.setValue("category", value as any)}
                        defaultValue="birthdays"
                      >
                        <SelectTrigger data-testid="select-upload-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="birthdays">Birthdays</SelectItem>
                          <SelectItem value="weddings">Weddings</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-foreground mb-2">Title</Label>
                      <Input
                        {...uploadForm.register("title")}
                        placeholder="Design title"
                        data-testid="input-upload-title"
                        className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background"
                      />
                      {uploadForm.formState.errors.title && (
                        <p className="text-destructive text-sm mt-1">
                          {uploadForm.formState.errors.title.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-foreground mb-2">Keywords</Label>
                      <Input
                        {...uploadForm.register("keywords")}
                        placeholder="keyword1 keyword2 keyword3"
                        data-testid="input-upload-keywords"
                        className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background"
                      />
                      {uploadForm.formState.errors.keywords && (
                        <p className="text-destructive text-sm mt-1">
                          {uploadForm.formState.errors.keywords.message}
                        </p>
                      )}
                    </div>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <i className="fas fa-cloud-upload-alt text-3xl text-muted-foreground mb-2"></i>
                      <p className="text-muted-foreground mb-2">
                        {selectedFile ? selectedFile.name : "Drag & drop image here"}
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        data-testid="input-image-upload"
                        className="hidden"
                        id="imageUpload"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => document.getElementById("imageUpload")?.click()}
                        data-testid="button-browse-files"
                        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-4 py-2 rounded-lg transition-colors"
                      >
                        Browse Files
                      </Button>
                    </div>
                    <Button
                      type="submit"
                      disabled={uploadMutation.isPending || !selectedFile}
                      data-testid="button-upload-image"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-lg transition-colors"
                    >
                      {uploadMutation.isPending ? "Uploading..." : "Upload Image"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              {/* Current Images */}
              <div>
                <h3 className="font-semibold text-foreground mb-4" data-testid="current-images-title">
                  Current Images
                </h3>
                <div className="space-y-3" data-testid="admin-image-list">
                  {images.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4" data-testid="no-images-message">
                      No images uploaded yet.
                    </p>
                  ) : (
                    images.map((image) => (
                      <div 
                        key={image.id} 
                        className="flex items-center justify-between bg-muted rounded-lg p-3"
                        data-testid={`admin-image-item-${image.designId}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-border rounded overflow-hidden">
                            <img
                              src={image.imagePath}
                              alt={image.title}
                              className="w-full h-full object-cover"
                              data-testid={`admin-image-thumbnail-${image.designId}`}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-foreground" data-testid={`admin-image-id-${image.designId}`}>
                              {image.designId}
                            </p>
                            <p className="text-xs text-muted-foreground" data-testid={`admin-image-category-${image.designId}`}>
                              {image.category.charAt(0).toUpperCase() + image.category.slice(1)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => handleDelete(image.designId)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${image.designId}`}
                          className="text-destructive hover:text-destructive/90 p-2"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
