import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GuestbookEntryRecord, GuestbookService } from '../../firebase/guestbook.service';
import { WishesRenderer } from './wishes-renderer';
import { UrlQueryParamService } from '../../services/url-query-params.service';
import { PhotoSlideshow } from './photo-slideshow';

@Component({
  standalone: true,
  imports: [RouterLink, WishesRenderer, PhotoSlideshow],
  selector: 'app-gallery-page',
  styleUrl: './gallery-page.scss',
  templateUrl: './gallery-page.html',
})
export class GalleryPage {
  private readonly pageSize = 15;
  protected readonly photos = signal<GuestbookEntryRecord[]>([]);
  protected readonly currentPage = signal(1);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly slideshowPhotoUrls = computed(() =>
    this.photos()
      .map((photo) => photo.photoUrl)
      .filter((photoUrl): photoUrl is string => Boolean(photoUrl)),
  );
  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.photos().length / this.pageSize)),
  );
  protected readonly visiblePhotos = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize;
    return this.photos().slice(startIndex, startIndex + this.pageSize);
  });

  constructor(
    private readonly guestbookService: GuestbookService,
    private readonly urlQueryParamService: UrlQueryParamService,
  ) {
    void this.loadPhotos();
  }

  private async loadPhotos(): Promise<void> {
    try {
      const entries = await this.guestbookService.getEntriesV1(
        this.urlQueryParamService.groupIdParam() ?? '',
      );
      await this.preloadFirstPhotos(entries);
      this.photos.set(entries);
      this.currentPage.set(1);
    } catch {
      this.errorMessage.set('Nie udało się pobrać zdjęć. Spróbuj ponownie później.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private async preloadFirstPhotos(entries: GuestbookEntryRecord[]): Promise<void> {
    const photoUrls = entries
      .map((entry) => entry.photoUrl)
      .filter((photoUrl): photoUrl is string => Boolean(photoUrl))
      .slice(0, 3);

    await Promise.allSettled(
      photoUrls.map((photoUrl) => {
        const image = new Image();
        image.loading = 'eager';
        image.fetchPriority = 'high';
        image.decoding = 'async';
        image.src = photoUrl;
        return image.decode();
      }),
    );
  }

  protected goToPreviousPage(): void {
    this.currentPage.update((page) => Math.max(1, page - 1));
    this.scrollToGalleryTop();
  }

  protected goToNextPage(): void {
    this.currentPage.update((page) => Math.min(this.totalPages(), page + 1));
    this.scrollToGalleryTop();
  }

  private scrollToGalleryTop(): void {
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
}
