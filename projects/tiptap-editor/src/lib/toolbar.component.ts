import { Component, input, output, signal } from "@angular/core";
import { Editor } from "@tiptap/core";
import { TiptapButtonComponent } from "./tiptap-button.component";
import { TiptapSeparatorComponent } from "./tiptap-separator.component";
import { TiptapImageUploadComponent } from "./tiptap-image-upload.component";
import { ImageUploadResult } from "./services/image.service";
import { EditorCommandsService } from "./services/editor-commands.service";

export interface ToolbarConfig {
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  code?: boolean;
  heading1?: boolean;
  heading2?: boolean;
  heading3?: boolean;
  bulletList?: boolean;
  orderedList?: boolean;
  blockquote?: boolean;
  image?: boolean;
  undo?: boolean;
  redo?: boolean;
  separator?: boolean;
}

@Component({
  selector: "tiptap-toolbar",
  standalone: true,
  imports: [
    TiptapButtonComponent,
    TiptapSeparatorComponent,
    TiptapImageUploadComponent,
  ],
  template: `
    <div class="tiptap-toolbar">
      @if (config().bold) {
      <tiptap-button
        icon="format_bold"
        title="Bold"
        [active]="isActive('bold')"
        [disabled]="!canExecute('toggleBold')"
        (onClick)="toggleBold()"
      />
      } @if (config().italic) {
      <tiptap-button
        icon="format_italic"
        title="Italic"
        [active]="isActive('italic')"
        [disabled]="!canExecute('toggleItalic')"
        (onClick)="toggleItalic()"
      />
      } @if (config().strike) {
      <tiptap-button
        icon="strikethrough_s"
        title="Strikethrough"
        [active]="isActive('strike')"
        [disabled]="!canExecute('toggleStrike')"
        (onClick)="toggleStrike()"
      />
      } @if (config().code) {
      <tiptap-button
        icon="code"
        title="Code"
        [active]="isActive('code')"
        [disabled]="!canExecute('toggleCode')"
        (onClick)="toggleCode()"
      />
      } @if (config().separator && (config().heading1 || config().heading2 ||
      config().heading3)) {
      <tiptap-separator />
      } @if (config().heading1) {
      <tiptap-button
        icon="format_h1"
        title="Heading 1"
        variant="text"
        [active]="isActive('heading', { level: 1 })"
        (onClick)="toggleHeading(1)"
      />
      } @if (config().heading2) {
      <tiptap-button
        icon="format_h2"
        title="Heading 2"
        variant="text"
        [active]="isActive('heading', { level: 2 })"
        (onClick)="toggleHeading(2)"
      />
      } @if (config().heading3) {
      <tiptap-button
        icon="format_h3"
        title="Heading 3"
        variant="text"
        [active]="isActive('heading', { level: 3 })"
        (onClick)="toggleHeading(3)"
      />
      } @if (config().separator && (config().bulletList || config().orderedList
      || config().blockquote)) {
      <tiptap-separator />
      } @if (config().bulletList) {
      <tiptap-button
        icon="format_list_bulleted"
        title="Bullet List"
        [active]="isActive('bulletList')"
        (onClick)="toggleBulletList()"
      />
      } @if (config().orderedList) {
      <tiptap-button
        icon="format_list_numbered"
        title="Ordered List"
        [active]="isActive('orderedList')"
        (onClick)="toggleOrderedList()"
      />
      } @if (config().blockquote) {
      <tiptap-button
        icon="format_quote"
        title="Blockquote"
        [active]="isActive('blockquote')"
        (onClick)="toggleBlockquote()"
      />
      } @if (config().separator && config().image) {
      <tiptap-separator />
      } @if (config().image) {
      <tiptap-image-upload
        (imageSelected)="onImageSelected($event)"
        (error)="onImageError($event)"
      />
      } @if (config().separator && (config().undo || config().redo)) {
      <tiptap-separator />
      } @if (config().undo) {
      <tiptap-button
        icon="undo"
        title="Undo"
        [disabled]="!canExecute('undo')"
        (onClick)="undo()"
      />
      } @if (config().redo) {
      <tiptap-button
        icon="redo"
        title="Redo"
        [disabled]="!canExecute('redo')"
        (onClick)="redo()"
      />
      }
    </div>
  `,
  styles: [
    `
      /* Styles de base pour la toolbar */
      .tiptap-toolbar {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 12px;
        background: #f8f9fa;
        border-bottom: 1px solid #e2e8f0;
        flex-wrap: wrap;
        min-height: 48px;
        position: relative;
      }

      /* Groupe de boutons */
      .toolbar-group {
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 0 4px;
      }

      /* Séparateur entre groupes */
      .toolbar-separator {
        width: 1px;
        height: 24px;
        background: #e2e8f0;
        margin: 0 4px;
      }

      /* Styles pour les boutons avec :host ::ng-deep */
      :host ::ng-deep .tiptap-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border: none;
        background: transparent;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        color: #64748b;
        position: relative;
        overflow: hidden;
      }

      :host ::ng-deep .tiptap-button::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        opacity: 0;
        transition: opacity 0.2s ease;
        border-radius: 8px;
      }

      :host ::ng-deep .tiptap-button:hover {
        color: #6366f1;
        transform: translateY(-1px);
      }

      :host ::ng-deep .tiptap-button:hover::before {
        opacity: 0.1;
      }

      :host ::ng-deep .tiptap-button:active {
        transform: translateY(0);
      }

      :host ::ng-deep .tiptap-button.is-active {
        color: #6366f1;
        background: rgba(99, 102, 241, 0.1);
      }

      :host ::ng-deep .tiptap-button.is-active::before {
        opacity: 0.15;
      }

      :host ::ng-deep .tiptap-button.is-active:hover {
        background: rgba(99, 102, 241, 0.15);
      }

      :host ::ng-deep .tiptap-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      :host ::ng-deep .tiptap-button:disabled:hover {
        transform: none;
        color: #64748b;
      }

      :host ::ng-deep .tiptap-button:disabled::before {
        opacity: 0;
      }

      /* Icônes Material Symbols */
      :host ::ng-deep .tiptap-button .material-symbols-outlined {
        font-size: 20px;
        position: relative;
        z-index: 1;
      }

      /* Boutons avec texte */
      :host ::ng-deep .tiptap-button.text-button {
        width: auto;
        padding: 0 12px;
        font-size: 14px;
        font-weight: 500;
      }

      /* Boutons de couleur */
      :host ::ng-deep .tiptap-button.color-button {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid transparent;
        transition: all 0.2s ease;
      }

      :host ::ng-deep .tiptap-button.color-button:hover {
        border-color: #e2e8f0;
        transform: scale(1.1);
      }

      :host ::ng-deep .tiptap-button.color-button.is-active {
        border-color: #6366f1;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
      }

      /* Menu déroulant */
      :host ::ng-deep .dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        min-width: 200px;
        max-height: 300px;
        overflow-y: auto;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-8px);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      :host ::ng-deep .dropdown-menu.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      :host ::ng-deep .dropdown-item {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        cursor: pointer;
        transition: background 0.2s ease;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        font-size: 14px;
        color: #2d3748;
      }

      :host ::ng-deep .dropdown-item:hover {
        background: #f7fafc;
      }

      :host ::ng-deep .dropdown-item.is-active {
        background: rgba(99, 102, 241, 0.1);
        color: #6366f1;
        font-weight: 500;
      }

      :host ::ng-deep .dropdown-separator {
        height: 1px;
        background: #e2e8f0;
        margin: 4px 0;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .tiptap-toolbar {
          padding: 6px 8px;
          gap: 2px;
        }

        :host ::ng-deep .tiptap-button {
          width: 32px;
          height: 32px;
        }

        :host ::ng-deep .tiptap-button .material-symbols-outlined {
          font-size: 18px;
        }

        .toolbar-group {
          gap: 1px;
        }
      }

      /* Animation d'apparition */
      @keyframes toolbarSlideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .tiptap-toolbar {
        animation: toolbarSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
    `,
  ],
})
export class TiptapToolbarComponent {
  editor = input.required<Editor>();
  config = input.required<ToolbarConfig>();

