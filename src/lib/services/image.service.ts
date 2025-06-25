import { Injectable, signal, computed } from "@angular/core";
import { Editor } from "@tiptap/core";

export interface ImageData {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
}

export interface ImageUploadResult {
  src: string;
  name: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
  originalSize?: number;
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
}

@Injectable({
  providedIn: "root",
})
export class ImageService {
  // Signals pour l'état des images
  selectedImage = signal<ImageData | null>(null);
  isImageSelected = computed(() => this.selectedImage() !== null);
  isResizing = signal(false);

  // Méthodes pour la gestion des images
  selectImage(editor: Editor): void {
    if (editor.isActive("resizableImage")) {
      const attrs = editor.getAttributes("resizableImage");
      this.selectedImage.set({
        src: attrs["src"],
        alt: attrs["alt"],
        title: attrs["title"],
        width: attrs["width"],
        height: attrs["height"],
      });
    } else {
      this.selectedImage.set(null);
    }
  }

  clearSelection(): void {
    this.selectedImage.set(null);
  }

  // Méthodes pour manipuler les images
  insertImage(editor: Editor, imageData: ImageData): void {
    editor.chain().focus().setResizableImage(imageData).run();
  }

  updateImageAttributes(editor: Editor, attributes: Partial<ImageData>): void {
    if (editor.isActive("resizableImage")) {
      editor
        .chain()
        .focus()
        .updateAttributes("resizableImage", attributes)
        .run();
      this.updateSelectedImage(attributes);
    }
  }

  // Nouvelles méthodes pour le redimensionnement
  resizeImage(editor: Editor, options: ResizeOptions): void {
    if (!editor.isActive("resizableImage")) return;

    const currentAttrs = editor.getAttributes("resizableImage");
    let newWidth = options.width;
    let newHeight = options.height;

    // Maintenir le ratio d'aspect si demandé
    if (
      options.maintainAspectRatio !== false &&
      currentAttrs["width"] &&
      currentAttrs["height"]
    ) {
      const aspectRatio = currentAttrs["width"] / currentAttrs["height"];

      if (newWidth && !newHeight) {
        newHeight = Math.round(newWidth / aspectRatio);
      } else if (newHeight && !newWidth) {
        newWidth = Math.round(newHeight * aspectRatio);
      }
    }

    // Appliquer des limites minimales
    if (newWidth) newWidth = Math.max(50, newWidth);
    if (newHeight) newHeight = Math.max(50, newHeight);

    this.updateImageAttributes(editor, {
      width: newWidth,
      height: newHeight,
    });
  }

  // Méthodes pour redimensionner par pourcentage
  resizeImageByPercentage(editor: Editor, percentage: number): void {
    if (!editor.isActive("resizableImage")) return;

    const currentAttrs = editor.getAttributes("resizableImage");
    if (!currentAttrs["width"] || !currentAttrs["height"]) return;

    const newWidth = Math.round(currentAttrs["width"] * (percentage / 100));
    const newHeight = Math.round(currentAttrs["height"] * (percentage / 100));

    this.resizeImage(editor, { width: newWidth, height: newHeight });
  }

  // Méthodes pour redimensionner à des tailles prédéfinies
  resizeImageToSmall(editor: Editor): void {
    this.resizeImage(editor, {
      width: 300,
      height: 200,
      maintainAspectRatio: true,
    });
  }

  resizeImageToMedium(editor: Editor): void {
    this.resizeImage(editor, {
      width: 500,
      height: 350,
      maintainAspectRatio: true,
    });
  }

  resizeImageToLarge(editor: Editor): void {
    this.resizeImage(editor, {
      width: 800,
      height: 600,
      maintainAspectRatio: true,
    });
  }

  resizeImageToOriginal(editor: Editor): void {
    if (!editor.isActive("resizableImage")) return;

    const img = new Image();
    img.onload = () => {
      this.resizeImage(editor, {
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.src = editor.getAttributes("resizableImage")["src"];
  }

  // Méthode pour redimensionner librement (sans maintenir le ratio)
  resizeImageFreely(editor: Editor, width: number, height: number): void {
    this.resizeImage(editor, {
      width,
      height,
      maintainAspectRatio: false,
    });
  }

  // Méthode pour obtenir les dimensions actuelles de l'image
  getImageDimensions(editor: Editor): { width: number; height: number } | null {
    if (!editor.isActive("resizableImage")) return null;

    const attrs = editor.getAttributes("resizableImage");
    return {
      width: attrs["width"] || 0,
      height: attrs["height"] || 0,
    };
  }

  // Méthode pour obtenir les dimensions naturelles de l'image
  getNaturalImageDimensions(
    src: string
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        reject(new Error("Impossible de charger l'image"));
      };
      img.src = src;
    });
  }

  deleteImage(editor: Editor): void {
    if (editor.isActive("resizableImage")) {
      editor.chain().focus().deleteSelection().run();
      this.clearSelection();
    }
  }

  // Méthodes pour l'upload d'images
  async uploadImage(file: File): Promise<ImageUploadResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        if (base64) {
          // Créer une image temporaire pour obtenir les dimensions
          const img = new Image();
          img.onload = () => {
            const result: ImageUploadResult = {
              src: base64,
              name: file.name,
              size: file.size,
              type: file.type,
              width: img.width,
              height: img.height,
              originalSize: file.size,
            };
            resolve(result);
          };
          img.onerror = () =>
            reject(new Error("Erreur lors du chargement de l'image"));
          img.src = base64;
        } else {
          reject(new Error("Erreur lors de la lecture du fichier"));
        }
      };

      reader.onerror = () =>
        reject(new Error("Erreur lors de la lecture du fichier"));
      reader.readAsDataURL(file);
    });
  }

  // Méthodes utilitaires
  private updateSelectedImage(attributes: Partial<ImageData>): void {
    const current = this.selectedImage();
    if (current) {
      this.selectedImage.set({ ...current, ...attributes });
    }
  }

  // Validation des images
  validateImage(
    file: File,
    maxSize: number = 5 * 1024 * 1024
  ): { valid: boolean; error?: string } {
    if (!file.type.startsWith("image/")) {
      return { valid: false, error: "Le fichier doit être une image" };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `L'image est trop volumineuse (max ${maxSize / 1024 / 1024}MB)`,
      };
    }

    return { valid: true };
  }

  // Compression d'image
  async compressImage(
    file: File,
    quality: number = 0.8,
    maxWidth: number = 1920,
    maxHeight: number = 1080
  ): Promise<ImageUploadResult> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Redimensionner si nécessaire
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Dessiner l'image redimensionnée
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir en base64 avec compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const base64 = e.target?.result as string;
                if (base64) {
                  const result: ImageUploadResult = {
                    src: base64,
                    name: file.name,
                    size: blob.size,
                    type: file.type,
                    width: Math.round(width),
                    height: Math.round(height),
                    originalSize: file.size,
                  };
                  resolve(result);
                } else {
                  reject(new Error("Erreur lors de la compression"));
                }
              };
              reader.readAsDataURL(blob);
            } else {
              reject(new Error("Erreur lors de la compression"));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () =>
        reject(new Error("Erreur lors du chargement de l'image"));
      img.src = URL.createObjectURL(file);
    });
  }
}
