import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe],
  template: `
    <header>
      <h1>Gestionnaire de Tâches Domestiques</h1>

      <!-- Zone d'info utilisateur (Technique / Auth) -->
      @if (authService.isAuthenticated$ | async) {
        <div class="user-info">
          Connecté : {{ (authService.currentUser$ | async)?.email }}
        </div>
      } @else {
        <p>Mode invité</p>
      }
    </header>

    <main>
      <!-- Le contenu change en fonction de l'URL (Features) -->
      <router-outlet></router-outlet>
    </main>
  `,
})
export class AppComponent {
  // Injection du service Core
  readonly authService = inject(AuthService);
}
