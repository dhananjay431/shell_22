import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceProcessNewDataService } from '../invoice-process-new-data.service';
import { AgentCanvasTabComponent } from './agent-canvas-tab/agent-canvas-tab.component';
import { FieldEditTabComponent } from './field-edit-tab/field-edit-tab.component';

@Component({
  selector: 'app-line-items',

  imports: [CommonModule, AgentCanvasTabComponent, FieldEditTabComponent],
  templateUrl: './line-items.component.html',
  styleUrls: ['./line-items.component.scss'],
})
export class LineItemsComponent {
  activeAgentTab: 'agent-canvas-tab' | 'field-edit-tab' = 'agent-canvas-tab';

  constructor(private ss: InvoiceProcessNewDataService) {}

  switchAgentTab(tabId: 'agent-canvas-tab' | 'field-edit-tab'): void {
    this.activeAgentTab = tabId;
  }

  ngOnInit() {
    console.log('LineItemsComponent initialized', this.ss.getData());
  }
}
