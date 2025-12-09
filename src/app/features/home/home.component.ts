import {Component, NgZone} from '@angular/core';
import {AuthService, User} from '../auth/services/auth.service'; // Ajustez le chemin si nécessaire
import {Observable} from 'rxjs';
import {CommonModule} from '@angular/common';
import {TaskService} from '../tasks/services/task.service';
import {Task} from '../tasks/models/task.model';
import {Router} from "@angular/router";
import {filter, take} from "rxjs/operators";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./home.component.css']
})

export class HomeComponent {
  user$: Observable<User | null>;
  tasks$: Observable<Task[]>;

  constructor(private authService: AuthService,
              private taskService: TaskService,
              private router: Router,
              private ngZone: NgZone
  ) {
    this.user$ = this.authService.user$;
    this.tasks$ = this.taskService.getAllTasks();
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
