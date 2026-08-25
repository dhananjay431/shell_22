import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar-vertical',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="sidebar-toggle mobile-toggle"
      type="button"
      aria-label="Toggle navigation menu"
      [attr.aria-expanded]="isMobileOpen()"
      (click)="toggleMobile()"
    >
      <span aria-hidden="true">☰</span>
    </button>

    @if (isMobileOpen()) {
      <button
        class="sidebar-backdrop"
        type="button"
        aria-label="Close navigation menu"
        (click)="closeMobile()"
      ></button>
    }

    <aside
      class="sidebar border-end bg-light"
      [class.collapsed]="isCollapsed()"
      [class.mobile-open]="isMobileOpen()"
      aria-label="Sidebar navigation"
    >
      <div class="sidebar-header">
        <span class="sidebar-title">Navigation</span>
        <button
          class="sidebar-toggle desktop-toggle"
          type="button"
          [attr.aria-label]="isCollapsed() ? 'Expand navigation menu' : 'Collapse navigation menu'"
          [attr.aria-expanded]="!isCollapsed()"
          (click)="toggleCollapsed()"
        >
          <span aria-hidden="true">{{ isCollapsed() ? '»' : '«' }}</span>
        </button>
      </div>

      <nav class="nav nav-pills flex-column gap-1 p-2">
        <a
          class="nav-link"
          routerLink="/home"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          (click)="closeMobile()"
        >
          <span class="menu-icon" aria-hidden="true">⌂</span><span class="menu-label">Home</span>
        </a>

        <button
          class="nav-link menu-button"
          type="button"
          [attr.aria-expanded]="isApplicationsOpen()"
          aria-controls="applications-submenu"
          (click)="toggleApplications()"
        >
          <span class="menu-icon" aria-hidden="true">▣</span
          ><span class="menu-label">Applications</span>
          <span class="submenu-icon" aria-hidden="true">{{
            isApplicationsOpen() ? '⌃' : '⌄'
          }}</span>
        </button>

        @if (isApplicationsOpen() && !isCollapsed()) {
          <div
            id="applications-submenu"
            class="submenu nav flex-column"
            aria-label="Applications submenu"
          >
            <a
              class="nav-link"
              routerLink="/home/mfe1"
              routerLinkActive="active"
              (click)="closeMobile()"
            >
              <span class="menu-icon" aria-hidden="true">•</span
              ><span class="menu-label">MFE 1</span>
            </a>
            <a
              class="nav-link"
              routerLink="/mfe2"
              routerLinkActive="active"
              (click)="closeMobile()"
            >
              <span class="menu-icon" aria-hidden="true">•</span
              ><span class="menu-label">MFE 2</span>
            </a>
          </div>
        }

        <a class="nav-link" routerLink="/login" routerLinkActive="active" (click)="closeMobile()">
          <span class="menu-icon" aria-hidden="true">↪</span><span class="menu-label">Sign in</span>
        </a>
      </nav>
    </aside>
  `,
  styles: `
    :host {
      display: block;
    }
    .sidebar {
      position: relative;
      z-index: 1031;
      width: 240px;
      min-height: calc(100vh - 56px);
      transition:
        width 0.2s ease,
        transform 0.2s ease;
    }
    .sidebar.collapsed {
      width: 68px;
    }
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 0.75rem 0.5rem;
    }
    .sidebar-title {
      overflow: hidden;
      white-space: nowrap;
      color: #64748b;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .collapsed .sidebar-title,
    .collapsed .menu-label,
    .collapsed .submenu-icon {
      display: none;
    }
    .collapsed .nav-link {
      justify-content: center;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.7rem;
    }
    .menu-button {
      width: 100%;
      border: 0;
      text-align: left;
      cursor: pointer;
    }
    .menu-icon {
      width: 1.25rem;
      flex: 0 0 1.25rem;
      text-align: center;
      font-size: 1.1rem;
    }
    .submenu-icon {
      margin-left: auto;
    }
    .submenu {
      margin-left: 1rem;
      padding-left: 0.5rem;
      border-left: 1px solid #dee2e6;
    }
    .sidebar-toggle {
      border: 1px solid #cbd5e1;
      border-radius: 0.35rem;
      color: #334155;
      background: white;
      cursor: pointer;
    }
    .desktop-toggle {
      width: 1.75rem;
      height: 1.75rem;
      line-height: 1;
    }
    .mobile-toggle {
      display: none;
      position: fixed;
      top: 0.65rem;
      left: 0.75rem;
      z-index: 1033;
      width: 2.25rem;
      height: 2.25rem;
    }
    .sidebar-backdrop {
      display: none;
    }
    @media (max-width: 767.98px) {
      .mobile-toggle {
        display: block;
      }
      .sidebar {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        width: 240px;
        min-height: 100vh;
        transform: translateX(-100%);
        box-shadow: 0 0 1rem rgb(15 23 42 / 15%);
      }
      .sidebar.mobile-open {
        transform: translateX(0);
      }
      .sidebar.collapsed {
        width: 240px;
      }
      .sidebar.collapsed .sidebar-title,
      .sidebar.collapsed .menu-label,
      .sidebar.collapsed .submenu-icon {
        display: inline;
      }
      .sidebar.collapsed .nav-link {
        justify-content: flex-start;
      }
      .desktop-toggle {
        display: none;
      }
      .sidebar-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        z-index: 1030;
        border: 0;
        background: rgb(0 0 0 / 35%);
      }
    }
  `,
})
export class NavbarVerticalComponent {
  readonly isCollapsed = signal(false);
  readonly isApplicationsOpen = signal(false);
  readonly isMobileOpen = signal(false);

  toggleCollapsed(): void {
    this.isCollapsed.update((collapsed) => !collapsed);
  }
  toggleApplications(): void {
    this.isApplicationsOpen.update((open) => !open);
  }
  toggleMobile(): void {
    this.isMobileOpen.update((open) => !open);
  }
  closeMobile(): void {
    this.isMobileOpen.set(false);
  }
}
