import {TestBed} from '@angular/core/testing';
import {TaskService} from './task.service';
import {Firestore, collection, collectionData, addDoc, updateDoc, doc} from '@angular/fire/firestore';
import {firstValueFrom, of} from 'rxjs';
import {Task} from '../models/task.model';


jest.mock('@angular/fire/firestore', () => {
  const originalModule = jest.requireActual('@angular/fire/firestore');
  return {
    ...originalModule,
    collection: jest.fn(),
    collectionData: jest.fn(),
    addDoc: jest.fn(),
    doc: jest.fn(),
    updateDoc: jest.fn(),  };
});

describe('TaskService', () => {
  let service: TaskService;
  let firestoreMock: Partial<Firestore>;

  beforeEach(() => {
    firestoreMock = {};

    (collection as jest.Mock).mockReturnValue({} as never);
    (collectionData as jest.Mock).mockReturnValue(of([]));
    (addDoc as jest.Mock).mockResolvedValue({id: 'new-id'});
    (doc as jest.Mock).mockReturnValue({});
    (updateDoc as jest.Mock).mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        TaskService,
        {provide: Firestore, useValue: firestoreMock}
      ]
    });
    service = TestBed.inject(TaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return tasks observable', async () => {
    const tasks = await firstValueFrom(service.getAllTasks());
    expect(tasks).toEqual([]);
    expect(collection).toHaveBeenCalledWith(firestoreMock, 'taches');
    expect(collectionData).toHaveBeenCalled();
  });

  it('should add a task to /tasks collection', async () => {
    const newTask: Task = {
      name: 'Faire la vaisselle',
      completed: false,
      createdAt: '2023-01-01T10:00:00.000Z'
    };

    await service.addTask(newTask);

    expect(collection).toHaveBeenCalledWith(firestoreMock, 'taches');
    expect(addDoc).toHaveBeenCalledWith(expect.anything(), newTask);
  });

  it('should complete a task', async () => {
    const taskId = 'task-123';
    const completedBy = 'user-abc';

    await service.completeTask(taskId, completedBy);

    expect(doc).toHaveBeenCalledWith(firestoreMock, `taches/${taskId}`);
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { completed: true, completedBy: completedBy });
  });

  it('should cancel task completion', async () => {
    const taskId = 'task-123';

    await service.cancelCompletion(taskId);

    expect(doc).toHaveBeenCalledWith(firestoreMock, `taches/${taskId}`);
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { completed: false, completedBy: null });
  });
});
