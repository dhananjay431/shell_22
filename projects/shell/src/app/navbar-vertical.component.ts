import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonService } from '../../../shared/common.service';
import { AsyncPipe } from '@angular/common';
import { forkJoin, map, mergeMap } from 'rxjs';
import { MenuItem, MenuItemComponent } from './menu-item.component';
import { Router } from '@angular/router';

type ApiMenuItem = Omit<MenuItem, 'children'>;
type TargetItem = {
  Id: string;
  Type: string;
  DisplayName: string;
};

@Component({
  selector: 'app-navbar-vertical',
  standalone: true,
  imports: [AsyncPipe, MenuItemComponent],
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
      class="sidebar"
      [class.collapsed]="isCollapsed()"
      [class.mobile-open]="isMobileOpen()"
      aria-label="Sidebar navigation"
    >
      <div class="logo">
        <div class="logo-mark">A</div>
        <div class="logo-labels">
          <div class="logo-text">Agentic</div>
          <div class="logo-sub">Intelligent AP</div>
        </div>
        <button
          class="sidebar-collapse desktop-toggle"
          type="button"
          [attr.aria-label]="isCollapsed() ? 'Expand navigation menu' : 'Collapse navigation menu'"
          [attr.aria-expanded]="!isCollapsed()"
          (click)="toggleCollapsed()"
        >
          <span aria-hidden="true">{{ isCollapsed() ? '»' : '«' }}</span>
        </button>
      </div>

      <nav class="nav">
        @if (menuItems$ | async; as menuItems) {
          @for (item of templateMenuItems(menuItems); track item.ID) {
            <app-menu-item
              [item]="item"
              [collapsed]="isCollapsed()"
              (navigate)="onNavigate($event)"
            />
          }
        } @else {
          <p class="menu-status">Loading menu…</p>
        }
      </nav>

      <div class="ai-widget sidebar-hide" aria-label="AI Copilot">
        <div class="ai-chat-bubble">
          I'm analyzing this invoice.<br />All validations are handled by agents.
        </div>
        <div class="ai-bottom-row">
          <div class="ai-avatar" aria-hidden="true">✦</div>
          <div>
            <div class="ai-meta"><span class="status-dot"></span>AI Copilot</div>
            <span class="ask-button">Ask a question</span>
          </div>
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="user-avatar" aria-hidden="true">
          {{ getuserdetailsdt[0].UserName.slice(0, 2).toUpperCase() }}
        </div>
        <div class="sidebar-hide user-details">
          <div>{{ getuserdetailsdt[0].UserName }}</div>
          <small>{{ getuserdetailsdt[0].ContactInformation.email }}</small>
        </div>
        <span class="sidebar-hide footer-chevron" aria-hidden="true">⌄</span>
      </div>
    </aside>
  `,
  styles: `
    :host {
      display: block;
    }
    .sidebar {
      position: relative;
      z-index: 1031;
      width: 250px;
      flex: 0 0 250px;
      flex-shrink: 0;
      height: 100vh;
      min-height: calc(100vh - 56px);
      background: #fff;
      border-right: 1px solid var(--vuexy-border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition:
        width 0.2s ease,
        transform 0.2s ease;
    }
    .sidebar.collapsed {
      width: 68px;
      flex-basis: 68px;
    }
    .logo {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 16px 14px 13px;
      border-bottom: 1px solid rgb(15 30 20 / 8%);
    }
    .logo-mark {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: var(--vuexy-primary);
      color: #fff;
      display: grid;
      place-items: center;
      font-size: 15px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .logo-text {
      font-size: 13.5px;
      font-weight: 600;
    }
    .logo-sub,
    .ai-meta,
    .user-details small {
      color: var(--vuexy-muted);
      font-size: 10px;
    }
    .sidebar-collapse {
      margin-left: auto;
      border: 0;
      background: transparent;
      color: #8a978e;
      cursor: pointer;
      font-size: 16px;
    }
    .nav {
      padding: 8px 6px;
      flex: 1;
      overflow-y: auto;
      display: block !important;
    }
    ::ng-deep .nav-link {
      color: var(--vuexy-body);
      font-size: 12px;
      border-radius: 6px;
      padding: 10px 14px;
      margin: 5px 0;
      transition: all 0.15s;
    }
    ::ng-deep .nav-link:hover {
      background: var(--vuexy-primary-soft);
      color: var(--vuexy-primary);
    }
    ::ng-deep .nav-link.active {
      background: var(--vuexy-primary-soft);
      color: var(--vuexy-primary);
      font-weight: 600;
    }
    ::ng-deep .menu-button {
      background: transparent;
    }
    ::ng-deep .menu-icon {
      color: var(--vuexy-muted);
      font-size: 14px;
    }
    ::ng-deep .submenu-icon {
      color: #718078;
      font-size: 11px;
    }
    .collapsed .logo {
      padding: 16px 0 13px;
      justify-content: center;
    }
    .collapsed .logo-labels,
    .collapsed .sidebar-hide,
    .collapsed ::ng-deep .menu-label,
    .collapsed ::ng-deep .submenu-icon {
      display: none;
    }
    .collapsed .sidebar-collapse {
      margin-left: 0;
    }
    .collapsed ::ng-deep .nav-link {
      justify-content: center;
      padding: 8px 0;
    }
    .ai-widget,
    .sidebar-footer {
      border-top: 1px solid var(--vuexy-border);
      padding: 10px 12px;
    }
    .ai-chat-bubble {
      background: var(--vuexy-primary-soft);
      border-radius: 8px 8px 8px 2px;
      padding: 8px 9px;
      color: var(--vuexy-body);
      font-size: 10px;
      line-height: 1.5;
      margin-bottom: 6px;
    }
    .ai-bottom-row,
    .sidebar-footer {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ai-avatar,
    .user-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      flex-shrink: 0;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      background: var(--vuexy-primary);
    }
    .ai-meta {
      margin-bottom: 3px;
    }
    .status-dot {
      display: inline-block;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #0d9488;
      margin-right: 3px;
    }
    .ask-button {
      color: var(--vuexy-primary);
      font-size: 10.5px;
    }
    .footer-chevron {
      margin-left: auto;
      color: var(--vuexy-muted);
    }
    .sidebar-toggle {
      border: 1px solid var(--vuexy-border);
      border-radius: 0.35rem;
      color: var(--vuexy-heading);
      background: var(--vuexy-paper);
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
        width: 250px;
        flex-basis: 250px;
        min-height: 100vh;
        transform: translateX(-100%);
        box-shadow: 0 0 1rem rgb(15 23 42 / 15%);
      }
      .sidebar.mobile-open {
        transform: translateX(0);
      }
      .sidebar.collapsed {
        width: 250px;
        flex-basis: 250px;
      }
      .sidebar.collapsed .logo-labels,
      .sidebar.collapsed .sidebar-hide,
      .sidebar.collapsed ::ng-deep .menu-label,
      .sidebar.collapsed ::ng-deep .submenu-icon {
        display: block;
      }
      .sidebar.collapsed ::ng-deep .nav-link {
        justify-content: flex-start;
        padding: 6px 10px;
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
  readonly isMobileOpen = signal(false);
  getuserdetailsdt: any;
  private readonly router = inject(Router);

  onNavigate(item: MenuItem): void {
    console.log(item.MENU_LINK);
    void this.router.navigate([item.MENU_LINK], {
      queryParams: { menuId: new Date().getTime() },
      state: { props: item },
    });
    this.closeMobile();
  }

  templateMenuItems(items: MenuItem[]): MenuItem[] {
    const labels = [
      'Home',
      'Payables',
      'Admin',
      'Analytics',
      'Process Intelligence',
      'AI IDP',
      'AP Help Desk',
      'Settings',
    ];

    return items.slice(0, labels.length).map((item, index) => ({
      ...item,
      MENU_LABEL: labels[index],
    }));
  }
  /*  
<SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/">
    <SOAP:Body>
        <GetSprintAPMenuForUser xmlns="http://schemas.cordys.com/purchaseorderdatabasemetadata">
            <userName>Indexer</userName>
            <accessBy>role</accessBy>
        </GetSprintAPMenuForUser>
    </SOAP:Body>
</SOAP:Envelope>
<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'>
    <SOAP:Body>
        <GetUserDetails xmlns='http://schemas.cordys.com/UserManagement/1.0/User'></GetUserDetails>
    </SOAP:Body>
</SOAP:Envelope>
  */

  cs = inject(CommonService);
  getalltargets = this.cs.getalltargets;
  getsprintapmenuforuser = this.cs.getuserdetails.pipe(
    mergeMap((r1: any) => {
      this.getuserdetailsdt = r1;
      console.log('getuserdetailsdt', this.getuserdetailsdt);
      return this.cs.ajax(
        'GetSprintAPMenuForUser.tuple',
        'http://schemas.cordys.com/purchaseorderdatabasemetadata',
        {
          userName: r1[0].UserName,
          accessBy: 'role',
        },
      );
    }),
  );
  readonly menuItems$ = forkJoin({
    menu: this.getsprintapmenuforuser,
    targets: this.getalltargets,
  }).pipe(
    map(({ menu, targets }) =>
      this.buildMenuTree(
        this.addTargetSubmenus(
          Array.isArray(menu) ? (menu as ApiMenuItem[]) : [],
          Array.isArray(targets) ? (targets as TargetItem[]) : [],
        ),
      ),
    ),
  );

  private addTargetSubmenus(items: ApiMenuItem[], targets: TargetItem[]): ApiMenuItem[] {
    const menuItems = items.map((item) => ({ ...item }));
    const sprintAp = menuItems.find((item) => item.MENU_ID === '9');

    if (!sprintAp) {
      return menuItems;
    }

    const targetGroups = [
      {
        menuId: '12',
        title: 'Touchless Queue',
        matches: (name: string) => name.includes('TP_Verify') || name.includes('TP_No GRN'),
      },
      {
        menuId: '15',
        title: 'Quality Check Queue',
        matches: (name: string) =>
          name.includes('New for QC') ||
          name.includes('After QR') ||
          name.includes('After QC Head') ||
          name.includes('QC Head'),
      },
      {
        menuId: '13',
        title: 'Indexing (Manual)',
        matches: (name: string) =>
          !name.includes('Audit_Queue') &&
          !name.includes('New for QC') &&
          !name.includes('After QR') &&
          !name.includes('After QC Head') &&
          !name.includes('QC Head') &&
          !name.includes('TP_Verify') &&
          !name.includes('TP_No GRN'),
      },
    ];

    const eligibleTargets = targets.filter(
      (target) =>
        (target.Type === 'team' || target.Type === 'user') &&
        target.DisplayName &&
        target.DisplayName !== 'Verification Queue' &&
        target.DisplayName !== 'Whitelisting Approval',
    );

    for (const group of targetGroups) {
      const parent = menuItems.find(
        (item) => item.PARENT_ID === sprintAp.ID && item.MENU_ID === group.menuId,
      );

      if (!parent) {
        continue;
      }

      const children = eligibleTargets
        .filter((target) => group.matches(target.DisplayName))
        .sort((a, b) => a.DisplayName.localeCompare(b.DisplayName))
        .map((target, index) => ({
          ID: target.Id,
          MENU_LABEL: target.DisplayName,
          MENU_LINK: '/payx/dashboard',
          TIP: 'sort',
          MODULE: '',
          PARENT_ID: parent.ID,
          MENU_LEVEL: '',
          PRIORITY: String(index),
          MENU_ID: '',
        }));

      menuItems.push(...children);
    }

    return menuItems;
  }

  private buildMenuTree(items: ApiMenuItem[]): MenuItem[] {
    const nodes = new Map<string, MenuItem>();

    for (const item of items ?? []) {
      nodes.set(item.ID, { ...item, children: [] });
    }

    const roots: MenuItem[] = [];
    for (const node of nodes.values()) {
      const parent = nodes.get(node.PARENT_ID);
      if (node.PARENT_ID === '0' || !parent) {
        roots.push(node);
      } else {
        parent.children.push(node);
      }
    }

    const sort = (menuItems: MenuItem[]): void => {
      menuItems.sort((a, b) => Number(a.PRIORITY) - Number(b.PRIORITY));
      menuItems.forEach((item) => sort(item.children));
    };

    sort(roots);
    return roots;
  }
  toggleCollapsed(): void {
    this.isCollapsed.update((collapsed) => !collapsed);
  }
  toggleMobile(): void {
    this.isMobileOpen.update((open) => !open);
  }
  closeMobile(): void {
    this.isMobileOpen.set(false);
  }

  ngOnInit() {}
}
