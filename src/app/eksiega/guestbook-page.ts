import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GuestbookService } from '../firebase/guestbook.service';
import { PhotoStorageService } from '../firebase/photo-storage.service';

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
    if (!this.selectedFile) {
      this.formMessage.set('Dodaj zdjęcie, aby wysłać życzenia.');
      return;
    }

    if (!this.wishes().trim() || !this.signature().trim()) {
      this.formMessage.set('Uzupełnij życzenia i podpis.');
      return;
    }

    this.isSubmitting.set(true);
    this.formMessage.set('Wysyłanie zdjęcia i życzeń...');

    try {
      const photoUrl = await this.photoStorageService.uploadPhoto(this.selectedFile);

      await this.guestbookService.saveEntry({
        wishes: this.wishes().trim(),
        signature: this.signature().trim(),
        photoUrl,
      });

      this.formMessage.set('Dziękujemy! Twoje życzenia zostały dodane.');
      this.submitted.set(true);
      this.showSnackbar('Zdjęcie i życzenia dodane do księgi.');
    } catch {
      this.formMessage.set('Nie udało się wysłać wpisu. Spróbuj ponownie.');
      this.showSnackbar('Nie udało się dodać wpisu.');
    } finally {
      this.isSubmitting.set(false);
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
