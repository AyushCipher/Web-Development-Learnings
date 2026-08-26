// Define all TypeScript types for the app

export interface Task {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  email: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}
