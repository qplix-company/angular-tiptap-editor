import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TiptapI18nService } from "tiptap-editor";
import { AppI18nService } from "../services/app-i18n.service";

@Component({
  selector: "app-language-switch",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-switch-container">
      <div
        class="language-switch"
        [class.french]="currentLocale() === 'fr'"
        (click)="toggleLanguage()"
        [title]="appI18n.ui().clickToChange"
      >
        <div class="language-options">
          <div
            class="language-option"
            [class.active]="currentLocale() === 'en'"
          >
            <span class="flag-icon">🇺🇸</span>
            <span class="language-label">EN</span>
          </div>
          <div
            class="language-option"
            [class.active]="currentLocale() === 'fr'"
          >
            <span class="flag-icon">🇫🇷</span>
            <span class="language-label">FR</span>
          </div>
        </div>
        <div
          class="language-slider"
          [class.slide-right]="currentLocale() === 'fr'"
        ></div>
      </div>
    </div>
  `,
  styles: [
    `
      .language-switch-container {
        display: flex;
        align-items: center;
      }

      .language-switch {
        position: relative;
        display: flex;
        background: #f1f5f9;
        border-radius: 8px;
        padding: 2px;
        width: 80px;
        height: 32px;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        cursor: pointer;
        border: 1px solid #e2e8f0;
      }

      .language-switch:hover {
        background: #e2e8f0;
      }

      .language-options {
        display: flex;
        width: 100%;
        z-index: 2;
        position: relative;
      }

      .language-option {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1px;
        transition: all 0.3s ease;
        border-radius: 6px;
        padding: 2px;
        position: relative;
        color: #64748b;
        pointer-events: none; /* Empêche les clics sur les options individuelles */
      }

      .language-option.active {
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }

      .flag-icon {
        font-size: 12px;
        line-height: 1;
      }

      .language-label {
        font-size: 0.6rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .language-slider {
        position: absolute;
        top: 2px;
        left: 2px;
        width: calc(50% - 2px);
        height: calc(100% - 4px);
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border-radius: 6px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 1px 4px rgba(99, 102, 241, 0.3);
        z-index: 1;
      }

      .language-slider.slide-right {
        transform: translateX(100%);
      }

      /* Effet de pulse au hover */
      .language-switch:hover .language-slider {
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
      }

      /* Responsive */
      @media (max-width: 768px) {
        .language-switch {
          width: 70px;
          height: 28px;
        }

        .flag-icon {
          font-size: 10px;
        }

        .language-label {
          font-size: 0.55rem;
        }
      }

      @media (max-width: 480px) {
        .language-switch {
          width: 65px;
          height: 26px;
        }

        .flag-icon {
          font-size: 9px;
        }

        .language-label {
          font-size: 0.5rem;
        }
      }
    `,
  ],
})
export class LanguageSwitchComponent {
  private i18nService = inject(TiptapI18nService);
  readonly appI18n = inject(AppI18nService);

  readonly currentLocale = this.i18nService.currentLocale;

  toggleLanguage() {
    const newLocale = this.currentLocale() === "en" ? "fr" : "en";
    this.i18nService.setLocale(newLocale);
  }
}
