import { CommonModule } from "@angular/common";
import { Component, OnDestroy, effect, computed, signal, input } from "@angular/core";
import type { Editor } from "@tiptap/core";
import { GenericBubbleMenuComponent } from "./generic-bubble-menu.component";
import {
  ComponentExampleNodeAttrs,
  ComponentExampleOptions,
  Example,
} from "./component-example.command";

@Component({
  selector: "component-example-bubble-menu",
  standalone: true,
  imports: [CommonModule, GenericBubbleMenuComponent],
  template: `
    <generic-bubble-menu
      [editor]="editor()!"
      [visibleWhen]="isComponentExampleActive"
      [referenceClientRect]="componentNodeRect"
    >
      <div class="component-example-menu">
        <div class="component-example-search">
          <input
            type="text"
            class="cdx-input"
            placeholder="Komponente suchen …"
            [value]="searchTerm()"
            (input)="onSearch($event)"
          />
        </div>

        <div class="component-example-results">
          @if (filteredComponents().length === 0) {
            <div class="component-example-empty">Keine Treffer</div>
          } @else {
            <div class="component-example-list">
              @for (component of filteredComponents(); track component.className) {
                <button
                  type="button"
                  class="component-example-item"
                  [class.active]="isActiveComponent(component)"
                  (click)="selectComponent(component)"
                >
                  {{ component.className }}
                </button>
              }
            </div>
          }
        </div>

        <div class="component-example-actions">
          <button type="button" (click)="openPreview()" [disabled]="!hasSelectedComponent()">
            Vorschau öffnen
          </button>
          <button type="button" (click)="clearSelection()" [disabled]="!hasSelectedComponent()">
            Auswahl löschen
          </button>
          <button type="button" class="danger" (click)="removeNode()">
            Block entfernen
          </button>
        </div>
      </div>
    </generic-bubble-menu>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .component-example-menu {
        display: flex;
        flex-direction: column;
        min-width: 240px;
        max-width: 260px;
        gap: 0.75rem;
      }
      .component-example-search input {
        width: 100%;
      }
      .component-example-results {
        max-height: 220px;
      }
      .component-example-list {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        max-height: 200px;
        overflow-y: auto;
      }
      .component-example-item {
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        background: #f8fafc;
        padding: 0.35rem 0.5rem;
        cursor: pointer;
        text-align: left;
        font-size: 0.85rem;
      }
      .component-example-item.active {
        background: #dbeafe;
        border-color: #93c5fd;
      }
      .component-example-empty {
        font-size: 0.85rem;
        color: #64748b;
        padding: 0.25rem 0;
      }
      .component-example-actions {
        display: flex;
        gap: 0.5rem;
      }
      .component-example-actions button {
        flex: 1;
        border: none;
        border-radius: 6px;
        padding: 0.35rem 0.5rem;
        cursor: pointer;
        background: #0f172a;
        color: #fff;
        font-size: 0.8rem;
      }
      .component-example-actions button:disabled {
        opacity: 0.5;
        cursor: default;
      }
      .component-example-actions button.danger {
        background: #dc2626;
      }
    `,
  ],
})
export class ComponentExampleBubbleMenuComponent implements OnDestroy {
  editor = input.required<Editor>();

  searchTerm = signal("");
  componentList = signal<Example[]>([]);
  currentNodeAttrs = signal<ComponentExampleNodeAttrs | null>(null);

