import React, { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { usePresignUpload } from "@/hooks/usePresignUpload";
import { useCreateGalleryItem } from "@/hooks/useCreateGalleryItem";
import { queryClient } from "@/lib/queryClient";
import { FALLBACK_IMAGE_URL } from "@/config";

const uploadSchema = z.object({
  category: z.enum(["birthdays", "weddings", "corporate"]),
  title: z.string().min(1, "Title is required"),
  keywords: z.string().optional().default(""),
});

type UploadFormData = z.infer<typeof uploadSchema>;

type FileWithPreview = {
  file: File;
  previewUrl: string;
  progress: number; // 0-100
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
};

function uploadFileWithProgress(url: string, file: File, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    // Debug: initial request details
    try {
      console.log("[upload] Initiating PUT to S3", {
        url,
        file: { name: file.name, type: file.type, size: file.size },
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
    } catch {}

    // Observe ready state transitions (helps diagnose CORS/preflight issues)
    xhr.onreadystatechange = () => {
      try {
        console.log("[upload] readyState change", {
          readyState: xhr.readyState,
          status: xhr.status,
          statusText: xhr.statusText,
        });
      } catch {}
    };

    // Trickle progress for slow networks or when e.lengthComputable is false
    let trickleTimer: number | null = null;
    let lastReported = 0;
    const startTrickle = () => {
      if (trickleTimer !== null) return;
      trickleTimer = window.setInterval(() => {
        // Slowly increase progress up to 90% while waiting for real progress
        if (lastReported < 90) {
          lastReported = Math.min(90, lastReported + 1);
          onProgress(lastReported);
        }
      }, 500);
    };
    const stopTrickle = () => {
      if (trickleTimer !== null) {
        clearInterval(trickleTimer);
        trickleTimer = null;
      }
    };

    xhr.upload.onloadstart = () => {
      // Kick off trickle immediately to signal activity
      try { console.log("[upload] loadstart", { name: file.name, size: file.size }); } catch {}
      lastReported = Math.max(lastReported, 1);
      onProgress(lastReported);
      startTrickle();
    };

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) {
        stopTrickle();
        const pct = Math.round((e.loaded / e.total) * 100);
        try { console.debug("[upload] progress", { loaded: e.loaded, total: e.total, pct }); } catch {}
        lastReported = pct;
        onProgress(pct);
      } else {
        // Keep trickling when not computable
        try { console.debug("[upload] progress not computable - continuing trickle"); } catch {}
        startTrickle();
      }
    };

    xhr.onload = () => {
      stopTrickle();
      try {
        console.log("[upload] load", {
          status: xhr.status,
          statusText: xhr.statusText,
          responseHeaders: (() => { try { return xhr.getAllResponseHeaders?.(); } catch { return undefined; } })(),
        });
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error(`S3 upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      stopTrickle();
      try { console.error("[upload] onerror - network or CORS failure", { status: xhr.status, statusText: xhr.statusText }); } catch {}
      reject(new Error("Network error during S3 upload"));
    };
    xhr.onabort = () => {
      stopTrickle();
      try { console.warn("[upload] onabort"); } catch {}
      reject(new Error("Upload aborted"));
    };

    try { console.log("[upload] sending file ..."); } catch {}
    xhr.send(file);
  });
}

export default function GalleryUploadForm() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<FileWithPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      category: "birthdays",
      title: "",
      keywords: "",
    },
  });

  const presignMutation = usePresignUpload();
  const createMutation = useCreateGalleryItem();

  const previews = useMemo(() => items.map((i) => i.previewUrl), [items]);

  const onSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    // Clear any previous validation error related to files selection
    form.clearErrors("files");
    const next: FileWithPreview[] = Array.from(files).map((f) => ({
      file: f,
      previewUrl: URL.createObjectURL(f),
      progress: 0,
      status: "pending",
    }));
    setItems((prev) => [...prev, ...next]);
  };

  const removePreview = (idx: number) => {
    setItems((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(idx, 1);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return copy;
    });
  };

  const parseKeywords = (value: string): string[] => {
    return value
      .split(/[,\s]+/)
      .map((k) => k.trim())
      .filter(Boolean);
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    if (items.length === 0) {
      form.setError("files", { type: "manual", message: "Please select at least one image" });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1) Presign + upload each file
      const uploadedKeys: string[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Presign (do not mark as uploading until presign succeeds)
        let presign: { uploadUrl: string; objectKey: string };
        try {
          presign = await presignMutation.mutateAsync({
            filename: item.file.name,
            contentType: item.file.type || "application/octet-stream",
          });
        } catch (err: any) {
          setItems((prev) =>
            prev.map((it, idx) =>
              idx === i ? { ...it, status: "error", error: err?.message || "Failed to prepare upload" } : it
            )
          );
          throw err; // abort overall submission so user can retry
        }

        // Mark uploading only after presign success
        setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, status: "uploading", progress: 0 } : it)));

        // Upload with retry
        let attempts = 0;
        let success = false;
        let lastError: any;
        while (attempts < 3 && !success) {
          attempts++;
          try {
            await uploadFileWithProgress(presign.uploadUrl, item.file, (pct) => {
              setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, progress: pct } : it)));
            });
            success = true;
            uploadedKeys.push(presign.objectKey);
            setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, status: "success", progress: 100 } : it)));
          } catch (err: any) {
            lastError = err;
            if (attempts >= 3) {
              setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, status: "error", error: err?.message || "Upload failed" } : it)));
            }
          }
        }

        if (!success) {
          throw lastError || new Error("Failed to upload one or more files");
        }
      }

      // 2) Create gallery item with uploaded keys
      const payload = {
        title: data.title,
        category: data.category,
        keywords: parseKeywords(data.keywords || ""),
        imageKeys: uploadedKeys,
      };
      const created = await createMutation.mutateAsync(payload);

      // Optimistic cache update: update all '/gallery' queries
      const queries = queryClient.getQueryCache().findAll({ predicate: (q) => {
        const key = q.queryKey?.[0];
        return key === "/gallery";
      }});
      for (const q of queries) {
        queryClient.setQueryData<any[]>(q.queryKey, (old = []) => [
          {
            ...created,
            keywords: Array.isArray(created.keywords) ? created.keywords.join(", ") : created.keywords,
            imagePaths: created.imageKeys, // compatibility with existing consumers
          },
          ...old,
        ]);
      }

      toast({ title: "Upload Successful", description: "Gallery item created successfully." });
      // Reset form and previews
      form.reset();
      items.forEach((i) => URL.revokeObjectURL(i.previewUrl));
      setItems([]);
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error?.message || "Failed to upload images.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Card className="bg-muted rounded-lg">
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground mb-4">Upload New Images</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">Category</Label>
            <Select onValueChange={(v) => form.setValue("category", v as any)} defaultValue={form.getValues("category") || "birthdays"}>
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
            <Input {...form.register("title")} placeholder="Design title" data-testid="input-upload-title" />
            {form.formState.errors.title && (
              <p className="text-destructive text-sm mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">Keywords (comma separated)</Label>
            <Input {...form.register("keywords")} placeholder="stage, flowers, decor" data-testid="input-upload-keywords" />
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <i className="fas fa-cloud-upload-alt text-3xl text-muted-foreground mb-2"></i>
            <p className="text-muted-foreground mb-2">
              {items.length > 0 ? `${items.length} file(s) selected` : "Drag & drop or choose images"}
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onSelectFiles}
              data-testid="input-image-upload"
              className="hidden"
              ref={fileInputRef}
              id="multiImageUpload"
            />
            <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} data-testid="button-browse-files">
              Browse Files
            </Button>
            {items.length === 0 && form.formState.submitCount > 0 && (
              <p className="text-destructive text-sm mt-2" data-testid="error-files">
                Please select at least one image
              </p>
            )}
          </div>

          {/* Previews */}
          {items.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {items.map((it, idx) => (
                <div key={idx} className="relative bg-card rounded overflow-hidden border border-border p-2">
                  <img
                    src={it.previewUrl || FALLBACK_IMAGE_URL}
                    alt={`preview-${idx}`}
                    className="w-full h-24 object-cover rounded"
                    onError={(e) => {
                      if (e.currentTarget.src !== FALLBACK_IMAGE_URL) e.currentTarget.src = FALLBACK_IMAGE_URL;
                    }}
                  />
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="truncate max-w-[70%]" title={it.file.name}>{it.file.name}</span>
                    <button type="button" className="text-destructive" onClick={() => removePreview(idx)} title="Remove">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  {/* Progress / Status */}
                  <div className="mt-1 h-2 bg-border rounded">
                    <div className={`h-2 rounded ${it.status === 'error' ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${it.progress}%` }}></div>
                  </div>
                  {it.status === 'error' && (
                    <p className="text-destructive text-xs mt-1">{it.error || 'Upload failed'}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <Button type="submit" disabled={isSubmitting || items.some((i) => i.status === 'uploading')} className="w-full">
            {isSubmitting ? "Uploading..." : "Create Gallery Item"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
