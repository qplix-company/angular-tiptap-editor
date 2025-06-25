import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { Editor } from "@tiptap/core";
import { TiptapButtonComponent } from "./tiptap-button.component";
import { TiptapSeparatorComponent } from "./tiptap-separator.component";

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
  imports: [TiptapButtonComponent, TiptapSeparatorComponent],
  template: `
    @if (isVisible()) {
    <div
      class="bubble-menu"
      [style.left.px]="position().x"
      [style.top.px]="position().y"
    >
      @if (config().bold) {
      <tiptap-button
        icon="format_bold"
        title="Bold"
        [active]="isActive('bold')"
        (onClick)="toggleBold()"
      />
      } @if (config().italic) {
      <tiptap-button
        icon="format_italic"
        title="Italic"
        [active]="isActive('italic')"
        (onClick)="toggleItalic()"
      />
      } @if (config().strike) {
      <tiptap-button
        icon="strikethrough_s"
        title="Strikethrough"
        [active]="isActive('strike')"
        (onClick)="toggleStrike()"
      />
      } @if (config().separator && config().code) {
      <tiptap-separator size="small" />
      } @if (config().code) {
      <tiptap-button
        icon="code"
        title="Code"
        [active]="isActive('code')"
        (onClick)="toggleCode()"
      />
      }
    </div>
    }
  `,
  styles: [
    `
      .bubble-menu {
        position: fixed;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 4px;
        display: flex;
        gap: 2px;
        z-index: 1000;
        animation: bubbleMenuFadeIn 0.2s ease-out;
      }

      @keyframes bubbleMenuFadeIn {
        from {
          opacity: 0;
          transform: translateY(-8px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `,
  ],
})
export class TiptapBubbleMenuComponent implements OnInit, OnDestroy {
  // Inputs
  editor = input.required<Editor>();
  config = input.required<BubbleMenuConfig>();

  // Outputs
  commandExecuted = output<{ command: string; editor: Editor }>();

  // Signals internes
  isVisible = signal(false);
  position = signal({ x: 0, y: 0 });
  selectionRange = signal<{ from: number; to: number } | null>(null);

  // Computed values
  shouldShow = computed(() => {
    const editor = this.editor();
    const range = this.selectionRange();
    return (
      editor &&
      range &&
      range.from !== range.to &&
      !editor.isActive("image") &&
      !editor.isActive("resizableImage")
    );
  });

  private updateInterval: number | null = null;

  constructor() {
    // Mettre à jour la position toutes les 100ms quand visible
    effect(() => {
      if (this.isVisible()) {
        this.startPositionUpdate();
      } else {
        this.stopPositionUpdate();
      }
    });
  }

  ngOnInit() {
    // Écouter les changements de sélection
    this.editor().on("selectionUpdate", () => {
      this.updateSelection();
    });

    // Écouter les changements de focus
    this.editor().on("focus", () => {
      this.updateSelection();
    });

    this.editor().on("blur", () => {
      this.hide();
    });
  }

  ngOnDestroy() {
    this.stopPositionUpdate();
  }

  private updateSelection() {
    const editor = this.editor();
    if (!editor) return;

    const { from, to } = editor.state.selection;
    this.selectionRange.set({ from, to });

    if (this.shouldShow()) {
      this.show();
    } else {
      this.hide();
    }
  }

  private show() {
    this.isVisible.set(true);
    this.updatePosition();
  }

  private hide() {
    this.isVisible.set(false);
  }

  private updatePosition() {
    const editor = this.editor();
    if (!editor || !this.shouldShow()) return;

    const { view } = editor;
    const { from, to } = editor.state.selection;

    // Calculer la position du menu
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    const left = Math.min(start.left, end.left);
    const top = start.bottom + 10; // Positionner en dessous du texte

    // Ajuster la position pour éviter de sortir de l'écran
    const menuWidth = 200; // Estimation de la largeur du menu
    const menuHeight = 40; // Estimation de la hauteur du menu

    const adjustedLeft = Math.max(
      10,
      Math.min(left, window.innerWidth - menuWidth - 10)
    );

    // Si le menu sort en bas de l'écran, le positionner au-dessus du texte
    let adjustedTop = top;
    if (top + menuHeight > window.innerHeight - 10) {
      adjustedTop = start.top - menuHeight - 10;
    }

    // S'assurer que le menu reste visible
    adjustedTop = Math.max(10, adjustedTop);

    this.position.set({ x: adjustedLeft, y: adjustedTop });
  }

  private startPositionUpdate() {
    if (this.updateInterval) return;
    this.updateInterval = window.setInterval(() => {
      this.updatePosition();
    }, 100);
  }

  private stopPositionUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  isActive(name: string, attributes?: Record<string, any>): boolean {
    return this.editor().isActive(name, attributes);
  }

  toggleBold() {
    this.editor().chain().focus().toggleBold().run();
    this.commandExecuted.emit({ command: "bold", editor: this.editor() });
  }

  toggleItalic() {
    this.editor().chain().focus().toggleItalic().run();
    this.commandExecuted.emit({ command: "italic", editor: this.editor() });
  }

  toggleStrike() {
    this.editor().chain().focus().toggleStrike().run();
    this.commandExecuted.emit({ command: "strike", editor: this.editor() });
  }

  toggleCode() {
    this.editor().chain().focus().toggleCode().run();
    this.commandExecuted.emit({ command: "code", editor: this.editor() });
  }
}
