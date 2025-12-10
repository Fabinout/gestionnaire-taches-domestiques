import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  DocumentReference,
  updateDoc,
  doc
} from '@angular/fire/firestore';
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

  addTask(task: Task): Promise<DocumentReference> {
    const tasksCollection = collection(this.firestore, 'taches');
    return addDoc(tasksCollection, task);
  }

  updateTaskStatus(taskId: string, completed: boolean): Promise<void> {
    const taskDocRef = doc(this.firestore, `taches/${taskId}`);
    return updateDoc(taskDocRef, { completed });
  }
}
