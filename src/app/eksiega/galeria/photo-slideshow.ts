import { Component, HostListener, Input, OnDestroy, computed, signal } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-photo-slideshow',
  templateUrl: './photo-slideshow.html',
  styleUrl: './photo-slideshow.scss',
})
export class PhotoSlideshow implements OnDestroy {
  private readonly photoUrlList = signal<string[]>([]);

  @Input()
  set photoUrls(urls: string[]) {
    this.photoUrlList.set(urls);
    this.isFirstPhotoReady.set(false);

    if (this.initialPhotoTimer) {
      clearTimeout(this.initialPhotoTimer);
    }

    const uniqueUrls = [...new Set(urls.filter(Boolean))];
    if (!uniqueUrls.length) {
      return;
    }

    this.initialPhotoTimer = setTimeout(() => {
      this.initialPhotoTimer = undefined;
      void this.prefetchFirstPhoto(uniqueUrls[0]);
    }, 350);
  }

  get photoUrls(): string[] {
    return this.photoUrlList();
  }

  protected readonly isOpen = signal(false);
  protected readonly isFirstPhotoReady = signal(false);
  protected readonly currentIndex = signal(0);
  protected readonly outgoingPhoto = signal('');
  protected readonly outgoingPhotoIndex = signal(-1);
  protected readonly isTransitioning = signal(false);
  protected readonly currentPhoto = computed(() => this.photoUrlList()[this.currentIndex()] ?? '');
  protected readonly displayedSlides = computed(() => {
    const currentIndex = this.currentIndex();
    const currentPhoto = this.photoUrlList()[currentIndex] ?? '';
    if (!currentPhoto) {
      return [];
    }

    if (this.isTransitioning() && this.outgoingPhoto()) {
      return [
        {
          index: this.outgoingPhotoIndex(),
          url: this.outgoingPhoto(),
          phase: 'outgoing' as const,
        },
        { index: currentIndex, url: currentPhoto, phase: 'incoming' as const },
      ];
    }

    return [{ index: currentIndex, url: currentPhoto, phase: 'current' as const }];
  });
  private readonly preloadedPhotos = new Map<string, Promise<boolean>>();
  private initialPhotoTimer?: ReturnType<typeof setTimeout>;
  private nextPhotoPrefetchTimer?: ReturnType<typeof setTimeout>;
  private slideTimer?: ReturnType<typeof setTimeout>;
  private transitionTimer?: ReturnType<typeof setTimeout>;
  private previousOverflow?: { document: string; body: string };

  protected start(): void {
    if (!this.photoUrls.length || !this.isFirstPhotoReady() || this.isOpen()) {
      return;
    }

    this.currentIndex.set(0);
    this.outgoingPhoto.set('');
    this.outgoingPhotoIndex.set(-1);
    this.isTransitioning.set(false);
    this.isOpen.set(true);
    this.lockDocumentScroll();

    if (document.fullscreenEnabled && !document.fullscreenElement) {
      void document.documentElement.requestFullscreen().catch(() => undefined);
    }

    this.scheduleNextSlide();
  }

  protected close(): void {
    if (this.slideTimer) {
      clearTimeout(this.slideTimer);
      this.slideTimer = undefined;
    }
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
      this.transitionTimer = undefined;
    }
    if (this.nextPhotoPrefetchTimer) {
      clearTimeout(this.nextPhotoPrefetchTimer);
      this.nextPhotoPrefetchTimer = undefined;
    }

    this.outgoingPhoto.set('');
    this.outgoingPhotoIndex.set(-1);
    this.isTransitioning.set(false);
    this.isOpen.set(false);
    this.unlockDocumentScroll();
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    }
  }

  @HostListener('document:fullscreenchange')
  protected onFullscreenChange(): void {
    if (this.isOpen() && !document.fullscreenElement) {
      this.close();
    }
  }

  ngOnDestroy(): void {
    this.unlockDocumentScroll();
    if (this.isOpen() && document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    }
    if (this.initialPhotoTimer) {
      clearTimeout(this.initialPhotoTimer);
    }
    if (this.nextPhotoPrefetchTimer) {
      clearTimeout(this.nextPhotoPrefetchTimer);
    }
    if (this.slideTimer) {
      clearTimeout(this.slideTimer);
    }
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
    }
  }

  private scheduleNextSlide(): void {
    const nextIndex = this.currentIndex() + 1;
    if (nextIndex < this.photoUrls.length) {
      this.nextPhotoPrefetchTimer = setTimeout(() => {
        this.nextPhotoPrefetchTimer = undefined;
        void this.loadPhoto(this.photoUrls[nextIndex], 'low');
      }, 2000);
    }

    this.slideTimer = setTimeout(() => {
      this.slideTimer = undefined;
      void this.advanceToNextLoadedPhoto();
    }, 5000);
  }

  private async prefetchFirstPhoto(url: string): Promise<void> {
    await this.loadPhoto(url, 'high');
    if (this.photoUrls[0] === url) {
      this.isFirstPhotoReady.set(true);
    }
  }

  private loadPhoto(url: string, priority: 'high' | 'low'): Promise<boolean> {
    const existingLoad = this.preloadedPhotos.get(url);
    if (existingLoad) {
      return existingLoad;
    }

    const image = new Image();
    image.decoding = 'async';
    image.loading = 'eager';
    image.setAttribute('fetchpriority', priority);

    const loadPromise = new Promise<boolean>((resolve) => {
      image.onload = () => {
        void image.decode().then(
          () => resolve(true),
          () => resolve(image.naturalWidth > 0),
        );
      };
      image.onerror = () => resolve(false);
      image.src = url;
    });

    this.preloadedPhotos.set(url, loadPromise);
    return loadPromise;
  }

  private async advanceToNextLoadedPhoto(): Promise<void> {
    let nextIndex = this.currentIndex() + 1;

    while (nextIndex < this.photoUrls.length) {
      const isLoaded = await this.loadPhoto(this.photoUrls[nextIndex], 'low');
      if (!this.isOpen()) {
        return;
      }
      if (isLoaded) {
        break;
      }
      nextIndex++;
    }

    if (nextIndex >= this.photoUrls.length) {
      this.close();
      return;
    }

    this.outgoingPhoto.set(this.currentPhoto());
    this.outgoingPhotoIndex.set(this.currentIndex());
    this.currentIndex.set(nextIndex);
    this.isTransitioning.set(true);
    this.transitionTimer = setTimeout(() => {
      this.transitionTimer = undefined;
      this.outgoingPhoto.set('');
      this.outgoingPhotoIndex.set(-1);
      this.isTransitioning.set(false);
      if (!this.isOpen()) {
        return;
      }

      this.scheduleNextSlide();
    }, 650);
  }

  private lockDocumentScroll(): void {
    if (this.previousOverflow) {
      return;
    }

    this.previousOverflow = {
      document: document.documentElement.style.overflow,
      body: document.body.style.overflow,
    };
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  private unlockDocumentScroll(): void {
    if (!this.previousOverflow) {
      return;
    }

    document.documentElement.style.overflow = this.previousOverflow.document;
    document.body.style.overflow = this.previousOverflow.body;
    this.previousOverflow = undefined;
  }
}
