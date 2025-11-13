import { Component, inject, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CodeGeneratorService } from "../services/code-generator.service";
import { AppI18nService } from "../services/app-i18n.service";

@Component({
  selector: "app-code-view",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="code-view">
      <div class="code-header">
        <div class="code-title">
          <span class="material-symbols-outlined"
            >integration_instructions</span
          >
          <span>{{ appI18n.titles().generatedCode }}</span>
        </div>
        <button
          class="copy-code-btn"
          (click)="copyCode()"
          [title]="appI18n.tooltips().copyGeneratedCode"
        >
          <span class="material-symbols-outlined">content_copy</span>
          <span>{{ appI18n.ui().copy }}</span>
        </button>
      </div>

      <div class="code-container">
        <pre class="code-block"><code>{{ generatedCode() }}</code></pre>
      </div>
    </div>
  `,
  styles: [
    `
      /* Mode Code - Largeur limitée */
      .code-view {
        background: white;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        max-width: 100%;
        animation: fadeIn 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .code-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        background: #f8f9fa;
        border-bottom: 1px solid #e2e8f0;
      }

      .code-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        color: #1a1a1a;
        font-size: 0.9rem;
      }

      .code-title .material-symbols-outlined {
        font-size: 18px;
        color: #6366f1;
      }

      .copy-code-btn {
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
      }

      .copy-code-btn::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        opacity: 0;
        transition: opacity 0.2s ease;
        border-radius: 8px;
      }

      .copy-code-btn:hover {
        color: #6366f1;
      }

      .copy-code-btn:hover::before {
        opacity: 0.1;
      }

      .copy-code-btn .material-symbols-outlined {
        font-size: 16px;
        position: relative;
        z-index: 1;
      }

      .code-container {
        max-height: 70vh;
        overflow-y: auto;
        overflow-x: auto;
        background: #1e293b;
        color: #e2e8f0;
        padding: 16px;
        border-radius: 8px;
        font-family: "Courier New", monospace;
        font-size: 14px;
        line-height: 1.5;
        white-space: pre-wrap;
        max-width: 100%;
        box-sizing: border-box;
        word-wrap: break-word;
      }

      .code-block {
        margin: 0;
        padding: 1.5rem;
        font-family: "Fira Code", "Monaco", "Menlo", "Ubuntu Mono", monospace;
        font-size: 14px;
        line-height: 1.6;
        color: #e2e8f0;
        background: transparent;
        white-space: pre;
        word-wrap: break-word;
        max-width: 100%;
      }

      /* Coloration syntaxique */
      .code-container .keyword {
        color: #f472b6;
        font-weight: 600;
      }

      .code-container .type {
        color: #60a5fa;
        font-weight: 500;
      }

      .code-container .string {
        color: #34d399;
      }

      .code-container .comment {
        color: #6b7280;
        font-style: italic;
      }

      .code-container .decorator {
        color: #fbbf24;
        font-weight: 600;
      }

      .code-container .punctuation {
        color: #94a3b8;
      }

      /* Scrollbar personnalisée pour le code */
      .code-container::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      .code-container::-webkit-scrollbar-track {
        background: #334155;
      }

      .code-container::-webkit-scrollbar-thumb {
        background: #475569;
        border-radius: 4px;
      }

      .code-container::-webkit-scrollbar-thumb:hover {
        background: #64748b;
      }
    `,
  ],
})
export class CodeViewComponent {
  private codeGeneratorService = inject(CodeGeneratorService);
  readonly appI18n = inject(AppI18nService);

  readonly generatedCode = computed(() =>
    this.codeGeneratorService.generateCode()
  );

  copyCode() {
    this.codeGeneratorService.copyCode();
  }
}
