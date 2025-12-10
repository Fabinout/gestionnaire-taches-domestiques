import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import {of} from "rxjs";

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jest.Mocked<AuthService>;
  let routerSpy: jest.Mocked<Router>;

  beforeEach(async () => {
    authServiceSpy = {
      googleSignIn: jest.fn(),
      user$: of({ uid: 'test-uid', email: 'test@gmail.com' }) // Mock user observable
    } as unknown as jest.Mocked<AuthService>;


    routerSpy = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
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
      authServiceSpy.googleSignIn.mockResolvedValue(undefined);

      // Act
      await component.signInWithGoogle();

      // Assert
      expect(authServiceSpy.googleSignIn).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('devrait loguer une erreur et NE PAS naviguer en cas d\'échec', async () => {
      // Arrange
      const error = new Error('Google Auth Failed');
      authServiceSpy.googleSignIn.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { /* empty */ });

      // Act
      await component.signInWithGoogle();

      // Assert
      expect(authServiceSpy.googleSignIn).toHaveBeenCalled();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Echec de la connexion', error);
    });
  });
});
