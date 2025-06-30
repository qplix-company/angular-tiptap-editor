import { Injectable } from "@angular/core";
import { Editor } from "@tiptap/core";

@Injectable({
  providedIn: "root",
})
export class EditorCommandsService {
  // Méthodes pour vérifier l'état actif
  isActive(
    editor: Editor,
    name: string,
    attributes?: Record<string, any>
  ): boolean {
    return editor.isActive(name, attributes);
  }

  // Méthodes pour vérifier si une commande peut être exécutée
  canExecute(editor: Editor, command: string): boolean {
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

  // Méthodes pour exécuter les commandes
  toggleBold(editor: Editor): void {
    editor.chain().focus().toggleBold().run();
  }

  toggleItalic(editor: Editor): void {
    editor.chain().focus().toggleItalic().run();
  }

  toggleStrike(editor: Editor): void {
    editor.chain().focus().toggleStrike().run();
  }

  toggleCode(editor: Editor): void {
    editor.chain().focus().toggleCode().run();
  }

  toggleHeading(editor: Editor, level: 1 | 2 | 3): void {
    editor.chain().focus().toggleHeading({ level }).run();
  }

  toggleBulletList(editor: Editor): void {
    editor.chain().focus().toggleBulletList().run();
  }

  toggleOrderedList(editor: Editor): void {
    editor.chain().focus().toggleOrderedList().run();
  }

  toggleBlockquote(editor: Editor): void {
    editor.chain().focus().toggleBlockquote().run();
  }

  undo(editor: Editor): void {
    editor.chain().focus().undo().run();
  }

  redo(editor: Editor): void {
    editor.chain().focus().redo().run();
  }
}
