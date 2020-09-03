import { Injectable } from '@angular/core';
import {NgxIndexedDBService} from 'ngx-indexed-db';

@Injectable({
  providedIn: 'root'
})
//@ts-ignore
export class LocationService {

  constructor(private dbService: NgxIndexedDBService) {
    window['locationService'] = this;

  }


  getLocations(){ //Get's all the locations stored in the DB
    return this.dbService.getAll('locations').then(
      success => {
        //console.log(success)
        return success;
      },
      error => {
        console.log(error);
        return [];
      },
    )
  }



}
