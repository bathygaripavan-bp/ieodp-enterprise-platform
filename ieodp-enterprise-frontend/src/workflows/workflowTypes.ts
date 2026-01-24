export type WorkflowStatus =
  | "CREATED"
  | "REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "REOPENED";

export interface Workflow {
  id: string;
  title: string;
  status: WorkflowStatus;
  createdBy: string;
  updatedAt: string;
}
