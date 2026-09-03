import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-vn-rules',
  styleUrl: './vn-rules.scss',
  templateUrl: './vn-rules.html',
})
export class VnRules implements OnInit {
  selectedCompanyCode = '';
  selectedEntityType = '';
  selectedExpenseType = '';

  companyCodes: string[] = [
    'GA12',
    'GA16',
    'US18',
    'AU22',
    'AU24',
    'SG24',
    'VN12',
    'SG00',
    'SG03',
    'US26',
    'GH13',
    'PL10',
    'GH00',
    'US17',
    'US19',
  ];

  entityTypeMapping: Record<string, string[]> = {
    SG00: ['Olam International Ltd'],
    SGOO: ['Olam International Ltd'],
    GA16: ['OPG'],
    AU22: [
      'Olam Orchards Australia Pty Ltd',
      'Coleambally Ginning Pty Ltd',
      'Queesland Cotton Corporation Pty Ltd',
    ],
    AU24: [
      'Olam Orchards Australia Pty Ltd',
      'Coleambally Ginning Pty Ltd',
      'Queesland Cotton Corporation Pty Ltd',
    ],
    US18: ['Olam Americas INC - Cashew'],
    GA12: ['ORG'],
    SG24: ['Olam Cocoa PTE Ltd'],
    VN12: ['Olam Vietnam Food Process'],
    SG03: ['Olam Global Agri Pte. Ltd.'],
    GH00: ['Olam Ghana Limited'],
    PL10: ['Olam Polska Sp. z o.o.'],
    US26: ['Olam West Coast INC - SVI'],
    GH13: ['Olam Nutri Foods Ghana'],
    US17: ['Universal Blanchers LLC - Peanuts'],
    US19: ['Olam Farming INC - Almonds'],
  };

  vn12ExpenseTypes: string[] = [
    'Service-Local',
    'PM-Import',
    'Stationary',
    'Spare Part Overseas',
    'Car-Rental',
    'PM-Local',
    'RM Import-Overseas Ship',
    'RM Import-Third Party Ship',
    'Service-Overseas',
    'Spare Part Local',
    'Import Expense-Directly Service',
    'Import Expense-Onbehalf Service',
    'Import Expense-Other Service',
    'RM-Local',
    'DSE-Government',
    'DSE-Contract',
    'DSE-CD.No-BL.No',
  ];

  get availableEntityTypes(): string[] {
    if (!this.selectedCompanyCode) {
      return [];
    }
    return this.entityTypeMapping[this.selectedCompanyCode] || [];
  }

  get availableExpenseTypes(): string[] {
    if (this.selectedCompanyCode === 'VN12' && this.selectedEntityType) {
      return this.vn12ExpenseTypes;
    }
    return [];
  }

  get showNoRulesState(): boolean {
    return !!(
      this.selectedCompanyCode &&
      this.selectedEntityType &&
      this.selectedCompanyCode !== 'VN12'
    );
  }

  onCompanyCodeChange(): void {
    this.selectedEntityType = '';
    this.selectedExpenseType = '';
  }

  onEntityTypeChange(): void {
    this.selectedExpenseType = '';
  }

  ngOnInit(): void {
    this.initTheme();
  }

  private initTheme(): void {
    try {
      const saved = JSON.parse(localStorage.getItem('mfe1-theme-configuration') ?? 'null');
      if (saved && saved.primary) {
        const root = document.documentElement;
        const hex = saved.primary.replace('#', '');
        const red = Number.parseInt(hex.slice(0, 2), 16);
        const green = Number.parseInt(hex.slice(2, 4), 16);
        const blue = Number.parseInt(hex.slice(4, 6), 16);
        const rgb = `${red}, ${green}, ${blue}`;

        root.style.setProperty('--vuexy-primary', saved.primary);
        root.style.setProperty('--vuexy-primary-soft', saved.primarySoft || '#eeedff');
        root.style.setProperty('--bs-primary', saved.primary);
        root.style.setProperty('--bs-primary-rgb', rgb);
        root.style.setProperty('--bs-link-color', saved.primary);
        root.style.setProperty('--bs-link-hover-color', saved.primary);
        if (saved.bodyBackground) root.style.setProperty('--vuexy-body-bg', saved.bodyBackground);
        if (saved.paper) root.style.setProperty('--vuexy-paper', saved.paper);
        if (saved.heading) root.style.setProperty('--vuexy-heading', saved.heading);
        if (saved.body) root.style.setProperty('--vuexy-body', saved.body);
        if (saved.muted) root.style.setProperty('--vuexy-muted', saved.muted);
        if (saved.border) root.style.setProperty('--vuexy-border', saved.border);
      }
    } catch {
      // fallback
    }
  }
}
