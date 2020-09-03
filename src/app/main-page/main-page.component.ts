import {Component, OnInit, ViewChild} from '@angular/core';

import {ChangeEvent, CKEditorComponent} from '@ckeditor/ckeditor5-angular';
import {ComponentPortal, Portal} from '@angular/cdk/portal';
import {EventsRecommendedComponent} from '../events-recommended/events-recommended.component';
import {EventsAllComponent} from '../events-all/events-all.component';
import {map, startWith} from 'rxjs/operators';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {BehaviorSubject, Observable} from 'rxjs';
import {LocationService} from '../location.service';
import {AccountService} from '../account.service';
import {EventServiceService} from '../event-service.service';
@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {

  constructor(private locationService: LocationService, private account: AccountService,private eventService: EventServiceService) {
    window['mainPageComponent'] = this; //For calling TypeScript functions in browser console

  }
  @ViewChild( 'editor' ) editorComponent: CKEditorComponent;

  events = []
  searchValue: string;

  locations: string[] = [];

  filteredLocations: Observable<string[]>;


  private messageSource = new BehaviorSubject<string>("");
  currentMessage = this.messageSource.asObservable();

  searchForm: FormGroup;
  loadAllEventsFlag: boolean = false;
  loadRecommendedEventsFlag: boolean = false;
  loadLocationEvents:boolean = false;
  ngOnInit(): void {
    this.account.getCurrentLoggedInUserLocation().then( //Setting the location search to users current location
      result => {
        this.searchForm.get('locationInput').setValue(result)
        this.searchForm.get('locationInput').updateValueAndValidity()
      }
    )
    this.loadAllEventsFlag = true;
    this.searchForm = new FormGroup({ //Setting up the search form
      searchedValue: new FormControl('',Validators.required),
      locationInput:  new FormControl('')
    });




    //this.loadAllEvents();

    this.searchForm.get('searchedValue').valueChanges.subscribe(
      result => {
        let query = {
          searchQuery: result
        }
        if(result != undefined){ //It's undefined on the page load
          this.filterEvents(query);
        }
      }
    )

  }

  filterEvents(searchQueryAndLocation: any){
      this.messageSource.next(searchQueryAndLocation)
  }
  changeView(buttonName: string){

      switch (buttonName) {
        case 'all':
          this.loadAllEventsFlag = true;
          this.loadRecommendedEventsFlag = false;
          this.loadLocationEvents = false;
          break;
        case 'recommended':
          this.loadAllEventsFlag = false;
          this.loadRecommendedEventsFlag = true;
          this.loadLocationEvents = false;
          break;
        case 'location':
          this.loadAllEventsFlag = false;
          this.loadRecommendedEventsFlag = false;
          this.loadLocationEvents = true;
          break;
      }

  }
  ngAfterViewInit(): void {
    this.setLocations();


  }

  loadAllEvents(){
    this.eventService;
  }

  setLocations(){
    this.locationService.getLocations().then(
      result => {
        for (let i = 0; i < result.length; i++) {
          //console.log(result[i]['location']);
          this.locations.push(result[i]['location']);
        }
        this.filteredLocations =  this.searchForm.get('locationInput').valueChanges.pipe(
          startWith(''),
          map(value =>
            this._filterLocation(value))
        );
      }
    );
  }
  _filterLocation(value): string[] {
    const filterValue = value.toLowerCase();
    return this.locations.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }

  searchOnChange($event: Event) {
      console.log($event)
  }
}
