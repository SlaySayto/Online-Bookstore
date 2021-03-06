import {ErrorHandler, Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpClientModule, HttpClient, HttpErrorResponse} from '@angular/common/http';
import {AuthService} from './auth.service';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Router} from '@angular/router';

@Injectable()
export class RefreshTokenInterceptor implements HttpInterceptor {

  constructor(public auth: AuthService, private http: HttpClient, private  router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {

    if (localStorage.getItem('token')) {
      request = request.clone({
        setHeaders: {
          Authorization: localStorage.getItem('token')
        }
      });
    }

    if (!(request.url.includes('/auth/renew/token') ||
          request.url.includes('login') ||
          request.url.includes('person/add')  )) {
      const token = localStorage.getItem('token');
      this.http.post('http://localhost:8080/auth/renew/token', token,
        {responseType: 'text'})
        .subscribe((response) => {
          if (response.substr(0, 5) === 'Bearer') {
            localStorage.setItem('token', response.substr(6) );
            console.log(response.substr(6));
          }
        });
    }

    return next.handle(request).pipe(catchError((error, caught) => {
      console.log(error);
      this.handleAuthError(error);
      return of(error);
    }) as any);
  }


  private handleAuthError(err: HttpErrorResponse): Observable<any> {
    // handle your auth error or rethrow
    if (err.status === 401) {
      // navigate /delete cookies or whatever
      console.log('handled error ' + err.status);
      // this.router.navigate([`/login`]);

      // if you've caught / handled the error,
      // you don't want to rethrow it unless you also want downstream consumers to have
      // to handle it as well.
      return of(err.message);
    }
    throw Error;
  }
}
