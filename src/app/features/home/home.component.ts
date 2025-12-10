import { Component, NgZone, inject } from '@angular/core';
import {AuthService, User} from '../auth/services/auth.service'; // Ajustez le chemin si nécessaire
import {Observable} from 'rxjs';
import {CommonModule} from '@angular/common';
import {TaskService} from '../tasks/services/task.service';
import {Task} from '../tasks/models/task.model';
import {Router} from "@angular/router";
import {filter, take} from "rxjs/operators";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./home.component.css']
})

export class HomeComponent {
  private authService = inject(AuthService);
  private taskService = inject(TaskService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  user$: Observable<User | null>;
  tasks$: Observable<Task[]>;
  newName = '';

  constructor() {
    this.user$ = this.authService.user$;
    this.tasks$ = this.taskService.getAllTasks();
  }

  addTask(): void {
    if (!this.newName.trim()) {
      return;
    }

    const newTask: Task = {
      name: this.newName,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.taskService.addTask(newTask).then(() => {
      this.newName = '';
    }).catch(err => {
      console.error('Erreur lors de l\'ajout de la tâche', err);
    });
  }


  async logout(): Promise<void> {
    await this.authService.signOut();

    this.authService.user$.pipe(
      filter(user => user === null),
      take(1)
    ).subscribe(() => {
      this.ngZone.run(() => {
        this.router.navigate(['/login']);
      });
    });
  }
}
