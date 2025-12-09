import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly firestore: Firestore = inject(Firestore);

  getAllTasks(): Observable<Task[]> {
    const tasksCollection = collection(this.firestore, 'taches');
    return collectionData(tasksCollection, { idField: 'id' }) as Observable<Task[]>;
  }

  // Ici, vous ajouterez plus tard : addTask(), updateTask(), etc.
}
