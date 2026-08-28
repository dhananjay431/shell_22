import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../../../shared/common.service';
//import { JsonPipe } from '@angular/common';
declare var $: any;
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="login-page">
      <section class="login-card" aria-labelledby="login-title">
        <h1 id="login-title">Sign in</h1>
        <p class="login-subtitle">Welcome back. Enter your details to continue.</p>

        <form #loginForm="ngForm" (ngSubmit)="submit(loginForm)" novalidate>
          <label for="email">Email</label>
          <input
            id="email"
            name="email"
            type="text"
            autocomplete="email"
            required
            text
            [(ngModel)]="email"
            #emailControl="ngModel"
            [class.invalid]="emailControl.invalid && emailControl.touched"
          />
          @if (emailControl.invalid && emailControl.touched) {
            <small class="error">Enter a valid email address.</small>
          }

          <label for="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            minlength="8"
            [(ngModel)]="password"
            #passwordControl="ngModel"
            [class.invalid]="passwordControl.invalid && passwordControl.touched"
          />
          @if (passwordControl.invalid && passwordControl.touched) {
            <small class="error">Password must be at least 8 characters.</small>
          }

          <button type="submit">Sign in</button>
        </form>
      </section>
    </main>
  `,
  styles: `
    .login-page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 2rem;
      background: #f4f7fb;
      font-family: Arial, sans-serif;
    }

    .login-card {
      width: min(100%, 400px);
      padding: 2rem;
      border: 1px solid #dce3ed;
      border-radius: 0.75rem;
      background: white;
      box-shadow: 0 8px 24px rgb(15 23 42 / 8%);
    }

    h1 {
      margin: 0;
      color: #172033;
    }

    .login-subtitle {
      margin: 0.5rem 0 1.5rem;
      color: #64748b;
    }

    label {
      display: block;
      margin: 1rem 0 0.4rem;
      color: #334155;
      font-weight: 600;
    }

    input {
      box-sizing: border-box;
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.35rem;
      font: inherit;
    }

    input.invalid {
      border-color: #dc2626;
    }

    .error {
      display: block;
      margin-top: 0.35rem;
      color: #dc2626;
    }

    button {
      width: 100%;
      margin-top: 1.5rem;
      padding: 0.8rem;
      border: 0;
      border-radius: 0.35rem;
      color: white;
      background: #1976d2;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  private readonly commonService = inject(CommonService);
  constructor(private readonly router: Router) {}

  submit(form: NgForm): void {
    console.log(form);
    let that = this;
    if (form.valid) {
      $.cordys.authentication.sso.authenticate(this.email, this.password).done(function (
        resp: any,
      ) {
        that.commonService
          .ajax('GetAllTargets.Target', 'http://schemas.cordys.com/notification/workflow/1.0', {
            TaskCountRequired: true,
          })
          .subscribe((r1: any) => {
            console.log(r1);
            void that.router.navigate(['/payx']);
          });
      });
    }
  }
}
