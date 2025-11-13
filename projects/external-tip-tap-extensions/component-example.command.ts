import { CommandProps, Node, RawCommands, mergeAttributes } from "@tiptap/core";
import { Extension } from "@tiptap/core";

// Beispielmodell, passe dies an deine Struktur an

export interface Example {
  className: string;
  // weitere Felder falls gewünscht
}

export interface ComponentExampleNodeAttrs {
  selectedComponent: Example | null;
}

export interface ComponentExampleOptions {
  componentList: Example[];
  appBaseUrl: string;
}

export const ComponentExampleNode = Node.create<ComponentExampleOptions>({
  name: "componentExample",

  group: "block",
  atom: true,
  selectable: true,

  addOptions() {
    return {
      componentList: [],
      appBaseUrl: "http://localhost:42011",
    };
  },

  addAttributes() {
    return {
      selectedComponent: {
        default: null,
        parseHTML: (element) => {
          try {
            // Lies das Attribut aus dem JSON-String
            return element.getAttribute("data-selected-component")
              ? JSON.parse(element.getAttribute("data-selected-component")!)
              : null;
          } catch {
            return null;
          }
        },
        renderHTML: (attrs) => ({
          "data-selected-component": JSON.stringify(attrs.selectedComponent),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "component-example-block" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["component-example-block", mergeAttributes(HTMLAttributes)];
  },

  addCommands(this: any): any {
    return {
      insertComponentExample: (props: CommandProps) => {
        return this.editor.commands.insertContent({
          type: this.name,
          attrs: { selectedComponent: null },
        });
      },
    };
  },

  addNodeView() {
    return ({ node, editor }) => {
      const dom = document.createElement("div");
      dom.className = "component-example-block";
      dom.style.position = "relative";

      const placeholder = document.createElement("div");
      placeholder.className = "component-example-placeholder";
      placeholder.textContent = "Komponente über das Bubble Menu auswählen …";
      placeholder.style.display = "flex";
      placeholder.style.alignItems = "center";
      placeholder.style.justifyContent = "center";
      placeholder.style.minHeight = "140px";
      placeholder.style.border = "1px dashed #cbd5f5";
      placeholder.style.borderRadius = "8px";
      placeholder.style.color = "#64748b";
      placeholder.style.padding = "1rem";
      placeholder.style.background = "#f8fafc";
      dom.appendChild(placeholder);

      let iframe: HTMLIFrameElement | null = null;
      const extensionOptions = editor.extensionManager.extensions.find((ext) => ext.name === "componentExample")
        ?.options as ComponentExampleOptions | undefined;

      const renderView = (attrs: ComponentExampleNodeAttrs) => {
        const className = attrs.selectedComponent?.className ?? null;
        if (className) {
          placeholder.style.display = "none";
          const url = `${extensionOptions?.appBaseUrl || ""}/example-server?example=${encodeURIComponent(className)}`;
          if (!iframe) {
            iframe = document.createElement("iframe");
            iframe.style.width = "100%";
            iframe.style.height = "320px";
            iframe.style.border = "1px solid #dbeafe";
            iframe.style.borderRadius = "8px";
            iframe.style.marginTop = "12px";
            dom.appendChild(iframe);
          }
          iframe.src = url;
        } else {
          placeholder.style.display = "flex";
          if (iframe) {
            dom.removeChild(iframe);
            iframe = null;
          }
        }
      };

      renderView(node.attrs as ComponentExampleNodeAttrs);

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== this.name) {
            return false;
          }
          renderView(updatedNode.attrs as ComponentExampleNodeAttrs);
          return true;
        },
      };
    };
  },
});
