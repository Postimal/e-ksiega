import { Component, computed, Input, signal } from '@angular/core';
import { WishesPrintComponent } from '../wishes-print';
import { GuestbookEntryRecord, GuestbookService } from '../../../firebase/guestbook.service';
import { UrlQueryParamService } from '../../../services/url-query-params.service';
import { PhotosPrintComponent } from '../photos-print';

@Component({
  selector: 'app-print-view',
  templateUrl: './print-view.html',
  styleUrls: ['./print-view.scss'],
  imports: [WishesPrintComponent, PhotosPrintComponent],
})
export class PrintViewComponent {
  protected readonly photos = signal<GuestbookEntryRecord[]>([]);

  constructor(
    private readonly guestbookService: GuestbookService,
    private readonly urlQueryParamService: UrlQueryParamService,
  ) {
    void this.loadPhotos();
  }

  fetchedPhotos = computed(
    () =>
      this.photos()
        .filter(Boolean)
        .map((photo) => photo.photoUrl)
        .filter(Boolean) as string[],
  );
  fetchedWishes = computed(
    () =>
      this.photos()
        .filter(Boolean)
        .map((photo) => ({ author: photo.signature, text: photo.wishes }))
        .filter((wish) => wish.text) as { author: string; text: string }[],
  );
  private async loadPhotos(): Promise<void> {
    try {
      this.photos.set(
        await this.guestbookService.getEntriesV1(this.urlQueryParamService.groupIdParam() ?? ''),
      );
    } catch {
      // this.errorMessage.set('Nie udało się pobrać zdjęć. Spróbuj ponownie później.');
    } finally {
      // this.isLoading.set(false);
    }
  }

  printPage(): void {
    window.print();
  }
}
