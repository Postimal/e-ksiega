import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GuestbookEntryRecord, GuestbookService } from '../../firebase/guestbook.service';

@Component({
  imports: [RouterLink],
  selector: 'app-gallery-page',
  styleUrl: './gallery-page.scss',
  templateUrl: './gallery-page.html',
})
export class GalleryPage {
  protected readonly photos = signal<GuestbookEntryRecord[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  constructor(private readonly guestbookService: GuestbookService) {
    void this.loadPhotos();
  }

  private async loadPhotos(): Promise<void> {
    try {
      this.photos.set(await this.guestbookService.getEntries());
    } catch {
      this.errorMessage.set('Nie udało się pobrać zdjęć. Spróbuj ponownie później.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
