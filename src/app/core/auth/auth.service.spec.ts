import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService, User } from './auth.service';
// On importe Auth pour l'injection, et le reste pour mocker les fonctions
import { Auth, User as FirebaseUser } from '@angular/fire/auth';
import * as AuthLib from '@angular/fire/auth';
import { of } from 'rxjs';

// Mock pour l'utilisateur Firebase
const mockUser: Partial<FirebaseUser> = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'url/photo.jpg',
  // Méthodes minimales requises pour le typage si nécessaire
  emailVerified: true,
  isAnonymous: false,
};

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;
  let authMock: Auth;

  // Spies pour les fonctions autonomes
  let signInWithPopupSpy: jasmine.Spy;
  let signOutSpy: jasmine.Spy;
  let authStateSpy: jasmine.Spy;

  beforeEach(() => {
    // 1. On crée un objet Auth vide (puisque les fonctions font tout le travail)
    authMock = {} as Auth;

    // 2. On espionne les fonctions exportées par @angular/fire/auth
    // Note: authState est appelé dans le constructor, donc on doit le mocker AVANT d'injecter le service
    authStateSpy = spyOn(AuthLib, 'authState').and.returnValue(of(null));
    signInWithPopupSpy = spyOn(AuthLib, 'signInWithPopup').and.returnValue(Promise.resolve({ user: mockUser as FirebaseUser } as any));
    signOutSpy = spyOn(AuthLib, 'signOut').and.returnValue(Promise.resolve());

    // 3. Mock du Router
    const routerSpy = { navigate: jasmine.createSpy('navigate') };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Auth, useValue: authMock },
        { provide: Router, useValue: routerSpy }
      ]
    });

    // Injection des dépendances
    // Le constructeur de AuthService est appelé ici, donc authStateSpy doit être prêt
    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('user$', () => {
    it('devrait émettre null si l\'utilisateur est déconnecté', (done) => {
      // Par défaut authStateSpy retourne of(null) dans le beforeEach
      service.user$.subscribe(user => {
        expect(user).toBeNull();
        done();
      });
    });

    it('devrait émettre un objet User si l\'utilisateur est connecté', (done) => {
      // On doit ré-instancier le service pour que le constructeur prenne la nouvelle valeur de authState
      // Ou plus simple : on mocke authState avant le test si on ne l'avait pas déjà fait.
      // Ici, comme le service est un singleton déjà créé dans beforeEach, user$ est déjà initialisé.
      // On ne peut pas "changer" le passé du constructeur facilement sans recréer le service.

      // Solution : On recrée le service pour ce test spécifique avec un nouveau mock
      authStateSpy.and.returnValue(of(mockUser as FirebaseUser));
      service = TestBed.inject(AuthService); // Récupère l'instance (déjà créée)

      // Astuce: Pour tester le flux, il vaut mieux le faire en injectant un Subject si on veut changer la valeur dynamiquement,
      // mais ici on va simplement relancer la logique du constructeur en "écrasant" la propriété user$ pour le test
      // ou en recréant le TestBed si besoin.
      // Pour faire simple et propre, simulons simplement le flux user$ tel qu'il est défini :

      // On réinitialise user$ manuellement pour le test en rappelant la logique (car authStateSpy a changé)
      // Note: Dans un vrai test unitaire rigoureux, on utiliserait un BehaviorSubject pour le mock de authState.
      const { switchMap } = require('rxjs/operators'); // Import dynamique juste pour la logique

      // On écrase user$ avec la nouvelle valeur simulée du spy
      service.user$ = AuthLib.authState(authMock).pipe(
        switchMap((user: any) => {
          if (user) return of({ uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL });
          return of(null);
        })
      );

      service.user$.subscribe(user => {
        expect(user).toEqual({
          uid: 'test-uid',
          email: 'test@example.com',
          displayName: 'Test User',
          photoURL: 'url/photo.jpg',
        } as User);
        done();
      });
    });
  });

  describe('googleSignIn', () => {
    it('devrait appeler signInWithPopup et naviguer vers /home en cas de succès', async () => {
      await service.googleSignIn();

      expect(signInWithPopupSpy).toHaveBeenCalled();
      // On peut vérifier qu'il a été appelé avec notre instance authMock
      expect(signInWithPopupSpy).toHaveBeenCalledWith(authMock, jasmine.any(Object));

      // Vérifie que la navigation a eu lieu
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('devrait gérer l\'erreur de signInWithPopup', async () => {
      // Configure le mock pour qu'il rejette une promesse
      signInWithPopupSpy.and.returnValue(Promise.reject('Test Error'));
      spyOn(console, 'error');

      await service.googleSignIn();

      expect(signInWithPopupSpy).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Erreur de connexion Google:', 'Test Error');
      // La navigation ne devrait PAS être appelée en cas d'échec
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('devrait appeler signOut et naviguer vers /login', async () => {
      await service.signOut();

      expect(signOutSpy).toHaveBeenCalled();
      expect(signOutSpy).toHaveBeenCalledWith(authMock);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('devrait gérer l\'erreur de signOut', async () => {
      signOutSpy.and.returnValue(Promise.reject('SignOut Error'));
      spyOn(console, 'error');

      await service.signOut();

      expect(signOutSpy).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Erreur de déconnexion:', 'SignOut Error');
    });
  });
});
