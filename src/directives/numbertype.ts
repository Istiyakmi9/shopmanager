import { Directive, ElementRef, Input, HostListener } from "@angular/core";

@Directive({ selector: "input[NumberType]" })
export class NumberOnlyDirective {
  AllowedKeys: Array<number> = [8, 9, 46, 37, 39];
  @Input() NumberType: boolean;
  constructor(private elemRef: ElementRef) {}

  @HostListener("keydown", ["$event"]) onKeyDown(event) {
    let e = <KeyboardEvent>event;
    if (this.NumberType) {
      if (this.AllowedKeys.indexOf(e.which) !== -1) {
        return;
      } else {
        if (e.which >= 48 && e.which <= 57) return;
        else e.preventDefault();
      }
    }
  }
}
