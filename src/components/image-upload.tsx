import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "./ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";


const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Calculate new dimensions
      let { width, height } = img;
      const MAX_HEIGHT = 480; // Only enforce 480p height constraint

      if (height > MAX_HEIGHT) {
        const ratio = MAX_HEIGHT / height;
        width = Math.round(width * ratio);
        height = MAX_HEIGHT;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Start with high quality, reduce if needed
      const quality = 0.9;
      const MAX_SIZE = 500 * 1024; // 500KB

      const attemptCompression = (q: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas to Blob failed"));
              return;
            }

            if (blob.size <= MAX_SIZE || q < 0.2) {
              // Convert blob back to File
              const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else {
              // Reduce quality and try again
              attemptCompression(q - 0.1);
            }
          },
          "image/jpeg",
          q
        );
      };

      attemptCompression(quality);
    };

    img.onerror = (error) => reject(error);
  });
};

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  bucket?: string;
}

export function ImageUpload({ value, onChange, bucket = "book" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    // Validate size (e.g., 5MB) - check input size before compression attempts
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const compressedFile = await compressImage(file);

      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, compressedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get Public URL
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(data.publicUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong uploading the image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (value) {
      try {
        const url = new URL(value);
        const pathParts = url.pathname.split('/');
        const bucketIndex = pathParts.indexOf(bucket);

        if (bucketIndex > -1) {
          const filePath = pathParts.slice(bucketIndex + 1).join('/');
          const { error } = await supabase.storage.from(bucket).remove([filePath]);
          if (error) throw error;
        }
      } catch (error) {
        console.error("Error removing image from storage:", error);
      }
    }
    onChange("");
  };

  return (
    <div className="flex flex-col gap-4">
      {value ? (
        <div className="relative w-32 h-48 rounded-md overflow-hidden border border-border group">
          <img src={value} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={handleRemove}
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-32 h-48 border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-accent/50 transition-colors relative">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground p-2 text-center">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
            ) : (
              <Upload className="h-8 w-8 mb-2 opacity-50" />
            )}
            <p className="text-xs font-medium">{isUploading ? "Uploading..." : "Upload Cover"}</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            disabled={isUploading}
            onChange={handleUpload}
          />
        </label>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
