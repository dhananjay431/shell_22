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
    <div class="shell-layout w-100">
      <app-navbar-vertical />

      <div class="shell-main">
        <app-navbar-top />

        <main class="shell-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: `
    .shell-main {
      width: 100%;
    }
  `,
})
export class HomeComponent {}
