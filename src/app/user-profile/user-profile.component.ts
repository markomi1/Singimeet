import { Component, OnInit } from '@angular/core';
import {CategoryService} from '../category.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AccountService} from '../account.service';
import {canReportError} from 'rxjs/internal/util/canReportError';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {LocationService} from '../location.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  offers = [ //NOTE This needs to be made dynamic, aka in a database
  ];
  locations: string[] = [];
  filteredLocations: Observable<string[]>;
  selectedChips: any[] = []; //Storing selected chips, only used for storing
  userFullName: any;

  constructor(private tags: CategoryService, private account: AccountService, private locationService: LocationService, private _snackBar: MatSnackBar) {
    window['profileComponent'] = this; //For calling TypeScript functions in browser console

  }

  profileFormGroup: FormGroup;

  ngOnInit(): void {
    this.profileFormGroup = new FormGroup({
      UserFullName: new FormControl('', Validators.required),
      UserEmail: new FormControl({value: '', disabled: true}, [Validators.required, Validators.email]),
      UserPassword: new FormControl('', Validators.required),
      selectedCategory: new FormControl('', Validators.required),
      UserLocation: new FormControl('', Validators.required),
    });
    this.setInterests()
    this.setLocations()
    let userID = localStorage.getItem('userID');
    this.account.getProfileGivenUserID(userID).then(
      profiles => {
        this.profileFormGroup.get('selectedCategory').setValue(profiles['interests'])

        let cat = profiles['interests'].length;
        for (let i = 0; i < this.offers.length; i++) {
          for (let b = 0; b < cat; b++) {
            if (this.offers[i]['interests'] == profiles['interests'][b]) {
              this.selectedChips.push(this.offers[i])
            }
          }
        }
        this.profileFormGroup.get('UserFullName').setValue(profiles['fullName'])
        this.userFullName = profiles['fullName'];
        this.profileFormGroup.get('UserFullName').updateValueAndValidity()
        this.profileFormGroup.get('UserEmail').setValue(profiles['userEmail'])
        this.profileFormGroup.get('UserEmail').updateValueAndValidity()

        this.profileFormGroup.get('UserPassword').setValue(profiles['userPassword'])
        this.profileFormGroup.get('UserPassword').updateValueAndValidity()

        this.profileFormGroup.get('UserLocation').setValue(profiles['userLocation'])
        this.profileFormGroup.get('UserLocation').updateValueAndValidity()

        this.profileFormGroup.get('selectedCategory').updateValueAndValidity()
      }
    )
  }

  setLocations() {
    this.locationService.getLocations().then(
      result => {
        for (let i = 0; i < result.length; i++) {
          //console.log(result[i]['location']);
          this.locations.push(result[i]['location']);
        }
        this.filteredLocations = this.profileFormGroup.get("UserLocation").valueChanges.pipe(
          startWith(''),
          map(value =>
            this._filter(value))
        );
      }
    );
  }

  _filter(value): string[] {
    const filterValue = value.toLowerCase();
    return this.locations.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }

  getFullNameErrorMessage() {
    if (this.profileFormGroup.get('UserFullName').hasError('required')) {
      return 'Field can\'t be empty';
    }
  }

  getPasswordErrorMessage() {
    if (this.profileFormGroup.get('UserPassword').hasError('required')) {
      return 'Field can\'t be empty';
    }
    return this.profileFormGroup.get('UserPassword').hasError('minlength') ? 'Password is too short (Min 6)' : '';
  }

  getEmailErrorMessage() {
    if (this.profileFormGroup.get('UserEmail').hasError('required')) {
      return 'Email field is empty';
    } else if (this.profileFormGroup.get('UserEmail').hasError('emailExists')) {
      return 'Email already exists';
    }
    return this.profileFormGroup.get('UserEmail').hasError('email') ? 'Not a valid email' : '';
  }

  checkIfEmailExists(data: any) { //Checks if email already exists;
    this.account.checkIfEmailExists(data).then(result => {
      if (result) {
        this.profileFormGroup.get('UserEmail').setErrors({'emailExists': true});
      }
    })

  }

  toggleOffer(offer: any): void { //Chip selector
    let index = this.selectedChips.indexOf(offer);
    //console.log(offer)
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

  get selectedInterests() {
    return this.profileFormGroup.get('selectedCategory');
  }


  isSelected(offer: any): boolean {
    const index = this.selectedChips.indexOf(offer);
    return index >= 0;
  }

  setInterests() {
    this.tags.getTags().then(
      value => {
        this.offers = value;
      });
  }

  updateProfile(value: any) {
    if (this.profileFormGroup.valid) {
      this.account.getProfileGivenUserID(localStorage.getItem('userID')).then(
        profile => {
          profile['fullName'] = value['UserFullName'];
          profile['userPassword'] = value['UserPassword']
          profile['userLocation'] = value['UserLocation']
          let userInterests: string[] = [];
          this.selectedChips.forEach(i => {
            userInterests.push(i['interests']);
          })
          profile['interests'] = userInterests;
          this.account.updateProfile(profile).then(
            () => {
              this.openSnackBar("Successfully updated profile", "", 4000)
            }
          )
        }
      )
    }
  }

  openSnackBar(message: string, action: string, duration: number) {
    this._snackBar.open(message, action, {
      duration: duration,
    });
  }
}
// this.profileFormGroup = new FormGroup({
//   UserFullName: new FormControl('',Validators.required),
//   UserEmail: new FormControl({value: '', disabled: true},[Validators.required,Validators.email]),
//   UserPassword: new FormControl('',Validators.required),
//   selectedCategory: new FormControl('',Validators.required),
//   UserLocation: new FormControl('',Validators.required),
// });
