import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  input,
} from "@angular/core";
import type { Editor } from "@tiptap/core";
import tippy, { Instance as TippyInstance, Placement } from "tippy.js";

@Component({
  selector: "generic-bubble-menu",
  standalone: true,
  template: `
    <div #menuRef class="bubble-menu">
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class GenericBubbleMenuComponent implements AfterViewInit, OnDestroy {
  editor = input.required<Editor>();
  visibleWhen = input<(editor: Editor) => boolean>(() => false);
  referenceClientRect = input<(() => DOMRect) | null>(null);
  placement = input<Placement>("top-start");

  @ViewChild("menuRef", { static: false }) menuRef?: ElementRef<HTMLDivElement>;

  private tippyInstance: TippyInstance | null = null;
  private currentEditor: Editor | null = null;
  private updateTimeout: any = null;

  constructor() {
    effect(() => {
      const editor = this.editor();
      this.rebindEditor(editor);
    });

    effect(() => {
      // React when any of the dynamic inputs change
      this.visibleWhen();
      this.referenceClientRect();
      this.placement();
      this.updateMenu();
    });
  }

  ngAfterViewInit(): void {
    this.initTippy();
    this.updateMenu();
  }

  ngOnDestroy(): void {
    this.detachEditorListeners();
    this.destroyTippy();
  }

  private rebindEditor(editor: Editor | null) {
    if (this.currentEditor === editor) {
      return;
    }

    this.detachEditorListeners();
    this.currentEditor = editor;

    if (editor) {
      editor.on("selectionUpdate", this.updateMenu);
      editor.on("transaction", this.updateMenu);
      editor.on("focus", this.updateMenu);
      editor.on("blur", this.handleBlur);
      this.initTippy();
      this.updateMenu();
    }
  }

  private detachEditorListeners() {
    if (!this.currentEditor) {
      return;
    }
    this.currentEditor.off("selectionUpdate", this.updateMenu);
    this.currentEditor.off("transaction", this.updateMenu);
    this.currentEditor.off("focus", this.updateMenu);
    this.currentEditor.off("blur", this.handleBlur);
    this.currentEditor = null;
  }

  private initTippy() {
    if (!this.menuRef?.nativeElement) {
      return;
    }

    if (this.tippyInstance) {
      this.tippyInstance.destroy();
    }

    this.tippyInstance = tippy(document.body, {
      content: this.menuRef.nativeElement,
      trigger: "manual",
      placement: this.placement(),
      appendTo: () => document.body,
      interactive: true,
      arrow: false,
      offset: [0, 8],
      hideOnClick: false,
      popperOptions: {
        modifiers: [
          {
            name: "preventOverflow",
            options: {
              boundary: "viewport",
              padding: 8,
            },
          },
          {
            name: "flip",
            options: {
              fallbackPlacements: ["bottom-start", "top-end", "bottom-end"],
            },
          },
        ],
      },
    });
  }

  updateMenu = () => {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      const editor = this.editor();
      if (!editor || !this.tippyInstance) {
        return;
      }

      const shouldShow = this.visibleWhen()(editor);
      if (shouldShow) {
        const rectFn = this.referenceClientRect();
        const reference = rectFn ?? (() => this.defaultClientRect(editor));
        this.tippyInstance.setProps({
          placement: this.placement(),
          getReferenceClientRect: reference,
        });
        this.tippyInstance.show();
      } else {
        this.tippyInstance.hide();
      }
    }, 10);
  };

  private handleBlur = () => {
    setTimeout(() => {
      if (this.menuRef?.nativeElement.contains(document.activeElement)) return;
      this.tippyInstance?.hide();
    }, 100);
  };

  private defaultClientRect(editor: Editor): DOMRect {
    const selection = editor.state.selection;
    const domSelection = window.getSelection();
    if (domSelection && domSelection.rangeCount > 0) {
      const range = domSelection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect && rect.width + rect.height > 0) {
        return rect;
      }
    }

    const pos = selection.from;
    const resolved = editor.view.domAtPos(pos);
    const node = resolved.node as Node;
    const element = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement | null);
    return element?.getBoundingClientRect() ?? new DOMRect();
  }

  private destroyTippy() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    if (this.tippyInstance) {
      this.tippyInstance.destroy();
      this.tippyInstance = null;
    }
  }
}
