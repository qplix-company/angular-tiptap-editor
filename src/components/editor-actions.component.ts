import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { EditorConfigurationService } from "../services/editor-configuration.service";
import { AppI18nService } from "../services/app-i18n.service";
import { LanguageSwitchComponent } from "./language-switch.component";

@Component({
  selector: "app-editor-actions",
  standalone: true,
  imports: [CommonModule, LanguageSwitchComponent],
  template: `
    <div class="editor-actions">
      <!-- Toggle Code/Éditeur -->
      <div class="mode-toggle">
        <button
          class="mode-btn"
          [class.active]="!editorState().showCodeMode"
          (click)="toggleCodeMode(false)"
          [title]="appI18n.tooltips().switchToEditor"
        >
          <span class="material-symbols-outlined">edit</span>
          <span>{{ appI18n.ui().editor }}</span>
        </button>
        <button
          class="mode-btn"
          [class.active]="editorState().showCodeMode"
          (click)="toggleCodeMode(true)"
          [title]="appI18n.tooltips().switchToCode"
        >
          <span class="material-symbols-outlined">code</span>
          <span>{{ appI18n.ui().code }}</span>
        </button>
      </div>

      <div class="action-separator"></div>

      <button
        class="editor-action-btn"
        (click)="clearContent()"
        [title]="appI18n.tooltips().clearEditorContent"
      >
        <span class="material-symbols-outlined">delete</span>
        <span>{{ appI18n.ui().clear }}</span>
      </button>

      <div class="action-separator"></div>

      <!-- Switch de langue -->
      <app-language-switch></app-language-switch>
    </div>
  `,
  styles: [
    `
      /* Actions de l'éditeur - Toujours visibles */
      .editor-actions {
        position: absolute;
        top: 2rem;
        right: 2rem;
        left: 2rem;
        z-index: 50;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      /* Toggle Mode */
      .mode-toggle {
        display: flex;
        background: #f8f9fa;
        border-radius: 8px;
        padding: 2px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .mode-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0 12px;
        height: 32px;
        background: transparent;
        color: #64748b;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        white-space: nowrap;
      }

      .mode-btn::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        opacity: 0;
        transition: opacity 0.2s ease;
        border-radius: 6px;
      }

      .mode-btn:hover {
        color: #6366f1;
      }

      .mode-btn:hover::before {
        opacity: 0.1;
      }

      .mode-btn.active {
        background: white;
        color: #6366f1;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }

      .mode-btn.active::before {
        opacity: 0.1;
      }

      .mode-btn .material-symbols-outlined {
        font-size: 18px;
        position: relative;
        z-index: 1;
        flex-shrink: 0;
      }

      /* Séparateurs */
      .action-separator {
        width: 1px;
        height: 24px;
        background: #e2e8f0;
        flex-shrink: 0;
      }

      .editor-action-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0 12px;
        height: 32px;
        background: transparent;
        color: #64748b;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        white-space: nowrap;
      }

      .editor-action-btn::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        opacity: 0;
        transition: opacity 0.2s ease;
        border-radius: 8px;
      }

      .editor-action-btn:hover {
        color: #ef4444;
      }

      .editor-action-btn:hover::before {
        opacity: 0.1;
      }

      .editor-action-btn .material-symbols-outlined {
        font-size: 20px;
        position: relative;
        z-index: 1;
        flex-shrink: 0;
      }

      @media (max-width: 480px) {
        .editor-actions {
          top: 0.75rem;
          right: 0.75rem;
          left: 0.75rem;
        }

        .mode-btn {
          font-size: 12px;
          padding: 0 8px;
          height: 28px;
        }

        .mode-btn .material-symbols-outlined {
          font-size: 14px;
        }

        .editor-action-btn {
          font-size: 12px;
          padding: 0 8px;
          height: 26px;
        }

        .editor-action-btn .material-symbols-outlined {
          font-size: 16px;
        }
      }
    `,
  ],
})
export class EditorActionsComponent {
  private configService = inject(EditorConfigurationService);
  readonly appI18n = inject(AppI18nService);

  readonly editorState = this.configService.editorState;

  toggleCodeMode(showCode: boolean) {
    this.configService.updateEditorState({ showCodeMode: showCode });
  }

  clearContent() {
    this.configService.clearContent();
  }
}
