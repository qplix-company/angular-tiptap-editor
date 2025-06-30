import {
  Component,
  ElementRef,
  input,
  output,
  OnInit,
  OnDestroy,
  viewChild,
  forwardRef,
  effect,
  signal,
  computed,
  AfterViewInit,
  inject,
  Injector,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Editor, Extension, Node, Mark } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import BubbleMenu from "@tiptap/extension-bubble-menu";
import OfficePaste from "@intevation/tiptap-extension-office-paste";
import { SlashCommands } from "./slash-commands.extension";
import { ResizableImage } from "./extensions/resizable-image.extension";
import { TiptapBubbleMenuComponent } from "./bubble-menu.component";
import { TiptapToolbarComponent } from "./toolbar.component";
import { TiptapImageUploadComponent } from "./tiptap-image-upload.component";
import { ImageService } from "./services/image.service";
import { ImageUploadResult } from "./services/image.service";
import { ToolbarConfig } from "./toolbar.component";
import { BubbleMenuConfig } from "./bubble-menu.component";

// Configuration par défaut de la toolbar
export const DEFAULT_TOOLBAR_CONFIG: ToolbarConfig = {
  bold: true,
  italic: true,
  strike: true,
  code: true,
  heading1: true,
  heading2: true,
  heading3: true,
  bulletList: true,
  orderedList: true,
  blockquote: true,
  image: true,
  undo: true,
  redo: true,
  separator: true,
};

// Configuration par défaut du bubble menu
export const DEFAULT_BUBBLE_MENU_CONFIG: BubbleMenuConfig = {
  bold: true,
  italic: true,
  strike: true,
  code: true,
  separator: true,
};

