import { Component, OnInit } from '@angular/core';
import {EventServiceService} from '../event-service.service';

@Component({
  selector: 'app-events-recommended',
  templateUrl: './events-recommended.component.html',
  styleUrls: ['./events-recommended.component.css']
})
export class EventsRecommendedComponent implements OnInit {
  events: any;

  constructor(private eventsService: EventServiceService) { }

  ngOnInit(): void {
    this.eventsService.getAllEvents().then(
      result => {
        this.events = result;
      }
    )
  }

}
