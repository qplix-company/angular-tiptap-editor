import { Component, input, output, signal } from "@angular/core";
import { Editor } from "@tiptap/core";
import { TiptapButtonComponent } from "./tiptap-button.component";
import { TiptapSeparatorComponent } from "./tiptap-separator.component";
import {
  TiptapImageUploadComponent,
  ImageUploadResult,
} from "./tiptap-image-upload.component";

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
      .tiptap-toolbar {
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 8px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

  isActive(name: string, attributes?: Record<string, any>): boolean {
    return this.editor().isActive(name, attributes);
  }

  canExecute(command: string): boolean {
    const editor = this.editor();
    if (!editor) return false;
    switch (command) {
      case "toggleBold":
        return editor.can().chain().focus().toggleBold().run();
      case "toggleItalic":
        return editor.can().chain().focus().toggleItalic().run();
      case "toggleStrike":
        return editor.can().chain().focus().toggleStrike().run();
      case "toggleCode":
        return editor.can().chain().focus().toggleCode().run();
      case "undo":
        return editor.can().chain().focus().undo().run();
      case "redo":
        return editor.can().chain().focus().redo().run();
      default:
        return false;
    }
  }

  toggleBold() {
    this.editor().chain().focus().toggleBold().run();
  }
  toggleItalic() {
    this.editor().chain().focus().toggleItalic().run();
  }
  toggleStrike() {
    this.editor().chain().focus().toggleStrike().run();
  }
  toggleCode() {
    this.editor().chain().focus().toggleCode().run();
  }
  toggleHeading(level: 1 | 2 | 3) {
    this.editor().chain().focus().toggleHeading({ level }).run();
  }
  toggleBulletList() {
    this.editor().chain().focus().toggleBulletList().run();
  }
  toggleOrderedList() {
    this.editor().chain().focus().toggleOrderedList().run();
  }
  toggleBlockquote() {
    this.editor().chain().focus().toggleBlockquote().run();
  }
  undo() {
    this.editor().chain().focus().undo().run();
  }
  redo() {
    this.editor().chain().focus().redo().run();
  }

  // Méthodes pour la gestion des images
  onImageSelected(result: ImageUploadResult) {
    // Insérer l'image dans l'éditeur
    this.editor()
      .chain()
      .focus()
      .setResizableImage({
        src: result.src,
        alt: result.name,
        title: `${result.name} (${result.width}×${result.height})`,
        width: result.width,
        height: result.height,
      })
      .run();
    this.imageUploaded.emit(result);
  }

  onImageError(error: string) {
    this.imageError.emit(error);
  }
}
