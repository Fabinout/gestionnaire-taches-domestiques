import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {HomeComponent} from './home.component';
import {TaskService} from '../tasks/services/task.service';
import {AuthService, User} from '../auth/services/auth.service';
import {Observable, of} from 'rxjs';
import {By} from '@angular/platform-browser';
import {Task} from '../tasks/models/task.model';

const mockTasks: Task[] = [
  {id: '1', name: 'Vaisselle', completed: false, createdAt: '2023-01-01'},
  {id: '2', name: 'Lessive', completed: true, createdAt: '2023-01-02'}
];

const mockUser: User = {
  uid: '123',
  email: 'test@test.com',
  displayName: 'Test User',
  photoURL: 'https://link.to.profile_picture.jpg'
};

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let authServiceSpy: { signOut: jest.Mock; user$: Observable<User | null> };
  let taskServiceSpy: { getAllTasks: jest.Mock; completeTask: jest.Mock };

  beforeEach(async () => {
    authServiceSpy = {
      signOut: jest.fn().mockResolvedValue(undefined),
      user$: of(null)
    };

    taskServiceSpy = {
      getAllTasks: jest.fn().mockReturnValue(of([])),
      completeTask: jest.fn().mockResolvedValue(undefined),
    }

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        {provide: AuthService, useValue: authServiceSpy},
        {provide: TaskService, useValue: taskServiceSpy}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize user$ and tasks$ as defined Observables', () => {
    expect(component.user$).toBeDefined();
    expect(component.tasks$).toBeDefined();
  });

  it('should call AuthService.signOut when logout is called', async () => {
    await component.logout();
    expect(authServiceSpy.signOut).toHaveBeenCalledTimes(1);
  });


  describe('when a user is logged in (Integration Tests)', () => {
    beforeEach(() => {
      authServiceSpy.user$ = of(mockUser);
      taskServiceSpy.getAllTasks.mockReturnValue(of(mockTasks));

      fixture = TestBed.createComponent(HomeComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should display the list of tasks returned by the service', () => {
      const taskElements = fixture.debugElement.queryAll(By.css('li'));

      expect(taskElements.length).toBe(mockTasks.length); // 2
      expect(taskElements[0].nativeElement.textContent).toContain('Vaisselle');
      expect(taskElements[1].nativeElement.textContent).toContain('Lessive');
    });

    it('should call completeTask and update the UI when the first task checkbox is clicked', fakeAsync(() => {
      const firstTaskCheckbox = fixture.debugElement
        .queryAll(By.css('input[type="checkbox"]'))[0].nativeElement;

      expect(firstTaskCheckbox.checked).toBeFalsy();

      firstTaskCheckbox.click();

      tick();

      fixture.detectChanges();

      expect(taskServiceSpy.completeTask).toHaveBeenCalledWith('1', "123");
    }));
  });
});
