import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  forkJoin,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { DataTablesModule } from 'angular-datatables';

import { CommonService } from '../../../../shared/common.service';

@Component({
  imports: [DataTablesModule],
  // imports: [AsyncPipe, DatePipe, DataTablesModule],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  private readonly router = inject(Router);
  private readonly cs = inject(CommonService);
  private readonly page$ = new BehaviorSubject(0);
  readonly pageSize = 10;
  currentPage = 0;
  showColumnOptions = false;
  readonly tblDT = combineLatest([
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => history.state?.props?.ID ?? ''),
      startWith(history.state?.props?.ID ?? ''),
    ),
    this.page$,
  ]).pipe(
    map(([targetId, page]) => ({ targetId, page })),
    switchMap(({ targetId, page }) => {
      const query = this.createQuery(targetId, page * this.pageSize);
      return forkJoin({
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
          .pipe(
            map((d: any) => {
              return Number(d.Count ?? 0);
            }),
          ),
      });
    }),
    tap((d: any) => {
      console.log('data=>', d);
    }),
  );

  dtOptions: any;

  private formatDate(value: unknown): string {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(String(value));

    return Number.isNaN(date.getTime()) ? '' : this.dateFormatter.format(date);
  }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      serverSide: true,
      ajax: (dataTablesParameters: any, callback: any) => {
        combineLatest([
          this.router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd),
            map(() => history.state?.props?.ID ?? ''),
            startWith(history.state?.props?.ID ?? ''),
          ),
          this.page$,
        ])
          .pipe(
            map(([targetId, page]) => ({ targetId, page })),
            switchMap(({ targetId, page }) => {
              const query = this.createQuery(targetId, dataTablesParameters);
              return forkJoin({
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
                  .pipe(
                    map((d: any) => {
                      return Number(d.Count ?? 0);
                    }),
                  ),
              });
            }),
            tap((d: any) => {
              console.log('data=>', d);
            }),
          )
          .subscribe((resp: any) => {
            console.log('sadf=>', resp);
            callback({
              recordsTotal: resp.count,
              recordsFiltered: resp.count,
              data: resp.data,
            });
          });
      },
      columns: [
        {
          title: 'SLA',
          data: 'SLA',
          className: 'text-nowrap',
          render: (data: any, type: any, row: any) => {
            console.log(data);
            return data || '';
          },
        },
        {
          title: 'Work Item Number',
          data: 'TaskData.ApplicationData.Invoice.WORK_ITEM_NUMBER',
          className: 'text-nowrap',
          render: (data: any, type: any, row: any) => {
            console.log(data, type, row);
            return data || '';
          },
        },
        {
          title: 'Status',
          data: 'TaskData.ApplicationData.Invoice.WORK_ITEM_STATUS',
          className: 'text-nowrap',
          render: (data: any, type: any, row: any) => {
            return data || '';
          },
        },
        {
          title: 'Invoice Number',
          data: 'TaskData.ApplicationData.Invoice.INVOICE_NUMBER',
          className: 'text-nowrap',
          render: function (data: any, type: any, row: any) {
            return data || '';
          },
        },
        {
          title: 'Classifications',
          data: 'TaskData.ApplicationData.Invoice.CLASSIFICATIONS',
          className: 'text-nowrap',
          render: function (data: any, type: any, row: any) {
            return data || '';
          },
        },
        {
          title: 'PO Number',
          data: 'TaskData.ApplicationData.Invoice.PO_NUMBER',
          className: 'text-nowrap',
          render: function (data: any, type: any, row: any) {
            return data || '';
          },
        },
        {
          title: 'Vendor Name',
          data: 'TaskData.ApplicationData.Invoice.VENDOR',
          className: 'text-nowrap',
          render: function (data: any, type: any, row: any) {
            return data || '';
          },
        },
        {
          title: 'Company Code',
          data: 'TaskData.ApplicationData.Invoice.COMPANY_CODE',
          className: 'text-nowrap',
          render: function (data: any, type: any, row: any) {
            return data || '';
          },
        },
        {
          title: 'Invoice Amount',
          data: 'TaskData.ApplicationData.Invoice.INVOICE_AMOUNT',
          className: 'text-nowrap',
          render: function (data: any, type: any, row: any) {
            return data || '';
          },
        },
        {
          title: 'Currency',
          data: 'TaskData.ApplicationData.Invoice.CURRENCY',
          className: 'text-nowrap',
          render: function (data: any, type: any, row: any) {
            return data || '';
          },
        },
        {
          title: 'ERP Due Date',
          data: 'TaskData.ApplicationData.Invoice.ERP_DUE_DATE',
          className: 'text-nowrap',
          render: (data: any, type: any, row: any) => {
            return this.formatDate(data);
          },
        },
        {
          title: 'Due Date',
          data: 'TaskData.ApplicationData.Invoice.SLA_OverDue',
          className: 'text-nowrap',
          render: (data: any, type: any, row: any) => {
            return this.formatDate(data);
          },
        },
        {
          title: 'Received Date',
          data: 'DeliveryDate',
          className: 'text-nowrap',
          render: (data: any, type: any, row: any) => {
            return this.formatDate(data);
          },
        },
        {
          title: 'Assignee',
          data: 'Assignee.@displayName',
          className: 'text-nowrap',
          render: function (data: any, type: any, row: any) {
            return data || '';
          },
        },
        {
          title: 'Delegated To',
          data: 'DelegatedToUser.@displayName',
          className: 'text-nowrap',
          render: function (data: any, type: any, row: any) {
            return data || '';
          },
        },
        {
          title: 'Queue',
          data: 'TaskData.ApplicationData.Invoice.QUEUE',
          className: 'text-nowrap',
          render: function (data: any, type: any, row: any) {
            return data || '';
          },
        },
        {
          title: 'Team',
          data: 'TaskData.ApplicationData.Invoice.TEAM',
          className: 'text-nowrap',
          render: function (data: any, type: any, row: any) {
            return data || '';
          },
        },
        // {
        //   title: 'Completed By',
        //   data: 'CompletedByUser.@displayName',
        //   className: 'text-nowrap',
        //   render: function (data: any, type: any, row: any) {
        //     return data || '';
        //   },
        // },
        // {
        //   title: 'Completed On',
        //   data: 'CompletionDate',
        //   className: 'text-nowrap',
        //   render: function (data: any, type: any, row: any) {
        //     return data || '';
        //   },
        // },
        {
          title: 'Source',
          data: 'TaskData.ApplicationData.Invoice.SOURCE',
          className: 'text-nowrap',
          render: function (data: any, type: any, row: any) {
            return data;
          },
        },
        {
          title: 'Initiator',
          data: 'TaskData.ApplicationData.Invoice.INITIATOR',
          className: 'text-nowrap',
          render: function (data: any, type: any, row: any) {
            return data;
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
            className: 'text-nowrap',
            render: (data: unknown) =>
              column.type === 'date' ? this.formatDate(data) : (data ?? ''),
          };
        })
        .filter(Boolean);
      console.log('columns=>', columns);
      this.dtOptions.columns = columns;
    });
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
