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
    return ({ node, getPos, editor }) => {
      // NODE VIEW LAYOUT (Vanilla)
      const dom = document.createElement("div");
      dom.className = "component-example-block";
      dom.style.position = "relative";

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Komponente suchen …";
      input.classList.add("cdx-input");
      input.style.width = "100%";

      const list = document.createElement("ul");
      list.style.listStyle = "none";
      list.style.margin = "0";
      list.style.padding = "0";
      list.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
      list.style.background = "#fff";
      list.style.borderRadius = "6px";
      list.style.minWidth = "180px";
      list.style.maxHeight = "220px";
      list.style.overflowY = "auto";
      list.style.position = "absolute";
      list.style.zIndex = "98";

      // Suche & Filter
      const getFilteredItems = (val: string) => {
        const cl = editor.extensionManager.extensions.find((ext) => ext.name === "componentExample")?.options
          ?.componentList as Example[];
        if (!cl) return [];
        return val ? cl.filter((c) => c.className.toLowerCase().includes(val.toLowerCase())) : cl;
      };

      // List zeichnen
      const renderList = (items: Example[]) => {
        list.innerHTML = "";
        if (items.length === 0) {
          const li = document.createElement("li");
          li.textContent = "Keine Treffer";
          li.style.padding = "8px 12px";
          li.style.color = "#666";
          list.appendChild(li);
          return;
        }
        items.forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item.className;
          li.style.padding = "8px 12px";
          li.style.cursor = "pointer";
          li.onmouseenter = () => (li.style.background = "#e5e5e5");
          li.onmouseleave = () => (li.style.background = "none");
          li.onclick = () => {
            input.value = item.className;

            // Speichere Auswahl im Node (wichtig: update auf Dokumentebene)
            editor.commands.command(({ tr }) => {
              tr.setNodeMarkup(getPos(), undefined, {
                ...node.attrs,
                selectedComponent: item,
              });
              return true;
            });

            input.blur();
            document.body.contains(list) && document.body.removeChild(list);
            renderIframe(item.className);
          };
          list.appendChild(li);
        });
      };

      input.addEventListener("focus", () => {
        const filtered = getFilteredItems(input.value);
        renderList(filtered);

        const rect = input.getBoundingClientRect();
        list.style.left = rect.left + "px";
        list.style.top = rect.bottom + "px";
        list.style.width = rect.width + "px";
        document.body.appendChild(list);
      });
      input.addEventListener("blur", () => {
        setTimeout(() => {
          document.body.contains(list) && document.body.removeChild(list);
        }, 150);
      });
      input.addEventListener("input", () => {
        renderList(getFilteredItems(input.value));
        if (!document.body.contains(list)) document.body.appendChild(list);
      });

      dom.appendChild(input);

      // Bei Selektion befüllen
      if (node.attrs.selectedComponent && node.attrs.selectedComponent.className) {
        input.value = node.attrs.selectedComponent.className;
      }

      // IFRAME
      let iframe: HTMLIFrameElement | null = null;
      const renderIframe = (className: string | null) => {
        if (iframe) dom.removeChild(iframe);
        if (!className) return;
        iframe = document.createElement("iframe");
        // Baue URL, z.B. appBaseUrl mit className als Parameter
        const url = `${editor.extensionManager.extensions.find((ext) => ext.name === "componentExample")?.options?.appBaseUrl || ""}/example-server?example=${className}`;
        iframe.src = url;
        iframe.style.width = "100%";
        iframe.style.height = "320px"; // optional dynamisch machen
        iframe.style.border = "1px solid #dbeafe";
        iframe.style.borderRadius = "8px";
        iframe.style.marginTop = "12px";
        dom.appendChild(iframe);
      };
      renderIframe(node.attrs.selectedComponent?.className || null);

      return {
        dom,
        // Atom-Node, also keine Kinder
      };
    };
  },
});
