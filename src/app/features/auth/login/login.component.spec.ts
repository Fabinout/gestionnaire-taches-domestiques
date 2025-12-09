import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service'; // Chemin à adapter selon ta structure
import { Router } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jest.Mocked<AuthService>;
  let routerSpy: jest.Mocked<Router>;

  beforeEach(async () => {
    // 1. Création des Mocks
    authServiceSpy = {
      googleSignIn: jest.fn()
    } as unknown as jest.Mocked<AuthService>;

    routerSpy = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [LoginComponent], // Standalone component
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait être créé', () => {
    expect(component).toBeTruthy();
  });

  describe('signInWithGoogle', () => {
    it('devrait appeler le service et naviguer vers /home en cas de succès', async () => {
      // Arrange
      authServiceSpy.googleSignIn.mockResolvedValue(undefined); // Promesse résolue (succès)

      // Act
      await component.signInWithGoogle();

      // Assert
      expect(authServiceSpy.googleSignIn).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('devrait loguer une erreur et NE PAS naviguer en cas d\'échec', async () => {
      // Arrange
      const error = new Error('Google Auth Failed');
      authServiceSpy.googleSignIn.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      await component.signInWithGoogle();

      // Assert
      expect(authServiceSpy.googleSignIn).toHaveBeenCalled();
      expect(routerSpy.navigate).not.toHaveBeenCalled(); // Important : on reste sur la page de login
      expect(consoleSpy).toHaveBeenCalledWith('Echec de la connexion', error);
    });
  });
});