  // Outputs pour les événements d'image
  imageUploaded = output<ImageUploadResult>();
  imageError = output<string>();

  constructor(private editorCommands: EditorCommandsService) {}

  isActive(name: string, attributes?: Record<string, any>): boolean {
    return this.editorCommands.isActive(this.editor(), name, attributes);
  }

  canExecute(command: string): boolean {
    return this.editorCommands.canExecute(this.editor(), command);
  }

  toggleBold() {
    this.editorCommands.toggleBold(this.editor());
  }
  toggleItalic() {
    this.editorCommands.toggleItalic(this.editor());
  }
  toggleStrike() {
    this.editorCommands.toggleStrike(this.editor());
  }
  toggleCode() {
    this.editorCommands.toggleCode(this.editor());
  }
  toggleHeading(level: 1 | 2 | 3) {
    this.editorCommands.toggleHeading(this.editor(), level);
  }
  toggleBulletList() {
    this.editorCommands.toggleBulletList(this.editor());
  }
  toggleOrderedList() {
    this.editorCommands.toggleOrderedList(this.editor());
  }
  toggleBlockquote() {
    this.editorCommands.toggleBlockquote(this.editor());
  }
  undo() {
    this.editorCommands.undo(this.editor());
  }
  redo() {
    this.editorCommands.redo(this.editor());
  }

  // Méthodes pour les événements d'image
  onImageSelected(result: ImageUploadResult) {
    this.imageUploaded.emit(result);
  }

  onImageError(error: string) {
    this.imageError.emit(error);
  }
}
