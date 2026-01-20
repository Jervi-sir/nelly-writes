import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "./ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

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

    // Validate size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

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

  const handleRemove = () => {
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
