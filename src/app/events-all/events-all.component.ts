import { Component, OnInit } from '@angular/core';
import {EventServiceService} from '../event-service.service';
import {BehaviorSubject} from 'rxjs';
import {MainPageComponent} from '../main-page/main-page.component';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {AppComponent} from '../app.component';


@Component({
  selector: 'app-events-all',
  templateUrl: './events-all.component.html',
  styleUrls: ['./events-all.component.css']
})
export class EventsAllComponent implements OnInit {
  events: any;
  eventsFilter: any;
  message: string

  constructor(private eventsService: EventServiceService,private data: MainPageComponent,public router: Router,private mainApp: AppComponent) {
    window['eventsAllComponent'] = this; //For calling TypeScript functions in browser console
  }

  ngOnInit(): void {

    this.data.currentMessage.subscribe(
      value => {
        if(value == undefined || value == '') return;

        if(value['searchQuery'].length >= 3) {//If it's greater than 3 char it gets sent to the eventsAll
          this.filterEvents(value['searchQuery'])
        }else{
          this.setEvents({flag: true, eventsList: ''});
        }
      }
    )
    this.setEvents({flag: true, eventsList: ''});

  }



  openDialog(eventID: string) {
    this.mainApp.canGoBack = true;
    this.router.navigate(['/event',eventID])
  }

  setEvents({flag, eventsList}: { flag: boolean, eventsList: any }){
    if (flag){
      this.eventsService.getAllEvents().then(
        result => {
          this.events = result;
          this.eventsFilter = result;
        }
      )
    }else{
      if(eventsList != ''){
        this.events = eventsList;
      }
    }
  }

  filterEvents(eventName: string){
    let filter = this.eventsFilter.filter(
      function(event) {
        if( event.eventName.toLowerCase().includes(eventName.toLowerCase())){
          return event
        }
      }
    )
    //console.log(filter)
    this.setEvents({flag: false, eventsList: filter});
  }

}
