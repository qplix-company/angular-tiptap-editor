import { Injectable, signal, computed, inject, effect } from "@angular/core";
import {
  ToolbarConfig,
  BubbleMenuConfig,
  SlashCommandsConfig,
  SlashCommandItem,
  TiptapI18nService,
} from "tiptap-editor";
import { createI18nSlashCommands } from "tiptap-editor";
import { EditorState, MenuState } from "../types/editor-config.types";
import { AppI18nService } from "./app-i18n.service";

@Injectable({
  providedIn: "root",
})
export class EditorConfigurationService {
  private i18nService = inject(TiptapI18nService);
  private appI18nService = inject(AppI18nService);
  // Editor state
  private _editorState = signal<EditorState>({
    showSidebar: true,
    showCodeMode: false,
    isTransitioning: false,
    showToolbar: true,
    showBubbleMenu: true,
    enableSlashCommands: true,
    placeholder: "Start typing...", // Will be updated by the effect
    // Height configuration
    minHeight: 200,
    height: undefined,
    maxHeight: undefined,
  });

  // Menu state
  private _menuState = signal<MenuState>({
    showToolbarMenu: false,
    showBubbleMenuMenu: false,
    showSlashCommandsMenu: false,
    showHeightMenu: false,
  });

  // Editor content
  private _demoContent = signal("<p></p>");

  // Configurations
  private _toolbarConfig = signal<Partial<ToolbarConfig>>({
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
    undo: true,
    redo: true,
    separator: true,
  });

  private _bubbleMenuConfig = signal<Partial<BubbleMenuConfig>>({
    bold: true,
    italic: true,
    underline: true,
    strike: true,
    code: true,
    highlight: true,
    link: true,
    separator: true,
  });

  private _activeSlashCommands = signal<Set<string>>(
    new Set([
      "heading1",
      "heading2",
      "heading3",
      "bulletList",
      "orderedList",
      "blockquote",
      "code",
      "image",
      "horizontalRule",
    ])
  );

  private _slashCommandsConfig = signal<SlashCommandsConfig>({
    commands: [],
  });

  // Signaux publics (lecture seule)
  readonly editorState = this._editorState.asReadonly();
  readonly menuState = this._menuState.asReadonly();
  readonly demoContent = this._demoContent.asReadonly();
  readonly toolbarConfig = this._toolbarConfig.asReadonly();
  readonly bubbleMenuConfig = this._bubbleMenuConfig.asReadonly();
  readonly slashCommandsConfig = this._slashCommandsConfig.asReadonly();
  readonly activeSlashCommands = this._activeSlashCommands.asReadonly();

  // Computed values
  readonly toolbarActiveCount = computed(() => {
    const config = this._toolbarConfig();
    return Object.values(config).filter(Boolean).length;
  });

  readonly bubbleMenuActiveCount = computed(() => {
    const config = this._bubbleMenuConfig();
    return Object.values(config).filter(Boolean).length;
  });

  readonly slashCommandsActiveCount = computed(() => {
    return this._activeSlashCommands().size;
  });

  constructor() {
    // Update content and slash commands when language changes
    effect(() => {
      // Re-trigger when language changes
      this.i18nService.currentLocale();
      this.updateSlashCommandsConfig();
      this.initializeDemoContent();
    });

    // Update editor placeholder based on language
    effect(() => {
      const editorTranslations = this.i18nService.editor();
      this._editorState.update((state) => ({
        ...state,
        placeholder: editorTranslations.placeholder,
      }));
    });

    this.updateSlashCommandsConfig();
    this.initializeDemoContent();
  }

  // Methods for editor state
  updateEditorState(partialState: Partial<EditorState>) {
    this._editorState.update((state) => ({ ...state, ...partialState }));
  }

  updateMenuState(partialState: Partial<MenuState>) {
    this._menuState.update((state) => ({ ...state, ...partialState }));
  }

  updateDemoContent(content: string) {
    this._demoContent.set(content);
  }

  // Methods for configurations
  toggleToolbarItem(key: string) {
    this._toolbarConfig.update((config) => ({
      ...config,
      [key]: !(config as any)[key],
    }));
  }

