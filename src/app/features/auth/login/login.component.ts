import { Component, NgZone, inject } from '@angular/core';
import {AuthService} from '../services/auth.service'; // Ajustez le chemin si nécessaire
import {filter, take} from 'rxjs/operators'; // Import nécessaire
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  /**
   * Déclenche la connexion Google via le service d'authentification.
   */
  async signInWithGoogle(): Promise<void> {
    try {
      await this.authService.googleSignIn();

      // On attend que l'état de l'utilisateur soit propagé (non null) avant de naviguer
      this.authService.user$.pipe(
        filter(user => !!user), // On filtre pour ne laisser passer que si un utilisateur existe
        take(1) // On ne prend que la première émission valide pour éviter les fuites de mémoire
      ).subscribe(() => {
        this.ngZone.run(() => {
          this.router.navigate(['/']);
        });
      });

    } catch (error) {
      //todo Ici on pourrait afficher une notification d'erreur à l'utilisateur
      console.error("Echec de la connexion", error);
    }
  }
}
