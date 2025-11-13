import {
  Component,
  ContentChildren,
  ElementRef,
  input,
  output,
  OnDestroy,
  viewChild,
  effect,
  signal,
  computed,
  AfterViewInit,
  inject,
  DestroyRef,
  QueryList,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Editor, Extension, Node, Mark } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import OfficePaste from "@intevation/tiptap-extension-office-paste";

import { ResizableImage } from "./extensions/resizable-image.extension";
import { UploadProgress } from "./extensions/upload-progress.extension";
import { TableExtension } from "./extensions/table.extension";
import { TiptapToolbarComponent } from "./index";
import { TiptapImageUploadComponent } from "./tiptap-image-upload.component";
import { TiptapBubbleMenuComponent } from "./tiptap-bubble-menu.component";
import { TiptapImageBubbleMenuComponent } from "./tiptap-image-bubble-menu.component";
import { TiptapTableBubbleMenuComponent } from "./tiptap-table-bubble-menu.component";
import { CellBubbleMenuConfig, TiptapCellBubbleMenuComponent } from "./tiptap-cell-bubble-menu.component";
import { TiptapSlashCommandsComponent, SlashCommandsConfig } from "./tiptap-slash-commands.component";
import { ImageService } from "./services/image.service";
import { TiptapI18nService, SupportedLocale } from "./services/i18n.service";
import { EditorCommandsService } from "./services/editor-commands.service";
import { NoopValueAccessorDirective } from "./noop-value-accessor.directive";
import { NgControl } from "@angular/forms";
import { filterSlashCommands, SLASH_COMMAND_KEYS } from "./config/i18n-slash-commands";

import { ImageUploadResult } from "./services/image.service";
import { ToolbarConfig } from "./tiptap-toolbar.component";
import { BubbleMenuConfig, ImageBubbleMenuConfig, TableBubbleMenuConfig } from "./models/bubble-menu.model";
import { concat, defer, of, tap, Subscription } from "rxjs";
import {
  TiptapBubbleMenuPortalDirective,
  TiptapBubbleMenuTemplateContext,
} from "./directives/tiptap-bubble-menu-portal.directive";

// Configuration par défaut de la toolbar
export const DEFAULT_TOOLBAR_CONFIG: ToolbarConfig = {
  bold: true,
  italic: true,
  underline: true,
  strike: true,
  code: true,
  superscript: false,
  subscript: false,
  highlight: true,
  heading1: true,
  heading2: true,
  heading3: true,
  bulletList: true,
  orderedList: true,
  blockquote: true,
  alignLeft: false,
  alignCenter: false,
  alignRight: false,
  alignJustify: false,
  link: true,
  image: true,
  horizontalRule: true,
  table: true,
  undo: true,
  redo: true,
  clear: false, // Désactivé par défaut (opt-in)
  separator: true,
};

