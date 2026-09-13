import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-wishes-renderer',
  templateUrl: './wishes-renderer.html',
  styleUrl: './wishes-renderer.scss',
})
export class WishesRenderer {
  @Input({ required: true }) photoUrl = '';
  @Input() wishes = '';
  @Input() signature = '';
  @Input() decoration: 'balloons' | 'stars' | 'none' = 'balloons';
}
