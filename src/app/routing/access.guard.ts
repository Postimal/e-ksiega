import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const accessGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);

  if (sessionStorage.getItem('guestbook-access') === 'granted') {
    return true;
  }

  return router.createUrlTree(['/haslo'], {
    queryParams: { redirect: state.url },
  });
};
