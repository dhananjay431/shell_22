import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonService } from '../../../shared/common.service';
import { debounceTime, forkJoin, last, map, mergeMap, of, tap } from 'rxjs';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
// {{i.UserName.slice(0,2).toUpperCase()}}
/* 
  <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="#">Invoice Processing</a>
          <span class="separator" aria-hidden="true">/</span>
          <a href="#">SAP - MIRO</a>
          <span class="separator" aria-hidden="true">/</span>
          <span class="current" aria-current="page">FB-60</span>
        </nav>
         */
@Component({
  selector: 'app-navbar-top',
  standalone: true,
  imports: [AsyncPipe, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="topbar">
      @if (dt | async; as _dt) {
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="#">{{ ob(_dt)[0].link.MENU_LABEL }}</a>
        </nav>

        <div class="topbar-right">
          <button class="icon-button" type="button" aria-label="3 new notifications">
            <span class="bell-icon" aria-hidden="true">♢</span>
            <span class="notification-badge" aria-hidden="true">3</span>
          </button>
          <button class="user-avatar" type="button" aria-label="Open Priya Sharma profile">
            {{ ob(_dt)[0].user[0].UserName.slice(0, 2).toUpperCase() }}
          </button>
        </div>
      }
    </header>
  `,
  styles: `
    :host {
      display: block;
    }

    .topbar {
      min-height: 58px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin: 1rem 1.5rem 0;
      padding: 0 1.25rem;
      border: 1px solid var(--vuexy-border);
      border-radius: 0.5rem;
      background: var(--vuexy-paper);
      box-shadow: var(--vuexy-shadow);
      color: var(--vuexy-body);
      font-size: 12px;
    }

    .breadcrumb,
    .topbar-right {
      display: flex;
      align-items: center;
    }

    .breadcrumb {
      min-width: 0;
      gap: 8px;
      white-space: nowrap;
      overflow: hidden;
    }

    .breadcrumb a {
      overflow: hidden;
      color: var(--vuexy-body);
      text-overflow: ellipsis;
      text-decoration: none;
    }

    .breadcrumb a:hover {
      color: var(--vuexy-primary);
    }

    .separator {
      color: var(--vuexy-muted);
    }

    .current {
      overflow: hidden;
      color: var(--vuexy-heading);
      text-overflow: ellipsis;
    }

    .topbar-right {
      flex-shrink: 0;
      gap: 10px;
    }

    .icon-button,
    .user-avatar {
      border: 0;
      cursor: pointer;
    }

    .icon-button {
      position: relative;
      width: 32px;
      height: 32px;
      display: grid;
      place-items: center;
      border-radius: 6px;
      background: transparent;
      color: #5b6b61;
    }

    .icon-button:hover {
      background: var(--vuexy-primary-soft);
      color: var(--vuexy-primary);
    }

    .bell-icon {
      font-size: 20px;
      line-height: 1;
      transform: rotate(45deg);
    }

    .notification-badge {
      position: absolute;
      top: 1px;
      right: 0;
      min-width: 15px;
      height: 15px;
      padding: 0 4px;
      border-radius: 20px;
      background: var(--vuexy-primary);
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      line-height: 15px;
      text-align: center;
    }

    .user-avatar {
      width: 30px;
      height: 30px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: var(--vuexy-primary);
      color: #fff;
      font-size: 10.5px;
      font-weight: 700;
    }

    .user-avatar:hover {
      box-shadow: 0 0 0 3px rgb(115 103 240 / 18%);
    }

    @media (max-width: 480px) {
      .topbar {
        padding: 0 0.75rem;
        margin: 0.75rem;
      }

      .breadcrumb {
        gap: 5px;
      }

      .breadcrumb a:first-child,
      .breadcrumb .separator:first-of-type {
        display: none;
      }
    }
  `,
})
export class NavbarTopComponent {
  //getuserdetailsdt[0].UserName.slice(0,2).toUpperCase()

  router = inject(Router);
  constructor(private cs: CommonService) {}
  ob = (_: any) => (Array.isArray(_) ? _ : [_]);

  fk() {
    return forkJoin({
      user: this.cs.getuserdetails,
      link: of(history.state.props),
    });
  }
  dt: any = of({ user: [], link: {} });
  ngOnInit() {
    this.dt = this.router.events.pipe(
      debounceTime(300),
      mergeMap((d: any) => this.fk()),
    );
  }
}
