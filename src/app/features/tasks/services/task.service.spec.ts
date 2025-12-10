import {TestBed} from '@angular/core/testing';
import {TaskService} from './task.service';
import {Firestore, collection, collectionData, addDoc} from '@angular/fire/firestore';
import {firstValueFrom, of} from 'rxjs';
import {Task} from '../models/task.model';


jest.mock('@angular/fire/firestore', () => {
  const originalModule = jest.requireActual('@angular/fire/firestore');
  return {
    ...originalModule,
    collection: jest.fn(),
    collectionData: jest.fn(),
    addDoc: jest.fn(),
  };
});

describe('TaskService', () => {
  let service: TaskService;
  let firestoreMock: Partial<Firestore>;

  beforeEach(() => {
    firestoreMock = {};

    (collection as jest.Mock).mockReturnValue({} as never);
    (collectionData as jest.Mock).mockReturnValue(of([]));
    (addDoc as jest.Mock).mockResolvedValue({id: 'new-id'});

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
});
