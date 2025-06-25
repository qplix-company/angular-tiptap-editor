import { Extension } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { Plugin } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  keywords: string[];
  command: (editor: any) => void;
}

export interface SlashCommandsOptions {
  commands?: SlashCommandItem[];
  onImageUpload?: (
    file: File
  ) => Promise<{ src: string; name: string; width?: number; height?: number }>;
}

export const DEFAULT_SLASH_COMMANDS: SlashCommandItem[] = [
  {
    title: "Titre 1",
    description: "Grand titre de section",
    icon: "format_h1",
    keywords: ["heading", "h1", "titre", "title", "1"],
    command: (editor) =>
      editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: "Titre 2",
    description: "Titre de sous-section",
    icon: "format_h2",
    keywords: ["heading", "h2", "titre", "title", "2"],
    command: (editor) =>
      editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: "Titre 3",
    description: "Petit titre",
    icon: "format_h3",
    keywords: ["heading", "h3", "titre", "title", "3"],
    command: (editor) =>
      editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: "Liste à puces",
    description: "Créer une liste à puces",
    icon: "format_list_bulleted",
    keywords: ["bullet", "list", "liste", "puces", "ul"],
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: "Liste numérotée",
    description: "Créer une liste numérotée",
    icon: "format_list_numbered",
    keywords: ["numbered", "list", "liste", "numérotée", "ol", "ordered"],
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: "Citation",
    description: "Ajouter une citation",
    icon: "format_quote",
    keywords: ["quote", "blockquote", "citation"],
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: "Code",
    description: "Bloc de code",
    icon: "code",
    keywords: ["code", "codeblock", "pre"],
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    title: "Image",
    description: "Insérer une image",
    icon: "image",
    keywords: ["image", "photo", "picture", "img"],
    command: (editor) => {
      // Créer un input file temporaire pour sélectionner une image
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.style.display = "none";

      input.addEventListener("change", (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file && file.type.startsWith("image/")) {
          // Utiliser la fonction de callback si disponible, sinon utiliser le comportement par défaut
          const options = editor.extensionManager.extensions.find(
            (ext: any) => ext.name === "slashCommands"
          )?.options as SlashCommandsOptions;

          if (options?.onImageUpload) {
            // Utiliser le service d'upload
            options
              .onImageUpload(file)
              .then((result) => {
                editor
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
              })
              .catch((error) => {
                console.error("Erreur lors de l'upload:", error);
              });
          } else {
            // Comportement par défaut avec compression locale
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
                        // Insérer l'image dans l'éditeur
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
              console.error("Erreur lors du chargement de l'image");
            };

            img.src = URL.createObjectURL(file);
          }
        }

        // Nettoyer l'input
        document.body.removeChild(input);
      });

      // Ajouter l'input au DOM et déclencher le clic
      document.body.appendChild(input);
      input.click();
    },
  },
  {
    title: "Ligne horizontale",
    description: "Ajouter une ligne de séparation",
    icon: "horizontal_rule",
    keywords: ["hr", "horizontal", "rule", "ligne", "séparation"],
    command: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
];

interface SlashCommandsState {
  active: boolean;
  range: { from: number; to: number } | null;
  query: string;
  filteredCommands: SlashCommandItem[];
  selectedIndex: number;
}

