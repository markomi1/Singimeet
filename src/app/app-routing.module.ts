import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LoginComponent} from './login/login.component';
import {RegisterComponent} from './register/register.component';
import {MainPageComponent} from './main-page/main-page.component';
import {AuthGuard} from './auth.guard';
import {DebugComponentComponent} from './debug-component/debug-component.component';
import {EventCreateComponent} from './event-create/event-create.component';
import {EventPageComponent} from './event-page/event-page.component';
import {UserProfileComponent} from './user-profile/user-profile.component';
import {EditEventComponent} from './edit-event/edit-event.component';


const routes: Routes = [
  {path: '', redirectTo: '/debug', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'main', component: MainPageComponent, canActivate: [AuthGuard]},
  {path: 'createEvent', component: EventCreateComponent, canActivate: [AuthGuard]},
  {path: 'editEvent/:eventID', component: EditEventComponent, canActivate: [AuthGuard]},
  {path: 'debug', component: DebugComponentComponent},
  {path: 'event/:eventID',component: EventPageComponent, canActivate: [AuthGuard]},
  {path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [LoginComponent,RegisterComponent,MainPageComponent,DebugComponentComponent,EventCreateComponent,EventPageComponent,UserProfileComponent];

