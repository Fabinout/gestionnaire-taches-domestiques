import { Injectable, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, authState, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { switchMap, map, shareReplay, filter, take } from 'rxjs/operators';

// Interface pour un utilisateur simple
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Injection des dépendances version moderne
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);
  private ngZone: NgZone = inject(NgZone);

  // Observable pour suivre l'état de l'utilisateur
  public user$: Observable<User | null>;

  get currentUser$(): Observable<User | null> {
    return this.user$;
  }
  get isAuthenticated$(): Observable<boolean> {
    return this.user$.pipe(map(user => !!user));
  }
  constructor() {
    // Initialise l'observable 'user$' avec la méthode 'authState' de la nouvelle API
    this.user$ = authState(this.auth).pipe(
      switchMap((user: FirebaseUser | null) => {
        if (user) {
          const simpleUser: User = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          };
          return of(simpleUser);
        } else {
          return of(null);
        }
      }),
    shareReplay(1)
  );
  }

  /**
   * Se connecte avec Google via une fenêtre pop-up.
   */
  async googleSignIn(): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(this.auth, provider);

      // On attend que l'observable user$ soit à jour avant de naviguer
      this.user$.pipe(
        filter(user => !!user), // On attend qu'un utilisateur soit présent
        take(1) // On prend juste la première valeur et on se désabonne
      ).subscribe(() => {
        this.ngZone.run(() => {
          this.router.navigate(['/home']);
        });
      });

    } catch (error) {
      console.error('Erreur de connexion Google:', error);
    }
  }

  /**
   * Déconnecte l'utilisateur et navigue vers la page de connexion.
   */
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      this.ngZone.run(() => {
        this.router.navigate(['/login']);
      });
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  }
}
