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
import OfficePaste from "@intevation/tiptap-extension-office-paste";
import { SlashCommands } from "./slash-commands.extension";
import { ResizableImage } from "./extensions/resizable-image.extension";
import { TiptapToolbarComponent } from "./toolbar.component";
import { TiptapImageUploadComponent } from "./tiptap-image-upload.component";
import { TiptapBubbleMenuComponent } from "./tiptap-bubble-menu.component";
import { TiptapImageBubbleMenuComponent } from "./tiptap-image-bubble-menu.component";
import { TiptapSlashCommandsComponent } from "./tiptap-slash-commands.component";
import { ImageService } from "./services/image.service";
import { ImageUploadResult } from "./services/image.service";
import { ToolbarConfig } from "./toolbar.component";
import {
  BubbleMenuConfig,
  ImageBubbleMenuConfig,
} from "./models/bubble-menu.model";

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

// Configuration par défaut du bubble menu image
export const DEFAULT_IMAGE_BUBBLE_MENU_CONFIG: ImageBubbleMenuConfig = {
  changeImage: true,
  resizeSmall: true,
  resizeMedium: true,
  resizeLarge: true,
  resizeOriginal: true,
  deleteImage: true,
  separator: true,
};

@Component({
  selector: "tiptap-editor",
  standalone: true,
  imports: [
    TiptapToolbarComponent,
    TiptapImageUploadComponent,
    TiptapBubbleMenuComponent,
    TiptapImageBubbleMenuComponent,
    TiptapSlashCommandsComponent,
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
        (click)="onEditorClick($event)"
      ></div>

      <!-- Bubble Menu pour le texte -->
      @if (showBubbleMenu() && editor()) {
      <tiptap-bubble-menu
        [editor]="editor()!"
        [config]="bubbleMenuConfig()"
      ></tiptap-bubble-menu>
      }

      <!-- Bubble Menu pour les images -->
      @if (showImageBubbleMenu() && editor()) {
      <tiptap-image-bubble-menu
        [editor]="editor()!"
        [config]="imageBubbleMenuConfig()"
      ></tiptap-image-bubble-menu>
      }

      <!-- Slash Commands -->
      @if (enableSlashCommands() && editor()) {
      <tiptap-slash-commands [editor]="editor()!"></tiptap-slash-commands>
      }

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
      /* Styles de base pour l'éditeur Tiptap */

      /* Conteneur principal de l'éditeur */
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

      /* Contenu de l'éditeur */
      .tiptap-content {
        padding: 16px;
        min-height: var(--editor-min-height, 300px);
        outline: none;
        position: relative;
      }

      .tiptap-content.drag-over {
        background: #f0f8ff;
        border: 2px dashed #3182ce;
      }

      /* Compteur de caractères */
      .character-count {
        padding: 8px 16px;
        font-size: 12px;
        color: #718096;
        text-align: right;
        border-top: 1px solid #e2e8f0;
        background: #f8f9fa;
      }

      /* Styles spécifiques au composant */
      .image-upload-container {
        position: relative;
        display: inline-block;
      }

      /* Styles ProseMirror avec :host ::ng-deep */
      :host ::ng-deep .ProseMirror {
        outline: none;
        line-height: 1.6;
        color: #2d3748;
        min-height: 100%;
        height: 100%;
      }

      /* Titres */
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

      /* Paragraphes et listes */
      :host ::ng-deep .ProseMirror p {
        margin: 0.5em 0;
      }

      :host ::ng-deep .ProseMirror ul,
      :host ::ng-deep .ProseMirror ol {
        padding-left: 2em;
        margin: 0.5em 0;
      }

      /* Citations */
      :host ::ng-deep .ProseMirror blockquote {
        border-left: 4px solid #e2e8f0;
        padding-left: 1em;
        margin: 1em 0;
        font-style: italic;
        background: #f8f9fa;
        padding: 0.5em 1em;
        border-radius: 0 4px 4px 0;
      }

      /* Code */
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

      /* Placeholder */
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

      /* Mode lecture seule */
      :host ::ng-deep .ProseMirror[contenteditable="false"] {
        pointer-events: none;
      }

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

      /* Styles pour les images */
      :host ::ng-deep .ProseMirror img {
        position: relative;
        display: inline-block;
        max-width: 100%;
        height: auto;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 2px solid transparent;
        border-radius: 8px;
      }

      :host ::ng-deep .ProseMirror img:hover {
        border-color: #e2e8f0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      :host ::ng-deep .ProseMirror img.selected {
        border-color: #3182ce;
        box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
        transition: all 0.2s ease;
      }

      /* Images avec classe tiptap-image */
      :host ::ng-deep .ProseMirror .tiptap-image {
        max-width: 100%;
        height: auto;
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        margin: 0.5em 0;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: block;
        filter: brightness(1) contrast(1);
      }

      :host ::ng-deep .ProseMirror .tiptap-image:hover {
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        filter: brightness(1.02) contrast(1.02);
      }

      :host ::ng-deep .ProseMirror .tiptap-image.ProseMirror-selectednode {
        outline: 2px solid #6366f1;
        outline-offset: 2px;
        border-radius: 16px;
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
      }

      /* Conteneurs d'images avec alignement */
      :host ::ng-deep .image-container {
        margin: 0.5em 0;
        text-align: center;
        border-radius: 16px;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      :host ::ng-deep .image-container.image-align-left {
        text-align: left;
      }

      :host ::ng-deep .image-container.image-align-center {
        text-align: center;
      }

      :host ::ng-deep .image-container.image-align-right {
        text-align: right;
      }

      :host ::ng-deep .image-container img {
        display: inline-block;
        max-width: 100%;
        height: auto;
        border-radius: 16px;
      }

      /* Conteneur pour les images redimensionnables */
      :host ::ng-deep .resizable-image-container {
        position: relative;
        display: inline-block;
        margin: 0.5em 0;
      }

      /* Conteneur des contrôles de redimensionnement */
      :host ::ng-deep .resize-controls {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 1000;
      }

      /* Poignées de redimensionnement */
      :host ::ng-deep .resize-handle {
        position: absolute;
        width: 12px;
        height: 12px;
        background: #3b82f6;
        border: 2px solid white;
        border-radius: 50%;
        pointer-events: all;
        cursor: pointer;
        z-index: 1001;
        transition: all 0.15s ease;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      }

      :host ::ng-deep .resize-handle:hover {
        background: #2563eb;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
      }

      :host ::ng-deep .resize-handle:active {
        background: #1d4ed8;
      }

      /* Poignées du milieu avec scale séparé */
      :host ::ng-deep .resize-handle-n:hover,
      :host ::ng-deep .resize-handle-s:hover {
        transform: translateX(-50%) scale(1.2);
      }

      :host ::ng-deep .resize-handle-w:hover,
      :host ::ng-deep .resize-handle-e:hover {
        transform: translateY(-50%) scale(1.2);
      }

      :host ::ng-deep .resize-handle-n:active,
      :host ::ng-deep .resize-handle-s:active {
        transform: translateX(-50%) scale(0.9);
      }

      :host ::ng-deep .resize-handle-w:active,
      :host ::ng-deep .resize-handle-e:active {
        transform: translateY(-50%) scale(0.9);
      }

      /* Poignées des coins avec scale simple */
      :host ::ng-deep .resize-handle-nw:hover,
      :host ::ng-deep .resize-handle-ne:hover,
      :host ::ng-deep .resize-handle-sw:hover,
      :host ::ng-deep .resize-handle-se:hover {
        transform: scale(1.2);
      }

      :host ::ng-deep .resize-handle-nw:active,
      :host ::ng-deep .resize-handle-ne:active,
      :host ::ng-deep .resize-handle-sw:active,
      :host ::ng-deep .resize-handle-se:active {
        transform: scale(0.9);
      }

      /* Positions spécifiques pour chaque poignée */
      :host ::ng-deep .resize-handle-nw {
        top: 0;
        left: -6px;
        cursor: nw-resize;
      }
      :host ::ng-deep .resize-handle-n {
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        cursor: n-resize;
      }
      :host ::ng-deep .resize-handle-ne {
        top: 0;
        right: -6px;
        cursor: ne-resize;
      }
      :host ::ng-deep .resize-handle-w {
        top: 50%;
        left: -6px;
        transform: translateY(-50%);
        cursor: w-resize;
      }
      :host ::ng-deep .resize-handle-e {
        top: 50%;
        right: -6px;
        transform: translateY(-50%);
        cursor: e-resize;
      }
      :host ::ng-deep .resize-handle-sw {
        bottom: 0;
        left: -6px;
        cursor: sw-resize;
      }
      :host ::ng-deep .resize-handle-s {
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        cursor: s-resize;
      }
      :host ::ng-deep .resize-handle-se {
        bottom: 0;
        right: -6px;
        cursor: se-resize;
      }

      /* Styles pour le redimensionnement en cours */
      :host ::ng-deep body.resizing {
        user-select: none;
        cursor: crosshair;
      }

      :host ::ng-deep body.resizing .ProseMirror {
        pointer-events: none;
      }

      :host ::ng-deep body.resizing .ProseMirror .tiptap-image {
        pointer-events: none;
      }

      /* Styles pour les informations de taille d'image */
      :host ::ng-deep .image-size-info {
        position: absolute;
        bottom: -20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 11px;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      :host ::ng-deep .image-container:hover .image-size-info {
        opacity: 1;
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
  minHeight = input<number>(300);
  showToolbar = input<boolean>(true);
  showCharacterCount = input<boolean>(true);
  maxCharacters = input<number | undefined>(undefined);
  enableOfficePaste = input<boolean>(true);
  enableSlashCommands = input<boolean>(true);

  // Nouveaux inputs pour les bubble menus
  showBubbleMenu = input<boolean>(true);
  bubbleMenu = input<Partial<BubbleMenuConfig>>(DEFAULT_BUBBLE_MENU_CONFIG);
  showImageBubbleMenu = input<boolean>(true);
  imageBubbleMenu = input<Partial<ImageBubbleMenuConfig>>(
    DEFAULT_IMAGE_BUBBLE_MENU_CONFIG
  );

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

  // Computed pour la configuration du bubble menu image
  imageBubbleMenuConfig = computed(() => {
    const userConfig = this.imageBubbleMenu();
    // Si aucune configuration n'est fournie, utiliser la configuration par défaut
    if (Object.keys(userConfig).length === 0) {
      return DEFAULT_IMAGE_BUBBLE_MENU_CONFIG;
    }
    // Sinon, fusionner avec la configuration par défaut
    return {
      ...DEFAULT_IMAGE_BUBBLE_MENU_CONFIG,
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
    // Effet pour mettre à jour le contenu de l'éditeur
    effect(() => {
      const editor = this.editor();
      const content = this.content();
      if (editor && content !== editor.getHTML()) {
        editor.commands.setContent(content, false);
      }
    });

    // Effet pour mettre à jour la hauteur minimale
    effect(() => {
      const minHeight = this.minHeight();
      const element = this.editorElement()?.nativeElement;
      if (element) {
        element.style.setProperty("--editor-min-height", `${minHeight}px`);
      }
    });

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

    // Note: Les slash commands sont maintenant gérés par le composant TiptapSlashCommandsComponent
    // if (this.enableSlashCommands()) {
    //   extensions.push(
    //     SlashCommands.configure({
    //       onImageUpload: async (file: File) => {
    //         try {
    //           const result = await this.imageService.compressImage(file);
    //           return {
    //             src: result.src,
    //             name: result.name,
    //             width: result.width,
    //             height: result.height,
    //           };
    //         } catch (error) {
    //           console.error("Erreur lors de l'upload d'image:", error);
    //           throw error;
    //         }
    //       },
    //     })
    //   );
    // }

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
        // Note: La mise à jour des états des boutons est maintenant gérée par TiptapBubbleMenuComponent
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

  private updateCharacterCount(editor: Editor) {
    if (this.showCharacterCount() && editor.storage["characterCount"]) {
      const storage = editor.storage["characterCount"];
      this.characterCountData.set({
        characters: storage.characters(),
        words: storage.words(),
      });
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

  onEditorClick(event: MouseEvent) {
    const editor = this.editor();
    if (!editor) return;

    // Vérifier si on clique sur l'élément conteneur et non sur le contenu
    const target = event.target as HTMLElement;
    const editorElement = this.editorElement()?.nativeElement;

    if (
      target === editorElement ||
      target.classList.contains("tiptap-content")
    ) {
      // On clique dans l'espace vide, positionner le curseur à la fin
      setTimeout(() => {
        const { doc } = editor.state;
        const endPos = doc.content.size;
        editor.commands.setTextSelection(endPos);
        editor.commands.focus();
      }, 0);
    }
  }
}
