import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {EventServiceService} from '../event-service.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-event-page',
  templateUrl: './event-page.component.html',
  styleUrls: ['./event-page.component.scss']
})
export class EventPageComponent implements OnInit {
  event: any = [];
  eventID: string;
  userID: string;
  reserveButtonText: any;
  reserveButtonFlag:boolean = false;
  numberOfParticipants: number = 0;
  eventComments: any;
  comment: any;
  areThereComments: any;
  commentForm = new FormControl('', [Validators.required]);
  commentButtonDisableFlag:boolean = false;
  constructor(private activeRoute: ActivatedRoute,private eventService: EventServiceService,private _snackBar: MatSnackBar, private router:Router) {
    window['eventPageComponent'] = this; //For calling TypeScript functions in browser console

  }

  ngOnInit(): void {
    this.userID = localStorage.getItem('userID');
    this.eventID = this.activeRoute.snapshot.paramMap.get("eventID");
    this.eventService.getEventGivenEventID(this.eventID).then(
      result => {
        this.event = result;
        this.numberOfParticipants = result['attendees'].length;
        console.log(result['eventComments'])
        if(result['eventComments'].length > 0){
          this.eventComments = result['eventComments']
          this.areThereComments = true;
        }else{
          this.areThereComments = false;
        }

      }
    )

    this.checkIfUserAlreadyReserved()
  }

  checkIfUserAlreadyReserved(){
    this.eventService.getAttendeesListGivenEventID(this.eventID).then(
      result => {
        for (let i = 0; i < result.length; i++) {
          if(result[i].toLowerCase().includes(this.userID.toLowerCase())){
            this.reserveButtonText = "Unreserve";
            if(this.event['eventCreatorID'] == this.userID){
              this.reserveButtonFlag = true;
            }
            break;
          }else{
            this.reserveButtonText = "Reserve";
            this.reserveButtonFlag = false;
          }
        }
      }
    )
  }

  reserveEvent() {
    if(this.reserveButtonText == "Reserve"){
      this.eventService.addUserToEvent(this.userID,this.event['events_id'],this.eventID).then(
       result => {
         if(result){
           this.reserveButtonText = "Unreserve"
           this.numberOfParticipants += 1;
           this.openSnackBar("Successfully reserved","",2000)
         }else{
           this.openSnackBar("Event expired, you can't reserve","",2000)
         }
        }
      )
    }else{
      this.eventService.removeUserFromEvent(this.userID,this.eventID).then(
        result => {
          if(result) {
            this.reserveButtonText = "Reserve"
            this.numberOfParticipants -= 1;
            this.openSnackBar("Successfully un-reserved", "", 2000)
          }else{
            this.openSnackBar("Event expired, you can't un-reserve","",2000)
          }
        }
      )
    }

  }

  deleteEvent() {
    this.eventService.deleteEventGivenEventKey(this.event['events_id']).then(
      result => {
        this._snackBar.open("Event has been deleted","", {
          duration: 2000,
        });
      }
    )
  }


  addComment() {
    let comment = this.commentForm.value
    this.eventService.addCommentToEvent(this.eventID,this.userID,comment).then(
      () => {
        this.openSnackBar("Comment posted, refresh to see it","",2000);
        this.commentButtonDisableFlag = true;
    }
    )
  }

  openSnackBar(message: string, action: string, duration: number) {
    this._snackBar.open(message, action, {
      duration: duration,
    });
  }
  editEvent() {
    this.router.navigate(['/editEvent',this.eventID])
  }
}
