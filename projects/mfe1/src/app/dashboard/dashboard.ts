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
import { CommonService } from '../../../../shared/common.service';

interface TableHeader {
  name: string;
  displayKey: string;
  index: number;
  isSelected: boolean;
  type: string;
  sort: boolean;
  db_sort: boolean;
  value?: string;
  displayOnlyIn?: string;
}

@Component({
  imports: [AsyncPipe, DatePipe],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly router = inject(Router);
  private readonly cs = inject(CommonService);
  private readonly page$ = new BehaviorSubject(0);
  readonly pageSize = 10;
  currentPage = 0;
  showColumnOptions = false;
  readonly allHeaders: TableHeader[] = [
    {
      name: 'select',
      displayKey: 'Select',
      index: 0,
      isSelected: true,
      type: '',
      sort: false,
      db_sort: true,
    },
    {
      name: 'SLA',
      displayKey: 'SLA',
      index: 1,
      isSelected: true,
      type: 'icon',
      sort: false,
      db_sort: true,
    },
    {
      name: 'Work Item Number',
      displayKey: 'Work Item Number',
      index: 2,
      isSelected: true,
      type: 'string',
      sort: false,
      db_sort: true,
    },
    {
      name: 'Status',
      displayKey: 'Status',
      index: 3,
      isSelected: true,
      type: 'string',
      sort: false,
      db_sort: true,
      value: 'Status',
    },
    {
      name: 'Invoice Number',
      displayKey: 'Invoice Number',
      index: 4,
      isSelected: true,
      type: 'string',
      sort: false,
      db_sort: true,
    },
    {
      name: 'Classifications',
      displayKey: 'Classifications',
      index: 5,
      isSelected: true,
      type: 'string',
      sort: false,
      db_sort: true,
    },
    {
      name: 'PO Number',
      displayKey: 'PO Number',
      index: 6,
      isSelected: true,
      type: 'string',
      sort: false,
      db_sort: true,
    },
    {
      name: 'Vendor Name',
      displayKey: 'Vendor Name',
      index: 7,
      isSelected: true,
      type: 'string',
      sort: false,
      db_sort: true,
    },
    {
      name: 'Company Code',
      displayKey: 'Company Code',
      index: 8,
      isSelected: true,
      type: 'string',
      sort: false,
      db_sort: true,
    },
    {
      name: 'Invoice Amount',
      displayKey: 'Invoice Amount',
      index: 9,
      isSelected: true,
      type: 'number',
      sort: false,
      db_sort: true,
    },
    {
      name: 'Currency',
      displayKey: 'Currency',
      index: 10,
      isSelected: true,
      type: 'string',
      sort: false,
      db_sort: true,
    },
    {
      name: 'ERP Due Date',
      displayKey: 'ERP Due Date',
      index: 11,
      isSelected: true,
      type: 'date',
      sort: false,
      db_sort: true,
    },
    {
      name: 'Due Date',
      displayKey: 'Due Date',
      index: 12,
      isSelected: true,
      type: 'date',
      sort: false,
      db_sort: true,
    },
    {
      name: 'Received Date',
      displayKey: 'Received Date',
      index: 13,
      isSelected: true,
      type: 'date',
      sort: false,
      db_sort: true,
    },
    {
      name: 'Assignee',
      displayKey: 'Assignee',
      index: 14,
      isSelected: true,
      type: 'string',
      sort: false,
      db_sort: true,
    },
    {
      name: 'Delegated To',
      displayKey: 'Delegated To',
      index: 15,
      isSelected: true,
      type: 'string',
      sort: false,
      db_sort: true,
    },
    {
      name: 'Queue',
      displayKey: 'Queue',
      index: 16,
      isSelected: true,
      type: 'string',
      sort: false,
      db_sort: true,
    },
    {
      name: 'Team',
      displayKey: 'Team',
      index: 17,
      isSelected: true,
      type: 'string',
      sort: false,
      db_sort: true,
    },
    {
      name: 'Completed By',
      displayKey: 'Completed By',
      index: 18,
      isSelected: true,
      type: 'string',
      sort: false,
      db_sort: true,
      displayOnlyIn: 'completedTask',
    },
    {
      name: 'Completed On',
      displayKey: 'Completed On',
      index: 19,
      isSelected: true,
      type: 'date',
      sort: false,
      db_sort: true,
      displayOnlyIn: 'completedTask',
    },
    {
      name: 'Source',
      displayKey: 'Source',
      index: 20,
      isSelected: true,
      type: 'string',
      sort: false,
      db_sort: true,
    },
    {
      name: 'Initiator',
      displayKey: 'Initiator',
      index: 21,
      isSelected: true,
      type: 'string',
      sort: false,
      db_sort: true,
    },
  ];
  tableHeaders = this.allHeaders.filter((header) => header.isSelected);

  toggleColumn(index: number): void {
    this.allHeaders[index].isSelected = !this.allHeaders[index].isSelected;
    this.tableHeaders = this.allHeaders.filter((header) => header.isSelected);
    this.tableHeaders.forEach((header, visibleIndex) => (header.index = visibleIndex));
  }

  getCellValue(task: any, header: TableHeader): any {
    const invoice = task?.TaskData?.ApplicationData?.Invoice ?? {};
    const attributes = Object.fromEntries(
      (task?.BusinessAttributes?.Attribute ?? []).map((attribute: any) => [
        attribute['@name'],
        attribute.text ?? '',
      ]),
    );
    const values: Record<string, any> = {
      SLA:
        attributes['SLA'] ??
        attributes['SLA_Due'] ??
        attributes['SLA_NearingDue'] ??
        attributes['SLA_OverDue'],
      'Work Item Number': attributes['WORK_ITEM_NUMBER'] ?? invoice.WORK_ITEM_NUMBER,
      Status: task.State,
      'Invoice Number': attributes['INVOICE_NUMBER'] ?? invoice.INVOICE_NUMBER,
      Classifications:
        attributes['CLASSIFICATIONS'] ??
        attributes['CLASSIFICATION'] ??
        invoice.CLASSIFICATIONS ??
        invoice.CLASSIFICATION,
      'PO Number': attributes['PO_NUMBER'] ?? invoice.PO_NUMBER ?? invoice.PO_NO,
      'Vendor Name': attributes['VENDOR_NAME'] ?? invoice.VENDOR_NAME ?? invoice.VENDOR,
      'Company Code': attributes['COMPANY_CODE'] ?? invoice.COMPANY_CODE,
      'Invoice Amount': attributes['INVOICE_AMOUNT'] ?? invoice.INVOICE_AMOUNT,
      Currency: attributes['CURRENCY'] ?? invoice.CURRENCY,
      'ERP Due Date': attributes['ERP_DUE_DATE'] ?? invoice.ERP_DUE_DATE,
      'Due Date': task.DueDate ?? attributes['SLA_Due'] ?? invoice.DUE_DATE,
      'Received Date': task.DeliveryDate ?? attributes['DeliveryDate'],
      Assignee: task.Assignee?.['@displayName'] ?? task.Assignee,
      'Delegated To': task.DelegatedToUser,
      Queue: attributes['QUEUE'] ?? invoice.QUEUE ?? task.Queue,
      Team: attributes['TEAM'] ?? task.Target?.text ?? task.Target,
      'Completed By': task.CompletedByUser,
      'Completed On': task.CompletionDate,
      Source: task.SourceType,
      Initiator: attributes['INITIATOR'] ?? task.Sender?.['@displayName'] ?? task.Sender,
    };
    return values[header.name];
  }

  ngOnInit() {
    fetch('/config/inbox.config.json')
      .then((j) => j.json())
      .then((r) => {
        console.log('=>', r);
      });
  }
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

  goToPage(page: number): void {
    if (page < 0 || page === this.currentPage) return;
    this.currentPage = page;
    this.page$.next(page);
  }

  private createQuery(targetId: string, position: number): any {
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
              { '@field': 'RETURN_TASK_DATA', Value: 'false' },
            ],
          },
        },
        OrderBy: { Property: { '@direction': 'desc', text: 'DeliveryDate' } },
        Cursor: { '@position': position, '@numRows': this.pageSize, '@maxRows': 5000 },
      },
    };
  }
}
