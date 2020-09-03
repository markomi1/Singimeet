import {Component, OnInit, ViewChild} from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {ChangeEvent, CKEditorComponent} from '@ckeditor/ckeditor5-angular';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NGX_MAT_DATE_FORMATS, NgxMatDateFormats} from '@angular-material-components/datetime-picker';
import {Observable} from 'rxjs';
import {LocationService} from '../location.service';
import {AccountService} from '../account.service';
import {map, startWith} from 'rxjs/operators';
import {CategoryService} from '../category.service';
import {MatDialog} from '@angular/material/dialog';
import {CheckImageComponent} from '../check-image/check-image.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {EventServiceService} from '../event-service.service';


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
  selector: 'app-event-create',
  templateUrl: './event-create.component.html',
  styleUrls: ['./event-create.component.css'],
  providers: [{provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS}]
})
export class EventCreateComponent implements OnInit {
  locations: string[] = [];
  categories: string[] = [];
  filteredLocations: Observable<string[]>;
  filteredCategories: Observable<string[]>;

  constructor(private locationService: LocationService, private account: AccountService,
              private categoryService: CategoryService,public dialog: MatDialog,private _snackBar: MatSnackBar,private eventService: EventServiceService) {
    window['createEventComponent']  = this; //For calling TypeScript functions in browser console

  }

  public showSpinners = true;
  public minDate: Date;


  public Editor = ClassicEditor;
  @ViewChild( 'editor' ) editorComponent: CKEditorComponent;
  eventCreateForm: FormGroup;
  minDate2: Date;
  ngOnInit(): void {
    this.minDate = new Date();

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

  }
  public getEditor() {
    // Warning: This may return "undefined" if the editor is hidden behind the `*ngIf` directive or
    // if the editor is not fully initialised yet.
    return this.editorComponent.editorInstance;
  }
  public onChange( { editor }: ChangeEvent ) {
    const data = editor.getData();
    this.getEditor().getData()
    console.log( data );
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
  closedEvent(){
   if(this.eventCreateForm.get('startDate').valid){
     this.minDate2 = this.eventCreateForm.get('startDate').value;
     this.eventCreateForm.get('endDate').enable();
     this.eventCreateForm.get('endDate').updateValueAndValidity()
   }
  }

  checkImage() {
    let pictureUrl = this.eventCreateForm.get('eventPictureURL').value; //Gets the image URL and passes it to the dialog
    this.dialog.open(CheckImageComponent, {
      height: '400px',
      width: '600px',
      data: pictureUrl
    });
  }

  makeEvent(value: any) {
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
        let userID = localStorage.getItem('userID');
        let editorContent = this.getEditor().getData();
        this.eventService.makeEvent(
          eventName,
          eventPictureUrl,
          userID,
          eventCardDescription,
          editorContent,
          startDate,
          endDate,
          eventLocation,
          eventAddress,
          eventCategory
        )
        this.openSnackBar("Successfully created event", "", 2000)
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

}
//   eventName: new FormControl('',[Validators.required]),
//   eventPictureURL: new FormControl('',[Validators.required,Validators.pattern(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@%!\$&'\(\)\*\+,;=.]+$/)]),
//   eventCardDescription: new FormControl('',[Validators.required]),
//   startDate: new FormControl('',[Validators.required]),
//   endDate: new FormControl({value: '', disabled: true}, Validators.required),
//   eventLocation: new FormControl('',Validators.required),
//   eventAddress: new FormControl('',Validators.required),
//   eventCategory: new FormControl('',Validators.required),
