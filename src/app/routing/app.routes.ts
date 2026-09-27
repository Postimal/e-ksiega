import { Routes } from '@angular/router';
import { GuestbookPage } from '../eksiega/guestbook-page';
import { GalleryPage } from '../eksiega/galeria/gallery-page';
import { PasswordPage } from '../haslo/password-page';
import { accessGuard } from './access.guard';
import { PrintViewComponent } from '../eksiega/print/print-view/print-view';

export const routes: Routes = [
  { path: 'start', component: GuestbookPage, canActivate: [accessGuard] },
  { path: 'galeria', component: GalleryPage, canActivate: [accessGuard] },
  { path: 'galeria/print', component: PrintViewComponent, canActivate: [accessGuard] },
  { path: 'haslo', component: PasswordPage },
  { path: '**', redirectTo: 'start' },
];
