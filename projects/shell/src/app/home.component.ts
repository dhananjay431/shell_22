import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="home">
      <h1>Angular Microfrontend Shell</h1>
      <p>This application is the host shell.</p>
      <a routerLink="/mfe1">Open MFE 1</a>
    </main>
  `,
  styles: `
    .home { max-width: 960px; margin: 4rem auto; padding: 2rem; font-family: Arial, sans-serif; }
    a { display: inline-block; margin-top: 1rem; padding: .75rem 1rem; color: white; background: #1976d2; border-radius: .25rem; text-decoration: none; }
  `,
})
export class HomeComponent {}
