import { Component, input, output } from "@angular/core";
import { Editor } from "@tiptap/core";
import { TiptapButtonComponent } from "./tiptap-button.component";
import { TiptapSeparatorComponent } from "./tiptap-separator.component";
import { ImageService } from "./services/image.service";

export interface ImageMenuConfig {
  change?: boolean;
  resize?: boolean;
  delete?: boolean;
}

@Component({
  selector: "tiptap-image-menu",
  standalone: true,
  imports: [TiptapButtonComponent, TiptapSeparatorComponent],
  template: `
    <div class="tiptap-image-menu">
      @if (config().change) {
      <tiptap-button
        icon="edit"
        title="Changer l'image"
        (onClick)="changeImage()"
      />
      } @if (config().change && (config().resize || config().delete)) {
      <tiptap-separator size="small" />
      } @if (config().resize) {
      <tiptap-button
        icon="crop_square"
        title="Petite (300×200)"
        (onClick)="resizeImageToSmall()"
      />
      <tiptap-button
        icon="crop_landscape"
        title="Moyenne (500×350)"
        (onClick)="resizeImageToMedium()"
      />
      <tiptap-button
        icon="crop_free"
        title="Grande (800×600)"
        (onClick)="resizeImageToLarge()"
      />
      <tiptap-button
        icon="restore"
        title="Taille originale"
        (onClick)="resizeImageToOriginal()"
      />
      } @if (config().resize && config().delete) {
      <tiptap-separator size="small" />
      } @if (config().delete) {
      <tiptap-button
        icon="delete"
        title="Supprimer l'image"
        variant="danger"
        (onClick)="deleteImage()"
      />
      }
    </div>
  `,
  styles: [
    `
      /* Styles pour le menu contextuel des images */
      .tiptap-image-menu {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        padding: 8px 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        z-index: 1000;
        animation: slideUp 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(8px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Responsive */
      @media (max-width: 768px) {
        .tiptap-image-menu {
          padding: 6px 10px;
          gap: 4px;
        }
      }
    `,
  ],
})
export class TiptapImageMenuComponent {
  // Inputs
  editor = input.required<Editor>();
  config = input<ImageMenuConfig>({
    change: true,
    resize: true,
    delete: true,
  });

  // Outputs
  imageChanged = output<{ src: string; alt: string; title: string }>();
  imageDeleted = output<void>();
  imageResized = output<{ size: string }>();

  constructor(private imageService: ImageService) {}

  changeImage() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";

    input.addEventListener("change", (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && file.type.startsWith("image/")) {
        const currentEditor = this.editor();
        if (currentEditor) {
          this.imageService
            .uploadImage(file)
            .then((result) => {
              this.imageService.insertImage(currentEditor, {
                src: result.src,
                alt: result.name,
                title: `${result.name} (${result.width}×${result.height})`,
              });
              this.imageChanged.emit({
                src: result.src,
                alt: result.name,
                title: `${result.name} (${result.width}×${result.height})`,
              });
            })
            .catch((error) => {
              console.error("Erreur lors de l'upload:", error);
            });
        }
      }
    });

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  deleteImage() {
    const currentEditor = this.editor();
    if (!currentEditor) return;

    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) {
      this.imageService.deleteImage(currentEditor);
      this.imageDeleted.emit();
    }
  }

  resizeImageToSmall() {
    const currentEditor = this.editor();
    if (currentEditor) {
      this.imageService.resizeImageToSmall(currentEditor);
      this.imageResized.emit({ size: "small" });
    }
  }

  resizeImageToMedium() {
    const currentEditor = this.editor();
    if (currentEditor) {
      this.imageService.resizeImageToMedium(currentEditor);
      this.imageResized.emit({ size: "medium" });
    }
  }

  resizeImageToLarge() {
    const currentEditor = this.editor();
    if (currentEditor) {
      this.imageService.resizeImageToLarge(currentEditor);
      this.imageResized.emit({ size: "large" });
    }
  }

  resizeImageToOriginal() {
    const currentEditor = this.editor();
    if (currentEditor) {
      this.imageService.resizeImageToOriginal(currentEditor);
      this.imageResized.emit({ size: "original" });
    }
  }
}
