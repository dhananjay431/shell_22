import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonService } from '../../../shared/common.service';
import { AsyncPipe } from '@angular/common';
import { forkJoin, map, mergeMap } from 'rxjs';
import { MenuItem, MenuItemComponent } from './menu-item.component';

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
        @if (menuItems$ | async; as menuItems) {
          @for (item of menuItems; track item.ID) {
            <app-menu-item [item]="item" [collapsed]="isCollapsed()" (navigate)="closeMobile()" />
          }
        } @else {
          <p class="menu-status">Loading menu…</p>
        }
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
    .menu-status {
      padding: 0.75rem;
      color: #64748b;
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
  readonly isMobileOpen = signal(false);
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
  getalltargets = this.cs.ajax(
    'GetAllTargets.Target',
    'http://schemas.cordys.com/notification/workflow/1.0',
    {},
  );
  getsprintapmenuforuser = this.cs
    .ajax('GetUserDetails.User', 'http://schemas.cordys.com/UserManagement/1.0/User', {})
    .pipe(
      mergeMap((r1: any) =>
        this.cs.ajax(
          'GetSprintAPMenuForUser.tuple',
          'http://schemas.cordys.com/purchaseorderdatabasemetadata',
          {
            userName: r1[0].UserName,
            accessBy: 'role',
          },
        ),
      ),
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
          ID: `target-${group.menuId}-${target.Id}`,
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
