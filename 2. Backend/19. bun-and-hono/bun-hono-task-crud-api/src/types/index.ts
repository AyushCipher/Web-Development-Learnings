export type User = {
  id: number;
  username: string;
  password: string;
  role: "user" | "admin";
};

export type Task = {
  id: number;
  user_id: number;
  title: string;
  description: string;
  created_at: string;
};