export const SlashCommands = Extension.create({
  name: "slashCommands",

  addOptions() {
    return {
      commands: DEFAULT_SLASH_COMMANDS,
      onImageUpload: undefined,
    } as SlashCommandsOptions;
  },

  addProseMirrorPlugins() {
    const commands = this.options.commands as SlashCommandItem[];
    let menuElement: HTMLElement | null = null;

    const filterCommands = (query: string): SlashCommandItem[] => {
      if (!query) return commands;

      const lowerQuery = query.toLowerCase();
      return commands.filter(
        (command) =>
          command.title.toLowerCase().includes(lowerQuery) ||
          command.description.toLowerCase().includes(lowerQuery) ||
          command.keywords.some((keyword) =>
            keyword.toLowerCase().includes(lowerQuery)
          )
      );
    };

    const createMenu = (): HTMLElement => {
      const menu = document.createElement("div");
      menu.className = "slash-commands-menu";
      menu.setAttribute("tabindex", "-1");
      menu.setAttribute("role", "listbox");
      menu.setAttribute("aria-label", "Commandes disponibles");
      menu.style.cssText = `
        position: fixed;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 8px;
        z-index: 1000;
        max-height: 300px;
        overflow-y: auto;
        min-width: 280px;
        animation: fadeIn 0.2s ease-out;
        outline: none;
      `;

      // Ajouter les styles CSS pour l'animation
      if (!document.querySelector("#slash-commands-styles")) {
        const style = document.createElement("style");
        style.id = "slash-commands-styles";
        style.textContent = `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-8px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .slash-command-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 2px solid transparent;
            outline: none;
          }
          .slash-command-item:hover {
            background: #f1f5f9;
            border-color: #e2e8f0;
          }
          .slash-command-item.selected {
            background: #e6f3ff;
            border-color: #3182ce;
            box-shadow: 0 0 0 1px #3182ce;
          }
          .slash-command-item:focus {
            outline: 2px solid #3182ce;
            outline-offset: 2px;
          }
          .slash-command-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: #f8f9fa;
            border-radius: 6px;
            color: #3182ce;
            flex-shrink: 0;
          }
          .slash-command-icon .material-symbols-outlined {
            font-size: 18px;
          }
          .slash-command-content {
            flex: 1;
            min-width: 0;
          }
          .slash-command-title {
            font-weight: 600;
            color: #2d3748;
            font-size: 14px;
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .slash-command-description {
            color: #718096;
            font-size: 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .slash-command-active {
            background: #e6f3ff;
            border-radius: 3px;
            padding: 0 2px;
          }
        `;
        document.head.appendChild(style);
      }

      return menu;
    };

    const updateMenu = (view: any, state: SlashCommandsState) => {
      if (!state.active || state.filteredCommands.length === 0) {
        hideMenu();
        return;
      }

      if (!menuElement) {
        menuElement = createMenu();
        document.body.appendChild(menuElement);
      }

      // Vider le menu
      menuElement.innerHTML = "";

      // Ajouter les commandes filtrées
      state.filteredCommands.forEach((command, index) => {
        const item = document.createElement("div");
        item.className = `slash-command-item ${
          index === state.selectedIndex ? "selected" : ""
        }`;
        item.setAttribute("data-index", index.toString());
        item.setAttribute("role", "button");
        item.setAttribute("tabindex", "0");
        item.setAttribute(
          "data-command",
          command.title.toLowerCase().replace(/\s+/g, "-")
        );

        item.innerHTML = `
          <div class="slash-command-icon">
            <span class="material-symbols-outlined">${command.icon}</span>
          </div>
          <div class="slash-command-content">
            <div class="slash-command-title">${command.title}</div>
            <div class="slash-command-description">${command.description}</div>
          </div>
        `;

        item.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (state.range) {
            executeCommand(view, command, state.range);
          }
        });

        // Ajouter la gestion des événements clavier pour chaque item
        item.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            if (state.range) {
              executeCommand(view, command, state.range);
            }
          }
        });

        // Ajouter un gestionnaire mousedown pour une meilleure réactivité
        item.addEventListener("mousedown", (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (state.range) {
            executeCommand(view, command, state.range);
          }
        });

        menuElement!.appendChild(item);
      });

      // Positionner le menu
      positionMenu(view, state);

      // Faire défiler vers l'élément sélectionné si nécessaire
      const selectedItem = menuElement.querySelector(
        ".slash-command-item.selected"
      ) as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    };

    const positionMenu = (view: any, state: SlashCommandsState) => {
      if (!menuElement || !state.range) return;

      try {
        const { from } = state.range;
        const coords = view.coordsAtPos(from);

        // Utiliser position fixed et ajuster selon la position dans la fenêtre
        const rect = view.dom.getBoundingClientRect();
        const left = coords.left;
        const top = coords.bottom + 5;

        menuElement.style.left = `${left}px`;
        menuElement.style.top = `${top}px`;

        // S'assurer que le menu reste dans la fenêtre
        const menuRect = menuElement.getBoundingClientRect();
        if (menuRect.right > window.innerWidth) {
          menuElement.style.left = `${
            window.innerWidth - menuRect.width - 10
          }px`;
        }
        if (menuRect.bottom > window.innerHeight) {
          menuElement.style.top = `${coords.top - menuRect.height - 5}px`;
        }
      } catch (error) {
        console.warn("Erreur lors du positionnement du menu slash:", error);
      }
    };

    const hideMenu = () => {
      if (menuElement) {
        menuElement.remove();
        menuElement = null;
      }
    };

    const executeCommand = (
      view: any,
      command: SlashCommandItem,
      range: { from: number; to: number }
    ) => {
      const { tr } = view.state;
      const { from, to } = range;

      // Supprimer le texte slash
      tr.delete(from, to);
      view.dispatch(tr);

      // Masquer le menu immédiatement
      hideMenu();

      // Exécuter la commande avec l'éditeur après un court délai pour s'assurer que la transaction est terminée
      setTimeout(() => {
        try {
          command.command(this.editor);
        } catch (error) {
          console.warn(
            "Erreur lors de l'exécution de la commande slash:",
            error
          );
        }
      }, 10);
    };

    const pluginKey = new PluginKey("slashCommands");

    return [
      new Plugin<SlashCommandsState>({
        key: pluginKey,
        state: {
          init(): SlashCommandsState {
            return {
              active: false,
              range: null,
              query: "",
              filteredCommands: [],
              selectedIndex: 0,
            };
          },
          apply(tr, prev): SlashCommandsState {
            // Vérifier d'abord les métadonnées personnalisées
            const meta = tr.getMeta(pluginKey);
            if (meta?.type === "updateSelectedIndex") {
              return {
                ...prev,
                selectedIndex: meta.selectedIndex,
              };
            }

            const { selection } = tr;
            const { from, to } = selection;

            // Vérifier si on a tapé '/' au début d'une ligne ou après un espace
            const textBefore = tr.doc.textBetween(
              Math.max(0, from - 20),
              from,
              "\n"
            );
            const slashMatch = textBefore.match(/(?:^|\s)\/([^\/\s]*)$/);

            if (slashMatch) {
              const query = slashMatch[1] || "";
              const filteredCommands = filterCommands(query);

              return {
                active: true,
                range: {
                  from:
                    from - slashMatch[0].length + slashMatch[0].indexOf("/"),
                  to: from,
                },
                query,
                filteredCommands,
                selectedIndex: 0,
              };
            }

            // Si on était actif mais plus maintenant, désactiver
            if (prev.active) {
              // Vérifier si on a encore le pattern slash
              const currentText = tr.doc.textBetween(
                Math.max(0, from - 20),
                from,
                "\n"
              );
              const currentMatch = currentText.match(/(?:^|\s)\/([^\/\s]*)$/);

              if (currentMatch) {
                const query = currentMatch[1] || "";
                const filteredCommands = filterCommands(query);

                return {
                  active: true,
                  range: {
                    from:
                      from -
                      currentMatch[0].length +
                      currentMatch[0].indexOf("/"),
                    to: from,
                  },
                  query,
                  filteredCommands,
                  selectedIndex: Math.min(
                    prev.selectedIndex,
                    Math.max(0, filteredCommands.length - 1)
                  ),
                };
              }
            }

            return {
              active: false,
              range: null,
              query: "",
              filteredCommands: [],
              selectedIndex: 0,
            };
          },
        },
        props: {
          decorations(state) {
            const pluginState = pluginKey.getState(state) as SlashCommandsState;
            if (!pluginState?.active || !pluginState.range) return null;

            return DecorationSet.create(state.doc, [
              Decoration.inline(pluginState.range.from, pluginState.range.to, {
                class: "slash-command-active",
              }),
            ]);
          },
          handleKeyDown(view, event) {
            const pluginState = pluginKey.getState(
              view.state
            ) as SlashCommandsState;
            if (
              !pluginState?.active ||
              pluginState.filteredCommands.length === 0
            )
              return false;

            if (event.key === "ArrowDown") {
              event.preventDefault();
              event.stopPropagation();
              const newIndex =
                (pluginState.selectedIndex + 1) %
                pluginState.filteredCommands.length;

              // Créer une nouvelle transaction pour mettre à jour l'état
              const { tr } = view.state;
              tr.setMeta(pluginKey, {
                type: "updateSelectedIndex",
                selectedIndex: newIndex,
              });
              view.dispatch(tr);
              return true;
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              event.stopPropagation();
              const newIndex =
                pluginState.selectedIndex === 0
                  ? pluginState.filteredCommands.length - 1
                  : pluginState.selectedIndex - 1;

              // Créer une nouvelle transaction pour mettre à jour l'état
              const { tr } = view.state;
              tr.setMeta(pluginKey, {
                type: "updateSelectedIndex",
                selectedIndex: newIndex,
              });
              view.dispatch(tr);
              return true;
            }

            if (event.key === "Enter") {
              event.preventDefault();
              event.stopPropagation();
              const selectedCommand =
                pluginState.filteredCommands[pluginState.selectedIndex];
              if (selectedCommand && pluginState.range) {
                executeCommand(view, selectedCommand, pluginState.range);
              }
              return true;
            }

            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              hideMenu();
              // Supprimer le texte slash
              if (pluginState.range) {
                const { tr } = view.state;
                tr.delete(pluginState.range.from, pluginState.range.to);
                view.dispatch(tr);
              }
              return true;
            }

            // Permettre la saisie normale de texte
            if (
              event.key.length === 1 ||
              event.key === "Backspace" ||
              event.key === "Delete"
            ) {
              return false;
            }

            return false;
          },
        },
        view() {
          return {
            update: (view) => {
              const pluginState = pluginKey.getState(
                view.state
              ) as SlashCommandsState;
              if (pluginState) {
                updateMenu(view, pluginState);
              }
            },
            destroy: () => {
              hideMenu();
            },
          };
        },
      }),
    ];
  },
});
