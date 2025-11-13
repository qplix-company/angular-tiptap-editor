/*
 * Public API Surface of tiptap-editor
 */

// Main component - only public component
export * from "./lib/tiptap-editor.component";
export * from "./lib/generic-bubble-menu.component";

// Composition helper directives
export { TiptapBubbleMenuPortalDirective } from "./lib/directives/tiptap-bubble-menu-portal.directive";
export type { TiptapBubbleMenuTemplateContext } from "./lib/directives/tiptap-bubble-menu-portal.directive";

// Host directive for FormControl integration
export * from "./lib/noop-value-accessor.directive";

// Internationalization service
export * from "./lib/services/i18n.service";

// Editor commands service
export * from "./lib/services/editor-commands.service";

// Image service
export * from "./lib/services/image.service";

// Types and interfaces for configuration
export type { ToolbarConfig } from "./lib/tiptap-toolbar.component";
export type {
  BubbleMenuConfig,
  ImageBubbleMenuConfig,
  TableBubbleMenuConfig,
  CellBubbleMenuConfig,
} from "./lib/models/bubble-menu.model";
export type {
  SlashCommandsConfig,
  SlashCommandItem,
} from "./lib/tiptap-slash-commands.component";
// Default configurations
export { DEFAULT_TOOLBAR_CONFIG } from "./lib/tiptap-editor.component";
export { DEFAULT_BUBBLE_MENU_CONFIG } from "./lib/tiptap-editor.component";
export { DEFAULT_IMAGE_BUBBLE_MENU_CONFIG } from "./lib/tiptap-editor.component";
export { DEFAULT_TABLE_MENU_CONFIG } from "./lib/tiptap-editor.component";
export { DEFAULT_SLASH_COMMANDS } from "./lib/tiptap-slash-commands.component";

// Utility functions to create and filter internationalized slash commands
export {
  createI18nSlashCommands,
  filterSlashCommands,
  SLASH_COMMAND_KEYS,
} from "./lib/config/i18n-slash-commands";

// Types for height configuration
export type HeightConfig = {
  minHeight?: number;
  height?: number;
  maxHeight?: number;
};

// Supported locales type
export type { SupportedLocale } from "./lib/services/i18n.service";
