import {
  Component,
  input,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  effect,
  signal,
  computed,
} from "@angular/core";
import tippy, { Instance as TippyInstance } from "tippy.js";
import type { Editor } from "@tiptap/core";
import { TiptapButtonComponent } from "./tiptap-button.component";

export interface BubbleMenuConfig {
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  code?: boolean;
  separator?: boolean;
}

@Component({
  selector: "tiptap-bubble-menu",
  standalone: true,
  imports: [TiptapButtonComponent],
  template: `
    <div #menuRef class="bubble-menu">
      @if (bubbleMenuConfig().bold) {
      <tiptap-button
        icon="format_bold"
        title="Gras"
        [active]="isActive('bold')"
        (click)="onCommand('bold', $event)"
      ></tiptap-button>
      } @if (bubbleMenuConfig().italic) {
      <tiptap-button
        icon="format_italic"
        title="Italique"
        [active]="isActive('italic')"
        (click)="onCommand('italic', $event)"
      ></tiptap-button>
      } @if (bubbleMenuConfig().strike) {
      <tiptap-button
        icon="strikethrough_s"
        title="Barré"
        [active]="isActive('strike')"
        (click)="onCommand('strike', $event)"
      ></tiptap-button>
      } @if (bubbleMenuConfig().separator && bubbleMenuConfig().code) {
      <div class="tiptap-separator"></div>
      } @if (bubbleMenuConfig().code) {
      <tiptap-button
        icon="code"
        title="Code"
        [active]="isActive('code')"
        (click)="onCommand('code', $event)"
      ></tiptap-button>
      }
    </div>
  `,
  styles: [],
})
export class TiptapBubbleMenuComponent implements OnInit, OnDestroy {
  editor = input.required<Editor>();
  config = input<BubbleMenuConfig>({
    bold: true,
    italic: true,
    strike: true,
    code: true,
    separator: true,
  });

  @ViewChild("menuRef", { static: false }) menuRef!: ElementRef<HTMLDivElement>;

  private tippyInstance: TippyInstance | null = null;

  bubbleMenuConfig = computed(() => ({
    bold: true,
    italic: true,
    strike: true,
    code: true,
    separator: true,
    ...this.config(),
  }));

  // Effect comme propriété de classe pour éviter l'erreur d'injection context
  constructor() {
    effect(() => {
      const ed = this.editor();
      if (!ed) return;

      // Nettoyer les anciens listeners
      ed.off("selectionUpdate", this.updateMenu);
      ed.off("transaction", this.updateMenu);

      // Ajouter les nouveaux listeners
      ed.on("selectionUpdate", this.updateMenu);
      ed.on("transaction", this.updateMenu);
      this.updateMenu();
    });
  }

  ngOnInit() {
    // Initialiser Tippy une fois que le component est ready
    setTimeout(() => {
      this.initTippy();
    }, 100);
  }

  ngOnDestroy() {
    const ed = this.editor();
    if (ed) {
      ed.off("selectionUpdate", this.updateMenu);
      ed.off("transaction", this.updateMenu);
    }

    // Nettoyer Tippy
    if (this.tippyInstance) {
      this.tippyInstance.destroy();
    }
  }

  private initTippy() {
    const menuElement = this.menuRef?.nativeElement;
    if (!menuElement) return;

    // Créer l'instance Tippy
    this.tippyInstance = tippy(document.body, {
      content: menuElement,
      trigger: "manual",
      placement: "top-start",
      appendTo: () => document.body,
      interactive: true,
      arrow: false,
      offset: [0, 8],
      hideOnClick: false,
      getReferenceClientRect: () => this.getSelectionRect(),
    });
  }

  private getSelectionRect(): DOMRect {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return new DOMRect(0, 0, 0, 0);
    }

    const range = selection.getRangeAt(0);
    return range.getBoundingClientRect();
  }

  updateMenu = () => {
    const ed = this.editor();
    if (!ed) return;

    const { from, to } = ed.state.selection;
    const shouldShow =
      from !== to &&
      !ed.isActive("image") &&
      !ed.isActive("resizableImage") &&
      ed.isEditable;

    if (shouldShow) {
      this.showTippy();
    } else {
      this.hideTippy();
    }
  };

  private showTippy() {
    if (!this.tippyInstance) return;

    // Mettre à jour la position
    this.tippyInstance.setProps({
      getReferenceClientRect: () => this.getSelectionRect(),
    });

    this.tippyInstance.show();
  }

  private hideTippy() {
    if (this.tippyInstance) {
      this.tippyInstance.hide();
    }
  }

  isActive(mark: string): boolean {
    const ed = this.editor();
    return ed?.isActive(mark) || false;
  }

  onCommand(command: string, event: MouseEvent) {
    event.preventDefault();
    const ed = this.editor();
    if (!ed) return;

    switch (command) {
      case "bold":
        ed.chain().focus().toggleBold().run();
        break;
      case "italic":
        ed.chain().focus().toggleItalic().run();
        break;
      case "strike":
        ed.chain().focus().toggleStrike().run();
        break;
      case "code":
        ed.chain().focus().toggleCode().run();
        break;
    }
  }
}
