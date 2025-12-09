import {Injectable, inject, NgZone} from '@angular/core';
import {Router} from '@angular/router';
import {Auth, authState, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser} from '@angular/fire/auth';
import {Observable, of} from 'rxjs';
import {switchMap, map, shareReplay, filter, take} from 'rxjs/operators';

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
   * Retourne une promesse qui se résout quand l'utilisateur est connecté.
   */
  async googleSignIn(): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(this.auth, provider);
      // On a supprimé la logique de navigation ici
      console.log('Connexion Google réussie');
    } catch (error) {
      console.error('Erreur de connexion Google:', error);
      throw error; // On renvoie l'erreur pour que le composant puisse l'afficher si besoin
    }
  }

  /**
   * Déconnecte l'utilisateur.
   */
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      throw error;
    }
  }
}
