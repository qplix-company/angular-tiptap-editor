import { Component, input, output, signal, inject } from "@angular/core";
import { Editor } from "@tiptap/core";
import { TiptapButtonComponent } from "./tiptap-button.component";
import { TiptapSeparatorComponent } from "./tiptap-separator.component";
import { ImageUploadResult, ImageService } from "./services/image.service";
import { EditorCommandsService } from "./services/editor-commands.service";
import { TiptapI18nService } from "./services/i18n.service";

export interface ToolbarConfig {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  highlight?: boolean;
  heading1?: boolean;
  heading2?: boolean;
  heading3?: boolean;
  bulletList?: boolean;
  orderedList?: boolean;
  blockquote?: boolean;
  alignLeft?: boolean;
  alignCenter?: boolean;
  alignRight?: boolean;
  alignJustify?: boolean;
  link?: boolean;
  image?: boolean;
  horizontalRule?: boolean;
  table?: boolean;
  undo?: boolean;
  redo?: boolean;
  clear?: boolean;
  separator?: boolean;
}

@Component({
  selector: "tiptap-toolbar",
  standalone: true,
  imports: [TiptapButtonComponent, TiptapSeparatorComponent],
  templateUrl: "./tiptap-toolbar.component.html",
  styleUrls: ["./tiptap-toolbar.component.css"],
})
export class TiptapToolbarComponent {
  editor = input.required<Editor>();
  config = input.required<ToolbarConfig>();

  // Outputs pour les événements d'image
  imageUploaded = output<ImageUploadResult>();
  imageError = output<string>();

  private imageService = inject(ImageService);
  private i18nService = inject(TiptapI18nService);

  // Computed values pour les traductions
  readonly t = this.i18nService.toolbar;

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

  // Nouvelles méthodes pour les formatages supplémentaires
  toggleUnderline() {
    this.editorCommands.toggleUnderline(this.editor());
  }
  toggleSuperscript() {
    this.editorCommands.toggleSuperscript(this.editor());
  }
  toggleSubscript() {
    this.editorCommands.toggleSubscript(this.editor());
  }
  setTextAlign(alignment: "left" | "center" | "right" | "justify") {
    this.editorCommands.setTextAlign(this.editor(), alignment);
  }
  toggleLink() {
    this.editorCommands.toggleLink(this.editor());
  }
  insertHorizontalRule() {
    this.editorCommands.insertHorizontalRule(this.editor());
  }
  toggleHighlight() {
    this.editorCommands.toggleHighlight(this.editor());
  }

  // Méthode pour insérer un tableau
  insertTable() {
    this.editorCommands.insertTable(this.editor());
  }

  // Méthode pour insérer une image
  async insertImage() {
    try {
      await this.imageService.selectAndUploadImage(this.editor());
    } catch (error) {
      console.error("Erreur lors de l'upload d'image:", error);
      this.imageError.emit("Erreur lors de l'upload d'image");
    }
  }

  // Méthode pour vider le contenu
  clearContent() {
    this.editorCommands.clearContent(this.editor());
  }

  // Méthodes pour les événements d'image (conservées pour compatibilité)
  onImageSelected(result: ImageUploadResult) {
    this.imageUploaded.emit(result);
  }

  onImageError(error: string) {
    this.imageError.emit(error);
  }
}
