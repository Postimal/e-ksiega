import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

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

    if (file.size > 8 * 1024 * 1024) {
      this.formMessage.set('Zdjęcie może mieć maksymalnie 8 MB.');
      input.value = '';
      return;
    }

    this.selectedFileName.set(file.name);
    this.formMessage.set('');
    this.previewUrl.set(URL.createObjectURL(file));
  }

  protected submitForm(): void {
    if (!this.previewUrl()) {
      this.formMessage.set('Dodaj zdjęcie, aby wysłać życzenia.');
      return;
    }

    if (!this.wishes().trim() || !this.signature().trim()) {
      this.formMessage.set('Uzupełnij życzenia i podpis.');
      return;
    }

    this.formMessage.set('Dziękujemy! Twoje życzenia zostały dodane.');
    this.submitted.set(true);
  }

  protected resetForm(): void {
    this.selectedFileName.set('');
    this.previewUrl.set('');
    this.wishes.set('');
    this.signature.set('');
    this.formMessage.set('');
    this.submitted.set(false);
  }
}
