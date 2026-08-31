import { Injectable, signal } from '@angular/core';
import { from, Observable, shareReplay } from 'rxjs';

/**
 * Shared application state that can be consumed by the shell and remotes.
 *
 * The service deliberately has no dependency on either application so it can
 * be reused by independently built Native Federation projects.
 */
declare var $: any;
@Injectable({ providedIn: 'root' })
export class CommonService {
  private readonly message = signal('');

  readonly message$ = this.message.asReadonly();

  setMessage(message: string): void {
    this.message.set(message);
  }

  clearMessage(): void {
    this.message.set('');
  }
  ajax(method: any, namespace: any, parameters: any, useShareReplay = false): Observable<any> {
    method = method.split('.');
    const request$ = new Observable<any>((subscriber) => {
      $.cordys.ajax({
        url: '/com.eibus.web.soap.Gateway.wcp',
        showLoadingIndicator: false,
        method: method[0],
        namespace: namespace,
        parameters: parameters,
        success: function (data: any, textStatus: any, jqXHR: any) {
          const res = method[1] !== undefined ? $.cordys.json.findObjects(data, method[1]) : data;
          subscriber.next(res);
          subscriber.complete();
        },
        error: function (response: any, status: any, errorText: any) {
          subscriber.error([response, status, errorText]);
        },
      });
    });

    return useShareReplay
      ? request$.pipe(shareReplay({ bufferSize: 1, refCount: true }))
      : request$;
  }
  fetch(url:any,useShareReplay = false): Observable<any> {
    const request$ =new Observable<any>((subscriber) => {
      fetch(url)
      .then((j) => j.json())
      .then((res:any)=>{
        subscriber.next(res);
        subscriber.complete();
      },(err:any)=>{
        subscriber.error(err);
      })
    })
    return useShareReplay
      ? request$.pipe(shareReplay({ bufferSize: 1, refCount: true }))
      : request$;
  }

  inbox_config_json = this.fetch("/config/inbox.config.json",true);

  getuserdetails = this.ajax(
    'GetUserDetails.User',
    'http://schemas.cordys.com/UserManagement/1.0/User',
    {},
    true,
  );
  getalltargets = this.ajax(
    'GetAllTargets.Target',
    'http://schemas.cordys.com/notification/workflow/1.0',
    {},
    true,
  );
}
