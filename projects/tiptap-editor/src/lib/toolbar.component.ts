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

      /* Responsive */
      @media (max-width: 768px) {
        .tiptap-toolbar {
          padding: 6px 8px;
          gap: 2px;
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
