import { Directive, ElementRef, Input, HostListener } from "@angular/core";

@Directive({ selector: "input[Upper]" })
export class UpperCaseDirective {
  @Input() Upper: boolean;
  constructor() {}

  @HostListener("keypress", ["$event"]) onKeyDown(event) {
    event.target.value = event.target.value.toUpperCase();
  }
}
