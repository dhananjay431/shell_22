import { Component } from '@angular/core';
import { InvoiceProcessNewDataService } from '../invoice-process-new-data.service';
import { LineItemsComponent } from './line-items/line-items.component';
import { MultiPoGridComponent } from './multi-po-grid/multi-po-grid.component';
import { AuditTrailComponent } from './audit-trail/audit-trail.component';
import { AgentReasoningComponent } from './agent-reasoning/agent-reasoning.component';
import { AttachmentsComponent } from './attachments/attachments.component';

const TAB_CONTENT_IDS = ['tc-match', 'tc-multipo', 'tc-audit', 'tc-reason', 'tc-attach'];

@Component({
  selector: 'app-invoice-summary',
  standalone: true,

  imports: [
    LineItemsComponent,
    MultiPoGridComponent,
    AuditTrailComponent,
    AgentReasoningComponent,
    AttachmentsComponent,
  ],
  templateUrl: './invoice-summary.component.html',
  styleUrls: ['./invoice-summary.component.scss'],
})
export class InvoiceSummaryComponent {
  constructor(private ss: InvoiceProcessNewDataService) {}
  ngOnInit() {
    console.log('InvoiceSummaryComponent initialized', this.ss.getData());
  }
  setTab(el: EventTarget | null, id: string): void {
    document
      .querySelectorAll<HTMLElement>('.ws-tab')
      .forEach((tab) => tab.classList.remove('active'));

    if (el instanceof HTMLElement) {
      el.classList.add('active');
    }

    TAB_CONTENT_IDS.forEach((tabId) => {
      const content = document.getElementById(tabId);

      if (content) {
        content.style.display = tabId === id ? 'block' : 'none';
      }
    });
  }
}
