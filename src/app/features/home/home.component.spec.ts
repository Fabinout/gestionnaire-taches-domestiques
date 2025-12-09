import {ComponentFixture, TestBed} from '@angular/core/testing';

import {HomeComponent} from './home.component';
import {AuthService} from '../../core/auth/auth.service';
import {TaskService} from '../tasks/services/task.service';
import {of} from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let authServiceSpy: any;
  let taskServiceSpy: any;

  beforeEach(async () => {
    // Mock AuthService
    authServiceSpy = {
      signOut: jest.fn().mockResolvedValue(undefined),
      user$: of(null)
    };

    // Mock TaskService
    taskServiceSpy = {
      getAllTasks: jest.fn().mockReturnValue(of([]))
    };

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
