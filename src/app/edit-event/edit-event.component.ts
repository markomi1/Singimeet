import {Component, OnInit, ViewChild} from '@angular/core';
import {NGX_MAT_DATE_FORMATS, NgxMatDateFormats} from '@angular-material-components/datetime-picker';
import {Observable} from 'rxjs';
import {LocationService} from '../location.service';
import {AccountService} from '../account.service';
import {CategoryService} from '../category.service';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {EventServiceService} from '../event-service.service';
import {CKEditorComponent} from '@ckeditor/ckeditor5-angular';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {map, startWith} from 'rxjs/operators';
import {CheckImageComponent} from '../check-image/check-image.component';
import {ActivatedRoute} from '@angular/router';




const CUSTOM_DATE_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: "l, LT"
  },
  display: {
    dateInput: "ll, HH:mm",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MM YYYY"
  }
};

@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.css'],
  providers: [{provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS}]
})
export class EditEventComponent implements OnInit {
  locations: string[] = [];
  categories: string[] = [];
  filteredLocations: Observable<string[]>;
  filteredCategories: Observable<string[]>;
  public showSpinners = true;
  public minDate: Date;
  public Editor = ClassicEditor;
  @ViewChild( 'editor' ) editorComponent: CKEditorComponent;
  eventCreateForm: FormGroup;
  minDate2: Date;
  editorData: any;
  eventID: string;
  constructor(private activeRoute: ActivatedRoute,private locationService: LocationService, private account: AccountService,
              private categoryService: CategoryService,public dialog: MatDialog,private _snackBar: MatSnackBar,private eventService: EventServiceService) {
    window['editEventComponent']  = this; //For calling TypeScript functions in browser console
  }

  ngOnInit(): void {
    this.minDate = new Date();
    // this.editorData = "<p>Event content here</p>";
    this.setLocations();
    this.setCategories();
    this.eventCreateForm = new FormGroup({
      eventName: new FormControl('',[Validators.required]),
      eventPictureURL: new FormControl('',[Validators.required,Validators.pattern(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@%!\$&'\(\)\*\+,;=.]+$/)]),
      eventCardDescription: new FormControl('',[Validators.required]),
      startDate: new FormControl('',[Validators.required]),
      endDate: new FormControl({value: '', disabled: true}, Validators.required),
      eventLocation: new FormControl('',Validators.required),
      eventAddress: new FormControl('',Validators.required),
      eventCategory: new FormControl('',Validators.required),
    });
    this.loadEventDataIn()
  }

  loadEventDataIn(){
    this.eventID = this.activeRoute.snapshot.paramMap.get("eventID");
    this.eventService.getEventGivenEventID(this.eventID).then(
      result => {
        this.eventCreateForm.get('eventName').setValue(result.eventName)
        this.eventCreateForm.get('eventPictureURL').setValue(result.eventPictureURL)
        this.eventCreateForm.get('eventCardDescription').setValue(result.eventCardDescription)
        this.eventCreateForm.get('startDate').setValue(result.eventStartDate )

        this.eventCreateForm.get('endDate').setValue(result.eventEndDate)
        this.eventCreateForm.get('eventLocation').setValue(result.eventLocation)
        this.eventCreateForm.get('eventAddress').setValue(result.eventAddress)
        this.eventCreateForm.get('eventCategory').setValue(result.eventCategory)
        this.getEditor().setData(result.eventDescription)
      }
    )
  }

  editEvent(value: any) {
    if(this.eventCreateForm.valid){
      if(this.getEditor().getData() != ""){
        let eventName = value['eventName'];
        let eventPictureUrl = value['eventPictureURL'];
        let eventCardDescription = value['eventCardDescription'];
        let eventLocation = value['eventLocation'];
        let eventAddress = value['eventAddress'];
        let eventCategory = value['eventCategory'];
        let startDate = value['startDate'].valueOf(); //Gets the UNIX timestamp
        let endDate = value['endDate'].valueOf();
        let editorContent = this.getEditor().getData();
        this.eventService.updateEvent(this.eventID,eventName,eventPictureUrl,eventCardDescription,editorContent,startDate,endDate,eventLocation,eventAddress,eventCategory)
        this.openSnackBar("Successfully edited event", "", 2000)
      }else{
        this.openSnackBar("Editor is empty","", 5000)
      }
    }else{
      this.openSnackBar("Some fields are invalid","",5000);
    }
  }
  openSnackBar(message: string, action: string, duration: number) {
    this._snackBar.open(message, action, {
      duration: duration,
    });
  }
  closedEvent(){
    if(this.eventCreateForm.get('startDate').valid){
      this.minDate2 = this.eventCreateForm.get('startDate').value;
      this.eventCreateForm.get('endDate').enable();
      this.eventCreateForm.get('endDate').updateValueAndValidity()
    }
  }
  public getEditor() {
    // Warning: This may return "undefined" if the editor is hidden behind the `*ngIf` directive or
    // if the editor is not fully initialised yet.
    return this.editorComponent.editorInstance;
  }

  checkImage() {
    let pictureUrl = this.eventCreateForm.get('eventPictureURL').value; //Gets the image URL and passes it to the dialog
    this.dialog.open(CheckImageComponent, {
      height: '400px',
      width: '600px',
      data: pictureUrl
    });
  }
  setLocations(){
    this.locationService.getLocations().then(
      result => {
        for (let i = 0; i < result.length; i++) {
          //console.log(result[i]['location']);
          this.locations.push(result[i]['location']);
        }
        this.filteredLocations = this.eventCreateForm.get('eventLocation').valueChanges.pipe(
          startWith(''),
          map(value =>
            this._filterLocations(value))
        );
      }
    );

  }
  setCategories(){
    this.categoryService.getTags().then(
      result => {
        for (let i = 0; i < result.length; i++) {
          //console.log(result[i]['location']);
          this.categories.push(result[i]['interests']);
        }
        this.filteredCategories = this.eventCreateForm.get('eventCategory').valueChanges.pipe(
          startWith(''),
          map(value =>
            this._filterCategories(value))
        );
      }
    )
  }
  _filterLocations(value): string[] {
    const filterValue = value.toLowerCase();
    return this.locations.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }
  _filterCategories(value): string[] {
    const filterValue2 = value.toLowerCase();
    return this.categories.filter(option => option.toLowerCase().indexOf(filterValue2) === 0);
  }


}
