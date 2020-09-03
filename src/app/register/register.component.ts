import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AccountService} from '../account.service';
import {Observable, Subscription} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {LocationService} from '../location.service';
import {Router} from '@angular/router';
import {AppComponent} from '../app.component';
import {MediaChange, MediaObserver} from '@angular/flex-layout';
import {CategoryService} from '../category.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(private account: AccountService,private locationService: LocationService, private router: Router, private appComp: AppComponent,
              private cdr: ChangeDetectorRef, private mediaObserver: MediaObserver,private tags: CategoryService) {
    window['registerComponent'] = this; //For calling TypeScript functions in browser console
  }

  private mediaSub: Subscription; //For checking screen size
  registerForm: FormGroup;

  locations: string[] = [];
  filteredLocations: Observable<string[]>;
  ngOnInit(): void {
    this.registerForm = new FormGroup({
      registerFullName: new FormControl('John Doe',[Validators.required]),
      registerUserEmail: new FormControl('john.doe@example.com',[Validators.required, Validators.email]),
      registerPassword: new FormControl('password',[Validators.required,
        Validators.minLength(6)]),
      selectedCategory: new FormControl([],[Validators.required]),
      locationInput: new FormControl('',[Validators.required]),
    })
    this.setLocations();
    this.setInterests();
    this.rotateLines();
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

  async  checkIfUserIsAlreadyLoggedIn(){
    return this.account.isLoggedIn(); //Simple check here calling the isLoggedIn and awaiting the result
  }


  setLocations(){
    this.locationService.getLocations().then(
      result => {
        for (let i = 0; i < result.length; i++) {
          //console.log(result[i]['location']);
          this.locations.push(result[i]['location']);
        }

        this.filteredLocations = this.registerForm.get('locationInput').valueChanges.pipe(
          startWith(''),
          map(value =>
            this._filter(value))
        );
      }
    );
  }
  setInterests(){
    this.tags.getTags().then(
      value => {
          this.offers = value;
      });
  }

  _filter(value): string[] {
    const filterValue = value.toLowerCase();

    return this.locations.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }
  getFullNameErrorMessage() {
    if (this.registerForm.get('registerFullName').hasError('required')) {
      return 'Field can\'t be empty';
    }
  }

  getEmailErrorMessage() {
    if (this.registerForm.get('registerUserEmail').hasError('required')) {
      return 'Email field is empty';
    }else if (this.registerForm.get('registerUserEmail').hasError('emailExists')){
      return 'Email already exists';
    }
    return this.registerForm.get('registerUserEmail').hasError('email') ? 'Not a valid email' : '';
  }

  getPasswordErrorMessage(){
    if (this.registerForm.get('registerPassword').hasError('required')) {
      return 'Field can\'t be empty';
    }
    return this.registerForm.get('registerPassword').hasError('minlength') ? 'Password is too short (Min 6)' : '';
  }

  registerUser(value: any) {
      if(this.registerForm.valid){
          let fullName = value['registerFullName']
          let userEmail = value['registerUserEmail']
          let userPassword = value['registerPassword']
          let userLocation = value['locationInput']
          let userInterests: string[] = [];
          value['selectedCategory'].forEach(i => {
              userInterests.push(i['interests']);
          })
          this.account.createProfile(fullName,userEmail,userPassword,userLocation,userInterests).then(
            result => {
              localStorage.setItem('userID',result)
              this.router.navigate(['/main']);
              this.appComp.isLoggedin = true;
              this.appComp.updateToolbar();
          })
      }
  }


  get selectedInterests() {
    return this.registerForm.get('selectedCategory');
  }

  offers = [ //NOTE This needs to be made dynamic, aka in a database
  ];





  selectedChips: any[] = []; //Storing selected chips, only used for storing

  isSelected(offer: any): boolean {
    const index = this.selectedChips.indexOf(offer);
    return index >= 0;
  }


  toggleOffer(offer: any): void { //Chip selector
    let index = this.selectedChips.indexOf(offer);

    if (index >= 0) {
      this.selectedChips.splice(index, 1);
      this.selectedInterests.value.splice(index, 1);
      this.selectedInterests.updateValueAndValidity();
    } else {
      this.selectedInterests.value.push(offer);
      this.selectedInterests.updateValueAndValidity();
      this.selectedChips.push(offer);
    }
  }

  checkIfEmailExists(data: any) { //Checks if email already exists;
    this.account.checkIfEmailExists(data).then(result => {
      if(result){
        this.registerForm.get('registerUserEmail').setErrors({'emailExists': true});
      }
    })

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
