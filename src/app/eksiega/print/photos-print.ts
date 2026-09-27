import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-photos-print',
  templateUrl: './photos-print.html',
  styleUrls: ['./photos-print.scss'],
})
export class PhotosPrintComponent {
  @Input() photos: string[] = [];
}
