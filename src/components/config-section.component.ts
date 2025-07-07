import { Component, Input, Output, EventEmitter, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ConfigItem } from "../types/editor-config.types";
import { AppI18nService } from "../services/app-i18n.service";
import { EditorConfigurationService } from "../services/editor-configuration.service";

@Component({
  selector: "app-config-section",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="config-section">
      <div class="section-header">
        <div class="section-title">
          <span class="material-symbols-outlined">{{ icon }}</span>
          <span>{{ title }}</span>
        </div>
        <label class="toggle">
          <input
            type="checkbox"
            [checked]="isEnabled"
            (change)="onToggleEnabled()"
          />
          <span></span>
        </label>
      </div>

      <div class="section-content" [class.collapsed]="!isEnabled">
        <div class="dropdown-section" [class.open]="isDropdownOpen">
          <div class="dropdown-trigger" (click)="onToggleDropdown()">
            <span
              >{{ appI18n.config().selectOptions }} ({{ activeCount }})</span
            >
            <span
              class="material-symbols-outlined chevron"
              [class.rotated]="isDropdownOpen"
            >
              keyboard_arrow_down
            </span>
          </div>

          <div class="dropdown-content" [class.open]="isDropdownOpen">
            <div class="options-grid">
              <label class="option" *ngFor="let item of items">
                <input
                  type="checkbox"
                  [checked]="isItemActive(item.key)"
                  (change)="onToggleItem(item.key)"
                />
                <span class="checkmark"></span>
                <span class="material-symbols-outlined">{{ item.icon }}</span>
                <span class="label">{{ item.label }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .config-section {
        border-bottom: 1px solid #e2e8f0;
      }

      .section-header {
        padding: 1.25rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: white;
        position: sticky;
        top: 0;
        z-index: 5;
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 500;
        color: #1a1a1a;
        font-size: 0.9rem;
      }

      .section-title .material-symbols-outlined {
        font-size: 18px;
        color: #64748b;
      }

      .section-content {
        transition: all 0.3s ease;
        overflow: hidden;
      }

      .section-content.collapsed {
        opacity: 0.5;
        pointer-events: none;
      }

      /* Dropdown */
      .dropdown-section {
        position: relative;
        z-index: 10;
      }

      .dropdown-section.open {
        z-index: 50;
      }

      .dropdown-trigger {
        padding: 1rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        background: #f8f9fa;
        border-top: 1px solid #e2e8f0;
        font-size: 0.85rem;
        color: #64748b;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .dropdown-trigger:hover {
        background: #f1f5f9;
        color: #475569;
      }

      .chevron {
        font-size: 18px !important;
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .chevron.rotated {
        transform: rotate(180deg);
      }

      .dropdown-content {
        max-height: 0;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        background: white;
        position: relative;
        z-index: 10;
      }

      .dropdown-content.open {
        max-height: 2000px;
        overflow: visible;
        position: relative;
        z-index: 30;
      }

      .options-grid {
        padding: 0.75rem;
        display: grid;
        gap: 2px;
      }

      .option {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 0.85rem;
        position: relative;
        overflow: hidden;
      }

      .option::before {
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

      .option:hover {
        color: #6366f1;
      }

      .option:hover::before {
        opacity: 0.1;
      }

      .option input {
        display: none;
      }

      .checkmark {
        width: 16px;
        height: 16px;
        border: 2px solid #d1d5db;
        border-radius: 4px;
        position: relative;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        flex-shrink: 0;
        z-index: 1;
      }

      .option input:checked + .checkmark {
        background: #6366f1;
        border-color: #6366f1;
      }

      .option input:checked + .checkmark:after {
        content: "";
        position: absolute;
        left: 4px;
        top: 1px;
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }

      .option .material-symbols-outlined {
        font-size: 16px;
        color: #64748b;
        position: relative;
        z-index: 1;
      }

      .option .label {
        flex: 1;
        color: #1a1a1a;
        position: relative;
        z-index: 1;
      }

      /* Toggle - Style Tiptap exact */
      .toggle {
        position: relative;
        display: inline-block;
        width: 36px;
        height: 20px;
        cursor: pointer;
      }

      .toggle input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .toggle span {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #d1d5db;
        transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 20px;
      }

      .toggle span:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 2px;
        bottom: 2px;
        background: white;
        transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }

      .toggle input:checked + span {
        background: #6366f1;
      }

      .toggle input:checked + span:before {
        transform: translateX(16px);
      }
    `,
  ],
})
export class ConfigSectionComponent {
  readonly appI18n = inject(AppI18nService);

  @Input() title!: string;
  @Input() icon!: string;
  @Input() items!: ConfigItem[];
  @Input() isEnabled!: boolean;
  @Input() activeCount!: number;
  @Input() isDropdownOpen!: boolean;
  @Input() itemCheckFunction!: (key: string) => boolean;

  @Output() toggleEnabled = new EventEmitter<void>();
  @Output() toggleDropdown = new EventEmitter<void>();
  @Output() toggleItem = new EventEmitter<string>();

  onToggleEnabled() {
    this.toggleEnabled.emit();
  }

  onToggleDropdown() {
    this.toggleDropdown.emit();
  }

  onToggleItem(key: string) {
    this.toggleItem.emit(key);
  }

  isItemActive(key: string): boolean {
    return this.itemCheckFunction(key);
  }
}
