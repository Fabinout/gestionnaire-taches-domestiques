import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {HomeComponent} from './home.component';
import {TaskService} from '../tasks/services/task.service';
import {AuthService, User} from '../auth/services/auth.service';
import {Observable, of} from 'rxjs';
import {By} from '@angular/platform-browser';
import {Task} from '../tasks/models/task.model';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let authServiceSpy: Partial<AuthService>;
  let taskServiceSpy: Partial<TaskService>;
  beforeEach(async () => {
    authServiceSpy = {
      signOut: jest.fn().mockResolvedValue(undefined),
      user$: of(null)
    };

    taskServiceSpy = {
      getAllTasks: jest.fn().mockReturnValue(of([])),
      updateTaskStatus: jest.fn().mockResolvedValue(undefined),
    }

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        {provide: AuthService, useValue: authServiceSpy},
        {provide: TaskService, useValue: taskServiceSpy}
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize user$ and tasks$', () => {
    expect(component.user$).toBeDefined();
    expect(component.tasks$).toBeDefined();
  });

  it('should call signOut when logout is called', async () => {
    await component.logout();
    expect(authServiceSpy.signOut).toHaveBeenCalled();
  });
});

describe('HomeComponent Integration', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let taskServiceSpy: { getAllTasks: jest.Mock; addTask: jest.Mock; updateTaskStatus: jest.Mock };
  let authServiceSpy: { signOut: jest.Mock; user$: Observable<User> };

  const mockTasks: Task[] = [
    {id: '1', name: 'Vaisselle', completed: false, createdAt: '2023-01-01'},
    {id: '2', name: 'Lessive', completed: true, createdAt: '2023-01-02'}
  ];

  beforeEach(async () => {
    taskServiceSpy = {
      getAllTasks: jest.fn(),
      addTask: jest.fn(),
      updateTaskStatus: jest.fn()
    };

    authServiceSpy = {
      signOut: jest.fn(),
      user$: of({uid: '123', email: 'test@test.com', displayName: 'Test User', photoURL: ('https://link.to.profile_picture.jpg')} as User)
    };

    taskServiceSpy.getAllTasks.mockReturnValue(of(mockTasks));
    taskServiceSpy.updateTaskStatus.mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        {provide: TaskService, useValue: taskServiceSpy},
        {provide: AuthService, useValue: authServiceSpy}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);

    fixture.detectChanges();
  });

  it('devrait afficher la liste des tâches', () => {
    fixture.detectChanges();

    const taskElements = fixture.debugElement.queryAll(By.css('li'));
    expect(taskElements.length).toBe(2);
    expect(taskElements[0].nativeElement.textContent).toContain('Vaisselle');
  });

  it('devrait appeler updateTaskStatus et mettre à jour l UI quand on clique sur la checkbox', fakeAsync(() => {
    fixture.detectChanges();

    const firstTaskCheckbox = fixture.debugElement.query(By.css('input[type="checkbox"]')).nativeElement;

    expect(firstTaskCheckbox.checked).toBeFalsy();

    firstTaskCheckbox.click();
    firstTaskCheckbox.dispatchEvent(new Event('change'));

    tick();
    fixture.detectChanges();

    expect(taskServiceSpy.updateTaskStatus).toHaveBeenCalledWith('1', true);
  }));
});
