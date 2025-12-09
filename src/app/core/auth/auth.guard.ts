import {ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateFn} from '@angular/router';
import { AuthService } from './auth.service'; // Assurez-vous que le chemin est correct
import { take, map, tap } from 'rxjs/operators';
import {inject} from "@angular/core";

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map(user => !!user),
    tap(loggedIn => {
      if (!loggedIn) {
        console.log('Accès refusé. Redirection vers /login.');
        router.navigate(['/login']);
      }
    })
  );
};
