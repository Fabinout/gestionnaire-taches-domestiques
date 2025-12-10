import { TestBed } from '@angular/core/testing';
import { AuthService, User } from './auth.service';
import { Auth, authState, GoogleAuthProvider, signInWithPopup, signOut, User as FirebaseUser } from '@angular/fire/auth';
import {BehaviorSubject, firstValueFrom} from 'rxjs';

// Mock simple de l'utilisateur Firebase
const mockFirebaseUser: Partial<FirebaseUser> = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'url/photo.jpg',
};

// On mocke les fonctions de Firebase
jest.mock('@angular/fire/auth', () => ({
  Auth: class {}, // Mock de la classe Auth injectée
  authState: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  GoogleAuthProvider: class {},
}));

describe('AuthService', () => {
  let service: AuthService;
  let authMock: Auth;
  // Subject pour piloter l'état de connexion pendant les tests
  let authStateSubject: BehaviorSubject<FirebaseUser | null>;

  beforeEach(() => {
    authMock = {} as Auth;
    authStateSubject = new BehaviorSubject<FirebaseUser | null>(null);

    // authState retourne notre Subject, nous permettant d'émettre des valeurs à la volée
    (authState as jest.Mock).mockReturnValue(authStateSubject.asObservable());

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Auth, useValue: authMock }
        // Plus besoin de Router ici !
      ]
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('user$', () => {
    it('devrait émettre null par défaut (déconnecté)', async () => {
      const user = await firstValueFrom(service.user$);
      expect(user).toBeNull();
    });

    it('devrait mapper et émettre un User quand Firebase émet un utilisateur', async () => {
      // On simule une connexion via le Subject
      authStateSubject.next(mockFirebaseUser as FirebaseUser);

      const user = await firstValueFrom(service.user$);
      expect(user).toEqual({
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'url/photo.jpg',
      } as User);
    });
  });

  describe('googleSignIn', () => {
    it('devrait appeler signInWithPopup', async () => {
      (signInWithPopup as jest.Mock).mockResolvedValue({ user: mockFirebaseUser });

      await service.googleSignIn();

      expect(signInWithPopup).toHaveBeenCalledWith(authMock, expect.any(GoogleAuthProvider));
    });

    it('devrait propager l\'erreur si la connexion échoue', async () => {
      const errorMsg = 'Popup closed by user';
      (signInWithPopup as jest.Mock).mockRejectedValue(errorMsg);
      jest.spyOn(console, 'error').mockImplementation(() => { /* empty */ });

      await expect(service.googleSignIn()).rejects.toEqual(errorMsg);
    });
  });

  describe('signOut', () => {
    it('devrait appeler signOut', async () => {
      (signOut as jest.Mock).mockResolvedValue(undefined);

      await service.signOut();

      expect(signOut).toHaveBeenCalledWith(authMock);
    });
  });
});
