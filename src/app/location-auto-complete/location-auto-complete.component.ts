import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {LocationService} from '../location.service';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-location-auto-complete',
  templateUrl: './location-auto-complete.component.html',
  styleUrls: ['./location-auto-complete.component.css']
})
export class LocationAutoCompleteComponent implements OnInit {

  constructor(private locationService: LocationService) { }
  locations: string[] = [];
  filteredLocations: Observable<string[]>;
  locationForm : FormControl;
  ngOnInit(): void {
    this.locationForm = new FormControl('',[Validators.required])
    this.setLocations();
  }


  setLocations(){
    this.locationService.getLocations().then(
      result => {
        for (let i = 0; i < result.length; i++) {
          //console.log(result[i]['location']);
          this.locations.push(result[i]['location']);
        }
        this.filteredLocations = this.locationForm.valueChanges.pipe(
          startWith(''),
          map(value =>
            this._filter(value))
        );
      }
    );
  }
  _filter(value): string[] {
    const filterValue = value.toLowerCase();
    return this.locations.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }
}
