import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface CreateGalleryPayload {
  title: string;
  category: 'birthdays' | 'weddings' | 'corporate';
  keywords: string[];
  imageKeys: string[];
}

export interface GalleryItemResponse {
  id: string;
  designId: string;
  title: string;
  category: 'birthdays' | 'weddings' | 'corporate';
  keywords: string[] | string;
  imageKeys: string[];
  createdAt: string;
}

export function useCreateGalleryItem() {
  return useMutation<GalleryItemResponse, Error, CreateGalleryPayload>({
    mutationFn: async (payload) => {
      const res = await apiRequest("POST", "/gallery", payload);
      return res.json();
    },
    retry: 1,
  });
}
