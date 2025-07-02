import {
  Component,
  input,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  effect,
  computed,
  inject,
  signal,
} from "@angular/core";
import tippy, { Instance as TippyInstance } from "tippy.js";
import type { Editor } from "@tiptap/core";
import { ImageService } from "./services/image.service";
import { Plugin, PluginKey } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  keywords: string[];
  command: (editor: Editor) => void;
}

export interface SlashCommandsConfig {
  commands?: SlashCommandItem[];
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
      // Logique d'upload d'image
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.style.display = "none";

      input.addEventListener("change", (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file && file.type.startsWith("image/")) {
          // Ici on pourrait utiliser le service d'upload
          const reader = new FileReader();
          reader.onload = (e) => {
            const src = e.target?.result as string;
            if (src) {
              // Utiliser directement setResizableImage car c'est configuré dans l'éditeur
              editor.chain().focus().setResizableImage({ src }).run();
            }
          };
          reader.readAsDataURL(file);
        }
        document.body.removeChild(input);
      });

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

@Component({
  selector: "tiptap-slash-commands",
  standalone: true,
  template: `
    <div #menuRef class="slash-commands-menu">
      @for (command of filteredCommands(); track command.title) {
      <div
        class="slash-command-item"
        [class.selected]="$index === selectedIndex()"
        (click)="executeCommand(command)"
        (mouseenter)="selectedIndex.set($index)"
      >
        <div class="slash-command-icon">
          <span class="material-symbols-outlined">{{ command.icon }}</span>
        </div>
        <div class="slash-command-content">
          <div class="slash-command-title">{{ command.title }}</div>
          <div class="slash-command-description">{{ command.description }}</div>
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .slash-commands-menu {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 8px;
        max-height: 300px;
        overflow-y: auto;
        min-width: 280px;
        outline: none;
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
    `,
  ],
})
export class TiptapSlashCommandsComponent implements OnInit, OnDestroy {
  editor = input.required<Editor>();
  config = input<SlashCommandsConfig>({
    commands: DEFAULT_SLASH_COMMANDS,
  });

  @ViewChild("menuRef", { static: false }) menuRef!: ElementRef<HTMLDivElement>;

  private tippyInstance: TippyInstance | null = null;
  private imageService = inject(ImageService);

  // État local
  private isActive = false;
  private currentQuery = signal("");
  private slashRange: { from: number; to: number } | null = null;

  // Signal pour l'index sélectionné
  selectedIndex = signal(0);

  commands = computed(() => this.config().commands || DEFAULT_SLASH_COMMANDS);

  filteredCommands = computed(() => {
    const query = this.currentQuery().toLowerCase();
    const commands = this.commands();

    if (!query) {
      return commands;
    }

    return commands.filter(
      (command) =>
        command.title.toLowerCase().includes(query) ||
        command.description.toLowerCase().includes(query)
    );
  });

  constructor() {
    effect(() => {
      const ed = this.editor();
      if (!ed) return;

      // Nettoyer les anciens listeners
      ed.off("selectionUpdate", this.updateMenu);
      ed.off("transaction", this.updateMenu);
      ed.off("focus", this.updateMenu);
      ed.off("blur", this.handleBlur);

      // Ajouter les nouveaux listeners
      ed.on("selectionUpdate", this.updateMenu);
      ed.on("transaction", this.updateMenu);
      ed.on("focus", this.updateMenu);
      ed.on("blur", this.handleBlur);

      // Utiliser le système de plugins ProseMirror pour intercepter les touches
      this.addKeyboardPlugin(ed);

      this.updateMenu();
    });
  }

  ngOnInit() {
    this.initTippy();
  }

  ngOnDestroy() {
    const ed = this.editor();
    if (ed) {
      ed.off("selectionUpdate", this.updateMenu);
      ed.off("transaction", this.updateMenu);
      ed.off("focus", this.updateMenu);
      ed.off("blur", this.handleBlur);
    }

    if (this.tippyInstance) {
      this.tippyInstance.destroy();
      this.tippyInstance = null;
    }
  }

  private initTippy() {
    if (!this.menuRef?.nativeElement) {
      setTimeout(() => this.initTippy(), 50);
      return;
    }

    const menuElement = this.menuRef.nativeElement;

    if (this.tippyInstance) {
      this.tippyInstance.destroy();
    }

    this.tippyInstance = tippy(document.body, {
      content: menuElement,
      trigger: "manual",
      placement: "bottom-start",
      appendTo: () => document.body,
      interactive: true,
      arrow: false,
      offset: [0, 8],
      hideOnClick: true,
      getReferenceClientRect: () => this.getSlashRect(),
    });
  }

