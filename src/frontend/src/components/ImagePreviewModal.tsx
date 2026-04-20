import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RotateCw, X, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

interface ImagePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  alt?: string;
  title?: string;
}

export function ImagePreviewModal({
  open,
  onOpenChange,
  src,
  alt = "Image preview",
  title,
}: ImagePreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  function handleClose() {
    setZoom(1);
    setRotation(0);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-3xl w-full bg-card border border-border p-0 overflow-hidden"
        data-ocid="image_preview.dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
          {title && (
            <span className="font-medium text-sm text-foreground truncate">
              {title}
            </span>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
              aria-label="Zoom in"
              data-ocid="image_preview.zoom_in_button"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
              aria-label="Zoom out"
              data-ocid="image_preview.zoom_out_button"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              aria-label="Rotate image"
              data-ocid="image_preview.rotate_button"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              aria-label="Close preview"
              data-ocid="image_preview.close_button"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Image */}
        <div className="flex items-center justify-center p-4 min-h-64 bg-muted/20 overflow-auto">
          <img
            src={src}
            alt={alt}
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: "transform 0.2s ease",
              maxWidth: "100%",
              maxHeight: "60vh",
              objectFit: "contain",
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
