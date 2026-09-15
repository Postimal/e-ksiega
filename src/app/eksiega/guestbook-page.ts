import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GuestbookService } from '../firebase/guestbook.service';
import { PhotoStorageService } from '../firebase/photo-storage.service';
import { InteractionService } from '../services/interaction.service';

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

  constructor(
    private readonly guestbookService: GuestbookService,
    private readonly photoStorageService: PhotoStorageService,
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

    if (file.size > 25 * 1024 * 1024) {
      this.formMessage.set('Zdjęcie może mieć maksymalnie 25 MB.');
      input.value = '';
      return;
    }

    this.selectedFileName.set(file.name);
    this.selectedFile = file;
    this.formMessage.set('');
    this.previewUrl.set(URL.createObjectURL(file));
  }

  protected async submitForm(): Promise<void> {
    // if (!this.selectedFile) {
    //   this.formMessage.set('Dodaj zdjęcie, aby wysłać życzenia.');
    //   return;
    // }

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
      await this.guestbookService.saveEntry({
        wishes: this.wishes().trim(),
        signature: this.signature().trim(),
        photoUrl,
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
