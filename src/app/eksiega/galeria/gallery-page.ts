import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-gallery-page',
  styleUrl: './gallery-page.scss',
  templateUrl: './gallery-page.html',
})
export class GalleryPage {
  protected readonly photos = [
    { src: 'assets/hero-image.svg', alt: 'Placeholder zdjęcia numer 1', label: 'Chrzest Święty' },
    {
      src: 'assets/hero-image.svg',
      alt: 'Placeholder zdjęcia numer 2',
      label: 'Pierwsze urodziny',
    },
    {
      src: 'assets/hero-image.svg',
      alt: 'Placeholder zdjęcia numer 3',
      label: 'Wspólne świętowanie',
    },
  ];
}
