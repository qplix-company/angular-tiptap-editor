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
import { EditorCommandsService } from "./services/editor-commands.service";

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
      /* Styles pour le menu contextuel (bubble menu) */
      .tiptap-bubble-menu {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        padding: 8px 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        z-index: 1000;
        animation: slideUp 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(8px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Styles pour les boutons avec :host ::ng-deep */
      :host ::ng-deep .tiptap-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border: none;
        background: transparent;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        color: #64748b;
        position: relative;
        overflow: hidden;
      }

      :host ::ng-deep .tiptap-button::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        opacity: 0;
        transition: opacity 0.2s ease;
        border-radius: 10px;
      }

      :host ::ng-deep .tiptap-button:hover {
        color: #6366f1;
        transform: translateY(-1px);
      }

      :host ::ng-deep .tiptap-button:hover::before {
        opacity: 0.1;
      }

      :host ::ng-deep .tiptap-button:active {
        transform: translateY(0);
      }

      :host ::ng-deep .tiptap-button.is-active {
        color: #6366f1;
        background: rgba(99, 102, 241, 0.1);
      }

      :host ::ng-deep .tiptap-button.is-active::before {
        opacity: 0.15;
      }

      :host ::ng-deep .tiptap-button.is-active:hover {
        background: rgba(99, 102, 241, 0.15);
      }

      :host ::ng-deep .tiptap-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      :host ::ng-deep .tiptap-button:disabled:hover {
        transform: none;
        color: #64748b;
      }

      :host ::ng-deep .tiptap-button:disabled::before {
        opacity: 0;
      }

      /* Icônes Material Symbols */
      :host ::ng-deep .tiptap-button .material-symbols-outlined {
        font-size: 20px;
        position: relative;
        z-index: 1;
      }

      /* Boutons avec texte */
      :host ::ng-deep .tiptap-button.text-button {
        width: auto;
        padding: 0 12px;
        font-size: 14px;
        font-weight: 500;
      }

      /* Boutons de couleur */
      :host ::ng-deep .tiptap-button.color-button {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid transparent;
        transition: all 0.2s ease;
      }

      :host ::ng-deep .tiptap-button.color-button:hover {
        border-color: #e2e8f0;
        transform: scale(1.1);
      }

      :host ::ng-deep .tiptap-button.color-button.is-active {
        border-color: #6366f1;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
      }

      /* Boutons avec variantes */
      :host ::ng-deep .tiptap-button.primary {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
      }

      :host ::ng-deep .tiptap-button.primary:hover {
        background: linear-gradient(135deg, #5b21b6, #7c3aed);
        color: white;
      }

      :host ::ng-deep .tiptap-button.secondary {
        background: #f1f5f9;
        color: #64748b;
      }

      :host ::ng-deep .tiptap-button.secondary:hover {
        background: #e2e8f0;
        color: #475569;
      }

      :host ::ng-deep .tiptap-button.danger {
        color: #ef4444;
      }

      :host ::ng-deep .tiptap-button.danger:hover {
        color: #dc2626;
        background: rgba(239, 68, 68, 0.1);
      }

      :host ::ng-deep .tiptap-button.danger::before {
        background: linear-gradient(135deg, #ef4444, #dc2626);
      }

      /* Boutons de taille différente */
      :host ::ng-deep .tiptap-button.small {
        width: 28px;
        height: 28px;
      }

      :host ::ng-deep .tiptap-button.small .material-symbols-outlined {
        font-size: 16px;
      }

      :host ::ng-deep .tiptap-button.large {
        width: 44px;
        height: 44px;
      }

      :host ::ng-deep .tiptap-button.large .material-symbols-outlined {
        font-size: 24px;
      }

      /* Boutons avec badge */
      :host ::ng-deep .tiptap-button.has-badge {
        position: relative;
      }

      :host ::ng-deep .tiptap-button .badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: #ef4444;
        color: white;
        font-size: 10px;
        padding: 2px 4px;
        border-radius: 8px;
        min-width: 16px;
        text-align: center;
        line-height: 1;
      }

      /* Boutons avec tooltip */
      :host ::ng-deep .tiptap-button.has-tooltip {
        position: relative;
      }

      :host ::ng-deep .tiptap-button .tooltip {
        position: absolute;
        bottom: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition: all 0.2s ease;
        z-index: 1000;
      }

      :host ::ng-deep .tiptap-button:hover .tooltip {
        opacity: 1;
        visibility: visible;
      }

      /* Animation de pulsation pour les boutons actifs */
      @keyframes pulse {
        0%,
        100% {
          box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
        }
        50% {
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0);
        }
      }

      :host ::ng-deep .tiptap-button.is-active.pulse {
        animation: pulse 2s infinite;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .tiptap-bubble-menu {
          padding: 6px 10px;
          gap: 4px;
        }

        :host ::ng-deep .tiptap-button {
          width: 32px;
          height: 32px;
        }

        :host ::ng-deep .tiptap-button .material-symbols-outlined {
          font-size: 18px;
        }

        :host ::ng-deep .tiptap-button.text-button {
          padding: 0 8px;
          font-size: 13px;
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

  constructor(private editorCommands: EditorCommandsService) {
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

    const adjustedTop = Math.max(
      10,
      Math.min(top, window.innerHeight - menuHeight - 10)
    );

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
    return this.editorCommands.isActive(this.editor(), name, attributes);
  }

  toggleBold() {
    this.editorCommands.toggleBold(this.editor());
    this.commandExecuted.emit({ command: "bold", editor: this.editor() });
  }

  toggleItalic() {
    this.editorCommands.toggleItalic(this.editor());
    this.commandExecuted.emit({ command: "italic", editor: this.editor() });
  }

  toggleStrike() {
    this.editorCommands.toggleStrike(this.editor());
    this.commandExecuted.emit({ command: "strike", editor: this.editor() });
  }

  toggleCode() {
    this.editorCommands.toggleCode(this.editor());
    this.commandExecuted.emit({ command: "code", editor: this.editor() });
  }
}
