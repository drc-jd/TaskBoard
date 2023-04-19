import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private titleService: Title) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (sessionStorage.getItem("UserInfo")) {
      this.SetTitle(state.url.toString());
      return true;
    }
    else {
      this.router.navigate(['/Login']);
      return false;
    }
  }

  SetTitle(stateurl: string) {
    try {
      // this.titleService.setTitle(JSON.parse(sessionStorage.getItem("UserInfo")).userName + ' | ' + this.toProperCase(stateurl.split('/')[stateurl.split('/').length - 1]))
      this.titleService.setTitle(JSON.parse(sessionStorage.getItem("UserInfo")).userName + ' | ' + this.toProperCase(stateurl.split('/')[1]))
    } catch (error) {
      console.error(error)
    }
  }
  toProperCase(s) {
    return s.toLowerCase().replace(/\b((m)(a?c))?(\w)/g,
      function ($1, $2, $3, $4, $5) { if ($2) { return $3.toUpperCase() + $4 + $5.toUpperCase(); } return $1.toUpperCase(); });
  }

}