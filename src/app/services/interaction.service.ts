import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InteractionService {
  readonly isBusy = signal(false);
  readonly message = signal('');

  private readonly minimumMessageDuration = 600;
  private messageQueue: string[] = [];
  private isShowingMessage = false;
  private stopRequested = false;
  private messageTimer?: ReturnType<typeof setTimeout>;

  start(message: string): void {
    this.messageQueue = [];
    this.stopRequested = false;
    this.message.set(message);
    this.isBusy.set(true);
    this.isShowingMessage = true;
    this.scheduleNextMessage();
  }

  update(message: string): void {
    if (!this.isBusy()) {
      return;
    }

    this.messageQueue.push(message);
    this.scheduleNextMessage();
  }

  stop(): void {
    this.stopRequested = true;
    this.scheduleNextMessage();
  }

  private scheduleNextMessage(): void {
    if (this.messageTimer || !this.isShowingMessage) {
      return;
    }

    this.messageTimer = setTimeout(() => {
      this.messageTimer = undefined;

      const nextMessage = this.messageQueue.shift();
      if (nextMessage) {
        this.message.set(nextMessage);
        this.scheduleNextMessage();
        return;
      }

      if (this.stopRequested) {
        this.isShowingMessage = false;
        this.isBusy.set(false);
        this.message.set('');
        return;
      }

      this.scheduleNextMessage();
    }, this.minimumMessageDuration);
  }
}
