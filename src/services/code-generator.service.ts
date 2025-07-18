import { Injectable, inject } from "@angular/core";
import { TiptapI18nService } from "tiptap-editor";
import { AppI18nService } from "./app-i18n.service";
import {
  TOOLBAR_ITEMS,
  BUBBLE_MENU_ITEMS,
  SLASH_COMMAND_ITEMS,
} from "../config/editor-items.config";
import { ConfigItem } from "../types/editor-config.types";
import { EditorConfigurationService } from "./editor-configuration.service";

// Default library values (copied from tiptap-editor.component.ts)
const DEFAULT_TOOLBAR_CONFIG = {
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
};

const DEFAULT_BUBBLE_MENU_CONFIG = {
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

@Injectable({
  providedIn: "root",
})
export class CodeGeneratorService {
  private configService = inject(EditorConfigurationService);
  private i18nService = inject(TiptapI18nService);
  private appI18nService = inject(AppI18nService);

  generateCode(): string {
    const editorState = this.configService.editorState();
    const toolbarConfig = this.configService.toolbarConfig();
    const bubbleMenuConfig = this.configService.bubbleMenuConfig();
    const activeSlashCommands = this.configService.activeSlashCommands();
    const currentLocale = this.i18nService.currentLocale();
    const codeGen = this.appI18nService.codeGeneration();

    // Detect enabled features and if they differ from default values
    const hasActiveToolbar = this.hasActiveItems(toolbarConfig, TOOLBAR_ITEMS);
    const hasActiveBubbleMenu = this.hasActiveItems(
      bubbleMenuConfig,
      BUBBLE_MENU_ITEMS
    );
    const hasActiveSlashCommands = activeSlashCommands.size > 0;

    const isToolbarDefault = this.isToolbarDefault(toolbarConfig);
    const isBubbleMenuDefault = this.isBubbleMenuDefault(bubbleMenuConfig);
    const isSlashCommandsDefault =
      this.isSlashCommandsDefault(activeSlashCommands);

    // Generate locale input if a specific language is selected
    const localeInput = currentLocale
      ? `\n      [locale]="${currentLocale}"`
      : "";

    return `${this.generateImports(
      hasActiveToolbar && !isToolbarDefault,
      hasActiveBubbleMenu && !isBubbleMenuDefault,
      hasActiveSlashCommands && !isSlashCommandsDefault
    )}

${this.generateComponentDecorator(
  editorState,
  localeInput,
  hasActiveToolbar && !isToolbarDefault,
  hasActiveBubbleMenu && !isBubbleMenuDefault,
  hasActiveSlashCommands && !isSlashCommandsDefault
)}
export class TiptapDemoComponent {
  
  // ============================================================================
  // DEMO CONTENT
  // ============================================================================
  ${this.generateDemoContent(codeGen)}

  ${
    hasActiveToolbar && !isToolbarDefault
      ? this.generateToolbarConfig(toolbarConfig, codeGen)
      : ""
  }

  ${
    hasActiveBubbleMenu && !isBubbleMenuDefault
      ? this.generateBubbleMenuConfig(bubbleMenuConfig, codeGen)
      : ""
  }

  ${
    hasActiveSlashCommands && !isSlashCommandsDefault
      ? this.generateSlashCommandsConfig(activeSlashCommands, codeGen)
      : ""
  }

  ${this.generateContentChangeHandler(codeGen)}
}`;
  }

  private hasActiveItems(
    config: Record<string, boolean>,
    items: ConfigItem[]
  ): boolean {
    return items.some(
      (item) => item.key !== "separator" && config[item.key] === true
    );
  }

  private isToolbarDefault(config: Record<string, boolean>): boolean {
    // Compare with default values for all elements
    const allKeys = Object.keys(DEFAULT_TOOLBAR_CONFIG);

    return allKeys.every((key) => {
      const configValue = config[key] === true;
      const defaultValue =
        DEFAULT_TOOLBAR_CONFIG[key as keyof typeof DEFAULT_TOOLBAR_CONFIG] ===
        true;
      return configValue === defaultValue;
    });
  }

  private isBubbleMenuDefault(config: Record<string, boolean>): boolean {
    // Compare with default values for all elements
    const allKeys = Object.keys(DEFAULT_BUBBLE_MENU_CONFIG);

    return allKeys.every((key) => {
      const configValue = config[key] === true;
      const defaultValue =
        DEFAULT_BUBBLE_MENU_CONFIG[
          key as keyof typeof DEFAULT_BUBBLE_MENU_CONFIG
        ] === true;
      return configValue === defaultValue;
    });
  }

  private isSlashCommandsDefault(activeCommands: Set<string>): boolean {
    // For slash commands, we consider them default if using DEFAULT_SLASH_COMMANDS
    // For now, we consider them default if all basic commands are present
    const defaultCommands = [
      "heading1",
      "heading2",
      "heading3",
      "bulletList",
      "orderedList",
      "blockquote",
      "code",
      "image",
      "horizontalRule",
    ];
    const activeCommandsArray = Array.from(activeCommands);

    return (
      defaultCommands.length === activeCommandsArray.length &&
      defaultCommands.every((cmd) => activeCommandsArray.includes(cmd))
    );
  }

  private generateImports(
    hasToolbar: boolean,
    hasBubbleMenu: boolean,
    hasSlashCommands: boolean
  ): string {
    const imports = [
      "import { Component } from '@angular/core';",
      "import { TiptapEditorComponent } from 'tiptap-editor';",
    ];

    // Add conditional imports based on used features
    if (hasToolbar || hasBubbleMenu || hasSlashCommands) {
      imports.push("import { DEFAULT_SLASH_COMMANDS } from 'tiptap-editor';");
    }

    return `// ============================================================================
// IMPORTS
// ============================================================================
${imports.join("\n")}`;
  }

  private generateComponentDecorator(
    editorState: any,
    localeInput: string,
    hasToolbar: boolean,
    hasBubbleMenu: boolean,
    hasSlashCommands: boolean
  ): string {
    const templateProps = [
      `[content]="${this.appI18nService.codeGeneration().demoContentVar}"`,
    ];

    // Add conditional props only if config differs from default values
    if (hasToolbar) {
      templateProps.push(
        `[toolbar]="${this.appI18nService.codeGeneration().toolbarConfigVar}"`
      );
    }

    if (hasBubbleMenu) {
      templateProps.push(
        `[bubbleMenu]="${
          this.appI18nService.codeGeneration().bubbleMenuConfigVar
        }"`
      );
    }

    // Always present props
    templateProps.push(
      `[showBubbleMenu]="${editorState.showBubbleMenu}"`,
      `[enableSlashCommands]="${editorState.enableSlashCommands}"`,
      `[showToolbar]="${editorState.showToolbar}"`,
      `[placeholder]="${editorState.placeholder}"`,
      `(contentChange)="${
        this.appI18nService.codeGeneration().onContentChangeVar
      }($event)"`
    );

    // Add slashCommandsConfig only if commands are active AND different from default values
    if (hasSlashCommands) {
      templateProps.splice(
        4,
        0,
        `[slashCommandsConfig]="${
          this.appI18nService.codeGeneration().slashCommandsConfigVar
        }"`
      );
    }

    // Add locale if specified
    if (localeInput) {
      templateProps.splice(1, 0, localeInput.trim());
    }

    return `@Component({
  selector: 'app-tiptap-demo',
  standalone: true,
  imports: [TiptapEditorComponent],
  template: \`
    <tiptap-editor
      ${templateProps.join("\n      ")}
    >
    </tiptap-editor>
  \`
})`;
  }

  private generateDemoContent(codeGen: any): string {
    return `// ${codeGen.demoContentComment}
  ${codeGen.demoContentVar} = '<p>${codeGen.placeholderContent}</p>';`;
  }

  private generateToolbarConfig(toolbarConfig: any, codeGen: any): string {
    return `
  // ============================================================================
  // TOOLBAR CONFIGURATION
  // ============================================================================
  ${codeGen.toolbarConfigComment}
  ${codeGen.toolbarConfigVar} = {
${this.generateSimpleConfig(toolbarConfig, TOOLBAR_ITEMS)}
  };`;
  }

  private generateBubbleMenuConfig(
    bubbleMenuConfig: any,
    codeGen: any
  ): string {
    return `
  // ============================================================================
  // BUBBLE MENU CONFIGURATION
  // ============================================================================
  ${codeGen.bubbleMenuConfigComment}
  ${codeGen.bubbleMenuConfigVar} = {
${this.generateSimpleConfig(bubbleMenuConfig, BUBBLE_MENU_ITEMS)}
  };`;
  }

  private generateSlashCommandsConfig(
    activeSlashCommands: any,
    codeGen: any
  ): string {
    return `
  // ============================================================================
  // SLASH COMMANDS CONFIGURATION
  // ============================================================================
  ${codeGen.slashCommandsConfigComment}
  ${codeGen.slashCommandsConfigVar} = {
    commands: [
${this.generateCompleteSlashCommandsConfig(activeSlashCommands)}
    ]
  };`;
  }

  private generateContentChangeHandler(codeGen: any): string {
    return `
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  ${codeGen.onContentChangeComment}
  ${codeGen.onContentChangeVar}(content: string) {
    console.log('${codeGen.contentChangedLog}', content);
  }`;
  }

  private generateSimpleConfig(
    config: Record<string, boolean>,
    availableItems: ConfigItem[]
  ): string {
    return availableItems
      .filter((item) => item.key !== "separator")
      .map((item) => {
        const isActive = config[item.key] === true;
        const comment = isActive ? "" : " // ";
        return `${comment}    ${item.key}: ${isActive},`;
      })
      .join("\n");
  }

  private generateCompleteSlashCommandsConfig(
    activeCommands: Set<string>
  ): string {
    const slashTranslations = this.i18nService.slashCommands();
    const currentLocale = this.i18nService.currentLocale();

    // Mapping keys to translations with safe access
    const getTranslation = (key: string) => {
      const translations: any = slashTranslations;
      return translations[key] || { title: key, description: "", keywords: [] };
    };

    const activeCommandsArray = Array.from(activeCommands);

    return activeCommandsArray
      .map((key) => {
        const translation = getTranslation(key);
        const iconMap: Record<string, string> = {
          heading1: "format_h1",
          heading2: "format_h2",
          heading3: "format_h3",
          bulletList: "format_list_bulleted",
          orderedList: "format_list_numbered",
          blockquote: "format_quote",
          code: "code",
          image: "image",
          horizontalRule: "horizontal_rule",
        };

        const codeGen = this.appI18nService.codeGeneration();
        return `      {
        title: '${translation.title}',
        description: '${translation.description}',
        icon: '${iconMap[key]}',
        keywords: ${JSON.stringify(translation.keywords)},
        command: (editor) => {
          // ${codeGen.commandImplementation} ${key}
          ${this.generateCommandImplementation(key)}
        }
      }`;
      })
      .join(",\n");
  }

  private generateCommandImplementation(key: string): string {
    const codeGen = this.appI18nService.codeGeneration();
    const implementations: Record<string, string> = {
      heading1: "editor.chain().focus().toggleHeading({ level: 1 }).run();",
      heading2: "editor.chain().focus().toggleHeading({ level: 2 }).run();",
      heading3: "editor.chain().focus().toggleHeading({ level: 3 }).run();",
      bulletList: "editor.chain().focus().toggleBulletList().run();",
      orderedList: "editor.chain().focus().toggleOrderedList().run();",
      blockquote: "editor.chain().focus().toggleBlockquote().run();",
      code: "editor.chain().focus().toggleCodeBlock().run();",
      image: `console.log('${codeGen.implementImageUpload}');`,
      horizontalRule: "editor.chain().focus().setHorizontalRule().run();",
    };

    return (
      implementations[key] ||
      `console.log('${codeGen.commandImplementation} ${key}');`
    );
  }

  // Copy code to clipboard
  async copyCode(): Promise<void> {
    try {
      const code = this.generateCode();
      await navigator.clipboard.writeText(code);
      const successMessage =
        this.appI18nService.currentLocale() === "fr"
          ? "Code copié dans le presse-papiers !"
          : "Code copied to clipboard!";
      console.log(successMessage);
    } catch (error) {
      const errorMessage =
        this.appI18nService.currentLocale() === "fr"
          ? "Erreur lors de la copie:"
          : "Error copying code:";
      console.error(errorMessage, error);
    }
  }

  // Method to highlight code (placeholder for now)
  highlightCode(code: string): string {
    // Return raw code without highlighting to avoid display issues
    return code;
  }
}
