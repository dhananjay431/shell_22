import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, TemplateRef, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { filter, forkJoin, map } from 'rxjs';
import { DataTableDirective, DataTablesModule } from 'angular-datatables';

import { CommonService } from '../../../../shared/common.service';
declare var _: any;
@Component({
  imports: [DataTablesModule, FormsModule],
  // imports: [AsyncPipe, DatePipe, DataTablesModule],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  @ViewChild('taskActions', { static: true })
  private taskActionsTemplate?: TemplateRef<unknown>;

  @ViewChild('taskFilters', { static: true })
  private taskFiltersTemplate?: TemplateRef<unknown>;

  @ViewChild(DataTableDirective, { static: false })
  private dataTableDirective?: DataTableDirective;

  private readonly dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  private readonly router = inject(Router);
  private readonly cs = inject(CommonService);
  private targetId = history.state?.props?.ID ?? '';

  dtOptions: any;
  readonly taskIdentifierOptions = [
    { nameToDisplay: 'Work Item Number', taskIdentifierName: 'TaskIdentifier.WORK_ITEM_NUMBER' },
    { nameToDisplay: 'Work Item Status', taskIdentifierName: 'TaskIdentifier.WORK_ITEM_STATUS' },
    { nameToDisplay: 'Invoice Number', taskIdentifierName: 'TaskIdentifier.INVOICE_NUMBER' },
    { nameToDisplay: 'PO Number', taskIdentifierName: 'TaskIdentifier.PO_NUMBER' },
    { nameToDisplay: 'Initiator', taskIdentifierName: 'TaskIdentifier.INITIATOR' },
    { nameToDisplay: 'Queue', taskIdentifierName: 'TaskIdentifier.QUEUE' },
  ];
  selectedTaskIdentifier = '';
  readonly summaryCards = signal<any[]>([
    {
      key: 'total',
      label: 'Total',
      icon: 'fa-file-lines',
      chartId: 'c-bar-total',
      value: 0,
      percentage: '100%',
    },
    {
      key: 'assigned',
      label: 'Assigned',
      icon: 'fa-user-check',
      chartId: 'c-bar-assigned',
      value: 0,
      percentage: '0%',
    },
    {
      key: 'unassigned',
      label: 'Unassigned',
      icon: 'fa-user-clock',
      chartId: 'c-bar-unassigned',
      value: 0,
      percentage: '0%',
    },
    {
      key: 'sla',
      label: 'SLA Breach',
      icon: 'fa-triangle-exclamation',
      chartId: 'c-bar-sla',
      value: 0,
      percentage: '0%',
    },
  ]);
  taskFilterText = '';
  private appliedTaskIdentifier = '';
  private appliedTaskFilterText = '';
  private readonly selectedTaskIds = new Set<string>();

  private runTaskAction(action: string): void {
    const taskIds = [...this.selectedTaskIds];
    console.info(`${action} requested`, { taskIds });
  }

  claimTask(): void {
    this.runTaskAction('Claim Task');
  }

  revokeClaim(): void {
    this.runTaskAction('Revoke Claim');
  }

  delegate(): void {
    this.runTaskAction('Delegate');
  }

  forward(): void {
    this.runTaskAction('Forward');
  }

  assignTask(): void {
    this.runTaskAction('Assign Task');
  }

  autoDelegate(): void {
    this.runTaskAction('Auto Delegate');
  }

  exportTasks(): void {
    this.runTaskAction('Export');
  }

  bulkApproval(): void {
    this.runTaskAction('Bulk Approval');
  }

  private getTaskId(row: any, rowIndex: number): string {
    return String(
      row?.ID ?? row?.TaskId ?? row?.TaskID ?? row?.TaskInstanceID ?? `row-${rowIndex}`,
    );
  }

  private escapeAttribute(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private selectionColumn() {
    return {
      title: '<input class="select-all-checkbox" type="checkbox" aria-label="Select all tasks">',
      data: null,
      orderable: false,
      searchable: false,
      className: 'text-nowrap p-1 task-selection-cell',
      render: (_data: any, _type: any, row: any, meta: any) => {
        const id = this.getTaskId(row, meta.row);
        const checked = this.selectedTaskIds.has(id) ? ' checked' : '';

        return `<input class="task-checkbox" type="checkbox" data-task-id="${this.escapeAttribute(id)}" aria-label="Select task"${checked}>`;
      },
    };
  }

  private updateHeaderCheckbox(table: Element): void {
    const header = table.querySelector<HTMLInputElement>('.select-all-checkbox');
    const rows = Array.from(table.querySelectorAll<HTMLInputElement>('.task-checkbox'));
    const selected = rows.filter((checkbox) => checkbox.checked).length;

    if (header) {
      header.checked = rows.length > 0 && selected === rows.length;
      header.indeterminate = selected > 0 && selected < rows.length;
    }
  }

  private bindSelectionCheckboxes(): void {
    const table = document.querySelector('.table-wrapper table');

    if (!table) {
      return;
    }

    table.querySelectorAll<HTMLInputElement>('.task-checkbox').forEach((checkbox) => {
      checkbox.onchange = () => {
        const id = checkbox.dataset['taskId'];

        if (id) {
          checkbox.checked ? this.selectedTaskIds.add(id) : this.selectedTaskIds.delete(id);
          this.updateHeaderCheckbox(table);
        }
      };
    });

    const header = table.querySelector<HTMLInputElement>('.select-all-checkbox');
    if (header) {
      header.onchange = () => {
        table.querySelectorAll<HTMLInputElement>('.task-checkbox').forEach((checkbox) => {
          checkbox.checked = header.checked;
          const id = checkbox.dataset['taskId'];

          if (id) {
            header.checked ? this.selectedTaskIds.add(id) : this.selectedTaskIds.delete(id);
          }
        });
        this.updateHeaderCheckbox(table);
      };
      this.updateHeaderCheckbox(table);
    }
  }

  private placeTaskActions(): void {
    const layoutEnd = document.querySelector('.table-wrapper .dt-layout-end');
    const template = this.taskActionsTemplate;

    if (!layoutEnd || !template || layoutEnd.querySelector('.task-actions')) {
      return;
    }

    const view = template.createEmbeddedView(null);
    view.detectChanges();
    view.rootNodes.forEach((node) => layoutEnd.appendChild(node));
  }

  private placeTaskFilters(): void {
    const layoutStart = document.querySelector('.table-wrapper .task-filter-slot');
    const template = this.taskFiltersTemplate;

    if (!layoutStart || !template || layoutStart.querySelector('.task-filters')) {
      return;
    }

    const view = template.createEmbeddedView(null);
    view.detectChanges();
    view.rootNodes.forEach((node) => layoutStart.appendChild(node));
  }

  searchTasks(): void {
    this.appliedTaskIdentifier = this.selectedTaskIdentifier;
    this.appliedTaskFilterText = this.taskFilterText.trim();
    console.log(this.appliedTaskIdentifier, this.appliedTaskFilterText);
    // void this.reloadDataTable();
  }

  resetTaskSearch(): void {
    this.selectedTaskIdentifier = '';
    this.taskFilterText = '';
    this.appliedTaskIdentifier = '';
    this.appliedTaskFilterText = '';
    void this.reloadDataTable();
  }

  private formatDate(value: unknown): string {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(String(value));

    return Number.isNaN(date.getTime()) ? '' : this.dateFormatter.format(date);
  }

  private formatBadge(value: unknown, modifier: string): string {
    const label = String(value ?? '').trim();

    return label
      ? `<span class="availability-badge availability-badge--${modifier}">${label}</span>`
      : '';
  }

  ngOnInit() {
    // this.cs.getalltargets_TaskCountRequired.subscribe((resp: any) => {
    //   console.log('getalltargets_TaskCountRequired=>', resp);
    // });
    this.cs.inbox_config_json.subscribe((r: any) => {
      console.log('r=>', r);
    });

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        const nextTargetId = history.state?.props?.ID ?? '';

        if (nextTargetId === this.targetId) {
          return;
        }

        this.targetId = nextTargetId;
        void this.reloadDataTable();
      });

    this.dtOptions = {
      searching: false,
      pagingType: 'full_numbers',
      serverSide: true,
      pageLength: 15,
      lengthMenu: [15, 20, 25, 30],
      layout: {
        topStart: { div: { className: 'task-filter-slot' } },
        // topEnd: null,
        bottomStart: ['pageLength', 'info'],
        bottomEnd: 'paging',
      },
      rowCallback: (row: Node) => {
        const workItemNumber = (row as HTMLElement).querySelector<HTMLElement>('.work-item-number');

        if (workItemNumber) {
          workItemNumber.onclick = () => {
            void this.router.navigate([
              '/payx/generic-invoice/' + workItemNumber.dataset['workItemNumber'],
            ]);
          };
        }

        return row;
      },
      drawCallback: () => {
        this.bindSelectionCheckboxes();
        this.placeTaskActions();
        this.placeTaskFilters();
      },
      ajax: (dataTablesParameters: any, callback: any) => {
        const query = this.createQuery(this.targetId, dataTablesParameters);
        function generateRandomArray(min: any, max: any, length = 10) {
          return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
        }
        forkJoin({
          data: this.cs.ajax(
            'GetHumanTasks.NOTF_TASK_INSTANCE',
            'http://schemas.cordys.com/notification/workflow/1.0',
            query,
          ),
          count: this.cs
            .ajax('GetHumanTasks', 'http://schemas.cordys.com/notification/workflow/1.0', {
              '@countOnly': 'true',
              Query: query.Query,
            })
            .pipe(map((response: any) => Number(response.Count ?? 0))),
          taskcount: this.cs.getalltargets_TaskCountRequired().pipe(
            map((dt1: any) => {
              // console.log('dt1=>', dt1, history.state.props.ID);
              return _.find(dt1, (d: any) => d.Id == history.state.props.ID);
            }),
          ),
        })
          .pipe(
            map((d: any) => {
              console.log('forkJoin response=>', d);
              const states = _.get(d, 'taskcount.TaskStates.State', []);
              const currentDate = new Date();

              const overdueTasks = _.filter(_.get(d, 'data', []), (task: any) => {
                const overdueDate = _.find(
                  _.get(task, 'BusinessAttributes.Attribute', []),
                  (attribute: any) => _.get(attribute, '@name') === 'SLA_OverDue',
                )?.text;

                return overdueDate ? currentDate > new Date(`${overdueDate}Z`) : false;
              });

              d.taskcount = {
                total: Number(_.get(d, 'count', 0)),
                assigned: Number(
                  _.find(states, (state: any) => state.Name === 'ASSIGNED')?.Count ?? 0,
                ),
                unassigned: Number(
                  _.find(states, (state: any) => state.Name === 'CREATED')?.Count ?? 0,
                ),
                sla: Number(overdueTasks.length),
              };

              return d;
            }),
          )
          .subscribe({
            next: (response: any) => {
              console.log('response=>', response);

              /* 
taskcount : 
assigned : 148
sla : 9
taskcount : 0
unassigned : 36
 */
              const total = response.taskcount.total;
              const colors: Record<string, string> = {
                total: '#1468e8',
                assigned: '#159957',
                unassigned: '#ff8308',
                sla: '#ed2424',
              };
              const updatedCards = this.summaryCards().map((card: any) => {
                card.value = response.taskcount[card.key];
                card.percentage =
                  card.key === 'total' || total === 0
                    ? card.key === 'total'
                      ? '100%'
                      : '0%'
                    : `${((card.value / total) * 100).toFixed(2)}%`;
                this.cs.render(
                  card.chartId,
                  this.cs.sparkline('bar', generateRandomArray(0, card.value, 50), {
                    colors: [colors[card.key]],
                    tooltip: false,
                    // height: 80,
                  }),
                );
                return card;
              });
              this.summaryCards.set(updatedCards);
              console.log('summaryCards=>', updatedCards);
              callback({
                recordsTotal: response.count,
                recordsFiltered: response.count,
                data: response.data,
              });
            },
            error: () => {
              callback({
                recordsTotal: 0,
                recordsFiltered: 0,
                data: [],
              });
            },
          });
      },
      columns: [
        this.selectionColumn(),
        {
          title: 'SLA',
          data: 'SLA',
          className: 'text-nowrap p-1',
          render: (data: any, type: any, row: any) => {
            return data || '';
          },
        },
        {
          title: 'Work Item Number',
          data: 'TaskData.ApplicationData.Invoice.WORK_ITEM_NUMBER',
          className: 'text-nowrap p-1',
          render: (data: any) => {
            const workItemNumber = String(data ?? '');
            const escapedWorkItemNumber = this.escapeAttribute(workItemNumber);

            return `
              <span
                class="availability-badge availability-badge--in-progress work-item-number"
                data-work-item-number="${escapedWorkItemNumber}"
                role="button"
                tabindex="0"
                aria-label="Open Work Item Number ${escapedWorkItemNumber}"
              >${escapedWorkItemNumber}</span>
            `;
          },
        },
        {
          title: 'Status',
          data: 'TaskData.ApplicationData.Invoice.WORK_ITEM_STATUS',
          className: 'text-nowrap p-1',
          render: (data: any, type: any, row: any) => {
            return data || '';
          },
        },
        {
          title: 'Invoice Number',
          data: 'TaskData.ApplicationData.Invoice.INVOICE_NUMBER',
          className: 'text-nowrap p-1',
          render: function (data: any, type: any, row: any) {
            return data || '';
          },
        },
        {
          title: 'Classifications',
          data: 'TaskData.ApplicationData.Invoice.CLASSIFICATIONS',
          className: 'text-nowrap p-1',
          render: (data: any) => {
            return this.formatBadge(data, 'classification');
          },
        },
        {
          title: 'PO Number',
          data: 'TaskData.ApplicationData.Invoice.PO_NUMBER',
          className: 'text-nowrap p-1',
          render: (data: any) => {
            return this.formatBadge(data, 'po-number');
          },
        },
        {
          title: 'Vendor Name',
          data: 'TaskData.ApplicationData.Invoice.VENDOR',
          className: 'text-nowrap p-1',
          render: function (data: any, type: any, row: any) {
            return data || '';
          },
        },
        {
          title: 'Company Code',
          data: 'TaskData.ApplicationData.Invoice.COMPANY_CODE',
          className: 'text-nowrap p-1',
          render: function (data: any, type: any, row: any) {
            return data || '';
          },
        },
        {
          title: 'Invoice Amount',
          data: 'TaskData.ApplicationData.Invoice.INVOICE_AMOUNT',
          className: 'text-nowrap p-1',
          render: function (data: any, type: any, row: any) {
            return data || '';
          },
        },
        {
          title: 'Currency',
          data: 'TaskData.ApplicationData.Invoice.CURRENCY',
          className: 'text-nowrap p-1',
          render: function (data: any, type: any, row: any) {
            return data || '';
          },
        },
        {
          title: 'ERP Due Date',
          data: 'TaskData.ApplicationData.Invoice.ERP_DUE_DATE',
          className: 'text-nowrap p-1',
          render: (data: any, type: any, row: any) => {
            return this.formatDate(data);
          },
        },
        {
          title: 'Due Date',
          data: 'TaskData.ApplicationData.Invoice.SLA_OverDue',
          className: 'text-nowrap p-1',
          render: (data: any, type: any, row: any) => {
            return this.formatDate(data);
          },
        },
        {
          title: 'Received Date',
          data: 'DeliveryDate',
          className: 'text-nowrap p-1',
          render: (data: any, type: any, row: any) => {
            return this.formatDate(data);
          },
        },
        {
          title: 'Assignee',
          data: 'Assignee.@displayName',
          className: 'text-nowrap p-1',
          render: function (data: any, type: any, row: any) {
            return data || '';
          },
        },
        {
          title: 'Delegated To',
          data: 'DelegatedToUser.@displayName',
          className: 'text-nowrap p-1',
          render: function (data: any, type: any, row: any) {
            return data || '';
          },
        },
        {
          title: 'Queue',
          data: 'TaskData.ApplicationData.Invoice.QUEUE',
          className: 'text-nowrap p-1',
          render: function (data: any, type: any, row: any) {
            return data || '';
          },
        },
        {
          title: 'Team',
          data: 'TaskData.ApplicationData.Invoice.TEAM',
          className: 'text-nowrap p-1',
          render: function (data: any, type: any, row: any) {
            return data || '';
          },
        },
        // {
        //   title: 'Completed By',
        //   data: 'CompletedByUser.@displayName',
        //   className: 'text-nowrap p-1',
        //   render: function (data: any, type: any, row: any) {
        //     return data || '';
        //   },
        // },
        // {
        //   title: 'Completed On',
        //   data: 'CompletionDate',
        //   className: 'text-nowrap p-1',
        //   render: function (data: any, type: any, row: any) {
        //     return data || '';
        //   },
        // },
        {
          title: 'Source',
          data: 'TaskData.ApplicationData.Invoice.SOURCE',
          className: 'text-nowrap p-1',
          render: function (data: any, type: any, row: any) {
            return data;
          },
        },
        {
          title: 'Initiator',
          data: 'TaskData.ApplicationData.Invoice.INITIATOR',
          className: 'text-nowrap p-1',
          render: (data: any) => {
            return this.formatBadge(data, 'initiator');
          },
        },
      ],
    };

    // this.cs.inbox_config_json.subscribe((r: any) => {

    // const columnsToDisplay = r.Inbox.InboxColumnsToDisplay;
    // const dataPopulateConfig = r.Inbox.InboxDataPopulateConfiguration;
    // const columns = columnsToDisplay
    //   .map((column: any) => {
    //     const config = dataPopulateConfig.find((item: any) => item.columnName === column.name);
    //     if (!config) {
    //       return null;
    //     }
    //     return {
    //       title: column.name,
    //       data: config.taskDataNode.join('.'),
    //       className: 'text-nowrap p-1',
    //       render: (data: unknown) =>
    //         column.type === 'date'
    //           ? this.formatDate(data)
    //           : column.name === 'Classifications'
    //             ? this.formatBadge(data, 'classification')
    //             : column.name === 'PO Number'
    //               ? this.formatBadge(data, 'po-number')
    //               : column.name === 'Initiator'
    //                 ? this.formatBadge(data, 'initiator')
    //                 : (data ?? ''),
    //     };
    //   })
    //   .filter(Boolean);
    // console.log('columns=>', columns);
    // this.dtOptions.columns = [this.selectionColumn(), ...columns];
    // });
  }

  private async reloadDataTable(): Promise<void> {
    if (!this.dataTableDirective) {
      return;
    }

    const dataTable = await this.dataTableDirective.dtInstance;
    dataTable.ajax.reload(null, true);
  }

  private createQuery(targetId: string, dt: any): any {
    const result = {
      Query: {
        Select: {
          QueryableObject: 'TASK_INSTANCE',
          Field: [
            'TaskId',
            'SourceInstanceId',
            'State',
            'ProcessName',
            'Activity',
            'ActivityId',
            'Priority',
            'Target',
            'Sender',
            'SourceType',
            'Assignee',
            'CompletedByUser',
            'DelegatedToUser',
            'DeliveryDate',
            'StartDate',
            'DueDate',
            'StartedOn',
            'CompletionDate',
            'IsPriorityFixed',
            'UITaskId',
            'TASK_ENTITY_INSTANCE_ID',
            'ENTITY_LAYOUT_ID',
          ],
        },
        Filters: {
          And: {
            EQ: [
              { '@field': 'SHOW_BUSINESS_ATTRIBUTES', Value: 'true' },
              { '@field': 'Target', Value: `team:${targetId}` },
              { '@field': 'SHOW_NON_WORKABLE_ITEMS', Value: 'false' },
              { '@field': 'RETURN_TASK_DATA', Value: 'true' },
            ],
          },
        },
        OrderBy: { Property: { '@direction': 'desc', text: 'DeliveryDate' } },
        Cursor: { '@position': dt.start, '@numRows': dt.length, '@maxRows': 5000 },
      },
    };

    // <Like field="TaskIdentifier.WORK_ITEM_NUMBER">
    //                         <Value>%GABAP0000000003115%</Value>
    //                     </Like>

    const filterValue = this.appliedTaskFilterText;
    if (this.appliedTaskIdentifier && filterValue) {
      const fieldName = this.appliedTaskIdentifier.replace('TaskIdentifier.', '');
      const existingFilters = result.Query.Filters.And.EQ;
      existingFilters.push({
        '@field': `TaskData.ApplicationData.Invoice.${fieldName}`,
        Value: filterValue,
      });
    }

    return result;
  }
}
