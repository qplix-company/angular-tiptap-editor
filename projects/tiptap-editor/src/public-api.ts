/*
 * Public API Surface of tiptap-editor
 */

// Composants principaux
export * from "./lib/tiptap-editor.component";
export * from "./lib/tiptap-bubble-menu.component";
export * from "./lib/tiptap-image-bubble-menu.component";
export { TiptapSlashCommandsComponent } from "./lib/tiptap-slash-commands.component";
export * from "./lib/toolbar.component";
export * from "./lib/tiptap-button.component";
export * from "./lib/tiptap-image-upload.component";
export * from "./lib/tiptap-separator.component";

// Services
export * from "./lib/services/image.service";
export * from "./lib/services/editor-commands.service";

// Extensions
export * from "./lib/extensions/resizable-image.extension";
export * from "./lib/slash-commands.extension";

// Types et interfaces
export type { ToolbarConfig } from "./lib/toolbar.component";
export type {
  BubbleMenuConfig,
  ImageBubbleMenuConfig,
} from "./lib/models/bubble-menu.model";
export type {
  SlashCommandsConfig,
  SlashCommandItem,
} from "./lib/tiptap-slash-commands.component";
export { DEFAULT_SLASH_COMMANDS } from "./lib/tiptap-slash-commands.component";
export type { TiptapButtonConfig } from "./lib/tiptap-button.component";
export type {
  ImageUploadResult,
  ImageData,
  ResizeOptions,
} from "./lib/services/image.service";
export type { ResizableImageOptions } from "./lib/extensions/resizable-image.extension";
