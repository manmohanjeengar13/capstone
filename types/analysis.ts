export type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface AnalysisProgress {
  jobId: string;
  status: JobStatus;
  progress: number;       // 0–100
  currentStep: string;
  reportId?: string;
  errorMsg?: string;
}

export interface AnalysisJobPayload {
  jobId: string;
  repoUrl: string;
  repoOwner: string;
  repoName: string;
  userId: string;
  encryptedToken: string;  // AES-256-GCM encrypted GitHub token
}
