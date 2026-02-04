import axios, { AxiosInstance } from 'axios';
import type {
  N8nConfig,
  N8nWorkflow,
  N8nExecution,
  N8nWorkflowListResponse,
  CreateWorkflowInput,
  UpdateWorkflowInput,
} from './types.js';

export class N8nClient {
  private client: AxiosInstance;

  constructor(config: N8nConfig) {
    this.client = axios.create({
      baseURL: config.apiUrl,
      headers: {
        'X-N8N-API-KEY': config.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * List all workflows with optional filters
   */
  async listWorkflows(options?: {
    active?: boolean;
    tags?: string[];
    limit?: number;
  }): Promise<N8nWorkflow[]> {
    const params: Record<string, any> = {};
    if (options?.active !== undefined) params.active = options.active;
    if (options?.tags) params.tags = options.tags.join(',');
    if (options?.limit) params.limit = options.limit;

    const response = await this.client.get<N8nWorkflowListResponse>('/workflows', { params });
    return response.data.data;
  }

  /**
   * Get a specific workflow by ID
   */
  async getWorkflow(workflowId: string): Promise<N8nWorkflow> {
    const response = await this.client.get<{ data: N8nWorkflow }>(`/workflows/${workflowId}`);
    return response.data.data;
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(workflow: CreateWorkflowInput): Promise<N8nWorkflow> {
    const response = await this.client.post<{ data: N8nWorkflow }>('/workflows', workflow);
    return response.data.data;
  }

  /**
   * Update an existing workflow
   */
  async updateWorkflow(workflowId: string, updates: Partial<UpdateWorkflowInput>): Promise<N8nWorkflow> {
    const response = await this.client.patch<{ data: N8nWorkflow }>(
      `/workflows/${workflowId}`,
      updates
    );
    return response.data.data;
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    await this.client.delete(`/workflows/${workflowId}`);
  }

  /**
   * Activate a workflow
   */
  async activateWorkflow(workflowId: string): Promise<N8nWorkflow> {
    return this.updateWorkflow(workflowId, { active: true });
  }

  /**
   * Deactivate a workflow
   */
  async deactivateWorkflow(workflowId: string): Promise<N8nWorkflow> {
    return this.updateWorkflow(workflowId, { active: false });
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId: string, data?: Record<string, any>): Promise<N8nExecution> {
    const response = await this.client.post<{ data: N8nExecution }>(
      `/workflows/${workflowId}/execute`,
      data || {}
    );
    return response.data.data;
  }

  /**
   * Get workflow executions
   */
  async getExecutions(workflowId: string, options?: {
    limit?: number;
    status?: string;
  }): Promise<N8nExecution[]> {
    const params: Record<string, any> = { workflowId };
    if (options?.limit) params.limit = options.limit;
    if (options?.status) params.status = options.status;

    const response = await this.client.get<{ data: N8nExecution[] }>('/executions', { params });
    return response.data.data;
  }

  /**
   * Get a specific execution
   */
  async getExecution(executionId: string): Promise<N8nExecution> {
    const response = await this.client.get<{ data: N8nExecution }>(`/executions/${executionId}`);
    return response.data.data;
  }

  /**
   * Delete an execution
   */
  async deleteExecution(executionId: string): Promise<void> {
    await this.client.delete(`/executions/${executionId}`);
  }

  /**
   * Search workflows by name or tags
   */
  async searchWorkflows(query: string): Promise<N8nWorkflow[]> {
    const workflows = await this.listWorkflows();
    const lowerQuery = query.toLowerCase();
    
    return workflows.filter(workflow => 
      workflow.name.toLowerCase().includes(lowerQuery) ||
      workflow.tags?.some(tag => tag.name.toLowerCase().includes(lowerQuery))
    );
  }
}
