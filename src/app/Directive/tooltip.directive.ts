import { Directive, Input, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[tooltip]'
})
export class TooltipDirective {
  @Input('tooltip') tooltipTitle: string;
  placement: string = "top";
  delay: number = 500;
  hideAfter: number = 2000
  tooltip: HTMLElement;
  offset = 1;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  show(element: ElementRef, str: string, isFocused: boolean = true) {
    switch (element['tagName'].toUpperCase()) {
      case 'INPUT':
        element['scrollIntoView']({ behavior: "smooth", block: "center", inline: "nearest" });
        if (isFocused)
          element['focus']();
        break;
      case 'SELECT':
        element['scrollIntoView']({ behavior: "smooth", block: "center", inline: "nearest" });
        if (isFocused)
          element['focus']();
        break;
      case 'TEXTAREA':
        element['scrollIntoView']({ behavior: "smooth", block: "center", inline: "nearest" });
        if (isFocused)
          element['focus']();
        break;
    }
    if (this.tooltip && this.tooltip != null)
      this.hide(false);
    this.create(str);
    this.setPosition(element);
    this.renderer.addClass(this.tooltip, 'ng-tooltip-show');
    setTimeout(() => {
      this.hide(true)
    }, this.hideAfter);
  }

  hide(autoHide: boolean) {
    if (!autoHide) {
      this.renderer.removeClass(this.tooltip, 'ng-tooltip-show');
      this.renderer.removeChild(document.body, this.tooltip);
      this.tooltip = null;
    }
    else
      if (this.tooltip && this.tooltip != null) {
        this.renderer.removeClass(this.tooltip, 'ng-tooltip-show');
        window.setTimeout(() => {
          this.renderer.removeChild(document.body, this.tooltip);
          this.tooltip = null;
        }, this.delay);
      }
  }

  create(str: string) {
    this.tooltip = this.renderer.createElement('span');

    this.renderer.appendChild(
      this.tooltip,
      this.renderer.createText(str) // Here is your text
    );

    this.renderer.appendChild(document.body, this.tooltip);

    this.renderer.addClass(this.tooltip, 'ng-tooltip');
    this.renderer.addClass(this.tooltip, `ng-tooltip-${this.placement}`);
    this.renderer.setStyle(this.tooltip, '-webkit-transition', `opacity ${this.delay}ms`);
    this.renderer.setStyle(this.tooltip, '-moz-transition', `opacity ${this.delay}ms`);
    this.renderer.setStyle(this.tooltip, '-o-transition', `opacity ${this.delay}ms`);
    this.renderer.setStyle(this.tooltip, 'transition', `opacity ${this.delay}ms`);
  }

  setPosition(event: ElementRef) {
    this.el = new ElementRef(event);
    const hostPos = this.el.nativeElement.getBoundingClientRect();
    const tooltipPos = this.tooltip.getBoundingClientRect();

    const scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    let top, left;

    if (this.placement === 'top') {
      top = hostPos.top - tooltipPos.height - this.offset;
      left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
    }

    // if (this.placement === 'bottom') {
    //   top = hostPos.bottom + this.offset;
    //   left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
    // }

    // if (this.placement === 'left') {
    //   top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
    //   left = hostPos.left - tooltipPos.width - this.offset;
    // }

    // if (this.placement === 'right') {
    //   top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
    //   left = hostPos.right + this.offset;
    // }

    this.renderer.setStyle(this.tooltip, 'top', `${top + scrollPos}px`);
    this.renderer.setStyle(this.tooltip, 'left', `${left}px`);
  }
}
