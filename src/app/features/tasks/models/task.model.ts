export interface Task {
  id?: string;
  createdAt: string;
  completed?: boolean;
  completedBy?: string;
  name: string;
}
