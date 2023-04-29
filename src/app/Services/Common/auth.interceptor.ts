import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private router: Router) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.headers && req.headers.has("Content-Type") && req.headers.get("No-Auth") == "True")
            return next.handle(req.clone());

        let userToken = sessionStorage.getItem("Access_token");
        if (userToken != null) {
            let token = JSON.parse(userToken);
            const clonedreq = req.clone({
                headers: req.headers.set("Authorization", "Bearer " + token.Access_token)
            });

            return next.handle(clonedreq).pipe(tap(
                (err: any) => {
                    if (err.status === 401) {
                        sessionStorage.clear();
                        this.router.navigate(["Login"]);
                    }
                }
            ));
        }
        else
            return next.handle(req);
    }

}