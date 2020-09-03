import { Injectable } from '@angular/core';
import {NgxIndexedDBService} from 'ngx-indexed-db';

@Injectable({
  providedIn: 'root'
})
//@ts-ignore
export class CategoryService {

  constructor(private dbService: NgxIndexedDBService) {
    window['tagsService'] = this;

  }


  getTags(){ //Get's all the locations stored in the DB
    return this.dbService.getAll('tags').then(
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
  addTag(tagName: string){
    let tag = {"interests": tagName}
    this.dbService.add('tags',tag).then(
      () => {
        console.log('Successfully added tag')
      }
    )
  }
}
