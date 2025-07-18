import { Component, input, output, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-height-slider",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="height-slider-container">
      <div class="slider-header">
        <span class="material-symbols-outlined">{{ icon() }}</span>
        <span class="slider-label">{{ label() }}</span>
        <span class="slider-value">{{ value() }}px</span>
      </div>

      <div class="slider-track">
        <input
          type="range"
          [min]="min()"
          [max]="max()"
          [value]="value()"
          [step]="step()"
          class="slider-input"
          (input)="onSliderChange($event)"
          (change)="onSliderChange($event)"
        />
        <div class="slider-fill" [style.width.%]="fillPercentage()"></div>
      </div>

      <div class="slider-controls">
        <label class="toggle">
          <input
            type="checkbox"
            [checked]="isEnabled()"
            (change)="toggleEnabled()"
          />
          <span></span>
        </label>
      </div>
    </div>
  `,
  styles: [
    `
      .height-slider-container {
        background: #f8f9fa;
        border-radius: 6px;
        padding: 10px;
        border: 1px solid #e2e8f0;
      }

      .slider-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
      }

      .slider-header .material-symbols-outlined {
        font-size: 18px;
        color: #64748b;
      }

      .slider-label {
        flex: 1;
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }

      .slider-value {
        font-size: 12px;
        font-weight: 600;
        color: #6366f1;
        background: #eef2ff;
        padding: 2px 8px;
        border-radius: 4px;
        min-width: 50px;
        text-align: center;
      }

      .slider-track {
        position: relative;
        height: 6px;
        background: #e2e8f0;
        border-radius: 3px;
        margin-bottom: 10px;
      }

      .slider-input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        z-index: 2;
      }

      .slider-fill {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: linear-gradient(90deg, #6366f1, #8b5cf6);
        border-radius: 3px;
        transition: width 0.2s ease;
        z-index: 1;
      }

      .slider-controls {
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }

      /* Toggle - Style cohérent avec le reste du panneau */
      .toggle {
        position: relative;
        display: inline-block;
        width: 32px;
        height: 18px;
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
        background-color: #d1d5db;
        transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 18px;
      }

      .toggle span:before {
        position: absolute;
        content: "";
        height: 14px;
        width: 14px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .toggle input:checked + span {
        background-color: #6366f1;
      }

      .toggle input:checked + span:before {
        transform: translateX(14px);
      }

      /* Hover effect pour le slider */
      .slider-track:hover .slider-fill {
        background: linear-gradient(90deg, #4f46e5, #7c3aed);
      }
    `,
  ],
})
export class HeightSliderComponent {
  // Inputs
  label = input.required<string>();
  icon = input.required<string>();
  value = input.required<number>();
  min = input<number>(100);
  max = input<number>(800);
  step = input<number>(10);
  isEnabled = input.required<boolean>();

  // Outputs
  valueChange = output<number>();
  enabledChange = output<boolean>();

  // Computed
  fillPercentage = computed(() => {
    return ((this.value() - this.min()) / (this.max() - this.min())) * 100;
  });

  onSliderChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const newValue = parseInt(target.value, 10);
    this.valueChange.emit(newValue);
  }

  toggleEnabled() {
    this.enabledChange.emit(!this.isEnabled());
  }
}
