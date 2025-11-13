import { Editor } from "@tiptap/core";
import { SlashCommandItem } from "../tiptap-slash-commands.component";
import { TiptapI18nService } from "../services/i18n.service";

/**
 * Clés des commandes dans l'ordre de création
 */
export const SLASH_COMMAND_KEYS = [
  "heading1",
  "heading2",
  "heading3",
  "bulletList",
  "orderedList",
  "blockquote",
  "code",
  "image",
  "horizontalRule",
  "table",
] as const;

/**
 * Factory function pour créer les slash commands traduits
 */
export function createI18nSlashCommands(
  i18nService: TiptapI18nService
): SlashCommandItem[] {
  const slashCommands = i18nService.slashCommands();

  return [
    {
      title: slashCommands.heading1.title,
      description: slashCommands.heading1.description,
      icon: "format_h1",
      keywords: slashCommands.heading1.keywords,
      command: (editor: Editor) =>
        editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      title: slashCommands.heading2.title,
      description: slashCommands.heading2.description,
      icon: "format_h2",
      keywords: slashCommands.heading2.keywords,
      command: (editor: Editor) =>
        editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      title: slashCommands.heading3.title,
      description: slashCommands.heading3.description,
      icon: "format_h3",
      keywords: slashCommands.heading3.keywords,
      command: (editor: Editor) =>
        editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      title: slashCommands.bulletList.title,
      description: slashCommands.bulletList.description,
      icon: "format_list_bulleted",
      keywords: slashCommands.bulletList.keywords,
      command: (editor: Editor) =>
        editor.chain().focus().toggleBulletList().run(),
    },
    {
      title: slashCommands.orderedList.title,
      description: slashCommands.orderedList.description,
      icon: "format_list_numbered",
      keywords: slashCommands.orderedList.keywords,
      command: (editor: Editor) =>
        editor.chain().focus().toggleOrderedList().run(),
    },
    {
      title: slashCommands.blockquote.title,
      description: slashCommands.blockquote.description,
      icon: "format_quote",
      keywords: slashCommands.blockquote.keywords,
      command: (editor: Editor) =>
        editor.chain().focus().toggleBlockquote().run(),
    },
    {
      title: slashCommands.code.title,
      description: slashCommands.code.description,
      icon: "code",
      keywords: slashCommands.code.keywords,
      command: (editor: Editor) =>
        editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      title: slashCommands.image.title,
      description: slashCommands.image.description,
      icon: "image",
      keywords: slashCommands.image.keywords,
      command: (editor: Editor) => {
        // Créer un input file temporaire pour sélectionner une image
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.style.display = "none";

        input.addEventListener("change", async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file && file.type.startsWith("image/")) {
            try {
              // Utiliser la méthode de compression unifiée
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              const img = new Image();

              img.onload = () => {
                // Vérifier les dimensions (max 1920x1080)
                const maxWidth = 1920;
                const maxHeight = 1080;
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
                          // Utiliser setResizableImage avec toutes les propriétés
                          editor
                            .chain()
                            .focus()
                            .setResizableImage({
                              src: base64,
                              alt: file.name,
                              title: `${file.name} (${Math.round(
                                width
                              )}×${Math.round(height)})`,
                              width: Math.round(width),
                              height: Math.round(height),
                            })
                            .run();
                        }
                      };
                      reader.readAsDataURL(blob);
                    }
                  },
                  file.type,
                  0.8 // qualité de compression
                );
              };

              img.onerror = () => {
                console.error(i18nService.editor().imageLoadError);
              };

              img.src = URL.createObjectURL(file);
            } catch (error) {
              console.error("Error uploading image:", error);
            }
          }
          document.body.removeChild(input);
        });

        document.body.appendChild(input);
        input.click();
      },
    },
    {
      title: slashCommands.horizontalRule.title,
      description: slashCommands.horizontalRule.description,
      icon: "horizontal_rule",
      keywords: slashCommands.horizontalRule.keywords,
      command: (editor: Editor) =>
        editor.chain().focus().setHorizontalRule().run(),
    },
    {
      title: slashCommands.table.title,
      description: slashCommands.table.description,
      icon: "table_view",
      keywords: slashCommands.table.keywords,
      command: (editor: Editor) =>
        editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run(),
    },
  ];
}

/**
 * Fonction utilitaire pour filtrer les slash commands selon les commandes actives
 */
export function filterSlashCommands(
  activeCommands: Set<string>,
  i18nService: TiptapI18nService
): SlashCommandItem[] {
  const allCommands = createI18nSlashCommands(i18nService);

  return allCommands.filter((command, index) => {
    const commandKey = SLASH_COMMAND_KEYS[index];
    return commandKey && activeCommands.has(commandKey);
  });
}
