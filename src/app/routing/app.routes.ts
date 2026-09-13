import { Routes } from '@angular/router';
import { GuestbookPage } from '../eksiega/guestbook-page';
import { GalleryPage } from '../eksiega/galeria/gallery-page';
import { PasswordPage } from '../haslo/password-page';
import { accessGuard } from './access.guard';

export const routes: Routes = [
  { path: '', component: GuestbookPage, canActivate: [accessGuard] },
  { path: 'galeria', component: GalleryPage, canActivate: [accessGuard] },
  { path: 'haslo', component: PasswordPage },
  { path: '**', redirectTo: '' },
];
