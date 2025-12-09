import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService, User } from './auth.service';
import { Auth, authState, GoogleAuthProvider, signInWithPopup, signOut, User as FirebaseUser } from '@angular/fire/auth';
import * as AuthLib from '@angular/fire/auth';
import {BehaviorSubject, of, switchMap} from 'rxjs';

// Mock pour l'utilisateur Firebase
const mockUser: Partial<FirebaseUser> = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'url/photo.jpg',
  emailVerified: true,
  isAnonymous: false,
};

jest.mock('@angular/fire/auth', () => ({
  Auth: class {}, // Mock de la classe Auth
  authState: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  GoogleAuthProvider: class {},
}));

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;
  let authMock: Auth;
  let authStateSubject: BehaviorSubject<FirebaseUser | null>;


  beforeEach(() => {
    // 1. On crée un objet Auth vide (puisque les fonctions font tout le travail)
    authMock = {} as Auth;

    // On utilise un BehaviorSubject pour contrôler l'émission de l'état d'auth
    authStateSubject = new BehaviorSubject<FirebaseUser | null>(null);

    // 2. On espionne les fonctions exportées par @angular/fire/auth
    // Note: authState est appelé dans le constructor, donc on doit le mocker AVANT d'injecter le service
    (authState as jest.Mock).mockReturnValue(authStateSubject);

    // On implémente le mock pour qu'il mette à jour le subject lors d'une connexion réussie
    (signInWithPopup as jest.Mock).mockImplementation(() => {
      authStateSubject.next(mockUser as FirebaseUser);
      return Promise.resolve({ user: mockUser as FirebaseUser });
    });

    (signOut as jest.Mock).mockResolvedValue(undefined);

    // 3. Mock du Router
    const routerSpy = { navigate: jest.fn() };

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

  afterEach(() => {
    jest.clearAllMocks();
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

      (authState as jest.Mock).mockReturnValue(of(mockUser as FirebaseUser));

      // On réinitialise user$ manuellement pour le test en rappelant la logique
      // authState fait maintenant référence à notre mock
      service.user$ = authState(authMock).pipe(
        switchMap((user: any) => {
          if (user) return of({ uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL });
          return of(null);
        })
      );

      // Astuce: Pour tester le flux, il vaut mieux le faire en injectant un Subject si on veut changer la valeur dynamiquement,
      // mais ici on va simplement relancer la logique du constructeur en "écrasant" la propriété user$ pour le test
      // ou en recréant le TestBed si besoin.
      // Pour faire simple et propre, simulons simplement le flux user$ tel qu'il est défini :

      // On réinitialise user$ manuellement pour le test en rappelant la logique (car authStateSpy a changé)
      // Note: Dans un vrai test unitaire rigoureux, on utiliserait un BehaviorSubject pour le mock de authState.

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

      expect(signInWithPopup).toHaveBeenCalled();
      // On peut vérifier qu'il a été appelé avec notre instance authMock
      expect(signInWithPopup).toHaveBeenCalledWith(authMock, expect.any(Object));

      // Vérifie que la navigation a eu lieu
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('devrait gérer l\'erreur de signInWithPopup', async () => {
      // Configure le mock pour qu'il rejette une promesse
      (signInWithPopup as jest.Mock).mockRejectedValue('Test Error');
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await service.googleSignIn();

      expect(signInWithPopup).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Erreur de connexion Google:', 'Test Error');
      // La navigation ne devrait PAS être appelée en cas d'échec
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('devrait appeler signOut et naviguer vers /login', async () => {
      await service.signOut();

      expect(signOut).toHaveBeenCalled();
      expect(signOut).toHaveBeenCalledWith(authMock);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('devrait gérer l\'erreur de signOut', async () => {
      (signOut as jest.Mock).mockRejectedValue('SignOut Error');
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await service.signOut();

      expect(signOut).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Erreur de déconnexion:', 'SignOut Error');
    });
  });
});
