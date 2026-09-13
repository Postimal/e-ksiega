import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InteractionService {
  readonly isBusy = signal(false);
  readonly message = signal('');

  start(message: string): void {
    this.message.set(message);
    this.isBusy.set(true);
  }

  update(message: string): void {
    this.message.set(message);
  }

  stop(): void {
    this.isBusy.set(false);
    this.message.set('');
  }
}