@Component({
  selector: "tiptap-editor",
  standalone: true,
  imports: [
    TiptapBubbleMenuComponent,
    TiptapToolbarComponent,
    TiptapImageUploadComponent,
  ],
  template: `
    <div class="tiptap-editor">
      <!-- Toolbar -->
      @if (showToolbar() && editor()) {
      <tiptap-toolbar [editor]="editor()!" [config]="toolbarConfig()">
        <div image-upload class="image-upload-container">
          <tiptap-image-upload
            [config]="imageUploadConfig()"
            (imageSelected)="onImageUploaded($event)"
            (error)="onImageUploadError($event)"
          />
        </div>
      </tiptap-toolbar>
      }

      <!-- Contenu de l'éditeur -->
      <div
        #editorElement
        class="tiptap-content"
        [class.drag-over]="isDragOver()"
        (dragover)="onDragOver($event)"
        (drop)="onDrop($event)"
      ></div>

      <!-- Compteur de caractères -->
      @if (showCharacterCount() && characterCountData()) {
      <div class="character-count">
        {{ characterCountData()?.characters }} caractères,
        {{ characterCountData()?.words }} mots @if (maxCharacters()) { /
        {{ maxCharacters() }}
        }
      </div>
      }
    </div>

    <!-- Bubble Menu Angular -->
    @if (showBubbleMenu() && editor()) {
    <tiptap-bubble-menu
      [editor]="editor()!"
      [config]="bubbleMenuConfig()"
      (commandExecuted)="onBubbleMenuCommand($event)"
    >
    </tiptap-bubble-menu>
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TiptapEditorComponent),
      multi: true,
    },
  ],
  styles: [
    `
      .tiptap-editor {
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        background: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: border-color 0.2s ease;
      }

      .tiptap-editor:focus-within {
        border-color: #3182ce;
        box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
      }

      .image-upload-container {
        position: relative;
        display: inline-block;
      }

      .tiptap-content {
        padding: 16px;
        min-height: 200px;
        outline: none;
        position: relative;
      }

      .tiptap-content.drag-over {
        background: #f0f8ff;
        border: 2px dashed #3182ce;
      }

      .character-count {
        padding: 8px 16px;
        font-size: 12px;
        color: #718096;
        text-align: right;
        border-top: 1px solid #e2e8f0;
        background: #f8f9fa;
      }

      :host ::ng-deep .ProseMirror {
        outline: none;
        line-height: 1.6;
        color: #2d3748;
      }

      :host ::ng-deep .ProseMirror h1 {
        font-size: 2em;
        font-weight: bold;
        margin-top: 0;
        margin-bottom: 0.5em;
      }

      :host ::ng-deep .ProseMirror h2 {
        font-size: 1.5em;
        font-weight: bold;
        margin-top: 1em;
        margin-bottom: 0.5em;
      }

      :host ::ng-deep .ProseMirror h3 {
        font-size: 1.25em;
        font-weight: bold;
        margin-top: 1em;
        margin-bottom: 0.5em;
      }

      :host ::ng-deep .ProseMirror p {
        margin: 0.5em 0;
      }

      :host ::ng-deep .ProseMirror ul,
      :host ::ng-deep .ProseMirror ol {
        padding-left: 2em;
        margin: 0.5em 0;
      }

      :host ::ng-deep .ProseMirror blockquote {
        border-left: 4px solid #e2e8f0;
        padding-left: 1em;
        margin: 1em 0;
        font-style: italic;
        background: #f8f9fa;
        padding: 0.5em 1em;
        border-radius: 0 4px 4px 0;
      }

      :host ::ng-deep .ProseMirror code {
        background: #f1f5f9;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-family: "Monaco", "Consolas", monospace;
        font-size: 0.9em;
      }

      :host ::ng-deep .ProseMirror pre {
        background: #1a202c;
        color: #e2e8f0;
        padding: 1em;
        border-radius: 6px;
        overflow-x: auto;
        margin: 1em 0;
      }

      :host ::ng-deep .ProseMirror pre code {
        background: none;
        color: inherit;
        padding: 0;
      }

      :host ::ng-deep .ProseMirror img {
        max-width: 100%;
        height: auto;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin: 0.5em 0;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      :host ::ng-deep .ProseMirror img:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      :host ::ng-deep .ProseMirror img.ProseMirror-selectednode {
        outline: 2px solid #3182ce;
        outline-offset: 2px;
      }

      /* Styles pour l'alignement des images */
      :host ::ng-deep .ProseMirror .image-container {
        text-align: center;
        margin: 1em 0;
      }

      :host ::ng-deep .ProseMirror .image-container.image-align-left {
        text-align: left;
      }

      :host ::ng-deep .ProseMirror .image-container.image-align-center {
        text-align: center;
      }

      :host ::ng-deep .ProseMirror .image-container.image-align-right {
        text-align: right;
      }

      :host ::ng-deep .ProseMirror .image-container img {
        display: inline-block;
        margin: 0;
      }

      /* Poignées de redimensionnement */
      :host ::ng-deep .ProseMirror img.ProseMirror-selectednode::after {
        content: "";
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        border: 2px solid #3182ce;
        border-radius: 8px;
        pointer-events: none;
      }

      :host ::ng-deep .ProseMirror .resize-handle {
        position: absolute;
        width: 8px;
        height: 8px;
        background: #3182ce;
        border: 2px solid white;
        border-radius: 50%;
        cursor: pointer;
      }

      :host ::ng-deep .ProseMirror .resize-handle.nw {
        top: -4px;
        left: -4px;
        cursor: nw-resize;
      }
      :host ::ng-deep .ProseMirror .resize-handle.ne {
        top: -4px;
        right: -4px;
        cursor: ne-resize;
      }
      :host ::ng-deep .ProseMirror .resize-handle.sw {
        bottom: -4px;
        left: -4px;
        cursor: sw-resize;
      }
      :host ::ng-deep .ProseMirror .resize-handle.se {
        bottom: -4px;
        right: -4px;
        cursor: se-resize;
      }

      /* Désactiver les interactions avec les images en mode lecture seule */
      :host ::ng-deep .ProseMirror[contenteditable="false"] img {
        cursor: default;
        pointer-events: none;
      }

      :host ::ng-deep .ProseMirror[contenteditable="false"] img:hover {
        transform: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      :host
        ::ng-deep
        .ProseMirror[contenteditable="false"]
        img.ProseMirror-selectednode {
        outline: none;
      }

      :host ::ng-deep .ProseMirror .placeholder {
        color: #a0aec0;
        pointer-events: none;
        height: 0;
      }

      :host ::ng-deep .ProseMirror .placeholder::before {
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
      }

      /* Styles pour le menu contextuel des images */
      :host ::ng-deep .image-menu {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 4px;
        display: flex;
        gap: 2px;
        z-index: 1000;
        animation: bubbleMenuFadeIn 0.2s ease-out;
      }

      @keyframes bubbleMenuFadeIn {
        from {
          opacity: 0;
          transform: translateY(-8px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      :host ::ng-deep .image-menu .tiptap-button {
        min-width: 32px;
        height: 32px;
        padding: 6px;
        font-size: 13px;
        border-radius: 4px;
        background: none;
        border: 1px solid transparent;
        cursor: pointer;
        color: #4a5568;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      :host ::ng-deep .image-menu .tiptap-button:hover {
        background: #f1f5f9;
        color: #2d3748;
      }

      :host ::ng-deep .image-menu .tiptap-button.danger:hover {
        background: #fed7d7;
        color: #c53030;
      }

      :host ::ng-deep .image-menu .tiptap-button .material-symbols-outlined {
        font-size: 16px;
      }

      :host ::ng-deep .image-menu .tiptap-separator {
        height: 20px;
        margin: 0 2px;
        width: 1px;
        background: #e2e8f0;
      }

      /* Styles pour les slash commands */
      :host ::ng-deep .slash-command-active {
        background: #e6f3ff;
        border-radius: 3px;
        padding: 0 2px;
      }
    `,
  ],
})
export class TiptapEditorComponent
  implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor
{
  // Nouveaux inputs avec signal
  content = input<string>("");
  placeholder = input<string>("Start typing...");
  editable = input<boolean>(true);
  showToolbar = input<boolean>(true);
  showCharacterCount = input<boolean>(true);
  maxCharacters = input<number | undefined>(undefined);
  enableOfficePaste = input<boolean>(true);
  enableSlashCommands = input<boolean>(true);

  // Nouveaux inputs pour le bubble menu
  showBubbleMenu = input<boolean>(true);
  bubbleMenu = input<Partial<BubbleMenuConfig>>(DEFAULT_BUBBLE_MENU_CONFIG);

  // Nouveau input pour la configuration de la toolbar
  toolbar = input<Partial<ToolbarConfig>>({});

  // Nouveau input pour la configuration de l'upload d'images
  imageUpload = input<Partial<any>>({});

  // Nouveaux outputs
  contentChange = output<string>();
  editorCreated = output<Editor>();
  editorUpdate = output<{ editor: Editor; transaction: any }>();
  editorFocus = output<{ editor: Editor; event: FocusEvent }>();
  editorBlur = output<{ editor: Editor; event: FocusEvent }>();

  // ViewChild avec signal
  editorElement = viewChild.required<ElementRef>("editorElement");

  // Signals pour l'état interne
  editor = signal<Editor | null>(null);
  characterCountData = signal<{ characters: number; words: number } | null>(
    null
  );
  isDragOver = signal<boolean>(false);

  // Computed pour les états de l'éditeur
  isEditorReady = computed(() => this.editor() !== null);

  // Computed pour la configuration de la toolbar
  toolbarConfig = computed(() => {
    const userConfig = this.toolbar();
    // Si aucune configuration n'est fournie, utiliser la configuration par défaut
    if (Object.keys(userConfig).length === 0) {
      return DEFAULT_TOOLBAR_CONFIG;
    }
    // Sinon, utiliser uniquement la configuration fournie par l'utilisateur
    return userConfig;
  });

  // Computed pour la configuration du bubble menu
  bubbleMenuConfig = computed(() => {
    const userConfig = this.bubbleMenu();
    // Si aucune configuration n'est fournie, utiliser la configuration par défaut
    if (Object.keys(userConfig).length === 0) {
      return DEFAULT_BUBBLE_MENU_CONFIG;
    }
    // Sinon, fusionner avec la configuration par défaut
    return {
      ...DEFAULT_BUBBLE_MENU_CONFIG,
      ...userConfig,
    };
  });

  // Computed pour la configuration de l'upload d'images
  imageUploadConfig = computed(() => {
    const userConfig = this.imageUpload();
    return {
      maxSize: 5,
      maxWidth: 1920,
      maxHeight: 1080,
      allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      enableDragDrop: true,
      showPreview: true,
      multiple: false,
      compressImages: true,
      quality: 0.8,
      ...userConfig,
    };
  });

  // ControlValueAccessor implementation
  private onChange = (value: string) => {};
  private onTouched = () => {};

  constructor(private imageService: ImageService) {
    // Effect pour surveiller les changements d'édition
    effect(() => {
      const currentEditor = this.editor();
      const isEditable = this.editable();

      if (currentEditor) {
        currentEditor.setEditable(isEditable);
      }
    });
  }

  ngOnInit() {
    // L'initialisation se fait maintenant dans ngAfterViewInit
  }

  ngAfterViewInit() {
    // Attendre que la vue soit complètement initialisée avant de créer l'éditeur
    setTimeout(() => {
      this.initEditor();
    }, 0);
  }

  ngOnDestroy() {
    const currentEditor = this.editor();
    if (currentEditor) {
      currentEditor.destroy();
    }
  }

  private initEditor() {
    const extensions: (Extension | Node | Mark)[] = [
      StarterKit,
      Placeholder.configure({
        placeholder: this.placeholder(),
      }),
      ResizableImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "tiptap-image",
        },
      }),
    ];

    // Ajouter l'extension Office Paste si activée
    if (this.enableOfficePaste()) {
      extensions.push(
        OfficePaste.configure({
          // Configuration par défaut pour une meilleure compatibilité
          transformPastedHTML: true,
          transformPastedText: true,
        })
      );
    }

    // Ajouter les Slash Commands si activés
    if (this.enableSlashCommands()) {
      extensions.push(
        SlashCommands.configure({
          onImageUpload: async (file: File) => {
            try {
              const result = await this.imageService.compressImage(file);
              return {
                src: result.src,
                name: result.name,
                width: result.width,
                height: result.height,
              };
            } catch (error) {
              console.error("Erreur lors de l'upload d'image:", error);
              throw error;
            }
          },
        })
      );
    }

    // Ajouter le Bubble Menu pour les images avec un nom unique
    extensions.push(
      BubbleMenu.configure({
        pluginKey: "imageBubbleMenu", // Nom unique pour éviter les conflits
        element: this.createImageMenuElement(),
        shouldShow: ({ editor }) => {
          // Afficher le menu image seulement quand une image est sélectionnée ET que l'éditeur est éditable
          return editor.isActive("resizableImage") && this.editable();
        },
        tippyOptions: {
          placement: "top-start", // Positionner en haut à gauche
          offset: [0, 8], // Décalage vers le haut
        },
      })
    );

    if (this.showCharacterCount()) {
      extensions.push(
        CharacterCount.configure({
          limit: this.maxCharacters(),
        })
      );
    }

    const newEditor = new Editor({
      element: this.editorElement().nativeElement,
      extensions,
      content: this.content(),
      editable: this.editable(),
      onUpdate: ({ editor, transaction }) => {
        const html = editor.getHTML();
        this.contentChange.emit(html);
        // Defer the onChange call to prevent ExpressionChangedAfterItHasBeenCheckedError
        Promise.resolve().then(() => {
          this.onChange(html);
        });
        this.editorUpdate.emit({ editor, transaction });
        this.updateCharacterCount(editor);
      },
      onSelectionUpdate: ({ editor, transaction }) => {
        this.updateBubbleMenuButtonStates();
      },
      onCreate: ({ editor }) => {
        this.editor.set(editor);
        this.editorCreated.emit(editor);
        this.updateCharacterCount(editor);
      },
      onFocus: ({ editor, event }) => {
        this.editorFocus.emit({ editor, event });
      },
      onBlur: ({ editor, event }) => {
        this.onTouched();
        this.editorBlur.emit({ editor, event });
      },
    });
  }

  private createImageMenuElement(): HTMLElement {
    const imageMenuEl = document.createElement("div");
    imageMenuEl.className = "image-menu";

    // Bouton pour changer l'image
    const changeBtn = this.createImageMenuButton(
      "edit",
      "Changer l'image",
      () => this.changeImage()
    );
    imageMenuEl.appendChild(changeBtn);

    // Séparateur
    const separator1 = document.createElement("div");
    separator1.className = "tiptap-separator";
    imageMenuEl.appendChild(separator1);

    // Boutons de redimensionnement
    const resizeSmallBtn = this.createImageMenuButton(
      "crop_square",
      "Petite (300×200)",
      () => this.imageService.resizeImageToSmall(this.editor()!)
    );
    imageMenuEl.appendChild(resizeSmallBtn);

    const resizeMediumBtn = this.createImageMenuButton(
      "crop_landscape",
      "Moyenne (500×350)",
      () => this.imageService.resizeImageToMedium(this.editor()!)
    );
    imageMenuEl.appendChild(resizeMediumBtn);

    const resizeLargeBtn = this.createImageMenuButton(
      "crop_free",
      "Grande (800×600)",
      () => this.imageService.resizeImageToLarge(this.editor()!)
    );
    imageMenuEl.appendChild(resizeLargeBtn);

    const resizeOriginalBtn = this.createImageMenuButton(
      "restore",
      "Taille originale",
      () => this.imageService.resizeImageToOriginal(this.editor()!)
    );
    imageMenuEl.appendChild(resizeOriginalBtn);

    // Séparateur
    const separator2 = document.createElement("div");
    separator2.className = "tiptap-separator";
    imageMenuEl.appendChild(separator2);

    // Bouton pour supprimer l'image
    const deleteBtn = this.createImageMenuButton(
      "delete",
      "Supprimer l'image",
      () => this.deleteImage(),
      "danger"
    );
    imageMenuEl.appendChild(deleteBtn);

    return imageMenuEl;
  }

  private createImageMenuButton(
    iconName: string,
    title: string,
    onClick: () => void,
    className?: string
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.className = `tiptap-button ${className || ""}`;
    button.type = "button";
    button.title = title;

    // Créer l'icône Material Symbols
    const icon = document.createElement("span");
    icon.className = "material-symbols-outlined";
    icon.textContent = iconName;
    button.appendChild(icon);

    button.addEventListener("click", (e) => {
      e.preventDefault();
      onClick();
    });

    return button;
  }

  private updateBubbleMenuButtonStates() {
    // Mettre à jour les états actifs des boutons du bubble menu
    const currentEditor = this.editor();
    if (!currentEditor) return;

    const bubbleMenus = document.querySelectorAll(".bubble-menu");
    bubbleMenus.forEach((bubbleMenu) => {
      const buttons = bubbleMenu.querySelectorAll(".tiptap-button");
      buttons.forEach((button: Element) => {
        const htmlButton = button as HTMLButtonElement;
        const title = htmlButton.title.toLowerCase();

        if (title === "bold" && currentEditor.isActive("bold")) {
          htmlButton.classList.add("is-active");
        } else if (title === "italic" && currentEditor.isActive("italic")) {
          htmlButton.classList.add("is-active");
        } else if (
          title === "strikethrough" &&
          currentEditor.isActive("strike")
        ) {
          htmlButton.classList.add("is-active");
        } else if (title === "code" && currentEditor.isActive("code")) {
          htmlButton.classList.add("is-active");
        } else {
          htmlButton.classList.remove("is-active");
        }
      });
    });
  }

  private updateCharacterCount(editor: Editor) {
    if (this.showCharacterCount() && editor.storage["characterCount"]) {
      const storage = editor.storage["characterCount"];
      this.characterCountData.set({
        characters: storage.characters(),
        words: storage.words(),
      });
    }
  }

  // Méthodes pour le menu contextuel des images
  private changeImage() {
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

  private deleteImage() {
    const currentEditor = this.editor();
    if (!currentEditor) return;

    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) {
      this.imageService.deleteImage(currentEditor);
    }
  }

  // Méthodes pour l'upload d'images
  onImageUploaded(result: ImageUploadResult) {
    const currentEditor = this.editor();
    if (currentEditor) {
      this.imageService.insertImage(currentEditor, {
        src: result.src,
        alt: result.name,
        title: `${result.name} (${result.width}×${result.height})`,
      });
    }
  }

  onImageUploadError(error: string) {
    console.error("Erreur upload image:", error);
    // Ici vous pourriez afficher une notification à l'utilisateur
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
      const file = files[0];
      if (file.type.startsWith("image/")) {
        this.insertImageFromFile(file);
      }
    }
  }

  private insertImageFromFile(file: File) {
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
        })
        .catch((error) => {
          console.error("Erreur lors de l'upload:", error);
        });
    }
  }

  // Méthodes pour les événements du bubble menu
  onBubbleMenuCommand(event: { command: string; editor: Editor }) {
    // Cette méthode peut être utilisée pour des actions supplémentaires
    // quand une commande du bubble menu est exécutée
    console.log("Bubble menu command executed:", event.command);
  }

  // Public methods
  getHTML(): string {
    return this.editor()?.getHTML() || "";
  }

  getJSON(): any {
    return this.editor()?.getJSON();
  }

  getText(): string {
    return this.editor()?.getText() || "";
  }

  setContent(content: string, emitUpdate = true) {
    this.editor()?.commands.setContent(content, emitUpdate);
  }

  focus() {
    this.editor()?.commands.focus();
  }

  blur() {
    this.editor()?.commands.blur();
  }

  clearContent() {
    this.editor()?.commands.clearContent();
  }

  // ControlValueAccessor methods
  writeValue(value: string): void {
    const currentEditor = this.editor();
    if (currentEditor && value !== currentEditor.getHTML()) {
      currentEditor.commands.setContent(value || "", false);
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    const currentEditor = this.editor();
    if (currentEditor) {
      currentEditor.setEditable(!isDisabled);
    }
  }
}
