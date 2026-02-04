export interface N8nConfig {
  apiUrl: string;
  apiKey: string;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  versionId?: string;
  tags?: Array<{ id: string; name: string }>;
  nodes?: N8nNode[];
  connections?: Record<string, any>;
  settings?: Record<string, any>;
  staticData?: Record<string, any>;
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters?: Record<string, any>;
  credentials?: Record<string, any>;
}

export interface N8nExecution {
  id: string;
  finished: boolean;
  mode: string;
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
  status?: 'success' | 'error' | 'waiting' | 'running';
  data?: {
    resultData?: {
      runData?: Record<string, any>;
      error?: any;
    };
  };
}

export interface N8nWorkflowListResponse {
  data: N8nWorkflow[];
  nextCursor?: string;
}

export interface N8nExecutionResponse {
  data: N8nExecution;
}

export interface CreateWorkflowInput {
  name: string;
  nodes: N8nNode[];
  connections?: Record<string, any>;
  active?: boolean;
  settings?: Record<string, any>;
  tags?: string[];
}

export interface UpdateWorkflowInput {
  id: string;
  name?: string;
  nodes?: N8nNode[];
  connections?: Record<string, any>;
  active?: boolean;
  settings?: Record<string, any>;
  tags?: string[];
}
