import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ThemeConfiguration {
  name: string;
  primary: string;
  primarySoft: string;
  bodyBackground: string;
  paper: string;
  heading: string;
  body: string;
  muted: string;
  border: string;
}

type ThemeColorKey = Exclude<keyof ThemeConfiguration, 'name'>;

const DEFAULT_THEME: ThemeConfiguration = {
  name: 'Vuexy Purple',
  primary: '#7367f0',
  primarySoft: '#eeedff',
  bodyBackground: '#f8f7fa',
  paper: '#ffffff',
  heading: '#2f2b3d',
  body: '#6d6b77',
  muted: '#a5a3ae',
  border: '#e6e6e8',
};

const STORAGE_KEY = 'mfe1-theme-configuration';

const PRESET_THEMES: ThemeConfiguration[] = [
  DEFAULT_THEME,
  {
    name: 'Ocean Blue',
    primary: '#1683d8',
    primarySoft: '#e4f3ff',
    bodyBackground: '#f5f9fc',
    paper: '#ffffff',
    heading: '#1d2939',
    body: '#52606d',
    muted: '#8b98a7',
    border: '#dce6ef',
  },
  {
    name: 'Emerald Green',
    primary: '#16a36a',
    primarySoft: '#e3f8ef',
    bodyBackground: '#f5faf7',
    paper: '#ffffff',
    heading: '#20332b',
    body: '#536b60',
    muted: '#8da097',
    border: '#dcebe3',
  },
  {
    name: 'Sunset Orange',
    primary: '#e76f2e',
    primarySoft: '#fff0e8',
    bodyBackground: '#fcf8f5',
    paper: '#ffffff',
    heading: '#382b26',
    body: '#725e55',
    muted: '#aa9690',
    border: '#eee1db',
  },
];

@Component({
  imports: [FormsModule],
  selector: 'app-theme',
  styleUrl: './theme.scss',
  templateUrl: './theme.html',
})
export class Theme implements OnInit {
  readonly presetThemes = PRESET_THEMES;
  readonly colorFields: ReadonlyArray<{ key: ThemeColorKey; label: string }> = [
    { key: 'primary', label: 'Primary color' },
    { key: 'primarySoft', label: 'Primary soft color' },
    { key: 'bodyBackground', label: 'Page background' },
    { key: 'paper', label: 'Card background' },
    { key: 'heading', label: 'Heading text' },
    { key: 'body', label: 'Body text' },
    { key: 'muted', label: 'Muted text' },
    { key: 'border', label: 'Border' },
  ];
  theme: ThemeConfiguration = { ...DEFAULT_THEME };
  appliedThemeName = DEFAULT_THEME.name;

  ngOnInit(): void {
    const savedTheme = this.readSavedTheme();
    this.theme = savedTheme ?? { ...DEFAULT_THEME };
    this.appliedThemeName = this.theme.name;
    this.applyThemeVariables(this.theme);
  }

  selectPreset(preset: ThemeConfiguration): void {
    this.theme = { ...preset };
  }

  applyTheme(): void {
    this.theme = { ...this.theme, name: this.theme.name.trim() || 'Custom Theme' };
    this.applyThemeVariables(this.theme);
    this.appliedThemeName = this.theme.name;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.theme));
  }

  resetTheme(): void {
    this.theme = { ...DEFAULT_THEME };
    this.applyTheme();
  }

  private applyThemeVariables(theme: ThemeConfiguration): void {
    const root = document.documentElement;
    const primaryRgb = this.hexToRgb(theme.primary);

    root.style.setProperty('--vuexy-primary', theme.primary);
    root.style.setProperty('--vuexy-primary-soft', theme.primarySoft);
    root.style.setProperty('--bs-primary', theme.primary);
    root.style.setProperty('--bs-primary-rgb', primaryRgb);
    root.style.setProperty('--bs-link-color', theme.primary);
    root.style.setProperty('--bs-link-hover-color', theme.primary);
    root.style.setProperty('--vuexy-body-bg', theme.bodyBackground);
    root.style.setProperty('--vuexy-paper', theme.paper);
    root.style.setProperty('--vuexy-heading', theme.heading);
    root.style.setProperty('--vuexy-body', theme.body);
    root.style.setProperty('--vuexy-muted', theme.muted);
    root.style.setProperty('--vuexy-border', theme.border);
  }

  private hexToRgb(hex: string): string {
    const value = hex.replace('#', '');
    const red = Number.parseInt(value.slice(0, 2), 16);
    const green = Number.parseInt(value.slice(2, 4), 16);
    const blue = Number.parseInt(value.slice(4, 6), 16);

    return `${red}, ${green}, ${blue}`;
  }

  private readSavedTheme(): ThemeConfiguration | null {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<ThemeConfiguration> | null;

      if (!saved || !this.hasValidColors(saved)) {
        return null;
      }

      return {
        name: saved.name?.trim() || 'Custom Theme',
        primary: saved.primary!,
        primarySoft: saved.primarySoft!,
        bodyBackground: saved.bodyBackground!,
        paper: saved.paper!,
        heading: saved.heading!,
        body: saved.body!,
        muted: saved.muted!,
        border: saved.border!,
      };
    } catch {
      return null;
    }
  }

  private hasValidColors(theme: Partial<ThemeConfiguration>): boolean {
    const colors = [
      theme.primary,
      theme.primarySoft,
      theme.bodyBackground,
      theme.paper,
      theme.heading,
      theme.body,
      theme.muted,
      theme.border,
    ];

    return colors.every((color) => typeof color === 'string' && /^#[\da-f]{6}$/i.test(color));
  }
}
