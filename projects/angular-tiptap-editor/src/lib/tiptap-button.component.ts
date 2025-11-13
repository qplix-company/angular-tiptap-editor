import { Component, input, output } from "@angular/core";

export interface TiptapButtonConfig {
  icon: string;
  title: string;
  active?: boolean;
  disabled?: boolean;
  variant?: "default" | "text" | "danger";
  size?: "small" | "medium" | "large";
  iconSize?: "small" | "medium" | "large";
}

@Component({
  selector: "tiptap-button",
  standalone: true,
  templateUrl: "./tiptap-button.component.html",
  styleUrls: ["./tiptap-button.component.css"],
})
export class TiptapButtonComponent {
  // Inputs
  icon = input.required<string>();
  title = input.required<string>();
  active = input(false);
  disabled = input(false);
  variant = input<"default" | "text" | "danger">("default");
  size = input<"small" | "medium" | "large">("medium");
  iconSize = input<"small" | "medium" | "large">("medium");

  // Outputs
  onClick = output<Event>();

  onMouseDown(event: MouseEvent) {
    event.preventDefault();
  }
}