  toggleBubbleMenuItem(key: string) {
    this._bubbleMenuConfig.update((config) => ({
      ...config,
      [key]: !(config as any)[key],
    }));
  }

  toggleSlashCommand(key: string) {
    this._activeSlashCommands.update((active) => {
      const newActive = new Set(active);
      if (newActive.has(key)) {
        newActive.delete(key);
      } else {
        newActive.add(key);
      }
      return newActive;
    });
    this.updateSlashCommandsConfig();
  }

  // Verification methods
  isToolbarItemActive(key: string): boolean {
    const config = this._toolbarConfig();
    return !!(config as any)[key];
  }

  isBubbleMenuItemActive(key: string): boolean {
    const config = this._bubbleMenuConfig();
    return !!(config as any)[key];
  }

  isSlashCommandActive(key: string): boolean {
    return this._activeSlashCommands().has(key);
  }

  // Height configuration methods
  toggleHeightItem(key: string) {
    const currentState = this._editorState();

    switch (key) {
      case "enableScroll":
        // Activer le scroll en définissant une hauteur max par défaut
        this._editorState.update((state) => ({
          ...state,
          maxHeight: state.maxHeight ? undefined : 400,
        }));
        break;
      case "fixedHeight":
        // Toggle between fixed height and auto
        this._editorState.update((state) => ({
          ...state,
          height: state.height ? undefined : 300,
        }));
        break;
      case "maxHeight":
        // Toggle between max height and none
        this._editorState.update((state) => ({
          ...state,
          maxHeight: state.maxHeight ? undefined : 400,
        }));
        break;
    }
  }

  isHeightItemActive(key: string): boolean {
    const state = this._editorState();

    switch (key) {
      case "enableScroll":
        // Le scroll est actif si on a une hauteur ou hauteur max
        return state.height !== undefined || state.maxHeight !== undefined;
      case "fixedHeight":
        return state.height !== undefined;
      case "maxHeight":
        return state.maxHeight !== undefined;
      default:
        return false;
    }
  }

  // Menu closing methods
  closeAllMenus() {
    this._menuState.set({
      showToolbarMenu: false,
      showBubbleMenuMenu: false,
      showSlashCommandsMenu: false,
      showHeightMenu: false,
    });
  }

  // Reset to default values
  resetToDefaults() {
    this._toolbarConfig.set({
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
      undo: true,
      redo: true,
      separator: true,
    });

    this._bubbleMenuConfig.set({
      bold: true,
      italic: true,
      underline: true,
      strike: true,
      code: true,
      highlight: true,
      link: true,
      separator: true,
    });

    this._activeSlashCommands.set(
      new Set([
        "heading1",
        "heading2",
        "heading3",
        "bulletList",
        "orderedList",
        "blockquote",
        "code",
        "image",
        "horizontalRule",
      ])
    );

    this.updateSlashCommandsConfig();

    this._editorState.update((state) => ({
      ...state,
      showToolbar: true,
      showBubbleMenu: true,
      enableSlashCommands: true,
    }));

    this.closeAllMenus();
  }

  // Vider le contenu
  clearContent() {
    this._demoContent.set("<p></p>");
  }

  private updateSlashCommandsConfig() {
    const activeCommands = this._activeSlashCommands();
    const allI18nCommands = createI18nSlashCommands(this.i18nService);

    // Map titles to keys for compatibility
    const commandKeyMap = new Map<string, string>([
      ["heading1", "heading1"],
      ["heading2", "heading2"],
      ["heading3", "heading3"],
      ["bulletList", "bulletList"],
      ["orderedList", "orderedList"],
      ["blockquote", "blockquote"],
      ["code", "code"],
      ["image", "image"],
      ["horizontalRule", "horizontalRule"],
    ]);

    const filteredCommands = allI18nCommands.filter(
      (command: any, index: number) => {
        // Use index to determine command key
        const commandKeys = Array.from(commandKeyMap.keys());
        const commandKey = commandKeys[index];
        return commandKey && activeCommands.has(commandKey);
      }
    );

    this._slashCommandsConfig.set({
      commands: filteredCommands,
    });
  }

  // Initialize demo content with translations
  private initializeDemoContent() {
    const translatedContent = this.appI18nService.generateDemoContent();
    this._demoContent.set(translatedContent);
  }
}
