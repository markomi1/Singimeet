import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import {AppRoutingModule, routingComponents} from './app-routing.module';
import { AppComponent } from './app.component';
import {DBConfig, NgxIndexedDBModule} from 'ngx-indexed-db';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MaterialModule} from './material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AccountService} from './account.service';
import {AuthGuard} from './auth.guard';
import {HttpClientModule} from '@angular/common/http';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { EventsAllComponent } from './events-all/events-all.component';
import { EventsRecommendedComponent } from './events-recommended/events-recommended.component';
import { LocationAutoCompleteComponent } from './location-auto-complete/location-auto-complete.component';
import {EventCreateComponent} from './event-create/event-create.component';
import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule
} from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule} from '@angular-material-components/moment-adapter';
import { CheckImageComponent } from './check-image/check-image.component';
import {MatDialogModule} from '@angular/material/dialog';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { EventPageComponent } from './event-page/event-page.component';
import { EditEventComponent } from './edit-event/edit-event.component';
import { ReservedEventsComponent } from './reserved-events/reserved-events.component';
import {MatTableModule} from '@angular/material/table';

const dbConfig: DBConfig  = {
  name: 'MarkoMitrovic',
  version: 1,
  objectStoresMeta: [{
    store: 'accounts',
    storeConfig: { keyPath: 'user_id', autoIncrement: true },
    storeSchema: [
      {name: 'uniqueUserID', keypath : 'uniqueUserID', options: {unique: true}},
      { name: 'fullName', keypath: 'fullName', options: { unique: false } },
      { name: 'userEmail', keypath: 'userEmail', options: { unique: true } },
      { name: 'userPassword', keypath: 'userPassword', options: { unique: false } },
      { name: 'userLocation', keypath: 'userLocation', options: { unique: false } },
      { name: 'reservedEvents', keypath: 'reservedEvents', options: { unique: false } },
      { name: 'beenToEvents', keypath: 'beenToEvents', options: { unique: false } },
      { name: 'interests', keypath: 'preferences', options: { unique: false } }
    ]
  },{
    store: 'locations',
    storeConfig: { keyPath: 'location_id', autoIncrement: true },
    storeSchema: [
      { name: 'location', keypath: 'location', options: { unique: false } }
    ]
  },{
    store: 'tags',
    storeConfig: { keyPath: 'tags_id', autoIncrement: true },
    storeSchema: [
      { name: 'interests', keypath: 'interests', options: { unique: true } }
    ]
  },{
    store: 'events',
    storeConfig: { keyPath: 'events_id', autoIncrement: true },
    storeSchema: [
      { name: 'eventID', keypath: 'eventID', options: { unique: true } },
      { name: 'eventName', keypath: 'eventName', options: { unique: false } },
      { name: 'eventPictureURL', keypath: 'eventPictureURL', options: { unique: false } },
      { name: 'eventCreatorID', keypath: 'eventCreatorID', options: { unique: false } },
      { name: 'eventCardDescription', keypath: 'eventCardDescription', options: { unique: false } },
      { name: 'eventDescription', keypath: 'eventDescription', options: { unique: false } },
      { name: 'eventComments', keypath: 'eventComments', options: { unique: false } },
      { name: 'eventStartDate', keypath: 'eventStartDate', options: { unique: false } },
      { name: 'eventEndDate', keypath: 'eventEndDate', options: { unique: false } },
      { name: 'eventLocation', keypath: 'eventLocation', options: { unique: false } },
      { name: 'eventAddress', keypath: 'eventAddress', options: { unique: false } },
      { name: 'eventCategory', keypath: 'eventCategory', options: { unique: false } },
      { name: 'attendees', keypath: 'attendees', options: { unique: false } },
      { name: 'isActive', keypath: 'isActive', options: { unique: false } },
    ]
  }]
};


@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    EventsAllComponent,
    EventsRecommendedComponent,
    LocationAutoCompleteComponent,
    EventCreateComponent,
    CheckImageComponent,
    UserProfileComponent,
    EventPageComponent,
    EditEventComponent,
    ReservedEventsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgxIndexedDBModule.forRoot(dbConfig),
    MaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CKEditorModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule,
    NgxMatMomentModule,
    MatDialogModule,
    MatTableModule,
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private accManagment: AccountService) {
  }
}
