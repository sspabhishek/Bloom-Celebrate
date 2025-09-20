import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { GalleryImage } from "@/lib/types";
import { API_BASE_URL, FALLBACK_IMAGE_URL } from "@/config";
import { getImageUrls } from "@/utils/imageUtils";
import GalleryUploadForm from "@/components/GalleryUploadForm";
import LeadsTable from "@/components/LeadsTable";

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const logoutTimeoutRef = useRef<number | null>(null);

  const EXPIRY_MS = 60 * 60 * 1000; // 1 hour

  const clearLogoutTimer = () => {
    if (logoutTimeoutRef.current) {
      window.clearTimeout(logoutTimeoutRef.current);
      logoutTimeoutRef.current = null;
    }
  };

  const logout = (showToast = true) => {
    try {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_token_expires_at");
    } catch {}
    clearLogoutTimer();
    setIsLoggedIn(false);
    if (showToast) {
      toast({ title: "Logged out", description: "Your session has expired. Please log in again." });
    }
  };

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: "" },
  });

  const { data: images = [] } = useQuery<GalleryImage[]>({
    queryKey: ["/gallery"],
    enabled: isLoggedIn,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: data.password }),
      });
      if (res.status === 200) {
        const json = await res.json();
        if (json?.token) {
          localStorage.setItem("admin_token", json.token);
        }
        return json;
      }
      if (res.status === 401) {
        throw new Error("INVALID_PASSWORD");
      }
      const text = (await res.text()) || res.statusText;
      throw new Error(text);
    },
    onSuccess: () => {
      setIsLoggedIn(true);
      // Set expiry 1 hour from now and schedule auto-logout
      const expiresAt = Date.now() + EXPIRY_MS;
      try {
        localStorage.setItem("admin_token_expires_at", String(expiresAt));
      } catch {}
      clearLogoutTimer();
      const msUntilExpiry = Math.max(0, expiresAt - Date.now());
      logoutTimeoutRef.current = window.setTimeout(() => logout(true), msUntilExpiry);
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel!",
      });
      loginForm.reset();
    },
    onError: (error: any) => {
      const message = error?.message === "INVALID_PASSWORD" ? "Invalid password" : "Login failed";
      toast({
        title: "Login Failed",
        description: message + ". Please try again.",
        variant: "destructive",
      });
    },
  });

  // Old single-file upload removed in favor of GalleryUploadForm

  const deleteMutation = useMutation({
    mutationFn: async (designId: string) => {
      const safeId = encodeURIComponent(designId);
      return apiRequest("DELETE", `/gallery/${safeId}`);
    },
    onSuccess: () => {
      toast({
        title: "Image Deleted",
        description: "Image deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/gallery"] });
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

  

  const handleDelete = (designId: string) => {
    console.log(designId);
    if (!designId) {
      toast({
        title: "Delete Failed",
        description: "Missing designId for this image.",
        variant: "destructive",
      });
      return;
    }
    if (confirm("Are you sure you want to delete this image?")) {
      deleteMutation.mutate(designId);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const expiresStr = typeof window !== 'undefined' ? localStorage.getItem('admin_token_expires_at') : null;
    const expiresAt = expiresStr ? parseInt(expiresStr, 10) : 0;

    // If token missing or expired, ensure logged out
    if (!token || !expiresAt || Number.isNaN(expiresAt) || Date.now() >= expiresAt) {
      if (token) {
        // token exists but expired
        logout(true);
      } else {
        setIsLoggedIn(false);
      }
      return;
    }

    // Valid token
    setIsLoggedIn(true);
    clearLogoutTimer();
    const msUntilExpiry = Math.max(0, expiresAt - Date.now());
    logoutTimeoutRef.current = window.setTimeout(() => logout(true), msUntilExpiry);
  }, [isOpen]);

  // Cleanup timer when component unmounts
  useEffect(() => {
    return () => {
      clearLogoutTimer();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex justify-end"
      onClick={handleBackdropClick}
      data-testid="admin-panel-backdrop"
    >
      <div 
        className="w-full sm:w-[28rem] md:w-[30rem] lg:w-[32rem] max-w-full h-full bg-card shadow-2xl admin-panel border-l border-border overflow-y-auto rounded-none lg:rounded-l-2xl animate-in slide-in-from-right duration-300"
        data-testid="admin-panel"
      >
        <div className="p-4 sm:p-6 border-b border-border sticky top-0 z-10 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground" data-testid="admin-panel-title">
              Admin Panel
            </h2>
            <Button 
              variant="ghost" 
              onClick={onClose}
              data-testid="button-close-admin"
              className="text-muted-foreground hover:text-foreground p-1"
              aria-label="Close admin panel"
            >
              <i className="fas fa-times text-xl"></i>
            </Button>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 space-y-6">
          {!isLoggedIn ? (
            /* Login Form */
            <div data-testid="admin-login">
              <h3 className="text-lg font-semibold text-foreground mb-4">Admin Login</h3>
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
              {/* Top actions */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg font-semibold text-foreground">Dashboard</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" data-testid="button-view-leads">
                        <i className="fas fa-table mr-2" /> View Leads
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl w-[95vw]">
                      <DialogHeader>
                        <DialogTitle>Leads</DialogTitle>
                      </DialogHeader>
                      <LeadsTable />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    onClick={() => logout(false)}
                    data-testid="button-logout"
                    className=""
                  >
                    <i className="fas fa-sign-out-alt mr-2" /> Logout
                  </Button>
                </div>
              </div>
              {/* Upload Section - New multi-image form */}
              <GalleryUploadForm />
              
              {/* Current Images */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="current-images-title">
                  Current Images
                </h3>
                <div className="space-y-3" data-testid="admin-image-list">
                  {images.length === 0 ? (
                    <div className="text-center py-8 bg-muted/60 rounded-lg border border-border" data-testid="no-images-message">
                      <i className="fas fa-images text-3xl text-muted-foreground mb-3"></i>
                      <p className="text-muted-foreground">No images uploaded yet. Use the form above to add your first one.</p>
                    </div>
                  ) : (
                    images.map((image) => (
                      <div 
                        key={image.id} 
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-muted rounded-lg p-3 transition-shadow hover:shadow-sm hover:ring-1 hover:ring-border"
                        data-testid={`admin-image-item-${image.designId}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-14 h-14 bg-border rounded overflow-hidden flex-shrink-0">
                            <img
                              src={(getImageUrls((image as any).imagePaths || (image as any).imageKeys || [])[0]) || FALLBACK_IMAGE_URL}
                              alt={image.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                if (e.currentTarget.src !== FALLBACK_IMAGE_URL) {
                                  e.currentTarget.src = FALLBACK_IMAGE_URL;
                                }
                              }}
                              data-testid={`admin-image-thumbnail-${image.designId}`}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[12rem]" data-testid={`admin-image-id-${image.designId}`}>
                              {image.designId}
                            </p>
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs" data-testid={`admin-image-category-${image.designId}`}>
                              {image.category.charAt(0).toUpperCase() + image.category.slice(1)}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => handleDelete(image.designId || (image as any).id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${image.designId}`}
                          className="border-destructive text-destructive hover:bg-destructive/10 p-2 self-start sm:self-auto"
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
