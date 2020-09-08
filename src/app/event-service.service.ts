import {Injectable} from '@angular/core';
import {NgxIndexedDBService} from 'ngx-indexed-db';
import {AccountService} from './account.service';
import {async} from 'rxjs/internal/scheduler/async';

@Injectable({
  providedIn: 'root'
})
export class EventServiceService {

  constructor(private dbService: NgxIndexedDBService,private account: AccountService) {
    window['eventService'] = this; //For calling TypeScript functions in browser console

  }




  getAllEvents(){
    return this.dbService.getAll('events').then(
      async result => {
        let toReturnEvents: any[] = [];
        for (let i = 0; i < result.length; i++) {
          if(result[i]['isActive']){
            if(result[i]['eventStartDate'] > Date.now()){
                toReturnEvents.push(result[i])
            }else{
              // event is over date
              result[i]['isActive'] = false; //deactivate the event
              await this.updateEventAttendeesStatus(result[i]['attendees'],result[i]['eventID']) //update attendees
              this.updateEventGivenEven(result[i]) //update the event
            }
          }
        }
        return toReturnEvents;
      }
    )
  }
  sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

  //Loads of awaits here because it's too fast
  async updateEventAttendeesStatus(attendeesList: any[],eventID:string){
    for (let i = 0; i < attendeesList.length; i++){
      //this.sleep(1000);
      await this.account.getProfileGivenUserID(attendeesList[i]).then(
       async profile => {
          if(profile['reservedEvents'].indexOf(eventID) != -1){
            let indexToSplice = profile['reservedEvents'].indexOf(eventID)

            profile['reservedEvents'].splice(indexToSplice,1)
          }
          if(profile['beenToEvents'].indexOf(eventID) == -1){
            profile['beenToEvents'].push(eventID)
          }
          // console.log(profile['beenToEvents'].indexOf(eventID))
          // profile['beenToEvents'].push(eventID);
          await this.account.updateProfile(profile);
        }
      )
    }
  }
  //Gets the list of attendees for given eventID
  getAttendeesListGivenEventID(eventID: string){
    return this.dbService.getByIndex('events', 'eventID', eventID).then(
      result => {
        if(result != undefined){
          return result['attendees']
        }
      }
    )
  }
  //Returns the event object given eventID
  getEventGivenEventID(eventID: string){
    return this.dbService.getByIndex('events', 'eventID', eventID).then(
      result => {
        if(result != undefined){
          return result
        }
      }
    )
  }


  //Adds the user to the event attendees list
  addUserToEvent(userID: string, eventKey: string,eventID: string){
   return this.getEventGivenEventID(eventID).then(
      result => {
        if(result['isActive']){
          result['attendees'].push(userID)
          this.dbService.update('events',result ).then(
            () => {
              console.log("Successfully updated")

            }
          )
          this.account.getProfileGivenUserID(userID).then(
            profile => {
              console.log(profile)
              profile['reservedEvents'].push(eventID);
              this.account.updateProfile(profile);
            }
          )
          return true
        }else{
          return false
        }
      }
    )
  }
  //removes the user from the attendees list
  removeUserFromEvent(userID: string, eventID: any) {
    return this.getEventGivenEventID(eventID).then(
      result => {
        if(result['isActive']) {
          let arr = result['attendees'].filter(e => e !== userID); // will return ['A', 'C']
          result['attendees'] = arr;
          this.dbService.update('events', result).then(
            () => {
              console.log("Successfully removed user from the event")
            }
          )
          this.account.getProfileGivenUserID(userID).then(
            profile => {
              let arr = profile['reservedEvents'].filter(e => e !== eventID);
              profile['reservedEvents'] = arr;
              this.account.updateProfile(profile);
            }
          )
          return true
        }else {
          return false
        }
      }
    )
  }

  //deletes the event given eventKey
  //It firsts removes the event from the reservedEvents list from each of attendees, then deletes the event
  deleteEventGivenEventKey(eventKey:string){
     this.dbService.getByKey('events',eventKey).then(
      result => {
        let attendees = result['attendees']
        for (let i = 0; i < attendees.length; i++) {
          this.account.getProfileGivenUserID(attendees[i]).then(
            profile => {
              let reservedEventsArray = profile['reservedEvents'].filter(e => e !== result['eventID']);
              let beenToEventsArray = profile['beenToEvents'].filter(e => e !== result['eventID']); //New
              profile['reservedEvents'] = reservedEventsArray;
              profile['beenToEvents'] = beenToEventsArray; //New
              this.account.updateProfile(profile);
            }
          );
        }
      }
    )


    return this.dbService.delete('events', eventKey ).then(
      () => {
        return true;
      }
    )
  }

