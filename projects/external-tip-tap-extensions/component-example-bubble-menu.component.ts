import { Component, ElementRef, OnDestroy, ViewChild, input, effect } from "@angular/core";
import type { Editor } from "@tiptap/core";
import tippy, { Instance as TippyInstance } from "tippy.js";
import { ComponentExampleNodeAttrs } from "./component-example.command";

@Component({
  selector: "component-example-bubble-menu",
  standalone: true,
  template: `
    <div #menuRef class="bubble-menu component-example-menu">
      <button type="button" class="tiptap-button" (click)="openPreview()">
        Vorschau öffnen
      </button>
      <button type="button" class="tiptap-button" (click)="resetComponent()">
        Auswahl löschen
      </button>
      <button type="button" class="tiptap-button danger" (click)="removeNode()">
        Block entfernen
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .component-example-menu {
        display: flex;
        gap: 0.25rem;
        align-items: center;
      }
      .tiptap-button {
        border: none;
        border-radius: 999px;
        padding: 0.35rem 0.8rem;
        background: #0f172a;
        color: white;
        font-size: 0.8rem;
        cursor: pointer;
      }
      .tiptap-button.danger {
        background: #dc2626;
      }
    `,
  ],
})
export class ComponentExampleBubbleMenuComponent implements OnDestroy {
  editor = input.required<Editor>();

  @ViewChild("menuRef", { static: false })
  private menuRef?: ElementRef<HTMLDivElement>;

  private tippyInstance: TippyInstance | null = null;
  private updateTimeout: any = null;

  constructor() {
    effect(() => {
      const ed = this.editor();
      if (!ed) {
        this.destroyTippy();
        return;
      }

      ed.off("selectionUpdate", this.updateMenu);
      ed.off("transaction", this.updateMenu);
      ed.on("selectionUpdate", this.updateMenu);
      ed.on("transaction", this.updateMenu);

      this.destroyTippy();
      this.initTippy();
      this.updateMenu();
    });
  }

  ngOnDestroy(): void {
    const ed = this.editor();
    if (ed) {
      ed.off("selectionUpdate", this.updateMenu);
      ed.off("transaction", this.updateMenu);
    }
    this.destroyTippy();
  }

  openPreview() {
    const attrs = this.getSelectedComponentAttrs();
    if (!attrs) return;
    window.open(`/preview/${attrs.selectedComponent?.className ?? "unknown"}`, "_blank");
  }

  resetComponent() {
    const ed = this.editor();
    if (!ed || !ed.isEditable) return;
    ed.chain().focus().updateAttributes("componentExample", { selectedComponent: null }).run();
  }

  removeNode() {
    const ed = this.editor();
    if (!ed || !ed.isEditable) return;
    ed.chain().focus().deleteSelection().run();
  }

  updateMenu = () => {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      const ed = this.editor();
      if (!ed || !this.tippyInstance) return;

      const shouldShow = ed.isEditable && ed.isActive("componentExample");
      if (shouldShow) {
        this.tippyInstance.setProps({
          getReferenceClientRect: () => this.getNodeRect(),
        });
        this.tippyInstance.show();
      } else {
        this.tippyInstance.hide();
      }
    }, 10);
  };

  private initTippy() {
    if (!this.menuRef?.nativeElement) {
      setTimeout(() => this.initTippy(), 50);
      return;
    }

    this.tippyInstance = tippy(document.body, {
      content: this.menuRef.nativeElement,
      trigger: "manual",
      placement: "top-start",
      appendTo: () => document.body,
      interactive: true,
      arrow: false,
      offset: [0, 8],
      popperOptions: {
        modifiers: [
          {
            name: "preventOverflow",
            options: {
              boundary: "viewport",
              padding: 8,
            },
          },
        ],
      },
    });
  }

  private destroyTippy() {
    if (this.tippyInstance) {
      this.tippyInstance.destroy();
      this.tippyInstance = null;
    }
  }

  private getNodeRect(): DOMRect {
    const ed = this.editor();
    if (!ed) return new DOMRect();

    const pos = ed.state.selection.from;
    const nodeDOM = ed.view.domAtPos(pos)?.node as HTMLElement | null;
    if (nodeDOM?.nodeType === Node.TEXT_NODE) {
      return nodeDOM.parentElement?.getBoundingClientRect() ?? new DOMRect();
    }

    return (nodeDOM as HTMLElement | null)?.getBoundingClientRect() ?? new DOMRect();
  }

  private getSelectedComponentAttrs(): ComponentExampleNodeAttrs | null {
    const ed = this.editor();
    if (!ed || !ed.isActive("componentExample")) {
      return null;
    }
    const pos = ed.state.selection.from;
    const node = ed.state.doc.nodeAt(pos);
    return (node?.attrs as ComponentExampleNodeAttrs) ?? null;
  }
}
