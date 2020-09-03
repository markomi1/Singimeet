import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EventCreateComponent} from '../event-create/event-create.component';

@Component({
  selector: 'app-check-image',
  templateUrl: './check-image.component.html',
  styleUrls: ['./check-image.component.css']
})
export class CheckImageComponent implements OnInit {
  imageUrl: any;

  constructor(public dialogRef: MatDialogRef<EventCreateComponent>, @Inject(MAT_DIALOG_DATA) public data: string) { }

  ngOnInit(): void {
    console.log(this.dialogRef);
    this.imageUrl = this.data;
  }

}
