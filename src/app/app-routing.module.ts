import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './Services/Common/auth.guard';
import { NotFoundComponent } from './view/404/404NotFound.component';

const routes: Routes = [
  { path: '', loadChildren: () => import('./view/view.module').then(m => m.ViewModule), canActivate: [AuthGuard] },
  { path: 'Login', loadChildren: () => import('./view/Common/login/login.module').then(m => m.LoginModule) },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: 'not-found' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
