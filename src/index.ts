#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { N8nClient } from './n8n-client.js';
import type { N8nWorkflow } from './types.js';

dotenv.config();

const N8N_API_URL = process.env.N8N_API_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

if (!N8N_API_URL || !N8N_API_KEY) {
  console.error('Error: N8N_API_URL and N8N_API_KEY must be set in environment variables');
  process.exit(1);
}

const n8nClient = new N8nClient({
  apiUrl: N8N_API_URL,
  apiKey: N8N_API_KEY,
});

const server = new Server(
  {
    name: 'mcp-n8n-api',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'n8n_search_workflows',
        description: 'Search for workflows with optional filters. Returns a preview of each workflow.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Filter by name or description',
            },
            limit: {
              type: 'integer',
              description: 'Limit the number of results (max 200)',
              maximum: 200,
              exclusiveMinimum: 0,
            },
            projectId: {
              type: 'string',
            },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'n8n_get_workflow_details',
        description: 'Get detailed information about a specific workflow including trigger details',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'The ID of the workflow to retrieve',
            },
          },
          required: ['workflowId'],
          additionalProperties: false,
        },
      },
      {
        name: 'n8n_execute_workflow',
        description: 'Execute a workflow by ID. Before executing always ensure you know the input schema by first using the get_workflow_details tool and consulting workflow description',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'The ID of the workflow to execute',
            },
            inputs: {
              description: 'Inputs to provide to the workflow.',
              anyOf: [
                {
                  type: 'object',
                  properties: {
                    type: { type: 'string', const: 'chat' },
                    chatInput: {
                      type: 'string',
                      description: 'Input for chat-based workflows',
                    },
                  },
                  required: ['type', 'chatInput'],
                  additionalProperties: false,
                },
                {
                  type: 'object',
                  properties: {
                    type: { type: 'string', const: 'form' },
                    formData: {
                      type: 'object',
                      description: 'Input data for form-based workflows',
                      additionalProperties: {},
                    },
                  },
                  required: ['type', 'formData'],
                  additionalProperties: false,
                },
                {
                  type: 'object',
                  properties: {
                    type: { type: 'string', const: 'webhook' },
                    webhookData: {
                      type: 'object',
                      description: 'Input data for webhook-based workflows',
                      properties: {
                        method: {
                          type: 'string',
                          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
                          default: 'GET',
                          description: 'HTTP method (defaults to GET)',
                        },
                        headers: {
                          type: 'object',
                          additionalProperties: { type: 'string' },
                          description: 'HTTP headers (e.g., authorization, content-type)',
                        },
                        query: {
                          type: 'object',
                          additionalProperties: { type: 'string' },
                          description: 'Query string parameters',
                        },
                        body: {
                          type: 'object',
                          additionalProperties: {},
                          description: 'Request body data (main webhook payload)',
                        },
                      },
                      additionalProperties: false,
                    },
                  },
                  required: ['type', 'webhookData'],
                  additionalProperties: false,
                },
              ],
            },
          },
          required: ['workflowId'],
          additionalProperties: false,
        },
      },
      {
        name: 'n8n_create_workflow',
        description: 'Create a new workflow in n8n',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the workflow',
            },
            nodes: {
              type: 'array',
              description: 'Array of workflow nodes',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  type: { type: 'string' },
                  typeVersion: { type: 'number' },
                  position: {
                    type: 'array',
                    items: { type: 'number' },
                    minItems: 2,
                    maxItems: 2,
                  },
                  parameters: { type: 'object' },
                },
                required: ['name', 'type', 'position'],
              },
            },
            connections: {
              type: 'object',
              description: 'Node connections configuration',
            },
            active: {
              type: 'boolean',
              description: 'Whether the workflow should be active',
              default: false,
            },
            settings: {
              type: 'object',
              description: 'Workflow settings',
            },
          },
          required: ['name', 'nodes'],
          additionalProperties: false,
        },
      },
      {
        name: 'n8n_update_workflow',
        description: 'Update an existing workflow',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'The ID of the workflow to update',
            },
            name: {
              type: 'string',
              description: 'New name for the workflow',
            },
            nodes: {
              type: 'array',
              description: 'Updated array of workflow nodes',
              items: { type: 'object' },
            },
            connections: {
              type: 'object',
              description: 'Updated node connections',
            },
            active: {
              type: 'boolean',
              description: 'Whether the workflow should be active',
            },
            settings: {
              type: 'object',
              description: 'Updated workflow settings',
            },
          },
          required: ['workflowId'],
          additionalProperties: false,
        },
      },
      {
        name: 'n8n_delete_workflow',
        description: 'Delete a workflow by ID',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'The ID of the workflow to delete',
            },
          },
          required: ['workflowId'],
          additionalProperties: false,
        },
      },
      {
        name: 'n8n_get_executions',
        description: 'Get execution history for a workflow',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'The ID of the workflow',
            },
            limit: {
              type: 'integer',
              description: 'Maximum number of executions to return',
              default: 20,
            },
            status: {
              type: 'string',
              description: 'Filter by execution status',
              enum: ['success', 'error', 'waiting', 'running'],
            },
          },
          required: ['workflowId'],
          additionalProperties: false,
        },
      },
      {
        name: 'n8n_get_execution_details',
        description: 'Get detailed information about a specific execution',
        inputSchema: {
          type: 'object',
          properties: {
            executionId: {
              type: 'string',
              description: 'The ID of the execution',
            },
          },
          required: ['executionId'],
          additionalProperties: false,
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'n8n_search_workflows': {
        const { query, limit } = args as { query?: string; limit?: number };
        let workflows: N8nWorkflow[];

        if (query) {
          workflows = await n8nClient.searchWorkflows(query);
        } else {
          workflows = await n8nClient.listWorkflows({ limit });
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                workflows.map((w) => ({
                  id: w.id,
                  name: w.name,
                  active: w.active,
                  tags: w.tags,
                  updatedAt: w.updatedAt,
                })),
                null,
                2
              ),
            },
          ],
        };
      }

      case 'n8n_get_workflow_details': {
        const { workflowId } = args as { workflowId: string };
        const workflow = await n8nClient.getWorkflow(workflowId);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(workflow, null, 2),
            },
          ],
        };
      }

      case 'n8n_execute_workflow': {
        const { workflowId, inputs } = args as { workflowId: string; inputs?: any };
        const execution = await n8nClient.executeWorkflow(workflowId, inputs);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(execution, null, 2),
            },
          ],
        };
      }

      case 'n8n_create_workflow': {
        const workflowData = args as any;
        const workflow = await n8nClient.createWorkflow(workflowData);

        return {
          content: [
            {
              type: 'text',
              text: `Workflow created successfully!\n\n${JSON.stringify(workflow, null, 2)}`,
            },
          ],
        };
      }

      case 'n8n_update_workflow': {
        const { workflowId, ...updates } = args as any;
        const workflow = await n8nClient.updateWorkflow(workflowId, updates);

        return {
          content: [
            {
              type: 'text',
              text: `Workflow updated successfully!\n\n${JSON.stringify(workflow, null, 2)}`,
            },
          ],
        };
      }

      case 'n8n_delete_workflow': {
        const { workflowId } = args as { workflowId: string };
        await n8nClient.deleteWorkflow(workflowId);

        return {
          content: [
            {
              type: 'text',
              text: `Workflow ${workflowId} deleted successfully!`,
            },
          ],
        };
      }

      case 'n8n_get_executions': {
        const { workflowId, limit, status } = args as {
          workflowId: string;
          limit?: number;
          status?: string;
        };
        const executions = await n8nClient.getExecutions(workflowId, { limit, status });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(executions, null, 2),
            },
          ],
        };
      }

      case 'n8n_get_execution_details': {
        const { executionId } = args as { executionId: string };
        const execution = await n8nClient.getExecution(executionId);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(execution, null, 2),
            },
          ],
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    throw new McpError(ErrorCode.InternalError, `n8n API error: ${errorMessage}`);
  }
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const workflows = await n8nClient.listWorkflows();

  return {
    resources: workflows.map((workflow) => ({
      uri: `n8n://workflow/${workflow.id}`,
      mimeType: 'application/json',
      name: workflow.name,
      description: `Workflow: ${workflow.name} (${workflow.active ? 'active' : 'inactive'})`,
    })),
  };
});

// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  const match = uri.match(/^n8n:\/\/workflow\/(.+)$/);

  if (!match) {
    throw new McpError(ErrorCode.InvalidRequest, `Invalid resource URI: ${uri}`);
  }

  const workflowId = match[1];
  const workflow = await n8nClient.getWorkflow(workflowId);

  return {
    contents: [
      {
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(workflow, null, 2),
      },
    ],
  };
});

// List available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: 'create_simple_workflow',
        description: 'Guide for creating a simple n8n workflow',
        arguments: [
          {
            name: 'workflow_type',
            description: 'Type of workflow (e.g., webhook, schedule, manual)',
            required: true,
          },
        ],
      },
      {
        name: 'analyze_workflow',
        description: 'Analyze an existing workflow and suggest improvements',
        arguments: [
          {
            name: 'workflow_id',
            description: 'ID of the workflow to analyze',
            required: true,
          },
        ],
      },
      {
        name: 'debug_workflow',
        description: 'Help debug a failing workflow execution',
        arguments: [
          {
            name: 'execution_id',
            description: 'ID of the failed execution',
            required: true,
          },
        ],
      },
    ],
  };
});

// Get prompt content
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'create_simple_workflow': {
      const workflowType = args?.workflow_type || 'manual';
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `I want to create a ${workflowType} workflow in n8n. Please help me:
1. Design the workflow structure with appropriate nodes
2. Configure the trigger (${workflowType})
3. Add necessary processing nodes
4. Set up any required connections
5. Create the workflow using the n8n_create_workflow tool

Please ask me about the specific functionality I need before creating the workflow.`,
            },
          },
        ],
      };
    }

    case 'analyze_workflow': {
      const workflowId = args?.workflow_id;
      if (!workflowId) {
        throw new McpError(ErrorCode.InvalidParams, 'workflow_id is required');
      }

      const workflow = await n8nClient.getWorkflow(workflowId);

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please analyze this n8n workflow and provide:
1. Overview of what the workflow does
2. Potential improvements or optimizations
3. Security considerations
4. Error handling assessment
5. Suggestions for better maintainability

Workflow details:
${JSON.stringify(workflow, null, 2)}`,
            },
          },
        ],
      };
    }

    case 'debug_workflow': {
      const executionId = args?.execution_id;
      if (!executionId) {
        throw new McpError(ErrorCode.InvalidParams, 'execution_id is required');
      }

      const execution = await n8nClient.getExecution(executionId);

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please help debug this failed n8n workflow execution:
1. Identify the node where the error occurred
2. Explain what went wrong
3. Suggest fixes
4. Recommend preventive measures

Execution details:
${JSON.stringify(execution, null, 2)}`,
            },
          },
        ],
      };
    }

    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown prompt: ${name}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('n8n MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
