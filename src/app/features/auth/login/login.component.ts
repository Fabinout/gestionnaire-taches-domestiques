import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Ajustez le chemin si nécessaire

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(private authService: AuthService) { }

  /**
   * Déclenche la connexion Google via le service d'authentification.
   */
  async signInWithGoogle(): Promise<void> {
    await this.authService.googleSignIn();
  }
}
