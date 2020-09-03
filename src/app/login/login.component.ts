import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AccountService} from '../account.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MediaChange, MediaObserver} from '@angular/flex-layout';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {AppComponent} from '../app.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private mediaSub: Subscription; //For checking screen size
  public  userExists:boolean;
  constructor(private account: AccountService,
              private mediaObserver: MediaObserver, private cdr: ChangeDetectorRef,private router: Router, private appComp: AppComponent) {
    window['loginComponent'] = this; //For calling TypeScript functions in browser console
  }

  ngOnInit(): void {
    //console.log(this.account.getAllFromStore('accounts'));
    this.rotateLines(); //Rotates the 2 lines on the OR

    this.checkIfUserIsAlreadyLoggedIn().then(
      res => {
        if(res){
          this.router.navigate(['/main']); //If he is then we redirect him to the main page
          this.appComp.isLoggedin = true;
        }
        this.appComp.updateToolbar();
      }
    )
  }

  loginForm = new FormGroup({
    loginEmail: new FormControl('john.doe@example.com',[Validators.required, Validators.email]),
    loginPassword: new FormControl('password',[Validators.required,
      Validators.minLength(3)])
  })
  getEmailErrorMessage() {
    if (this.loginForm.get('loginEmail').hasError('required')) {
      return 'Email field is empty';
    }
    return this.loginForm.get('loginEmail').hasError('email') ? 'Not a valid email' : '';
  }

  getPasswordErrorMessage() {
    return this.loginForm.get('loginPassword').hasError('required') ? 'Password field is empty' : '';
  }

  loginUser(data){
    if(this.loginForm.valid){ //check if form is valid
      this.account.checkUserEmailAndPassword('accounts',data.loginEmail,data.loginPassword).then(result => { //then check if the user exists in the Indexed DB
        console.log(result); // Log the result
        if(!result){ //The function above returns boolean so i can check here if it's false or not
          this.userExists = true; //Displays that the user doesn't exist or that the username/password is wrong
          return;
        }
        this.userExists = false;
        this.account.getUserIDForGivenEmail(data.loginEmail).then( result => {
          localStorage.setItem('userID',result) //Grabbing the user uniqID
          this.router.navigate(['/main']); //navigating the user to the main page
          this.appComp.isLoggedin = true;
          this.appComp.updateToolbar();
        })
      })
    }

  }




  async  checkIfUserIsAlreadyLoggedIn(){
    return this.account.isLoggedIn(); //Simple check here calling the isLoggedIn and awaiting the result
  }
  rotateLines(){ //Responsible for rotating the little line
    this.mediaSub = this.mediaObserver.media$.subscribe(
      (change: MediaChange) =>{
        //console.log(change.mqAlias);
        let lineBefore = document.getElementById("line-before");
        let lineText = document.getElementById("line-text");
        let lineAfter = document.getElementById("line-after");
        if(change.mqAlias == 'lt-md' || change.mqAlias == 'sm' || change.mqAlias == 'xs'){

          lineAfter.classList.remove('vertical-line')
          lineAfter.classList.add("horizontal-line");   //add the class

          lineText.classList.remove('line-text-vertical')
          lineText.classList.add('line-text-horizontal')

          lineBefore.classList.remove('vertical-line')
          lineBefore.classList.add("horizontal-line");   //add the class
        }else{
          lineAfter.classList.remove('horizontal-line')
          lineAfter.classList.add("vertical-line");   //add the class
          lineText.classList.remove('line-text-horizontal')
          lineText.classList.add('line-text-vertical')
          lineBefore.classList.remove('horizontal-line')
          lineBefore.classList.add("vertical-line");   //add the class
        }
        this.cdr.detectChanges();
      }
    )
  }



}
