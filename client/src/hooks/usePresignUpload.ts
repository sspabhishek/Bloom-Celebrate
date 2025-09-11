import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface PresignRequest {
  filename: string;
  contentType: string;
}

export interface PresignResponse {
  uploadUrl: string;
  objectKey: string;
}

export function usePresignUpload() {
  return useMutation<{ uploadUrl: string; objectKey: string }, Error, PresignRequest>({
    mutationFn: async ({ filename, contentType }) => {
      const res = await apiRequest("POST", "/gallery/presign-upload", {
        filename,
        contentType,
      });
      const json = (await res.json()) as PresignResponse;
      if (!json?.uploadUrl || !json?.objectKey) {
        throw new Error("Invalid presign response");
      }
      return json;
    },
    retry: 2,
  });
}
