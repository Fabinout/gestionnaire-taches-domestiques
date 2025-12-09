import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Auth, user } from '@angular/fire/auth';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe],
  template: `
    <header>
      <h1>Gestionnaire de Tâches Domestiques</h1>
    </header>
    <main>
      @if (isAuthenticated | async) {
        <p>Utilisateur connecté : {{ (currentUser | async)?.email }}</p>
      } @else {
        <p>Non connecté. Veuillez vous identifier.</p>
      }

      <h2>Liste de Tâches (Firestore)</h2>
      <ul>
        @for (task of (tasks | async); track task.id) {
          <li>{{ task.name }}</li>
        } @empty {
          <li>Aucune tâche pour le moment.</li>
        }
      </ul>
    </main>
  `,
})
export class AppComponent {
  private readonly auth: Auth = inject(Auth);
  private readonly firestore: Firestore = inject(Firestore);

  // Observable pour vérifier l'état de l'utilisateur
  currentUser = user(this.auth);
  isAuthenticated: Observable<boolean> = this.currentUser.pipe(map(u => !!u));

  // Observable pour lire les données de Firestore
  tasks: Observable<any[]>;

  constructor() {
    // Référence à la collection 'taches'
    const tasksCollection = collection(this.firestore, 'taches');
    // Récupérer les données
    this.tasks = collectionData(tasksCollection, { idField: 'id' });
  }
}
