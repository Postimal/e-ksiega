import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getAuth } from 'firebase/auth';

export const accessGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const auth = getAuth();

  // Sprawdzamy prawdziwy stan zalogowania w Firebase
  if (auth.currentUser && auth.currentUser.uid === 'app_member') {
    return true;
  }

  return router.createUrlTree(['/haslo'], {
    queryParams: { redirect: state.url },
  });
};