  filteredComponents = computed(() => {
    const list = this.componentList();
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) {
      return list;
    }
    return list.filter((component) => component.className.toLowerCase().includes(query));
  });

  hasSelectedComponent = computed(() => !!this.currentNodeAttrs()?.selectedComponent);

  private currentEditor: Editor | null = null;
  private lastSelectedComponentName: string | null = null;

  private readonly selectionListener = () => this.refreshCurrentNodeAttrs();
  private readonly transactionListener = () => this.refreshCurrentNodeAttrs();

  constructor() {
    effect(() => {
      const ed = this.editor();
      this.bindToEditor(ed);
    });
  }

  ngOnDestroy(): void {
    this.detachEditorListeners();
  }

  readonly isComponentExampleActive = () => !!this.editor()?.isActive("componentExample");

  readonly componentNodeRect = () => {
    const ed = this.editor();
    if (!ed) {
      return new DOMRect();
    }
    const pos = ed.state.selection.from;
    const dom = ed.view.nodeDOM(pos) as HTMLElement | null;
    if (dom) {
      return dom.getBoundingClientRect();
    }
    const resolved = ed.view.domAtPos(pos).node as Node;
    const element = resolved.nodeType === Node.TEXT_NODE ? resolved.parentElement : (resolved as HTMLElement | null);
    return element?.getBoundingClientRect() ?? new DOMRect();
  };

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  selectComponent(component: Example) {
    const ed = this.editor();
    if (!ed || !ed.isEditable) {
      return;
    }
    ed.chain().focus().updateAttributes("componentExample", { selectedComponent: component }).run();
    this.searchTerm.set(component.className);
    this.lastSelectedComponentName = component.className;
    this.refreshCurrentNodeAttrs();
  }

  clearSelection() {
    const ed = this.editor();
    if (!ed || !ed.isEditable) {
      return;
    }
    ed.chain().focus().updateAttributes("componentExample", { selectedComponent: null }).run();
    this.lastSelectedComponentName = null;
    this.searchTerm.set("");
    this.refreshCurrentNodeAttrs();
  }

  removeNode() {
    const ed = this.editor();
    if (!ed || !ed.isEditable) {
      return;
    }
    ed.chain().focus().deleteSelection().run();
  }

  openPreview() {
    const attrs = this.currentNodeAttrs();
    const className = attrs?.selectedComponent?.className;
    if (!className) {
      return;
    }
    const ed = this.editor();
    const options = ed ? this.getExtensionOptions(ed) : null;
    const baseUrl = options?.appBaseUrl ?? "";
    window.open(`${baseUrl}/example-server?example=${encodeURIComponent(className)}`, "_blank");
  }

  isActiveComponent(component: Example): boolean {
    const selected = this.currentNodeAttrs()?.selectedComponent?.className;
    return selected === component.className;
  }

  private bindToEditor(editor: Editor | null) {
    if (this.currentEditor === editor) {
      return;
    }

    this.detachEditorListeners();
    this.currentEditor = editor;

    if (!editor) {
      this.componentList.set([]);
      this.currentNodeAttrs.set(null);
      this.searchTerm.set("");
      this.lastSelectedComponentName = null;
      return;
    }

    this.componentList.set(this.getComponentList(editor));
    editor.on("selectionUpdate", this.selectionListener);
    editor.on("transaction", this.transactionListener);
    this.refreshCurrentNodeAttrs();
  }

  private detachEditorListeners() {
    if (!this.currentEditor) {
      return;
    }
    this.currentEditor.off("selectionUpdate", this.selectionListener);
    this.currentEditor.off("transaction", this.transactionListener);
    this.currentEditor = null;
  }

  private refreshCurrentNodeAttrs() {
    const ed = this.editor();
    if (!ed || !ed.isActive("componentExample")) {
      this.currentNodeAttrs.set(null);
      this.lastSelectedComponentName = null;
      return;
    }
    const pos = ed.state.selection.from;
    const node = ed.state.doc.nodeAt(pos);
    const attrs = (node?.attrs as ComponentExampleNodeAttrs) ?? null;
    this.currentNodeAttrs.set(attrs);

    const className = attrs?.selectedComponent?.className ?? null;
    if (className && className !== this.lastSelectedComponentName) {
      this.searchTerm.set(className);
      this.lastSelectedComponentName = className;
    }
  }

  private getComponentList(editor: Editor): Example[] {
    const options = this.getExtensionOptions(editor);
    return options?.componentList ?? [];
  }

  private getExtensionOptions(editor: Editor): ComponentExampleOptions | undefined {
    const extension = editor.extensionManager.extensions.find((ext) => ext.name === "componentExample");
    return extension?.options as ComponentExampleOptions | undefined;
  }
}
