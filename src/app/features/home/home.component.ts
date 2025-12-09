import {Component} from '@angular/core';
import {AuthService, User} from '../../core/auth/auth.service'; // Ajustez le chemin si nécessaire
import {Observable} from 'rxjs';
import {CommonModule} from '@angular/common';
import {TaskService} from '../tasks/services/task.service';
import {Task} from '../tasks/models/task.model';

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
  tasks$: Observable<Task[]>;

  constructor(private authService: AuthService, private taskService: TaskService
  ) {
    // Récupère l'observable de l'utilisateur
    this.user$ = this.authService.user$;
    this.tasks$ = this.taskService.getAllTasks();
  }

  /**
   * Déclenche la déconnexion via le service d'authentification.
   */
  async logout(): Promise<void> {
    console.log("Déconnexion...");
    await this.authService.signOut();
  }
}
