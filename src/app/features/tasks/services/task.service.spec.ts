import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { of } from 'rxjs';

jest.mock('@angular/fire/firestore', () => {
  const originalModule = jest.requireActual('@angular/fire/firestore');
  return {
    ...originalModule,
    collection: jest.fn(),
    collectionData: jest.fn(),
  };
});

describe('TaskService', () => {
  let service: TaskService;
  let firestoreMock: Partial<Firestore>;

  beforeEach(() => {
    firestoreMock = {};

    (collection as jest.Mock).mockReturnValue({} as never);
    (collectionData as jest.Mock).mockReturnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        TaskService,
        { provide: Firestore, useValue: firestoreMock }
      ]
    });
    service = TestBed.inject(TaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return tasks observable', (done) => {
    service.getAllTasks().subscribe(tasks => {
      expect(tasks).toEqual([]);
      expect(collection).toHaveBeenCalledWith(firestoreMock, 'taches');
      expect(collectionData).toHaveBeenCalled();
      done();
    });
  });
});
