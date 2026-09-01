import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

export interface MenuItem {
  ID: string;
  MENU_LABEL: string;
  MENU_LINK: string;
  TIP: string;
  MODULE: string;
  PARENT_ID: string;
  MENU_LEVEL: string;
  PRIORITY: string;
  MENU_ID: string;
  children: MenuItem[];
}

export interface MenuNavigationEvent {
  item: MenuItem;
  parentMenuLabel?: string;
}

@Component({
  selector: 'app-menu-item',
  standalone: true,
  imports: [],

  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (hasChildren()) {
      <button
        class="nav-link menu-button p-0"
        type="button"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="submenuId()"
        (click)="toggle()"
      >
        <span class="menu-icon" aria-hidden="true">{{ iconFor(item().TIP) }}</span>
        <span class="menu-label"> {{ item().MENU_LABEL }}</span>
        <span class="submenu-icon" aria-hidden="true">
          <i [class]="isOpen() ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
        </span>
      </button>

      @if (isOpen() && !collapsed()) {
        <div
          [id]="submenuId()"
          class="submenu nav flex-column"
          [attr.aria-label]="item().MENU_LABEL + ' submenu'"
        >
          @for (child of item().children; track child.ID) {
            <app-menu-item
              [item]="child"
              [parentMenuLabel]="item().MENU_LABEL"
              [collapsed]="collapsed()"
              (navigate)="navigate.emit($event)"
            />
          }
        </div>
      }
    } @else if (isExternalLink()) {
      <a
        class="nav-link p-0"
        [href]="item().MENU_LINK"
        target="_blank"
        rel="noopener noreferrer"
        (click)="navigate.emit({ item: item(), parentMenuLabel: parentMenuLabel() })"
      >
        <span class="menu-icon" aria-hidden="true">{{ iconFor(item().TIP) }}</span>
        <span class="menu-label"> {{ item().MENU_LABEL }}</span>
      </a>
    } @else {
      <a
        class="nav-link p-0"
        (click)="navigate.emit({ item: item(), parentMenuLabel: parentMenuLabel() })"
      >
        <span class="menu-icon" aria-hidden="true">&nbsp;&nbsp;&nbsp;</span>
        <span class="menu-label">{{ item().MENU_LABEL }}</span>
      </a>
    }
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      text-decoration: none;
      cursor: pointer;
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
      color: var(--vuexy-muted);
      font-size: 1rem;
    }
    .submenu-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1rem;
      line-height: 1;
      margin-left: auto;
    }
    .submenu {
      width: 100%;
      margin: 0;
      padding: 0;
      border: 0;
    }
  `,
})
export class MenuItemComponent {
  readonly item = input.required<MenuItem>();
  readonly parentMenuLabel = input<string | undefined>();
  readonly collapsed = input(false);
  readonly navigate = output<MenuNavigationEvent>();
  readonly isOpen = signal(false);

  readonly hasChildren = () => this.item().children.length > 0;
  readonly isExternalLink = () => /^https?:\/\//i.test(this.item().MENU_LINK);
  readonly submenuId = () => `submenu-${this.item().ID}`;

  iconFor(tip: string): string {
    return (
      {
        'icon-Home': '⌂',
        'icon-Liabilities': '▣',
        'icon-admin': '⚙',
        'icon-Analytics': '▥',
        'icon-Ai-Doc': '✦',
        'icon-Help': '?',
        'icon-Settings': '⚙',
      }[tip] ?? '•'
    );
  }

  toggle(): void {
    this.isOpen.update((open) => !open);
  }
}
