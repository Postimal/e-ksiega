import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GuestbookService } from '../firebase/guestbook.service';
import { PhotoStorageService } from '../firebase/photo-storage.service';
import { InteractionService } from '../services/interaction.service';
import { UrlQueryParamService } from '../services/url-query-params.service';

export interface HeaderConfig {
  imgSrc: string;
  imgAlt: string;
  date: string;
  title: string;
  subtitle: string;
}

@Component({
  imports: [RouterLink],
  selector: 'app-guestbook-page',
  styleUrl: './guestbook-page.scss',
  templateUrl: './guestbook-page.html',
})
export class GuestbookPage {
  protected readonly selectedFileName = signal('');
  protected readonly previewUrl = signal('');
  protected readonly formMessage = signal('');
  protected readonly submitted = signal(false);
  protected readonly wishes = signal('');
  protected readonly signature = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly snackbarMessage = signal('');

  private selectedFile: File | null = null;
  private snackbarTimeout?: ReturnType<typeof setTimeout>;
  private readonly configs: Record<string, HeaderConfig> = {
    chrzest: {
      imgSrc: 'assets/teddy.png',
      imgAlt: 'Miś z okazji uroczystości',
      date: '25 październik 2026',
      title: 'Chrzest Święty<br />i Roczek',
      subtitle: 'Podziel się z nami życzeniami!',
    },
    slub: {
      imgSrc: 'assets/hero-image.svg',
      imgAlt: 'Obrączki ślubne',
      date: '12 września 2026',
      title: 'Ślub i Wesele<br />Anny i Jana',
      subtitle: 'Zostaw pamiątkowy wpis!',
    },
    komunia: {
      imgSrc: 'assets/birthday-cake.svg',
      imgAlt: 'Tort',
      date: '5 grudnia 2026',
      title: 'Komunia<br />Michała',
      subtitle: 'Baw się dobrze i życz mi wszystkiego najlepszego!',
    },
  };

  get currentConfig(): HeaderConfig {
    const activeVariant = this.urlQueryParamService.variantParam() || 'chrzest';
    return this.configs[activeVariant] || this.configs['chrzest'];
  }

  constructor(
    private readonly guestbookService: GuestbookService,
    private readonly photoStorageService: PhotoStorageService,
    private readonly urlQueryParamService: UrlQueryParamService,
    protected readonly interactionService: InteractionService,
  ) {}

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.formMessage.set('Wybierz plik graficzny.');
      input.value = '';
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      this.formMessage.set('Zdjęcie może mieć maksymalnie 15 MB.');
      input.value = '';
      return;
    }

    this.selectedFileName.set(file.name);
    this.selectedFile = file;
    this.formMessage.set('');
    this.previewUrl.set(URL.createObjectURL(file));
  }

  protected async submitForm(): Promise<void> {
    if (!this.wishes().trim() || !this.signature().trim()) {
      this.formMessage.set('Uzupełnij życzenia i podpis.');
      return;
    }

    this.isSubmitting.set(true);
    this.interactionService.start('Przygotowujemy zdjęcie...');

    try {
      let photoUrl = '';

      if (this.selectedFile) {
        this.interactionService.update('Wysyłamy zdjęcie...');
        photoUrl = await this.photoStorageService.uploadPhoto(this.selectedFile);
      }

      this.interactionService.update('Zapisujemy życzenia...');
      // await this.guestbookService.saveEntry({
      //   wishes: this.wishes().trim(),
      //   signature: this.signature().trim(),
      //   photoUrl,
      // });
      await this.guestbookService.saveEntryV1({
        wishes: this.wishes().trim(),
        signature: this.signature().trim(),
        photoUrl,
        group_id: this.urlQueryParamService.groupIdParam() ?? '',
      });

      this.submitted.set(true);
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
      this.showSnackbar(
        this.selectedFile ? 'Zdjęcie i życzenia dodane do księgi.' : 'Życzenia dodane do księgi.',
      );
    } catch (error: unknown) {
      console.error('Guestbook submission failed:', error);
      this.formMessage.set('Nie udało się wysłać wpisu. Spróbuj ponownie.');
      this.showSnackbar('Nie udało się dodać wpisu.');
    } finally {
      this.isSubmitting.set(false);
      this.interactionService.stop();
    }
  }

  protected resetForm(): void {
    if (this.previewUrl()) {
      URL.revokeObjectURL(this.previewUrl());
    }

    this.selectedFile = null;
    this.selectedFileName.set('');
    this.previewUrl.set('');
    this.wishes.set('');
    this.signature.set('');
    this.formMessage.set('');
    this.submitted.set(false);
  }

  private showSnackbar(message: string): void {
    if (this.snackbarTimeout) {
      clearTimeout(this.snackbarTimeout);
    }

    this.snackbarMessage.set(message);
    this.snackbarTimeout = setTimeout(() => this.snackbarMessage.set(''), 4000);
  }
}
