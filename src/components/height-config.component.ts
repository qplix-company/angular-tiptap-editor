import { Component, inject, computed, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HeightSliderComponent } from "./height-slider.component";
import { EditorConfigurationService } from "../services/editor-configuration.service";
import { AppI18nService } from "../services/app-i18n.service";

@Component({
  selector: "app-height-config",
  standalone: true,
  imports: [CommonModule, HeightSliderComponent],
  template: `
    <section class="config-section">
      <div class="section-header">
        <div class="section-title">
          <span class="material-symbols-outlined">height</span>
          <span>{{ appI18n.config().height }}</span>
        </div>
        <div class="section-status">
          <span class="status-count">{{ activeCount() }}</span>
        </div>
      </div>

      <div class="section-content">
        <div class="dropdown-section" [class.open]="isDropdownOpen()">
          <div class="dropdown-trigger" (click)="onToggleDropdown()">
            <span
              >{{ appI18n.config().heightSettings }} ({{ activeCount() }})</span
            >
            <span
              class="material-symbols-outlined chevron"
              [class.rotated]="isDropdownOpen()"
            >
              keyboard_arrow_down
            </span>
          </div>

          <div class="dropdown-content" [class.open]="isDropdownOpen()">
            <div class="sliders-container">
              <!-- Slider pour hauteur fixe -->
              <app-height-slider
                [label]="appI18n.items().fixedHeight"
                icon="height"
                [value]="fixedHeightValue()"
                [min]="150"
                [max]="600"
                [step]="10"
                [isEnabled]="isFixedHeightEnabled()"
                (valueChange)="onFixedHeightChange($event)"
                (enabledChange)="onFixedHeightToggle($event)"
              />

              <!-- Slider pour hauteur maximale -->
              <app-height-slider
                [label]="appI18n.items().maxHeight"
                icon="vertical_align_top"
                [value]="maxHeightValue()"
                [min]="200"
                [max]="800"
                [step]="10"
                [isEnabled]="isMaxHeightEnabled()"
                (valueChange)="onMaxHeightChange($event)"
                (enabledChange)="onMaxHeightToggle($event)"
              />
            </div>

            <div class="config-info">
              <p class="info-text">
                <span class="material-symbols-outlined">info</span>
                {{ appI18n.messages().heightConfigInfo }}
              </p>
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

      .section-status {
        display: flex;
        align-items: center;
      }

      .status-count {
        background: #6366f1;
        color: white;
        font-size: 12px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 12px;
        min-width: 20px;
        text-align: center;
      }

      .section-content {
        transition: all 0.3s ease;
        overflow: hidden;
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

      .sliders-container {
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .config-info {
        margin: 0 0.75rem 0.75rem 0.75rem;
        background: #f0f9ff;
        border: 1px solid #bae6fd;
        border-radius: 6px;
        padding: 0.75rem;
      }

      .info-text {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
        font-size: 0.8rem;
        color: #0369a1;
        line-height: 1.4;
      }

      .info-text .material-symbols-outlined {
        font-size: 14px;
        flex-shrink: 0;
      }
    `,
  ],
})
export class HeightConfigComponent {
  private configService = inject(EditorConfigurationService);
  readonly appI18n = inject(AppI18nService);

  readonly editorState = this.configService.editorState;

  // État du dropdown
  private _isDropdownOpen = signal(false);
  readonly isDropdownOpen = this._isDropdownOpen.asReadonly();

  readonly activeCount = computed(() => {
    const state = this.editorState();
    let count = 0;
    if (state.height !== undefined) count++;
    if (state.maxHeight !== undefined) count++;
    return count;
  });

  // Computed values pour les sliders
  readonly fixedHeightValue = computed(() => {
    return this.editorState().height || 300;
  });

  readonly maxHeightValue = computed(() => {
    return this.editorState().maxHeight || 400;
  });

  readonly isFixedHeightEnabled = computed(() => {
    return this.editorState().height !== undefined;
  });

  readonly isMaxHeightEnabled = computed(() => {
    return this.editorState().maxHeight !== undefined;
  });

  // Event handlers
  onToggleDropdown() {
    this._isDropdownOpen.update((open) => !open);
  }

  onFixedHeightChange(value: number) {
    this.configService.updateEditorState({
      height: value,
    });
  }

  onFixedHeightToggle(enabled: boolean) {
    this.configService.updateEditorState({
      height: enabled ? this.fixedHeightValue() : undefined,
    });
  }

  onMaxHeightChange(value: number) {
    this.configService.updateEditorState({
      maxHeight: value,
    });
  }

  onMaxHeightToggle(enabled: boolean) {
    this.configService.updateEditorState({
      maxHeight: enabled ? this.maxHeightValue() : undefined,
    });
  }
}