// Configuration par défaut du bubble menu
export const DEFAULT_BUBBLE_MENU_CONFIG: BubbleMenuConfig = {
  bold: true,
  italic: true,
  underline: true,
  strike: true,
  code: true,
  superscript: false,
  subscript: false,
  highlight: true,
  link: true,
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

// Configuration par défaut du menu de table
export const DEFAULT_TABLE_MENU_CONFIG: TableBubbleMenuConfig = {
  addRowBefore: true,
  addRowAfter: true,
  deleteRow: true,
  addColumnBefore: true,
  addColumnAfter: true,
  deleteColumn: true,
  toggleHeaderRow: true,
  toggleHeaderColumn: true,
  deleteTable: true,
  separator: true,
};

@Component({
  selector: "angular-tiptap-editor",
  exportAs: "angularTiptapEditor",
  standalone: true,
  host: { "[class.editable]": "this.editable()" },
  hostDirectives: [NoopValueAccessorDirective],
  imports: [
    NgTemplateOutlet,
    TiptapToolbarComponent,
    TiptapImageUploadComponent,
    TiptapBubbleMenuComponent,
    TiptapImageBubbleMenuComponent,
    TiptapTableBubbleMenuComponent,
    TiptapCellBubbleMenuComponent,
    TiptapSlashCommandsComponent,
  ],
  templateUrl: "./tiptap-editor.component.html",
  styleUrls: ["./tiptap-editor.component.css"],
})
export class AngularTiptapEditorComponent implements AfterViewInit, OnDestroy {
  // Nouveaux inputs avec signal
  content = input<string>("");
  placeholder = input<string>("");
  editable = input<boolean>(true);
  minHeight = input<number>(200);
  height = input<number | undefined>(undefined);
  maxHeight = input<number | undefined>(undefined);
  showToolbar = input<boolean>(true);
  showCharacterCount = input<boolean>(true);
  maxCharacters = input<number | undefined>(undefined);
  enableOfficePaste = input<boolean>(true);
  enableSlashCommands = input<boolean>(true);
  slashCommandsConfig = input<SlashCommandsConfig | undefined>(undefined);
  locale = input<SupportedLocale | undefined>(undefined);
  extensions = input<(Extension | Node | Mark)[] | undefined>(undefined);

  // Nouveaux inputs pour les bubble menus
  showBubbleMenu = input<boolean>(true);
  bubbleMenu = input<Partial<BubbleMenuConfig>>(DEFAULT_BUBBLE_MENU_CONFIG);
  showImageBubbleMenu = input<boolean>(true);
  imageBubbleMenu = input<Partial<ImageBubbleMenuConfig>>(DEFAULT_IMAGE_BUBBLE_MENU_CONFIG);

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

  // Signals privés pour l'état interne
  private _editor = signal<Editor | null>(null);
  private _characterCount = signal<number>(0);
  private _wordCount = signal<number>(0);
  private _isDragOver = signal<boolean>(false);
  private _editorFullyInitialized = signal<boolean>(false);
  private _customBubbleMenus = signal<TiptapBubbleMenuPortalDirective[]>([]);
  private customBubbleMenusChanges: Subscription | null = null;
  private bubbleMenuContext: TiptapBubbleMenuTemplateContext = { $implicit: null, editor: null };

  // Accès en lecture seule aux signaux
  readonly editor = this._editor.asReadonly();
  readonly characterCount = this._characterCount.asReadonly();
  readonly wordCount = this._wordCount.asReadonly();
  readonly isDragOver = this._isDragOver.asReadonly();
  readonly editorFullyInitialized = this._editorFullyInitialized.asReadonly();
  readonly customBubbleMenus = this._customBubbleMenus.asReadonly();

  // Computed pour les états de l'éditeur
  isEditorReady = computed(() => this.editor() !== null);

  // Computed pour la configuration de la toolbar
  toolbarConfig = computed(() => (Object.keys(this.toolbar()).length === 0 ? DEFAULT_TOOLBAR_CONFIG : this.toolbar()));

  // Computed pour la configuration du bubble menu
  bubbleMenuConfig = computed(() =>
    Object.keys(this.bubbleMenu()).length === 0
      ? DEFAULT_BUBBLE_MENU_CONFIG
      : { ...DEFAULT_BUBBLE_MENU_CONFIG, ...this.bubbleMenu() },
  );

  // Computed pour la configuration du bubble menu image
  imageBubbleMenuConfig = computed(() =>
    Object.keys(this.imageBubbleMenu()).length === 0
      ? DEFAULT_IMAGE_BUBBLE_MENU_CONFIG
      : { ...DEFAULT_IMAGE_BUBBLE_MENU_CONFIG, ...this.imageBubbleMenu() },
  );

  // Computed pour la configuration du bubble menu table
  tableBubbleMenuConfig = computed(() => ({
    addRowBefore: true,
    addRowAfter: true,
    deleteRow: true,
    addColumnBefore: true,
    addColumnAfter: true,
    deleteColumn: true,
    deleteTable: true,
    toggleHeaderRow: true,
    toggleHeaderColumn: true,
  }));

  // Computed pour la configuration du menu de cellules
  cellBubbleMenuConfig = computed(() => ({
    mergeCells: true,
    splitCell: true,
  }));

  // Computed pour la configuration de l'upload d'images
  imageUploadConfig = computed(() => ({
    maxSize: 5,
    maxWidth: 1920,
    maxHeight: 1080,
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    enableDragDrop: true,
    showPreview: true,
    multiple: false,
    compressImages: true,
    quality: 0.8,
    ...this.imageUpload(),
  }));

  // Computed pour la configuration des slash commands
  slashCommandsConfigComputed = computed(() => {
    const config = this.slashCommandsConfig();
    if (config) {
      return config;
    }

    // Configuration par défaut avec toutes les commandes
    const allCommands = filterSlashCommands(new Set(SLASH_COMMAND_KEYS), this.i18nService);
    return { commands: allCommands };
  });

  private _destroyRef = inject(DestroyRef);
  // NgControl pour gérer les FormControls
  private ngControl = inject(NgControl, { self: true, optional: true });

  readonly i18nService = inject(TiptapI18nService);
  readonly imageService = inject(ImageService);
  readonly editorCommandsService = inject(EditorCommandsService);

  @ContentChildren(TiptapBubbleMenuPortalDirective)
  set projectedBubbleMenus(value: QueryList<TiptapBubbleMenuPortalDirective> | undefined) {
    this.customBubbleMenusChanges?.unsubscribe();

    if (!value) {
      this._customBubbleMenus.set([]);
      this.customBubbleMenusChanges = null;
      return;
    }

    this._customBubbleMenus.set(value.toArray());
    this.customBubbleMenusChanges = value.changes.subscribe((list: QueryList<TiptapBubbleMenuPortalDirective>) => {
      this._customBubbleMenus.set(list.toArray());
    });
  }

  constructor() {
    // Effet pour gérer le changement de langue
    effect(() => {
      const locale = this.locale();
      if (locale) {
        this.i18nService.setLocale(locale);
      }
    });

    // Effet pour mettre à jour le contenu de l'éditeur
    effect(() => {
      const editor = this.editor();
      const content = this.content();
      const hasFormControl = !!(this.ngControl as any)?.control;

      // Ne pas écraser le contenu si on a un FormControl et que le content est vide
      if (editor && content !== undefined && content !== editor.getHTML()) {
        if (hasFormControl && !content) {
          return;
        }
        this.setContent(content, false);
      }
    });

    // Effet pour mettre à jour les propriétés de hauteur
    effect(() => {
      const minHeight = this.minHeight();
      const height = this.height();
      const maxHeight = this.maxHeight();
      const element = this.editorElement()?.nativeElement;

      // Calculer automatiquement si le scroll est nécessaire
      const needsScroll = height !== undefined || maxHeight !== undefined;

      if (element) {
        element.style.setProperty("--editor-min-height", `${minHeight}px`);
        element.style.setProperty("--editor-height", height ? `${height}px` : "auto");
        element.style.setProperty("--editor-max-height", maxHeight ? `${maxHeight}px` : "none");
        element.style.setProperty("--editor-overflow", needsScroll ? "auto" : "visible");
      }
    });

    // Effect pour surveiller les changements d'édition
    effect(() => {
      const currentEditor = this.editor();
      const isEditable = this.editable();

      if (currentEditor) {
        this.editorCommandsService.setEditable(currentEditor, isEditable);
      }
    });

    // Effect pour la détection du survol des tables
    effect(() => {
      const currentEditor = this.editor();
      if (!currentEditor) return;

      // Table hover detection supprimée car remplacée par le menu bubble
    });
  }

  ngAfterViewInit() {
    // La vue est déjà complètement initialisée dans ngAfterViewInit
    this.initEditor();

    // S'abonner aux changements du FormControl
    this.setupFormControlSubscription();
  }

  ngOnDestroy() {
    const currentEditor = this.editor();
    if (currentEditor) {
      currentEditor.destroy();
    }
    this._editorFullyInitialized.set(false);
    this.customBubbleMenusChanges?.unsubscribe();
    this.customBubbleMenusChanges = null;
  }

  private initEditor() {
    const extensions: (Extension | Node | Mark)[] = [
      StarterKit,
      Placeholder.configure({
        placeholder: this.placeholder() || this.i18nService.editor().placeholder,
      }),
      Underline,
      Superscript,
      Subscript,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "tiptap-link",
        },
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: "tiptap-highlight",
        },
      }),
      ResizableImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "tiptap-image",
        },
      }),
      UploadProgress.configure({
        isUploading: () => this.imageService.isUploading(),
        uploadProgress: () => this.imageService.uploadProgress(),
        uploadMessage: () => this.imageService.uploadMessage(),
      }),
      TableExtension,
      ...(this.extensions() ?? []),
    ];

    // Ajouter l'extension Office Paste si activée
    if (this.enableOfficePaste()) {
      extensions.push(
        OfficePaste.configure({
          // Configuration par défaut pour une meilleure compatibilité
          transformPastedHTML: true,
          transformPastedText: true,
        }),
      );
    }

    if (this.showCharacterCount()) {
      extensions.push(
        CharacterCount.configure({
          limit: this.maxCharacters(),
        }),
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
        // Mettre à jour le FormControl si il existe (dans le prochain cycle)
        if ((this.ngControl as any)?.control) {
          setTimeout(() => {
            (this.ngControl as any).control.setValue(html, {
              emitEvent: false,
            });
          }, 0);
        }
        this.editorUpdate.emit({ editor, transaction });
        this.updateCharacterCount(editor);
      },
      onCreate: ({ editor }) => {
        this.editorCreated.emit(editor);
        this.updateCharacterCount(editor);

        // Marquer l'éditeur comme complètement initialisé après un court délai
        // pour s'assurer que tous les plugins et extensions sont prêts
        setTimeout(() => {
          this._editorFullyInitialized.set(true);
        }, 100);
      },
      onFocus: ({ editor, event }) => {
        this.editorFocus.emit({ editor, event });
      },
      onBlur: ({ editor, event }) => {
        // Marquer le FormControl comme touché si il existe
        if ((this.ngControl as any)?.control) {
          (this.ngControl as any).control.markAsTouched();
        }
        this.editorBlur.emit({ editor, event });
      },
    });

    // Stocker la référence de l'éditeur immédiatement
    this._editor.set(newEditor);
  }

  private updateCharacterCount(editor: Editor) {
    if (this.showCharacterCount() && editor.storage["characterCount"]) {
      const storage = editor.storage["characterCount"];
      this._characterCount.set(storage.characters());
      this._wordCount.set(storage.words());
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
        width: result.width,
        height: result.height,
      });
    }
  }

  onImageUploadError(error: string) {
    // Ici vous pourriez afficher une notification à l'utilisateur
  }

  // Gestion de l'upload d'image depuis les slash commands
  async onSlashCommandImageUpload(file: File) {
    const currentEditor = this.editor();
    if (currentEditor) {
      try {
        await this.imageService.uploadAndInsertImage(currentEditor, file);
      } catch (error) {
        // Gérer l'erreur silencieusement ou afficher une notification
      }
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this._isDragOver.set(true);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this._isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        this.insertImageFromFile(file);
      }
    }
  }

  private async insertImageFromFile(file: File) {
    const currentEditor = this.editor();
    if (currentEditor) {
      try {
        await this.imageService.uploadAndInsertImage(currentEditor, file);
      } catch (error) {
        // Gérer l'erreur silencieusement ou afficher une notification
      }
    }
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
    const editor = this.editor();
    if (editor) {
      this.editorCommandsService.setContent(editor, content, emitUpdate);
    }
  }

  focus() {
    const editor = this.editor();
    if (editor) {
      this.editorCommandsService.focus(editor);
    }
  }

  blur() {
    const editor = this.editor();
    if (editor) {
      this.editorCommandsService.blur(editor);
    }
  }

  clearContent() {
    const editor = this.editor();
    if (editor) {
      this.editorCommandsService.clearContent(editor);
    }
  }

  // Méthode publique pour obtenir l'éditeur
  getEditor(): Editor | null {
    return this.editor();
  }

  bubbleMenuOutletContext(): TiptapBubbleMenuTemplateContext {
    const editor = this.editor();
    this.bubbleMenuContext.$implicit = editor;
    this.bubbleMenuContext.editor = editor;
    return this.bubbleMenuContext;
  }

  private setupFormControlSubscription(): void {
    const control = (this.ngControl as any)?.control;
    if (control) {
      const formValue$ = concat(
        defer(() => of(control.value)),
        control.valueChanges,
      );

      formValue$
        .pipe(
          tap((value: any) => {
            const editor = this.editor();
            if (editor) {
              this.setContent(value, false);
            }
          }),
          takeUntilDestroyed(this._destroyRef),
        )
        .subscribe();
    }
  }

  // Méthode pour gérer l'état disabled
  setDisabledState(isDisabled: boolean): void {
    const currentEditor = this.editor();
    if (currentEditor) {
      this.editorCommandsService.setEditable(currentEditor, !isDisabled);
    }
  }

  onEditorClick(event: MouseEvent) {
    const editor = this.editor();
    if (!editor) return;

    // Vérifier si on clique sur l'élément conteneur et non sur le contenu
    const target = event.target as HTMLElement;
    const editorElement = this.editorElement()?.nativeElement;

    if (target === editorElement || target.classList.contains("tiptap-content")) {
      // On clique dans l'espace vide, positionner le curseur à la fin
      setTimeout(() => {
        const { doc } = editor.state;
        const endPos = doc.content.size;
        editor.commands.setTextSelection(endPos);
        editor.commands.focus();
      }, 0);
    }
  }

  // Méthodes pour le bouton d'édition de table - Supprimées car remplacées par le menu bubble
}
