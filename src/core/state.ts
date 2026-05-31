
export interface Task {
  id: string;
  input: string;
  output: string;
  status: "pending" | "running" | "done" | "failed";
}
