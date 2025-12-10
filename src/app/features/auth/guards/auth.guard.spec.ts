import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import {of, Observable, firstValueFrom} from 'rxjs';

describe('authGuard', () => {
  let authServiceSpy: Partial<AuthService>;
  let routerSpy: Partial<Router>;

  beforeEach(() => {
    // Création du mock sans définir user$ via createSpyObj pour pouvoir le modifier facilement
    authServiceSpy = {
      signOut: jest.fn()
    };
    routerSpy = {
      navigate: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        {provide: AuthService, useValue: authServiceSpy},
        {provide: Router, useValue: routerSpy}
      ]
    });
  });

  const executeGuard = () =>
    TestBed.runInInjectionContext(() => authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));

  it('should allow access if user is logged in', async () => {
    authServiceSpy.user$ = of({uid: '123'} as never);

    const result = executeGuard();

    const allowed = await firstValueFrom(result as Observable<boolean>);
    expect(allowed).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should deny access and redirect to login if user is not logged in', async () => {
    authServiceSpy.user$ = of(null);

    const result = executeGuard();

    const allowed = await firstValueFrom(result as Observable<boolean>);
    expect(allowed).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
