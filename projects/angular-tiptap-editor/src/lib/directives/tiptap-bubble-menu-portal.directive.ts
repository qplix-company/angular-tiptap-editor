import { Directive, Input, TemplateRef } from "@angular/core";
import type { Editor } from "@tiptap/core";

export interface TiptapBubbleMenuTemplateContext {
  $implicit: Editor | null;
  editor: Editor | null;
}

@Directive({
  selector: "ng-template[tiptapBubbleMenu]",
  standalone: true,
})
export class TiptapBubbleMenuPortalDirective {
  @Input("tiptapBubbleMenu") key: string | null = null;

  constructor(public templateRef: TemplateRef<TiptapBubbleMenuTemplateContext>) {}
}
