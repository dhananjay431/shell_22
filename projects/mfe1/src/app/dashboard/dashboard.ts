import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, forkJoin, map } from 'rxjs';
import { DataTableDirective, DataTablesModule } from 'angular-datatables';

import { CommonService } from '../../../../shared/common.service';

@Component({
  imports: [DataTablesModule],
  // imports: [AsyncPipe, DatePipe, DataTablesModule],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard {
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
      pagingType: 'full_numbers',
      serverSide: true,
      pageLength: 10,
      lengthMenu: [15, 20, 25, 30],
      ajax: (dataTablesParameters: any, callback: any) => {
        const query = this.createQuery(this.targetId, dataTablesParameters);

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
        }).subscribe({
          next: (response: any) => {
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
        {
          title: 'SLA',
          data: 'SLA',
          className: 'text-nowrap p-1',
          render: (data: any, type: any, row: any) => {
            console.log(data);
            return data || '';
          },
        },
        {
          title: 'Work Item Number',
          data: 'TaskData.ApplicationData.Invoice.WORK_ITEM_NUMBER',
          className: 'text-nowrap p-1',
          render: (data: any, type: any, row: any) => {
            return `
              <span class="availability-badge availability-badge--in-progress">${data || ''}</span>
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

    this.cs.inbox_config_json.subscribe((r: any) => {
      const columnsToDisplay = r.Inbox.InboxColumnsToDisplay;
      const dataPopulateConfig = r.Inbox.InboxDataPopulateConfiguration;

      const columns = columnsToDisplay
        .map((column: any) => {
          const config = dataPopulateConfig.find((item: any) => item.columnName === column.name);

          if (!config) {
            return null;
          }

          return {
            title: column.name,
            data: config.taskDataNode.join('.'),
            className: 'text-nowrap p-1',
            render: (data: unknown) =>
              column.type === 'date'
                ? this.formatDate(data)
                : column.name === 'Classifications'
                  ? this.formatBadge(data, 'classification')
                  : column.name === 'PO Number'
                    ? this.formatBadge(data, 'po-number')
                    : column.name === 'Initiator'
                      ? this.formatBadge(data, 'initiator')
                      : (data ?? ''),
          };
        })
        .filter(Boolean);
      console.log('columns=>', columns);
      this.dtOptions.columns = columns;
    });
  }

  private async reloadDataTable(): Promise<void> {
    if (!this.dataTableDirective) {
      return;
    }

    const dataTable = await this.dataTableDirective.dtInstance;
    dataTable.ajax.reload(null, true);
  }

  private createQuery(targetId: string, dt: any): any {
    return {
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
  }
}
