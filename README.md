# Angular Tiptap Editor

A modern, customizable rich-text editor for Angular applications, built with Tiptap and featuring complete internationalization support.

[![Try it on StackBlitz](https://img.shields.io/badge/Try%20it-StackBlitz-blue?style=for-the-badge&logo=stackblitz)](https://stackblitz.com/edit/angular-tiptap-editor)

## 🚀 Features

- **Modern Angular**: Built with Angular 18+ with Signals and modern patterns
- **Rich Text Editing**: Powered by Tiptap v3.3.0 with extensive formatting options
- **Table Support**: Full table management with bubble menus and cell selection
- **Slash Commands**: Intuitive slash commands for quick content insertion
- **Internationalization**: Full i18n support (English & French) with auto-detection
- **Customizable**: Highly configurable toolbar, bubble menus, and slash commands
- **Image Support**: Advanced image handling with resizing, compression, and bubble menus
- **Height Control**: Configurable editor height with scrolling
- **Word/Character Count**: Real-time word and character counting with proper pluralization
- **Office Paste**: Clean pasting from Microsoft Office applications
- **TypeScript**: Full TypeScript support with strict typing
- **Accessibility**: Built with accessibility best practices
- **Service Architecture**: Clean service-based architecture with `EditorCommandsService`

## 📦 Installation

```bash
npm install @flogeez/angular-tiptap-editor
```

### CSS Styles

Add the required CSS to your `angular.json` file in the `styles` array:

```json
{
  "styles": [
    ...
    "node_modules/@fontsource/material-symbols-outlined/index.css",
    "node_modules/@flogeez/angular-tiptap-editor/src/lib/styles/index.css",
    ...
  ]
}
```

## 🎯 Quick Start

### 1. Basic Usage

```typescript
import { Component } from "@angular/core";
import { AngularTiptapEditorComponent } from "@flogeez/angular-tiptap-editor";

@Component({
  selector: "app-example",
  standalone: true,
  imports: [AngularTiptapEditorComponent],
  template: `
    <angular-tiptap-editor
      [content]="content"
      (contentChange)="onContentChange($event)"
    />
  `,
})
export class ExampleComponent {
  content = "<p>Hello <strong>World</strong>!</p>";

  onContentChange(newContent: string) {
    this.content = newContent;
    console.log("Content updated:", newContent);
  }
}
```

### 2. With Custom Configuration

```typescript
import { Component } from "@angular/core";
import {
  AngularTiptapEditorComponent,
  DEFAULT_TOOLBAR_CONFIG,
  DEFAULT_BUBBLE_MENU_CONFIG,
} from "@flogeez/angular-tiptap-editor";

@Component({
  selector: "app-advanced",
  standalone: true,
  imports: [AngularTiptapEditorComponent],
  template: `
    <angular-tiptap-editor
      [content]="content"
      [toolbar]="toolbarConfig"
      [bubbleMenu]="bubbleMenuConfig"
      [slashCommands]="slashCommandsConfig"
      [locale]="'en'"
      [height]="400"
      [showCharacterCount]="true"
      [showWordCount]="true"
      (contentChange)="onContentChange($event)"
    />
  `,
})
export class AdvancedComponent {
  content = "<h1>Welcome!</h1><p>Start editing...</p>";

  // Use default configurations as base
  toolbarConfig = {
    ...DEFAULT_TOOLBAR_CONFIG,
    clear: true, // Add clear button
  };

  bubbleMenuConfig = {
    ...DEFAULT_BUBBLE_MENU_CONFIG,
    table: true, // Enable table bubble menu
  };

  slashCommandsConfig = {
    commands: [], // Will be populated by the library
  };

  onContentChange(newContent: string) {
    this.content = newContent;
  }
}
```

### 3. With Form Integration

```typescript
import { Component } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { AngularTiptapEditorComponent } from "@flogeez/angular-tiptap-editor";

@Component({
  selector: "app-form",
  standalone: true,
  imports: [AngularTiptapEditorComponent, ReactiveFormsModule],
  template: `
    <form>
      <angular-tiptap-editor
        [formControl]="contentControl"
        placeholder="Enter your content here..."
        [showCharacterCount]="true"
        [showWordCount]="true"
      />
      <button type="submit">Submit</button>
    </form>
  `,
})
export class FormComponent {
  contentControl = new FormControl("<p>Initial content</p>");
}
```

### 4. Using EditorCommandsService

```typescript
import { Component, inject } from "@angular/core";
import { EditorCommandsService } from "@flogeez/angular-tiptap-editor";

@Component({
  selector: "app-commands",
  standalone: true,
  template: `
    <div>
      <button (click)="clearContent()">Clear Content</button>
      <button (click)="focusEditor()">Focus Editor</button>
      <button (click)="setContent()">Set Content</button>
    </div>
  `,
})
export class CommandsComponent {
  private editorCommandsService = inject(EditorCommandsService);
  private editor: Editor | null = null;

  onEditorCreated(editor: Editor) {
    this.editor = editor;
  }

  clearContent() {
    if (this.editor) {
      this.editorCommandsService.clearContent(this.editor);
    }
  }

  focusEditor() {
    if (this.editor) {
      this.editorCommandsService.focus(this.editor);
    }
  }

  setContent() {
    if (this.editor) {
      this.editorCommandsService.setContent(
        this.editor,
        "<h1>New Content</h1>"
      );
    }
  }
}
```

## ✨ Key Features

### 📊 Table Management

Full table support with intuitive bubble menus:

- **Table Creation**: Insert tables via slash commands (`/table`)
- **Cell Selection**: Click and drag to select multiple cells
- **Bubble Menus**: Context-aware menus for table operations
- **Row/Column Management**: Add, remove, and merge cells
- **Styling**: Custom table styling with proper borders

### ⚡ Slash Commands

Quick content insertion with slash commands:

- **Headings**: `/h1`, `/h2`, `/h3`
- **Lists**: `/bullet`, `/numbered`
- **Blocks**: `/quote`, `/code`, `/line`
- **Media**: `/image`, `/table`
- **Fully Internationalized**: All commands translated

### 🖼️ Advanced Image Handling

Professional image management:

- **Drag & Drop**: Drag images directly into the editor
- **File Selection**: Click to select images from device
- **Auto-Compression**: Images automatically compressed (max 1920x1080)
- **Resizable**: Images can be resized with handles
- **Bubble Menu**: Context menu for image operations

### 📝 Word & Character Counting

Real-time content statistics:

- **Live Updates**: Counters update as you type
- **Proper Pluralization**: "1 word" vs "2 words"
- **Separate Counts**: Independent word and character counts
- **Configurable**: Show/hide individual counters

## 🎨 Demo

### 🌐 Live Demo

Try the interactive demo online: **[https://flogeez.github.io/angular-tiptap-editor/](https://flogeez.github.io/angular-tiptap-editor/)**

### 🖥️ Run Locally

```bash
git clone https://github.com/FloGeez/angular-tiptap-editor.git
cd angular-tiptap-editor
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200) to view the demo.

## 📖 Documentation

### API Reference

#### Inputs

| Input                | Type                  | Default             | Description                  |
| -------------------- | --------------------- | ------------------- | ---------------------------- |
| `content`            | `string`              | `""`                | Initial HTML content         |
| `placeholder`        | `string`              | `"Start typing..."` | Placeholder text             |
| `locale`             | `'en' \| 'fr'`        | Auto-detect         | Editor language              |
| `editable`           | `boolean`             | `true`              | Whether editor is editable   |
| `height`             | `number`              | `undefined`         | Fixed height in pixels       |
| `maxHeight`          | `number`              | `undefined`         | Maximum height in pixels     |
| `minHeight`          | `number`              | `200`               | Minimum height in pixels     |
| `showToolbar`        | `boolean`             | `true`              | Show toolbar                 |
| `showBubbleMenu`     | `boolean`             | `true`              | Show bubble menu             |
| `showCharacterCount` | `boolean`             | `true`              | Show character counter       |
| `showWordCount`      | `boolean`             | `true`              | Show word counter            |
| `toolbar`            | `ToolbarConfig`       | All enabled         | Toolbar configuration        |
| `bubbleMenu`         | `BubbleMenuConfig`    | All enabled         | Bubble menu configuration    |
| `slashCommands`      | `SlashCommandsConfig` | All enabled         | Slash commands configuration |

#### Outputs

| Output          | Type              | Description                     |
| --------------- | ----------------- | ------------------------------- |
| `contentChange` | `string`          | Emitted when content changes    |
| `editorCreated` | `Editor`          | Emitted when editor is created  |
| `editorFocus`   | `{editor, event}` | Emitted when editor gains focus |
| `editorBlur`    | `{editor, event}` | Emitted when editor loses focus |

### Configuration Examples

```typescript
import {
  DEFAULT_TOOLBAR_CONFIG,
  DEFAULT_BUBBLE_MENU_CONFIG,
  SLASH_COMMAND_KEYS,
} from "@flogeez/angular-tiptap-editor";

// Minimal toolbar
const minimalToolbar = {
  bold: true,
  italic: true,
  bulletList: true,
};

// Full toolbar with clear button
const fullToolbar = {
  ...DEFAULT_TOOLBAR_CONFIG,
  clear: true, // Add clear button
};

// Bubble menu with table support
const bubbleMenuWithTable = {
  ...DEFAULT_BUBBLE_MENU_CONFIG,
  table: true, // Enable table bubble menu
};

// Slash commands configuration
const slashCommands = {
  commands: [], // Will be populated by filterSlashCommands()
};

// Available slash command keys
console.log(SLASH_COMMAND_KEYS); // ["heading1", "heading2", "heading3", "bulletList", "orderedList", "blockquote", "code", "image", "horizontalRule", "table"]
```

### Projecting Custom Bubble Menus

You can now compose the editor UI by projecting your own bubble menus. The library ships a `TiptapBubbleMenuPortalDirective` that exposes the current `Editor` instance to any template inside `<angular-tiptap-editor>`.

1. Import the directive alongside the editor component:

```ts
import {
  AngularTiptapEditorComponent,
  TiptapBubbleMenuPortalDirective,
} from "@flogeez/angular-tiptap-editor";
```

2. Register your template inside the editor and grab the editor reference through the template context:

```html
<angular-tiptap-editor
  #editorCmp="angularTiptapEditor"
  [extensions]="[ComponentExampleNode]"
>
  <ng-template tiptapBubbleMenu="componentExample" let-editor="editor">
    <component-example-bubble-menu [editor]="editor!" />
  </ng-template>
</angular-tiptap-editor>
```

3. Implement the projected component however you like. This repo now ships a reusable overlay host at
`projects/external-tip-tap-extensions/generic-bubble-menu.component.ts` and a concrete implementation for
`ComponentExampleNode` at `projects/external-tip-tap-extensions/component-example-bubble-menu.component.ts` that shows how to drive
node-specific actions (like selecting a component) entirely from a projected bubble menu.

This approach keeps the core editor lean while letting consumers opt-in to any amount of custom UI.

## 🌍 Internationalization

The editor supports English and French with automatic browser language detection:

```typescript
// Force English
<angular-tiptap-editor [locale]="'en'" />

// Force French
<angular-tiptap-editor [locale]="'fr'" />

// Auto-detect (default)
<angular-tiptap-editor />
```

### Available Translations

- **English (en)**: Default language with complete translations
- **French (fr)**: Full French translation including:
  - Toolbar buttons
  - Bubble menu items
  - Slash commands
  - Placeholder text
  - Error messages
  - Word/character count (with proper pluralization)

### Custom Slash Commands

```typescript
import {
  filterSlashCommands,
  SLASH_COMMAND_KEYS,
} from "@flogeez/angular-tiptap-editor";

// Filter available slash commands
const activeCommands = new Set(["heading1", "heading2", "bulletList", "table"]);
const commands = filterSlashCommands(activeCommands);

// Use in component
slashCommandsConfig = {
  commands: commands,
};
```

## 🏗️ Architecture

### Service-Based Design

The library follows a clean service-based architecture:

- **`EditorCommandsService`**: Centralized service for all editor commands
- **`TiptapI18nService`**: Internationalization service with automatic language detection
- **`ImageService`**: Advanced image handling with compression and resizing
- **`filterSlashCommands()`**: Utility function for managing slash commands

### Modern Angular Patterns

- **Signals**: Used throughout for reactive state management
- **Dependency Injection**: Clean service injection with `inject()`
- **Standalone Components**: All components are standalone for better tree-shaking
- **TypeScript**: Strict typing with comprehensive interfaces

### Default Configurations

The library provides default configurations that can be imported and customized:

```typescript
import {
  DEFAULT_TOOLBAR_CONFIG,
  DEFAULT_BUBBLE_MENU_CONFIG,
  DEFAULT_IMAGE_BUBBLE_MENU_CONFIG,
  DEFAULT_TABLE_MENU_CONFIG,
  SLASH_COMMAND_KEYS,
} from "@flogeez/angular-tiptap-editor";
```

## 🔧 Development

### Build Library

```bash
npm run build:lib
```

### Watch Mode (Development)

```bash
npm run dev
```

This runs the library in watch mode and starts the demo application.

### Available Scripts

- `npm start` - Start demo application
- `npm run build` - Build demo application
- `npm run build:lib` - Build library
- `npm run watch:lib` - Watch library changes
- `npm run dev` - Development mode (watch + serve)

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🔗 Links

- 🎮 [Live Demo](https://flogeez.github.io/angular-tiptap-editor/)
- 📖 [Tiptap Documentation](https://tiptap.dev/)
- 🅰️ [Angular Documentation](https://angular.dev/)
- 📦 [NPM Package](https://www.npmjs.com/package/@flogeez/angular-tiptap-editor)
- 🐛 [Report Issues](https://github.com/FloGeez/angular-tiptap-editor/issues)
- 💡 [Feature Requests](https://github.com/FloGeez/angular-tiptap-editor/issues)

## 🆕 What's New

### Latest Updates

- ✅ **Table Support**: Full table management with bubble menus
- ✅ **Slash Commands**: Intuitive content insertion commands
- ✅ **Word/Character Count**: Real-time counting with proper pluralization
- ✅ **Service Architecture**: Clean `EditorCommandsService` for better maintainability
- ✅ **Default Configurations**: Importable default configs for easy customization
- ✅ **Office Paste**: Clean pasting from Microsoft Office applications
- ✅ **Enhanced i18n**: Improved internationalization with better architecture

---

Made with ❤️ by [FloGeez](https://github.com/FloGeez)
