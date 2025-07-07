/*
 * Public API Surface of tiptap-editor
 */

// Composant principal - seul composant exposé publiquement
export * from "./lib/tiptap-editor.component";

// Service d'internationalisation
export * from "./lib/services/i18n.service";

// Types et interfaces pour la configuration
export type { ToolbarConfig } from "./lib/toolbar.component";
export type {
  BubbleMenuConfig,
  ImageBubbleMenuConfig,
} from "./lib/models/bubble-menu.model";
export type {
  SlashCommandsConfig,
  SlashCommandItem,
} from "./lib/tiptap-slash-commands.component";

// Configuration par défaut des slash commands
export { DEFAULT_SLASH_COMMANDS } from "./lib/tiptap-slash-commands.component";
