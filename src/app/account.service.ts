import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
// @ts-ignore
export class AccountService {

  constructor(private dbService: NgxIndexedDBService) {
    window['accountService'] = this;
  }


  createProfile(userFullName: string,userEmail: string, userPassword: string,userLocation: string,interests: any){
    const user: any = { "uniqueUserID" : this.makeRandomString(12),
                        "fullName" : userFullName,
                        "userEmail" : userEmail,
                        "userPassword" : userPassword,
                        "userLocation" : userLocation,
                        "reservedEvents" :  [],
                        "beenToEvents" :  [],
                        "interests" : interests
    };
    return this.dbService.add('accounts', user).then(
      result => {
        console.log("Successfully added user to database");
        return user['uniqueUserID']
      },
      error => console.error
    );
  }
  makeRandomString(lengthOfCode: number) {
   let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let text = "";
    for (let i = 0; i < lengthOfCode; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }


  checkUserEmailAndPassword(store: string, email: string, password: string) {
    return this.dbService.getByIndex(store, 'userEmail', email).then(
      person => {
        if(person == undefined) return false;
        return person.userPassword == password;
      },
      error => {
        console.log(error);
        return false;
      },
    );
  }
    getProfileGivenEmail(store: string, email: string, password: string) {
    return this.dbService.getByIndex(store, 'email', email).then(
      person => {
        console.log(person)
        return person != undefined;
      },
      error => {
        console.log(error);
        return false;
      },
    );
  }

  getUserFullName(){
    let userID = localStorage.getItem("userID");
    return this.dbService.getByIndex('accounts','uniqueUserID' ,userID).then(
      person => {
        return person.fullName;
      },
      error => {
        console.log(error);
      }
    );
  }

  getAllFromStore(data: string){
    this.dbService.getAll(data).then(
      people => {
        console.log(people);
      },
      error => {
        console.log(error);
      }
    );
  }

  getCurrentLoggedInUserLocation(){
    let userID = localStorage.getItem("userID");
    return this.dbService.getByIndex('accounts', 'uniqueUserID', userID).then(
      person => {
        if(person != undefined){
          return person.userLocation;
        }else{
          return ;
        }
      },
      error => {
        console.log(error);
        return false;
      },
    );
  }

  isLoggedIn(){
    let userID = localStorage.getItem("userID");
    if(userID == null || userID == ''){
      return false;
    }
    return this.dbService.getByIndex('accounts', 'uniqueUserID', userID).then(
      person => {
        //console.log(person)
        return person != undefined;
      },
      error => {
        console.log(error);
        return false;
      },
    );
  }



  updateGivenId(store: string, index: number, newName: string, newEmail: string){
    this.dbService.update(store, { id: index, name: newName, email: newEmail }).then(
      () => {
        console.log('Update done');
      },
      error => {
        console.log(error);
      }
    );
  }


  checkIfEmailExists(loginEmail: string) {
    return this.dbService.getByIndex('accounts', 'userEmail', loginEmail).then(
      person => {
        //console.log(person)
        return person != undefined;
      },
      error => {
        console.log(error);
        return false;
      },
    );
  }

  async updateProfile(profile: any){
    return await this.dbService.update('accounts', profile).then(
      () => {
        console.log('Profile update done');
      }
    )
  }

  getUserIDForGivenEmail(loginEmail: string) {
    return this.dbService.getByIndex('accounts', 'userEmail', loginEmail).then(
      person => {
        if( person != undefined){
          return person.uniqueUserID;
        }
        return '';
      },
      error => {
        console.log(error);
        return false;
      },
    );
  }

  getProfileGivenUserID(userID: string) {
    return this.dbService.getByIndex('accounts', 'uniqueUserID',userID).then(
      result => {
        return result;
      }
    )
  }
}
