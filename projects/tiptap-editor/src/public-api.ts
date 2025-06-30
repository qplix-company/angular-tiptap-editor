/*
 * Public API Surface of tiptap-editor
 */

// Components
export * from "./lib/tiptap-editor.component";
export * from "./lib/toolbar.component";
export * from "./lib/tiptap-button.component";
export * from "./lib/bubble-menu.component";
export * from "./lib/tiptap-image-menu.component";
export * from "./lib/tiptap-separator.component";
export * from "./lib/tiptap-image-upload.component";

// Services
export * from "./lib/services/editor-commands.service";
export * from "./lib/services/image.service";

// Extensions
export * from "./lib/extensions/resizable-image.extension";
export * from "./lib/slash-commands.extension";

// Types
export * from "./lib/toolbar.component";
export * from "./lib/bubble-menu.component";
export * from "./lib/tiptap-image-menu.component";

// Types et interfaces
export type { ToolbarConfig } from "./lib/toolbar.component";
export type { BubbleMenuConfig } from "./lib/bubble-menu.component";
export type { TiptapButtonConfig } from "./lib/tiptap-button.component";
export type {
  ImageUploadResult,
  ImageData,
  ResizeOptions,
} from "./lib/services/image.service";
export type { ResizableImageOptions } from "./lib/extensions/resizable-image.extension";
