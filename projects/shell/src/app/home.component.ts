import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarTopComponent } from './navbar-top.component';
import { NavbarVerticalComponent } from './navbar-vertical.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, NavbarTopComponent, NavbarVerticalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navbar-top />

    <div class="shell-layout">
      <app-navbar-vertical />

      <main class="shell-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: ``,
})
export class HomeComponent {}
