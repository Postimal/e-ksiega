import { Component, Input } from '@angular/core';

export interface WishItem {
  author: string;
  text: string;
}

@Component({
  selector: 'app-wishes-print',
  templateUrl: './wishes-print.html',
  styleUrls: ['./wishes-print.scss'],
})
export class WishesPrintComponent {
  @Input() wishes: WishItem[] = [];
}
