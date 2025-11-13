import { Component, input, output, signal, computed } from "@angular/core";
import { TiptapButtonComponent } from "./tiptap-button.component";
import { ImageUploadResult } from "./services/image.service";

export interface ImageUploadConfig {
  maxSize?: number; // en MB
  maxWidth?: number; // largeur max en px
  maxHeight?: number; // hauteur max en px
  allowedTypes?: string[];
  enableDragDrop?: boolean;
  showPreview?: boolean;
  multiple?: boolean;
  compressImages?: boolean; // compression automatique
  quality?: number; // qualité de compression (0-1)
}

@Component({
  selector: "tiptap-image-upload",
  standalone: true,
  imports: [TiptapButtonComponent],
  templateUrl: "./tiptap-image-upload.component.html",
  styleUrls: ["./tiptap-image-upload.component.css"],
})
export class TiptapImageUploadComponent {
  // Inputs
  config = input<Partial<ImageUploadConfig>>({
    maxSize: 5, // 5MB par défaut
    maxWidth: 1920, // largeur max par défaut
    maxHeight: 1080, // hauteur max par défaut
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    enableDragDrop: true,
    showPreview: true,
    multiple: false,
    compressImages: true,
    quality: 0.8,
  });

  // Outputs
  imageSelected = output<ImageUploadResult>();
  error = output<string>();

  // Signals internes
  isDragOver = signal(false);
  isUploading = signal(false);
  uploadProgress = signal(0);
  previewImage = signal<string | null>(null);
  previewInfo = signal<string>("");
  errorMessage = signal<string | null>(null);

  // Computed
  acceptedTypes = computed(() => {
    const types = this.config().allowedTypes || ["image/*"];
    return types.join(",");
  });

  triggerFileInput() {
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length > 0) {
      this.processFiles(Array.from(files));
    }

    // Reset input
    input.value = "";
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFiles(Array.from(files));
    }
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  private processFiles(files: File[]) {
    const config = this.config();
    const maxSize = (config.maxSize || 5) * 1024 * 1024; // Convertir en bytes
    const allowedTypes = config.allowedTypes || ["image/*"];

    // Vérifier le nombre de fichiers
    if (!config.multiple && files.length > 1) {
      this.showError("Veuillez sélectionner une seule image");
      return;
    }

    // Traiter chaque fichier
    files.forEach((file) => {
      // Vérifier le type
      if (!this.isValidFileType(file, allowedTypes)) {
        this.showError(`Type de fichier non supporté: ${file.name}`);
        return;
      }

      // Vérifier la taille
      if (file.size > maxSize) {
        this.showError(
          `Fichier trop volumineux: ${file.name} (max ${config.maxSize}MB)`
        );
        return;
      }

      // Traiter l'image avec compression si nécessaire
      this.processImage(file);
    });
  }

  private isValidFileType(file: File, allowedTypes: string[]): boolean {
    if (allowedTypes.includes("image/*")) {
      return file.type.startsWith("image/");
    }
    return allowedTypes.includes(file.type);
  }

  private processImage(file: File) {
    this.isUploading.set(true);
    this.uploadProgress.set(10);

    const config = this.config();
    const originalSize = file.size;

    // Créer un canvas pour la compression
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      this.uploadProgress.set(30);

      // Vérifier les dimensions
      const maxWidth = config.maxWidth || 1920;
      const maxHeight = config.maxHeight || 1080;

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

      this.uploadProgress.set(70);

      // Convertir en base64 avec compression
      const quality = config.quality || 0.8;
      const mimeType = file.type;

      canvas.toBlob(
        (blob) => {
          this.uploadProgress.set(90);

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
                  originalSize: originalSize,
                };

                // Afficher la prévisualisation si activée
                if (config.showPreview) {
                  this.previewImage.set(base64);
                  this.previewInfo.set(
                    `${result.width}×${result.height} • ${this.formatFileSize(
                      blob.size
                    )}`
                  );
                }

                // Émettre l'événement
                this.imageSelected.emit(result);
                this.clearError();
              }

              this.uploadProgress.set(100);
              setTimeout(() => {
                this.isUploading.set(false);
                this.uploadProgress.set(0);
              }, 500);
            };
            reader.readAsDataURL(blob);
          } else {
            this.showError("Erreur lors de la compression de l'image");
            this.isUploading.set(false);
            this.uploadProgress.set(0);
          }
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      this.showError("Erreur lors du chargement de l'image");
      this.isUploading.set(false);
      this.uploadProgress.set(0);
    };

    img.src = URL.createObjectURL(file);
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  private showError(message: string) {
    this.errorMessage.set(message);
    this.error.emit(message);
    this.isUploading.set(false);
    this.uploadProgress.set(0);

    // Auto-clear après 5 secondes
    setTimeout(() => {
      this.clearError();
    }, 5000);
  }

  private clearError() {
    this.errorMessage.set(null);
  }

  clearPreview() {
    this.previewImage.set(null);
    this.previewInfo.set("");
  }
}
