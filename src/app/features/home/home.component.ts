import { Component } from '@angular/core';
import { AuthService, User } from '../../core/auth/auth.service'; // Ajustez le chemin si nécessaire
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  // L'utilisateur est suivi via l'observable du service
  user$: Observable<User | null>;

  constructor(private authService: AuthService) {
    // Récupère l'observable de l'utilisateur
    this.user$ = this.authService.user$;
  }

  /**
   * Déclenche la déconnexion via le service d'authentification.
   */
  async logout(): Promise<void> {
    console.log("Déconnexion...");
    await this.authService.signOut();
  }
}
