import { Component, input } from "@angular/core";

@Component({
  selector: "tiptap-separator",
  standalone: true,
  template: `
    <div
      class="tiptap-separator"
      [class.vertical]="orientation() === 'vertical'"
      [class.horizontal]="orientation() === 'horizontal'"
      [class.size-small]="size() === 'small'"
      [class.size-large]="size() === 'large'"
    ></div>
  `,
  styles: [
    `
      .tiptap-separator {
        background-color: #e2e8f0;
        margin: 0;
      }

      .tiptap-separator.vertical {
        width: 1px;
        height: 24px;
        margin: 0 8px;
      }

      .tiptap-separator.horizontal {
        height: 1px;
        width: 100%;
        margin: 8px 0;
      }

      .tiptap-separator.size-small.vertical {
        height: 16px;
        margin: 0 4px;
      }

      .tiptap-separator.size-small.horizontal {
        margin: 4px 0;
      }

      .tiptap-separator.size-large.vertical {
        height: 32px;
        margin: 0 12px;
      }

      .tiptap-separator.size-large.horizontal {
        margin: 12px 0;
      }
    `,
  ],
})
export class TiptapSeparatorComponent {
  orientation = input<"vertical" | "horizontal">("vertical");
  size = input<"small" | "medium" | "large">("medium");
}
