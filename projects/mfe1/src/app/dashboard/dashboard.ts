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
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      serverSide: true,
      ajax: (dataTablesParameters: any, callback: any) => {
        console.log(dataTablesParameters);
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
          title: 'ID',
          data: 'ActivityId',
        },
      ],
    };

    fetch('/config/inbox.config.json')
      .then((j) => j.json())
      .then((r) => {
        console.log('=>', r);
      });
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
