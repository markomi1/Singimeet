import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NgxIndexedDBService} from 'ngx-indexed-db';




@Component({
  selector: 'app-debug-component',
  templateUrl: './debug-component.component.html',
  styleUrls: ['./debug-component.component.css']
})
export class DebugComponentComponent implements OnInit {

  constructor(private http: HttpClient,private  dbService: NgxIndexedDBService,) {
    window['debugComponent'] = this; //For calling TypeScript functions in browser console
  }

  ngOnInit(): void {
  }

  loadLocationsIntoDB(){
    this.http.get<any>('/assets/locations.json').subscribe((res)=>{
        console.log(res)
        for (let i=0; i< res.length; i++) {
          console.log(res[i]);
          this.dbService.add('locations',res[i]).then(
            result => {
              console.log("Successfully loaded locations into database")
            }
          )
        }
      },
        error => {
            console.error(error)
        })

  }

  loadAccountIntoDB(){
    this.http.get<any>('/assets/accounts.json').subscribe((res)=>{
        console.log(res)
        for (let i=0; i< res.length; i++) {
          console.log(res[i]);
          this.dbService.add('accounts',res[i]).then(
            result => {
              console.log("Successfully loaded Accounts into database")
            }
          )
        }
      },
      error => {
        console.error(error)
      })

  }

  loadTagsIntoDB(){
    this.http.get<any>('/assets/tags.json').subscribe((res)=>{
        console.log(res)
        for (let i=0; i< res.length; i++) {
          console.log(res[i]);
          this.dbService.add('tags',res[i]).then(
            result => {
              console.log("Successfully loaded Tags into database")
            }
          )
        }
      },
      error => {
        console.error(error)
      })
  }

  loadEventsIntoDB(){
    this.http.get<any>('/assets/events.json').subscribe((res)=>{
        console.log(res)
        for (let i=0; i< res.length; i++) {
          //console.log(res[i]);
          this.dbService.add('events',res[i]).then(
            result => {
              console.log("Successfully loaded events into database")
            }
          )
        }
      },
      error => {
        console.error(error)
      })
  }
}