  private getSlashRect(): DOMRect {
    const ed = this.editor();
    if (!ed || !this.slashRange) {
      return new DOMRect(0, 0, 0, 0);
    }

    try {
      // Utiliser les coordonnées ProseMirror pour plus de précision
      const coords = ed.view.coordsAtPos(this.slashRange.from);
      return new DOMRect(
        coords.left,
        coords.top,
        0,
        coords.bottom - coords.top
      );
    } catch (error) {
      console.warn("Erreur lors du calcul des coordonnées:", error);
      // Fallback sur window.getSelection
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return new DOMRect(0, 0, 0, 0);
      }
      const range = selection.getRangeAt(0);
      return range.getBoundingClientRect();
    }
  }

  updateMenu = () => {
    const ed = this.editor();
    if (!ed) return;

    const { from } = ed.state.selection;

    // Vérifier si on a tapé '/' au début d'une ligne ou après un espace
    const textBefore = ed.state.doc.textBetween(
      Math.max(0, from - 20),
      from,
      "\n"
    );
    const slashMatch = textBefore.match(/(?:^|\s)\/([^\/\s]*)$/);

    if (slashMatch) {
      const query = slashMatch[1] || "";
      const wasActive = this.isActive;

      this.currentQuery.set(query);
      this.slashRange = {
        from: from - slashMatch[0].length + slashMatch[0].indexOf("/"),
        to: from,
      };

      // Si le menu vient de devenir actif, réinitialiser l'index
      if (!wasActive) {
        this.selectedIndex.set(0);
      }

      this.isActive = true;
      this.showTippy();
    } else {
      this.isActive = false;
      this.hideTippy();
    }
  };

  handleBlur = () => {
    setTimeout(() => this.hideTippy(), 100);
  };

  handleKeyDown = (event: KeyboardEvent) => {
    // Ne gérer les touches que si le menu est actif
    if (!this.isActive || this.filteredCommands().length === 0) {
      return;
    }

    console.log(
      "Key pressed:",
      event.key,
      "Active:",
      this.isActive,
      "Commands:",
      this.filteredCommands().length
    );

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        event.stopPropagation();
        const nextIndex =
          (this.selectedIndex() + 1) % this.filteredCommands().length;
        this.selectedIndex.set(nextIndex);
        this.scrollToSelected();
        break;

      case "ArrowUp":
        event.preventDefault();
        event.stopPropagation();
        const prevIndex =
          this.selectedIndex() === 0
            ? this.filteredCommands().length - 1
            : this.selectedIndex() - 1;
        this.selectedIndex.set(prevIndex);
        this.scrollToSelected();
        break;

      case "Enter":
        console.log(
          "Enter pressed, executing command:",
          this.filteredCommands()[this.selectedIndex()]
        );
        event.preventDefault();
        event.stopPropagation();
        const selectedCommand = this.filteredCommands()[this.selectedIndex()];
        if (selectedCommand) {
          this.executeCommand(selectedCommand);
        }
        break;

      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        this.isActive = false;
        this.hideTippy();
        // Optionnel : supprimer le "/" tapé
        const ed = this.editor();
        if (ed && this.slashRange) {
          const { tr } = ed.state;
          tr.delete(this.slashRange.from, this.slashRange.to);
          ed.view.dispatch(tr);
        }
        break;
    }
  };

  private scrollToSelected() {
    // Faire défiler vers l'élément sélectionné
    if (this.menuRef?.nativeElement) {
      const selectedItem = this.menuRef.nativeElement.querySelector(
        ".slash-command-item.selected"
      ) as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }

  private showTippy() {
    if (this.tippyInstance && this.filteredCommands().length > 0) {
      this.tippyInstance.show();
    }
  }

  private hideTippy() {
    if (this.tippyInstance) {
      this.tippyInstance.hide();
    }
  }

  executeCommand(command: SlashCommandItem) {
    const ed = this.editor();
    if (!ed || !this.slashRange) return;

    // Supprimer le texte slash
    const { tr } = ed.state;
    tr.delete(this.slashRange.from, this.slashRange.to);
    ed.view.dispatch(tr);

    // Cacher le menu
    this.hideTippy();

    // Exécuter la commande
    setTimeout(() => {
      command.command(ed);
    }, 10);
  }

  handleGlobalKeyDown = (event: KeyboardEvent) => {
    // Seulement intercepter si le menu est actif et que l'événement vient de l'éditeur
    if (!this.isActive || this.filteredCommands().length === 0) {
      return;
    }

    // Vérifier si l'événement vient de l'éditeur ou de ses enfants
    const ed = this.editor();
    if (!ed || !ed.view.dom.contains(event.target as Node)) {
      return;
    }

    console.log("Global key pressed:", event.key, "Active:", this.isActive);
    this.handleKeyDown(event);
  };

  private addKeyboardPlugin(ed: Editor) {
    // Ajouter un plugin ProseMirror pour intercepter les événements clavier
    const keyboardPlugin = new Plugin({
      key: new PluginKey("slash-commands-keyboard"),
      props: {
        handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
          // Ne gérer que si le menu est actif
          if (!this.isActive || this.filteredCommands().length === 0) {
            return false;
          }

          console.log(
            "ProseMirror key pressed:",
            event.key,
            "Active:",
            this.isActive
          );

          switch (event.key) {
            case "ArrowDown":
              event.preventDefault();
              const nextIndex =
                (this.selectedIndex() + 1) % this.filteredCommands().length;
              this.selectedIndex.set(nextIndex);
              this.scrollToSelected();
              return true;

            case "ArrowUp":
              event.preventDefault();
              const prevIndex =
                this.selectedIndex() === 0
                  ? this.filteredCommands().length - 1
                  : this.selectedIndex() - 1;
              this.selectedIndex.set(prevIndex);
              this.scrollToSelected();
              return true;

            case "Enter":
              console.log(
                "ProseMirror Enter pressed, executing command:",
                this.filteredCommands()[this.selectedIndex()]
              );
              event.preventDefault();
              const selectedCommand =
                this.filteredCommands()[this.selectedIndex()];
              if (selectedCommand) {
                this.executeCommand(selectedCommand);
              }
              return true;

            case "Escape":
              event.preventDefault();
              this.isActive = false;
              this.hideTippy();
              // Supprimer le "/" tapé
              if (this.slashRange) {
                const { tr } = view.state;
                tr.delete(this.slashRange.from, this.slashRange.to);
                view.dispatch(tr);
              }
              return true;
          }

          return false;
        },
      },
    });

    // Ajouter le plugin à l'éditeur
    ed.view.updateState(
      ed.view.state.reconfigure({
        plugins: [keyboardPlugin, ...ed.view.state.plugins],
      })
    );
  }
}
