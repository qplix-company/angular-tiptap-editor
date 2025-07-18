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

// Default configuration for slash commands
export { DEFAULT_SLASH_COMMANDS } from "./lib/tiptap-slash-commands.component";

// Utility function to create internationalized slash commands
export { createI18nSlashCommands } from "./lib/config/i18n-slash-commands";
