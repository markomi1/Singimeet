import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {EventServiceService} from '../event-service.service';
import {AccountService} from '../account.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AppComponent} from '../app.component';


const ELEMENT_DATA: any[] = [{
  startTime: 'eventStartDate',
  endTime: 'eventEndDate',
  eventLocation: 'eventLocation',
  eventGoto: 'eventID'
}
];


@Component({
  selector: 'app-reserved-events',
  templateUrl: './reserved-events.component.html',
  styleUrls: ['./reserved-events.component.css']
})
export class ReservedEventsComponent implements OnInit {
  displayedColumns: string[] = [ 'EventName', 'StartTime','EndTime', 'Location', 'Goto'];
  reservedEvents:any[] = [];
  beenToEvents:any = [];
  userID: string;
  constructor(private  eventService:EventServiceService,private accountService:AccountService,
              private cdr: ChangeDetectorRef,public router: Router) {
    window['reservedEventsComponent'] = this; //For calling TypeScript functions in browser console

  }

  ngOnInit(): void {
    this.userID = localStorage.getItem('userID')
    this.accountService.getProfileGivenUserID(this.userID).then(
      profile => {
        let listOfEvents = profile['reservedEvents'];
        let listOfBeenToEvents = profile['beenToEvents'];
        for (let i = 0; i < listOfEvents.length; i++) {
          this.eventService.getEventGivenEventID(listOfEvents[i]).then(
            result => {
              let event = {eventName: result['eventName'],
                  startTime: result['eventStartDate'],
                  endTime: result['eventEndDate'],
                  eventLocation: result['eventLocation'],
                  eventGoto: result['eventID']}
                  console.log(event)
                  this.reservedEvents.push(event)
            }
          )
        }
        for (let b = 0; b < listOfBeenToEvents.length; b++){
          this.eventService.getEventGivenEventID(listOfBeenToEvents[b]).then(
            result => {
              let event = {eventName: result['eventName'],
                startTime: result['eventStartDate'],
                endTime: result['eventEndDate'],
                eventLocation: result['eventLocation'],
                eventGoto: result['eventID']}
              console.log(event)
              this.beenToEvents.push(event)
            }
          )
        }
      }
    )
  }

  goToEvent(eventID: any) {

    this.router.navigate(['/event',eventID])
  }
}
