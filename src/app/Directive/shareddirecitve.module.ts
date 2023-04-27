import { NgModule } from "@angular/core";
import { absolute } from "./absolute";
import { TooltipDirective } from "./tooltip.directive";



@NgModule({
  declarations: [
    TooltipDirective,
    absolute
  ],
  exports: [
    TooltipDirective,
    absolute
  ]
})
export class SharedDirectiveModule { }