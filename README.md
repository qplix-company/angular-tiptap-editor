# Angular Tiptap Editor

A modern, customizable rich-text editor for Angular applications, built with Tiptap and featuring complete internationalization support.

[![Try it on StackBlitz](https://img.shields.io/badge/Try%20it-StackBlitz-blue?style=for-the-badge&logo=stackblitz)](https://stackblitz.com/edit/angular-tiptap-editor)

## 🚀 Features

- **Modern Angular**: Built with Angular 18+
- **Rich Text Editing**: Powered by Tiptap with extensive formatting options
- **Internationalization**: Full i18n support (English & French) with auto-detection
- **Customizable**: Highly configurable toolbar, bubble menus, and slash commands
- **Image Support**: Advanced image handling with resizing and compression
- **Height Control**: Configurable editor height with scrolling
- **TypeScript**: Full TypeScript support with strict typing
- **Accessibility**: Built with accessibility best practices

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
import { AngularTiptapEditorComponent } from "@flogeez/angular-tiptap-editor";

@Component({
  selector: "app-advanced",
  standalone: true,
  imports: [AngularTiptapEditorComponent],
  template: `
    <angular-tiptap-editor
      [content]="content"
      [toolbar]="toolbarConfig"
      [bubbleMenu]="bubbleMenuConfig"
      [locale]="'en'"
      [height]="400"
      [showCharacterCount]="true"
      (contentChange)="onContentChange($event)"
    />
  `,
})
export class AdvancedComponent {
  content = "<h1>Welcome!</h1><p>Start editing...</p>";

  toolbarConfig = {
    bold: true,
    italic: true,
    underline: true,
    heading1: true,
    heading2: true,
    bulletList: true,
    orderedList: true,
    link: true,
    image: true,
  };

  bubbleMenuConfig = {
    bold: true,
    italic: true,
    underline: true,
    link: true,
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
      />
      <button type="submit">Submit</button>
    </form>
  `,
})
export class FormComponent {
  contentControl = new FormControl("<p>Initial content</p>");
}
```

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

| Input                | Type               | Default             | Description                |
| -------------------- | ------------------ | ------------------- | -------------------------- |
| `content`            | `string`           | `""`                | Initial HTML content       |
| `placeholder`        | `string`           | `"Start typing..."` | Placeholder text           |
| `locale`             | `'en' \| 'fr'`     | Auto-detect         | Editor language            |
| `editable`           | `boolean`          | `true`              | Whether editor is editable |
| `height`             | `number`           | `undefined`         | Fixed height in pixels     |
| `maxHeight`          | `number`           | `undefined`         | Maximum height in pixels   |
| `minHeight`          | `number`           | `200`               | Minimum height in pixels   |
| `showToolbar`        | `boolean`          | `true`              | Show toolbar               |
| `showBubbleMenu`     | `boolean`          | `true`              | Show bubble menu           |
| `showCharacterCount` | `boolean`          | `true`              | Show character counter     |
| `toolbar`            | `ToolbarConfig`    | All enabled         | Toolbar configuration      |
| `bubbleMenu`         | `BubbleMenuConfig` | All enabled         | Bubble menu configuration  |

#### Outputs

| Output          | Type              | Description                     |
| --------------- | ----------------- | ------------------------------- |
| `contentChange` | `string`          | Emitted when content changes    |
| `editorCreated` | `Editor`          | Emitted when editor is created  |
| `editorFocus`   | `{editor, event}` | Emitted when editor gains focus |
| `editorBlur`    | `{editor, event}` | Emitted when editor loses focus |

### Configuration Examples

```typescript
// Minimal toolbar
const minimalToolbar = {
  bold: true,
  italic: true,
  bulletList: true,
};

// Full toolbar
const fullToolbar = {
  bold: true,
  italic: true,
  underline: true,
  strike: true,
  code: true,
  heading1: true,
  heading2: true,
  heading3: true,
  bulletList: true,
  orderedList: true,
  blockquote: true,
  link: true,
  image: true,
  horizontalRule: true,
  undo: true,
  redo: true,
};
```

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

## 📞 Support

- 🐛 [Report Issues](https://github.com/flogeez/angular-tiptap-editor/issues)
- 💡 [Feature Requests](https://github.com/flogeez/angular-tiptap-editor/issues)
- 📖 [Documentation](https://github.com/flogeez/angular-tiptap-editor#readme)

## 🔗 Links

- 🎮 [Live Demo](https://flogeez.github.io/angular-tiptap-editor/)
- 📖 [Tiptap Documentation](https://tiptap.dev/)
- 🅰️ [Angular Documentation](https://angular.dev/)
- 📦 [NPM Package](https://www.npmjs.com/package/@flogeez/angular-tiptap-editor)

---

Made with ❤️ by [FloGeez](https://github.com/FloGeez)
