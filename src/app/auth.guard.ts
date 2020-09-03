import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import {AccountService} from './account.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {


  constructor(private loginService: AccountService,private router: Router) {
  }


  async canActivate():Promise<boolean>{
    let res = await this.loginService.isLoggedIn();
    if(res){
      return true;
    }else{
      this.router.navigate(['/login']);
      return false;
    }
  }
}
