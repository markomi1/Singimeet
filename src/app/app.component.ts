import {AfterViewInit, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AccountService} from './account.service';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {ReservedEventsComponent} from './reserved-events/reserved-events.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit{
  title = 'Singimeet';

  constructor(private account: AccountService,private cdr: ChangeDetectorRef, private router: Router,public dialog: MatDialog) {
    window['appComponent'] = this; //For calling TypeScript functions in browser console

  }

  public isLoggedin = false;
  userFullName: any;
  canGoBack: any = false;

 updateToolbar(){
   this.cdr.detectChanges();
 }

  ngAfterViewInit(): void {

   this.checkIfUserIsAlreadyLoggedIn().then(
     result =>{
       if(result){
         this.isLoggedin = result;
         this.account.getUserFullName().then(
           result =>{
             this.userFullName = result;
           }
         )
       }
       this.updateToolbar();
     }
   )

    this.checkIfUserCanGoBack();
    this.cdr.detectChanges();
  }


  async  checkIfUserIsAlreadyLoggedIn(){
    return this.account.isLoggedIn(); //Simple check here calling the isLoggedIn and awaiting the result
  }

  logoutUser() {
    localStorage.setItem('userID','');
    this.router.navigate(['/login']);
  }

  goToCreateEvent(){
   this.canGoBack = true;
   this.router.navigate(['/createEvent'])
  }

  goBack() {
    this.canGoBack = false;
    this.router.navigate(['/main'])
  }

  checkIfUserCanGoBack() {
    console.log(window.location.href)
    if(window.location.href != 'http://localhost:4200/main'){
      this.canGoBack = true;
    }
  }

  goToProfile() {
    this.canGoBack = true;
    this.router.navigate(['/profile'])
  }

  showReservedEvents() {
    const dialogRef = this.dialog.open(ReservedEventsComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if(result){
        this.canGoBack = true;
      }
    });
  }
}
