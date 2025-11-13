import { Component, input } from "@angular/core";

@Component({
  selector: "tiptap-separator",
  standalone: true,
  templateUrl: "./tiptap-separator.component.html",
  styleUrls: ["./tiptap-separator.component.css"],
})
export class TiptapSeparatorComponent {
  orientation = input<"vertical" | "horizontal">("vertical");
  size = input<"small" | "medium" | "large">("medium");
}
