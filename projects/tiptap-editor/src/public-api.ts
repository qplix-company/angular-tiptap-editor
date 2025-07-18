/*
 * Public API Surface of tiptap-editor
 */

// Main component - only public component
export * from "./lib/tiptap-editor.component";

// Internationalization service
export * from "./lib/services/i18n.service";

// Types and interfaces for configuration
export type { ToolbarConfig } from "./lib/toolbar.component";
export type {
  BubbleMenuConfig,
  ImageBubbleMenuConfig,
} from "./lib/models/bubble-menu.model";
export type {
  SlashCommandsConfig,
  SlashCommandItem,
} from "./lib/tiptap-slash-commands.component";

// Default configurations
export { DEFAULT_TOOLBAR_CONFIG } from "./lib/tiptap-editor.component";
export { DEFAULT_BUBBLE_MENU_CONFIG } from "./lib/tiptap-editor.component";
export { DEFAULT_IMAGE_BUBBLE_MENU_CONFIG } from "./lib/tiptap-editor.component";
export { DEFAULT_SLASH_COMMANDS } from "./lib/tiptap-slash-commands.component";

// Utility function to create internationalized slash commands
export { createI18nSlashCommands } from "./lib/config/i18n-slash-commands";

// Types for height configuration
export type HeightConfig = {
  minHeight?: number;
  height?: number;
  maxHeight?: number;
};

// Supported locales type
export type { SupportedLocale } from "./lib/services/i18n.service";
