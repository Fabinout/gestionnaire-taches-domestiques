import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AuthService } from './core/auth/auth.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let authServiceSpy: any;

  beforeEach(async () => {
    // Création du mock avec des propriétés initiales
    authServiceSpy = {
      isAuthenticated$: of(false),
      currentUser$: of(null)
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Gestionnaire de Tâches Domestiques');
  });

  it('should show guest mode when not authenticated', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent).toContain('Mode invité');
  });

  it('should show user email when authenticated', () => {
    // Modification des mocks pour ce test via Object.defineProperty car ce sont des propriétés en lecture seule sur le spy
    Object.defineProperty(authServiceSpy, 'isAuthenticated$', { value: of(true) });
    Object.defineProperty(authServiceSpy, 'currentUser$', { value: of({ email: 'test@example.com' }) });

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.user-info')?.textContent).toContain('Connecté : test@example.com');
  });
});
