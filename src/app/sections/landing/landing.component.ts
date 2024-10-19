import {Component} from '@angular/core';
import {environment} from "../../../environments/environment";
import {NavbarWrapperComponent} from "../../shared/navbar-wrapper/navbar-wrapper.component";
import {NotReadyComponent} from "../../shared/not-ready/not-ready.component";

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    NavbarWrapperComponent,
    NotReadyComponent
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.less'
})
export class LandingComponent {
  protected readonly environment = environment;
    protected readonly window = window;
}