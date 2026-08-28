import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, DestroyRef, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, forkJoin, map, of } from 'rxjs';
import { CommonService } from '../../../../shared/common.service';
import { AsyncPipe, JsonPipe } from '@angular/common';

@Component({
  imports: [JsonPipe, AsyncPipe],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  tblDT: any = of([]);
  constructor(private cs: CommonService) {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.logNavigationState());
  }
  private logNavigationState(): void {
    this.tblDT = forkJoin({
      data: this.cs.ajax(
        'GetHumanTasks.NOTF_TASK_INSTANCE',
        'http://schemas.cordys.com/notification/workflow/1.0',
        {
          Query: {
            '@xmlns': 'http://schemas.cordys.com/cql/1.0',
            select: {
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
                  {
                    '@field': 'SHOW_BUSINESS_ATTRIBUTES',
                    Value: true,
                  },
                  {
                    '@field': 'Target',
                    Value: 'team:' + history.state?.props.ID,
                  },
                  {
                    '@field': 'SHOW_NON_WORKABLE_ITEMS',
                    Value: false,
                  },
                  {
                    '@field': 'RETURN_TASK_DATA',
                    Value: true,
                  },
                ],
              },
            },
            OrderBy: {
              Property: {
                '@direction': 'desc',
                text: 'DeliveryDate',
              },
            },
            Cursor: {
              '@position': 0,
              '@numRows': 10,
              '@maxRows': 5000,
            },
          },
        },
      ),
      count: this.cs
        .ajax(
          'GetHumanTasks.NOTF_TASK_INSTANCE',
          'http://schemas.cordys.com/notification/workflow/1.0',
          {
            Query: {
              '@xmlns': 'http://schemas.cordys.com/cql/1.0',
              select: {
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
                    {
                      '@field': 'SHOW_BUSINESS_ATTRIBUTES',
                      Value: true,
                    },
                    {
                      '@field': 'Target',
                      Value: 'team:' + history.state?.props.ID,
                    },
                    {
                      '@field': 'SHOW_NON_WORKABLE_ITEMS',
                      Value: false,
                    },
                    {
                      '@field': 'RETURN_TASK_DATA',
                      Value: false,
                    },
                  ],
                },
              },
              OrderBy: {
                Property: {
                  '@direction': 'desc',
                  text: 'DeliveryDate',
                },
              },
              Cursor: {
                '@position': 0,
                '@numRows': 10,
                '@maxRows': 5000,
              },
            },
          },
        )
        .pipe(map((d) => 289)),
    });
    console.log('Navigation state:', {
      state: {
        props: history.state?.props,
      },
    });
  }
}
