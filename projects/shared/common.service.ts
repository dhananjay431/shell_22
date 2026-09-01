import { Injectable, signal } from '@angular/core';
import { defer, Observable, finalize, shareReplay } from 'rxjs';

/**
 * Shared application state that can be consumed by the shell and remotes.
 *
 * The service deliberately has no dependency on either application so it can
 * be reused by independently built Native Federation projects.
 */
declare var $: any, Sparkline: any, _: any;
@Injectable({ providedIn: 'root' })
export class CommonService {
  private readonly message = signal('');
  private activeAjaxRequests = 0;

  readonly message$ = this.message.asReadonly();

  setMessage(message: string): void {
    this.message.set(message);
  }

  clearMessage(): void {
    this.message.set('');
  }

  ajax(method: any, namespace: any, parameters: any, useShareReplay = false): Observable<any> {
    const [operation, resultPath] = method.split('.');
    const request$ = defer(() => {
      this.showLoader();

      return new Observable<any>((subscriber) => {
        $.cordys.ajax({
          url: '/com.eibus.web.soap.Gateway.wcp',
          showLoadingIndicator: false,
          method: operation,
          namespace,
          parameters,
          success: (data: any) => {
            const result =
              resultPath !== undefined ? $.cordys.json.findObjects(data, resultPath) : data;
            subscriber.next(result);
            subscriber.complete();
          },
          error: (response: any, status: any, errorText: any) => {
            subscriber.error([response, status, errorText]);
          },
        });
      }).pipe(finalize(() => this.hideLoader()));
    });

    return useShareReplay
      ? request$.pipe(shareReplay({ bufferSize: 1, refCount: true }))
      : request$;
  }

  private showLoader(): void {
    this.activeAjaxRequests += 1;

    if ($('.loader').length === 0) {
      $('body').append("<div id='ajax-loader' class='loader'></div>");
    }
  }

  private hideLoader(): void {
    this.activeAjaxRequests = Math.max(0, this.activeAjaxRequests - 1);

    if (this.activeAjaxRequests === 0) {
      $('#ajax-loader').remove();
    }
  }
  fetch(url: any, useShareReplay = false): Observable<any> {
    const request$ = new Observable<any>((subscriber) => {
      fetch(url)
        .then((j) => j.json())
        .then(
          (res: any) => {
            subscriber.next(res);
            subscriber.complete();
          },
          (err: any) => {
            subscriber.error(err);
          },
        );
    });
    return useShareReplay
      ? request$.pipe(shareReplay({ bufferSize: 1, refCount: true }))
      : request$;
  }

  inbox_config_json = this.fetch('/config/inbox.config.json', true);

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
    true
  );
  getalltargets_TaskCountRequired = this.ajax(
    'GetAllTargets.Target',
    'http://schemas.cordys.com/notification/workflow/1.0',
    { TaskCountRequired: "true" },
    true
  );
  render(id: any, svg: any) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = svg;
  }


  sparkline(type:any,data: any, obj: any) {
    return Sparkline[type](data, obj)
  }

}
/* 
<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'>
    <SOAP:Body>
        <GetAllTargets xmlns='http://schemas.cordys.com/notification/workflow/1.0'>
            <TaskCountRequired>true</TaskCountRequired>
        </GetAllTargets>
    </SOAP:Body>
</SOAP:Envelope>

 */