  getAllEventsNameOnly(){
    return this.dbService.getAll('events',).then(
      result => {
        let eventNamesArray = []
        for (let event of result){
          eventNamesArray.push(event['eventName'])
        }
        return eventNamesArray;
      },
      error => {
        console.error(error);
      }
    )
  }


  makeEvent(eventName: string,eventPictureUrl: string,eventCreatorID: string,
            eventShortDescription: string,eventHTMLDescription: string,eventStartDate:string,eventEndDate:string,
            eventLocation:string,eventAddresses:string,eventCategory:string){
    let creatorUserID = localStorage.getItem('userID');
    let event = {
      "eventID" : this.account.makeRandomString(24),
      "eventName": eventName,
      "eventPictureURL": eventPictureUrl,
      "eventCreatorID": creatorUserID,
      "eventCardDescription": eventShortDescription,
      "eventDescription": eventHTMLDescription,
      "eventComments": [],
      "eventStartDate": eventStartDate,
      "eventEndDate": eventEndDate,
      "eventLocation": eventLocation,
      "eventAddress": eventAddresses,
      "eventCategory": eventCategory,
      "attendees" : [creatorUserID],
      "isActive": true
    }

    this.dbService.add('events',event).then(
      res => {
        console.log('Successfully added event ' + res);
      }
    )
    this.account.getProfileGivenUserID(eventCreatorID).then(
      profile => {
        profile['reservedEvents'].push(event['eventID'])
        this.account.updateProfile(profile)
      }
    )
  }

  private updateEventGivenEven(event: any){
    this.dbService.update('events',event).then(
      () => {
        console.log("Event has been updated directly")
      }
    )
  }

  updateEvent(eventID:string, eventName: string,eventPictureUrl: string,
              eventShortDescription: string,eventHTMLDescription: string,eventStartDate:string,eventEndDate:string,
              eventLocation:string,eventAddresses:string,eventCategory:string) {
    this.getEventGivenEventID(eventID).then(
      result => {
        let creatorID = result.eventCreatorID;
        let attendees = result.attendees;
        let comments = result.eventComments;

          result["eventID"] = eventID
          result["eventName"] =  eventName
          result["eventPictureURL"] =  eventPictureUrl
          result["eventCreatorID"] =  creatorID
          result["eventCardDescription"] =  eventShortDescription
          result["eventDescription"] =  eventHTMLDescription
          result["eventComments"] =  comments
          result["eventStartDate"] =  eventStartDate
          result["eventEndDate"] =  eventEndDate
          result["eventLocation"] =  eventLocation
          result["eventAddress"] =  eventAddresses
          result["eventCategory"] =  eventCategory
          result["attendees"] =  attendees
          result["isActive"] =  true


        console.log(result)
        this.dbService.update('events', result).then(
          () => {
            console.log("Updated event");
          },
          error => {
            console.error(error);
          }
        )
      }
    )

  }

// { name: 'eventID', keypath: 'eventID', options: { unique: true } },
// { name: 'eventName', keypath: 'eventName', options: { unique: false } },
// { name: 'eventPictureURL', keypath: 'eventPictureURL', options: { unique: false } },
// { name: 'eventCreatorID', keypath: 'eventCreatorID', options: { unique: false } },
// { name: 'eventCardDescription', keypath: 'eventCardDescription', options: { unique: false } },
// { name: 'eventDescription', keypath: 'eventDescription', options: { unique: false } },
// { name: 'eventComments', keypath: 'eventComments', options: { unique: false } },
// { name: 'eventStartDate', keypath: 'eventStartDate', options: { unique: false } },
// { name: 'eventEndDate', keypath: 'eventEndDate', options: { unique: false } },
// { name: 'eventLocation', keypath: 'eventLocation', options: { unique: false } },
// { name: 'eventAddress', keypath: 'eventAddress', options: { unique: false } },
// { name: 'eventCategory', keypath: 'eventCategory', options: { unique: false } },
// { name: 'eventTags', keypath: 'eventTags', options: { unique: false } },
// { name: 'attendees', keypath: 'attendees', options: { unique: false } },
// { name: 'isActive', keypath: 'isActive', options: { unique: false } },


  addCommentToEvent(eventID: string, userID: string, comment: any) {
    return this.getEventGivenEventID(eventID).then(
      result => { //We get the instance of that even using eventID
        let arr = result['eventComments']; //We extract current arr of comments
        this.account.getUserFullName().then( //We get the user Full Name
          fullNameresult => {
            let com = { //Construct the comment format
              commentAuthor: fullNameresult,
              commentContent: comment
            }
            arr.push(com); //Push it onto the existing arr of comments
            result['eventComments'] = arr; //Then we set it
            this.dbService.update('events', result).then( //And update the indexedDB
              () => {
                console.log("Added comment to event")
              }
            )
          }
        )
      }
    )
  }
}
