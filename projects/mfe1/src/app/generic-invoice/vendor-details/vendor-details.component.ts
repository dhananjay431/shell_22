import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { InvoiceProcessNewDataService } from '../invoice-process-new-data.service';
import * as pdfjsLib from 'pdfjs-dist';

declare var _: any;
type CoordinateUnit = 'inch' | 'pixel';
interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}
interface Source extends Bounds {
  page: number;
  confidence: number;
  label: string;
  value: string;
  group: string;
  unit: CoordinateUnit;
  path: string;
}
interface ProjectedBox {
  left: number;
  top: number;
  width: number;
  height: number;
}
interface ConfidenceStyle {
  border: string;
  background: string;
}

interface FieldPopup {
  title: string;
  value: string;
  confidence: number;
  level: 'high' | 'medium' | 'low';
  path: string;
}

interface AgentBadge {
  key: string;
  label: string;
  themeClass: string;
  icon: string;
  color: string;
  background: string;
  border: string;
  scoreLabel: string;
  score: string;
  timeLabel: string;
  fieldCount: number;
  pageCount: number;
}

@Component({
  selector: 'app-vendor-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendor-details.component.html',
  styleUrls: ['./vendor-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class VendorDetailsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasWrap') private canvasWrap?: ElementRef<HTMLElement>;
  cachedPdfDoc: any;
  zoomLevel = 100;
  editFields = false;

  showLabels = true;
  isCanvasExpanded = true;
  status = 'Loading invoice document...';
  fieldPopup: FieldPopup | null = null;
  agentBadges: AgentBadge[] = [];
  private viewReady = false;
  private renderToken = 0;
  private sourcesByPage: Record<number, any[]> = {};
  private resizeObserver?: ResizeObserver;
  private readonly stopEffect = effect(() => {
    const data = this.ss.data();
    if (this.viewReady && data) void this.loadData(data);
  });
  private readonly selectionEffect = effect(() => {
    this.ss.selectedAgentSignal();
    if (this.viewReady && this.cachedPdfDoc) void this.renderPdf();
  });

  constructor(public readonly ss: InvoiceProcessNewDataService) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `/build/pdf.worker.min.mjs`;

    (window as any).app = this;
  }
  ngAfterViewInit(): void {
    this.viewReady = true;
    if (this.canvasWrap) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.cachedPdfDoc) void this.renderPdf();
      });
      this.resizeObserver.observe(this.canvasWrap.nativeElement);
    }
    const data = this.ss.getData();
    if (data) void this.loadData(data);
  }
  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.stopEffect.destroy();
    this.selectionEffect.destroy();
  }
  zoomIn(): void {
    this.zoomLevel = Math.min(200, this.zoomLevel + 10);
    void this.renderPdf();
  }
  zoomOut(): void {
    this.zoomLevel = Math.max(50, this.zoomLevel - 10);
    void this.renderPdf();
  }
  toggleCanvas(): void {
    this.isCanvasExpanded = !this.isCanvasExpanded;
  }

  toggleLabels(): void {
    this.showLabels = !this.showLabels;
    this.canvasWrap?.nativeElement.classList.toggle('hide-labels', !this.showLabels);
  }

  toggleEditFields(): void {
    this.editFields = !this.editFields;
  }

  closeFieldPopup(): void {
    this.fieldPopup = null;
  }

  confirmFieldValue(): void {
    // The textarea is two-way bound via [(ngModel)] to popup.value, so any
    // edits typed while Edit Fields is enabled are already reflected on the
    // field before we confirm and dismiss the popup.
    const popup = this.fieldPopup;
    const data = this.ss.getData();
    if (popup && data) {
      const updated = this.applyFieldUpdate(data, popup.path, popup.value);
      if (updated) {
        this.ss.setData(updated);
      }
    }
    this.closeFieldPopup();
  }

  private applyFieldUpdate(data: any, path: string, value: string): any | null {
    const rawJson = _.get(data, 'a1[0]');
    const wasString = _.isString(rawJson);
    const json = wasString ? JSON.parse(rawJson) : rawJson;
    if (!_.isObject(json)) return null;
    // Preserve the original format: if a1[0] was a JSON string, serialize the
    // edited JSON back to a string; otherwise keep it as an object.
    const next = _.cloneDeep(data);
    _.set(json, `${path}.value`, value);
    _.set(next, 'a1[0]', wasString ? JSON.stringify(json) : json);
    return next;
  }

  private showFieldPopup(source: any): void {
    const confidence = Math.round(source.confidence * 100);
    this.fieldPopup = {
      title: source.label.split('.').pop() || source.label,
      value: String(source.value ?? ''),
      confidence,
      level: confidence >= 95 ? 'high' : confidence >= 80 ? 'medium' : 'low',
      path: source.path || source.label,
    };
  }

  private async loadData(data: any): Promise<void> {
    try {
      const payload = this.parsePayload(data);
      if (!payload.pdfBase64) {
        this.status = 'No invoice PDF available.';
        return;
      }
      this.agentBadges = this.buildAgentBadges(payload.json);
      this.sourcesByPage = this.groupByPage(this.collectSources(payload.json));
      this.cachedPdfDoc = await this.loadPdf(payload.pdfBase64);
      await this.renderPdf();
    } catch (error) {
      console.error('Unable to render invoice PDF', error);
      this.status = 'Unable to render invoice document.';
    }
  }

  private parsePayload(data: any): { json: any; pdfBase64: string } {
    const jsonData = _.get(data, 'a1[0]');
    const pdfBase64 = _.get(data, 'a1[1]');
    return {
      json: _.isString(jsonData) ? JSON.parse(jsonData) : jsonData,
      pdfBase64: String(pdfBase64 || '').replace(/^data:application\/pdf;base64,/i, ''),
    };
  }

  private async loadPdf(base64: string): Promise<any> {
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return pdfjsLib.getDocument({ data: bytes }).promise;
  }

  private async renderPdf(): Promise<void> {
    if (!this.cachedPdfDoc || !this.canvasWrap) return;
    const token = ++this.renderToken;
    const container = this.canvasWrap.nativeElement;
    container.replaceChildren();
    const pages = document.createElement('div');
    pages.className = 'pdf-pages';
    container.appendChild(pages);
    try {
      for (const pageNumber of _.range(1, this.cachedPdfDoc.numPages + 1)) {
        if (token !== this.renderToken) return;
        await this.renderPage(pages, pageNumber);
      }
      this.status = '';
    } catch (error) {
      console.error('PDF page rendering failed', error);
      this.status = 'Unable to render invoice document.';
    }
  }

  private async renderPage(pages: HTMLElement, pageNumber: number): Promise<void> {
    const page = await this.cachedPdfDoc.getPage(pageNumber);
    const baseScale = 1.25;
    const baseViewport = page.getViewport({ scale: baseScale });
    const availableWidth = Math.max(0, pages.clientWidth - 24);
    const responsiveScale =
      baseScale *
      Math.min(this.zoomLevel / 100, availableWidth > 0 ? availableWidth / baseViewport.width : 1);
    const viewport = page.getViewport({ scale: responsiveScale });
    const wrapper = document.createElement('div');
    wrapper.className = 'pdf-page';
    Object.assign(wrapper.style, {
      position: 'relative',
      display: 'block',
      width: `${viewport.width}px`,
      height: `${viewport.height}px`,
    });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    Object.assign(canvas.style, {
      display: 'block',
      width: `${viewport.width}px`,
      height: `${viewport.height}px`,
    });
    wrapper.appendChild(canvas);
    const overlay = document.createElement('div');
    overlay.className = 'pdf-bounding-box-overlay';
    Object.assign(overlay.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      width: `${viewport.width}px`,
      height: `${viewport.height}px`,
      pointerEvents: 'none',
    });
    wrapper.appendChild(overlay);
    pages.appendChild(wrapper);
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    this.renderBoxes(overlay, pageNumber, viewport);
  }

  private renderBoxes(overlay: HTMLElement, page: number, viewport: any): void {
    const sources = this.getVisibleSources(page);
    const previousCount = _.sumBy(
      _.filter(_.keys(this.sourcesByPage), (key: string) => Number(key) < page),
      (key: string) => this.getVisibleSources(Number(key)).length,
    );
    _.forEach(sources, (source: any, index: number) =>
      overlay.appendChild(
        this.createBoundingBox(
          source,
          this.projectSource(source, viewport),
          this.getConfidenceStyle(source.confidence),
          previousCount + index + 1,
        ),
      ),
    );
  }

  private projectSource(source: any, viewport: any): ProjectedBox {
    const scaleX =
      source.unit === 'inch'
        ? viewport.scale * 72
        : viewport.width / this.getSourcePageWidth(source);
    const scaleY =
      source.unit === 'inch'
        ? viewport.scale * 72
        : viewport.height / this.getSourcePageHeight(source);
    return {
      left: source.minX * scaleX,
      top: source.minY * scaleY,
      width: (source.maxX - source.minX) * scaleX,
      height: (source.maxY - source.minY) * scaleY,
    };
  }

  private createBoundingBox(
    source: any,
    projected: ProjectedBox,
    style: ConfidenceStyle,
    index: number,
  ): HTMLElement {
    const box = document.createElement('div');
    box.className = 'pdf-bounding-box';
    Object.assign(box.style, {
      left: `${projected.left}px`,
      top: `${projected.top}px`,
      width: `${projected.width}px`,
      height: `${projected.height}px`,
      borderColor: style.border,
      background: style.background,
    });
    box.title = `${source.label}: ${source.value} (${Math.round(source.confidence * 100)}%)`;
    box.addEventListener('click', (event) => {
      event.stopPropagation();
      this.showFieldPopup(source);
    });
    const label = document.createElement('span');
    label.className = 'pdf-box-label';
    label.textContent = String(index);
    label.style.background = style.border;
    box.appendChild(label);
    return box;
  }

  private getConfidenceStyle(confidence: number): ConfidenceStyle {
    if (confidence >= 0.9)
      return {
        border: 'rgba(0, 180, 0, 0.9)',
        background: 'rgba(0, 255, 0, 0.2)',
      };
    if (confidence >= 0.7)
      return {
        border: 'rgba(0, 100, 255, 0.8)',
        background: 'rgba(0, 150, 255, 0.2)',
      };
    return {
      border: 'rgba(255, 0, 0, 0.8)',
      background: 'rgba(255, 255, 0, 0.25)',
    };
  }

  private collectSources(data: any, path = ''): any[] {
    if (!_.isObject(data)) return [];
    if (_.isArray(data))
      return _.flatMap(data, (item: any, index: number) =>
        this.collectSources(item, `${path}[${index}]`),
      );
    const source = this.createSource(data, path);
    if (source) return [source];
    return _.flatMap(_.entries(data), ([key, value]: [string, any]) =>
      this.collectSources(value, path ? `${path}.${key}` : key),
    );
  }

  private createSource(data: any, path: string): any | null {
    console.log;
    if (!data.bounding_box || !_.isNumber(data.page)) return null;
    const bounds = this.toBounds(data.bounding_box);
    if (!bounds) return null;
    return {
      ...bounds,
      page: data.page,
      confidence: this.normalizeConfidence(data.confidence),
      label: path || 'Field',
      value: String(data.value ?? ''),
      group: (path || 'Field').split('.')[0],
      path: path || 'Field',
      unit: this.detectUnit(bounds),
    };
  }

  private toBounds(boundingBox: any): Bounds | null {
    const xs = _.isArray(boundingBox)
      ? _.map([0, 2, 4, 6], (index: number) => Number(boundingBox[index]))
      : [Number(boundingBox.left), Number(boundingBox.right)];
    const ys = _.isArray(boundingBox)
      ? _.map([1, 3, 5, 7], (index: number) => Number(boundingBox[index]))
      : [Number(boundingBox.top), Number(boundingBox.bottom)];
    if (!_.every([...xs, ...ys], Number.isFinite)) return null;
    const bounds = {
      minX: _.min(xs)!,
      minY: _.min(ys)!,
      maxX: _.max(xs)!,
      maxY: _.max(ys)!,
    };
    return bounds.maxX > bounds.minX && bounds.maxY > bounds.minY ? bounds : null;
  }

  private normalizeConfidence(value: unknown): number {
    const confidence = Number(value);
    return Number.isFinite(confidence) ? (confidence > 1 ? confidence / 100 : confidence) : 0;
  }
  private detectUnit(bounds: Bounds): CoordinateUnit {
    return _.max([bounds.minX, bounds.minY, bounds.maxX, bounds.maxY])! <= 20 ? 'inch' : 'pixel';
  }
  private groupByPage(sources: any[]): Record<number, any[]> {
    const unique = new Map<string, any>();
    sources.forEach((source: Source) => {
      const key = [source.page, source.minX, source.minY, source.maxX, source.maxY].join('|');
      if (!unique.has(key)) unique.set(key, source);
    });
    return _.groupBy([...unique.values()], (source: any) => source.page);
  }

  private buildAgentBadges(data: any): AgentBadge[] {
    const definitions = [
      [
        'VendorInformation',
        'Vendor Information Agent',
        'ab-accent',
        'store',
        'var(--accent)',
        'var(--accent-glow)',
        'var(--accent)',
      ],
      [
        'InvoiceParticulars',
        'Invoice Particulars Match',
        'ab-teal',
        'receipt_long',
        'var(--teal)',
        'var(--teal-dim)',
        'var(--teal)',
      ],
      [
        'BillingDetails',
        'Billing Details Extraction',
        'ab-purple',
        'receipt',
        'var(--purple)',
        'var(--purple-dim)',
        'var(--purple)',
      ],
      [
        'BeneficiaryBankingInformation',
        'Beneficiary Banking Verification',
        'ab-amber',
        'account_balance',
        'var(--amber)',
        'var(--amber-dim)',
        'var(--amber)',
      ],
      [
        'TaxDetails',
        'Tax Details Agent',
        'ab-accent',
        'percent',
        'var(--accent)',
        'var(--accent-glow)',
        'var(--accent)',
      ],
      [
        'LineItems',
        'Line Items Match',
        'ab-teal',
        'format_list_bulleted',
        'var(--teal)',
        'var(--teal-dim)',
        'var(--teal)',
      ],
    ] as const;

    return definitions.map(([key, label, themeClass, icon, color, background, border]) => {
      const sources = this.collectSources(data?.[key], key);
      const confidences = sources
        .map((source: Source) => source.confidence)
        .filter((confidence: number) => confidence > 0);
      const confidence = confidences.length
        ? Math.round(
            (confidences.reduce((sum, value) => sum + value, 0) / confidences.length) * 100,
          )
        : null;
      const pages = new Set(sources.map((source: Source) => source.page));
      const timing = Number(data?._timings?.total_sec);

      return {
        key,
        label,
        themeClass,
        icon,
        color,
        background,
        border,
        scoreLabel: confidence === null ? 'Confidence' : 'Confidence',
        score: confidence === null ? '—' : `${confidence}%`,
        timeLabel:
          timing > 0
            ? `${sources.length} field${sources.length === 1 ? '' : 's'} · ${pages.size} page${pages.size === 1 ? '' : 's'} · ${timing.toFixed(2)}s`
            : `${sources.length} field${sources.length === 1 ? '' : 's'} · ${pages.size} page${pages.size === 1 ? '' : 's'}`,
        fieldCount: sources.length,
        pageCount: pages.size,
      };
    });
  }
  private getVisibleSources(page: number): any[] {
    const sources = _.get(this.sourcesByPage, page, []);
    const selectedAgent = this.ss.selectedAgentSignal();
    return selectedAgent
      ? sources.filter((source: Source) => source.group === selectedAgent)
      : sources;
  }
  private getSourcePageWidth(source: any): number {
    const pageSources = _.get(this.sourcesByPage, source.page, []);
    return Math.max(source.maxX, ..._.map(pageSources, 'maxX'), 1);
  }
  private getSourcePageHeight(source: any): number {
    const pageSources = _.get(this.sourcesByPage, source.page, []);
    return Math.max(source.maxY, ..._.map(pageSources, 'maxY'), 1);
  }
  highlightCanvasSection(key: any) {
    const group = String(key);
    this.ss.selectAgent(this.ss.selectedAgentSignal() === group ? null : group);
  }
}
