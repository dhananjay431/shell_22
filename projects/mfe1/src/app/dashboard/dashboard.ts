import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, DestroyRef, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, forkJoin, map, mergeMap, Observable, of, tap } from 'rxjs';
import { CommonService } from '../../../../shared/common.service';
import { AsyncPipe, DatePipe } from '@angular/common';

interface TaskResponse {
  data: Array<{
    TaskId: string;
    State: string;
    DeliveryDate: string;
    TaskData?: {
      ApplicationData?: {
        Invoice?: {
          WORK_ITEM_NUMBER?: string;
          INVOICE_NUMBER?: string;
          VENDOR?: string;
          COUNTRY?: string;
          QUEUE?: string;
          INVOICE_AMOUNT?: string;
          CURRENCY?: string;
        };
      };
    };
  }>;
  count: number;
}

@Component({
  imports: [AsyncPipe, DatePipe],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
    tblDT = this.router.events
      .pipe(
        mergeMap((d: any) => forkJoin({
          data: this.cs.ajax(
            'GetHumanTasks.NOTF_TASK_INSTANCE',
            'http://schemas.cordys.com/notification/workflow/1.0',
            {

              "Query": {

                "Select": {
                  "QueryableObject": 'TASK_INSTANCE',
                  "Field": [
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
                "Filters": {
                  "And": {
                    "EQ": [
                      {
                        '@field': 'SHOW_BUSINESS_ATTRIBUTES',
                        "Value": "true",
                      },
                      {
                        '@field': 'Target',
                        "Value": 'team:' + history.state?.props.ID,
                      },
                      {
                        '@field': 'SHOW_NON_WORKABLE_ITEMS',
                        "Value": "false",
                      },
                      {
                        '@field': 'RETURN_TASK_DATA',
                        "Value": "false",
                      },
                    ],
                  },
                },
                "OrderBy": {
                  "Property": {
                    '@direction': 'desc',
                    text: 'DeliveryDate',
                  },
                },
                "Cursor": {
                  '@position': this.currentPage * this.pageSize,
                  '@numRows': 10,
                  '@maxRows': 5000,
                },
              },
            },
          ),
          count: this.cs
            .ajax(
              'GetHumanTasks',
              'http://schemas.cordys.com/notification/workflow/1.0',
              {
                "@countOnly": "true",
                "Query": {

                  "Select": {
                    "QueryableObject": 'TASK_INSTANCE',
                    "Field": [
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
                  "Filters": {
                    "And": {
                      "EQ": [
                        {
                          '@field': 'SHOW_BUSINESS_ATTRIBUTES',
                          "Value": "true",
                        },
                        {
                          '@field': 'Target',
                          "Value": 'team:' + history.state?.props.ID,
                        },
                        {
                          '@field': 'SHOW_NON_WORKABLE_ITEMS',
                          "Value": "false",
                        },
                        {
                          '@field': 'RETURN_TASK_DATA',
                          "Value": "false",
                        },
                      ],
                    },
                  },
                  "OrderBy": {
                    "Property": {
                      '@direction': 'desc',
                      "text": 'DeliveryDate',
                    },
                  },
                  "Cursor": {
                    '@position': 0,
                    '@numRows': 10,
                    '@maxRows': 5000,
                  },
                },
              },
            )
            .pipe(map((d: any) => {
              debugger;
              return Number(d?.Count || 0);
            }))
        }).pipe(
          tap((d:any)=>{
            console.log(d);
          })
        ))

      )
  readonly pageSize = 10;
  currentPage = 0;
  goToPage(page: number): void {
    this.currentPage = page;
    // this.logNavigationState();
  }
  constructor(private cs: CommonService) {
  
  }
  
}
