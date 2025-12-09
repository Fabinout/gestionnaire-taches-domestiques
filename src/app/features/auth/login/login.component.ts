import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Ajustez le chemin si nécessaire
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(
    private authService: AuthService,
    private router: Router // On injecte le Router ici
  ) { }

  /**
   * Déclenche la connexion Google via le service d'authentification.
   */
  async signInWithGoogle(): Promise<void> {
    try {
      await this.authService.googleSignIn();
      await this.router.navigate(['/home']);
    } catch (error) {
      //todo Ici on pourrait afficher une notification d'erreur à l'utilisateur
      console.error("Echec de la connexion", error);
    }
  }
}
