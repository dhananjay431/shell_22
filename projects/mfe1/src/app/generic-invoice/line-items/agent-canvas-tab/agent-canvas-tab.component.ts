import { Component } from '@angular/core';

@Component({
  selector: 'app-agent-canvas-tab',

  templateUrl: './agent-canvas-tab.component.html',
  styleUrls: ['./agent-canvas-tab.component.scss'],
})
export class AgentCanvasTabComponent {
  toggleSection(bodyId: string, iconId: string): void {
    const body = document.getElementById(bodyId);
    const icon = document.getElementById(iconId);
    if (!body || !icon) return;

    const isExpanded = body.style.display !== 'none';
    body.style.display = isExpanded ? 'none' : 'block';
    icon.textContent = isExpanded ? 'expand_more' : 'expand_less';
  }

  toggleAgent(agentId: string): void {
    const body = document.getElementById(agentId);
    const icon = document.getElementById(`ic-${agentId}`);
    if (!body || !icon) return;

    const isExpanded = body.style.display !== 'none';
    body.style.display = isExpanded ? 'none' : 'block';
    icon.textContent = isExpanded ? 'expand_more' : 'expand_less';
  }
}
