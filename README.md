# n8n MCP Server

A Model Context Protocol (MCP) server that provides comprehensive access to n8n workflow automation via API. This server allows AI assistants like Claude to create, manage, execute, and debug n8n workflows.

## Features

### Tools
- **n8n_search_workflows** - Search and filter workflows
- **n8n_get_workflow_details** - Get complete workflow configuration
- **n8n_execute_workflow** - Execute workflows with custom inputs
- **n8n_create_workflow** - Create new workflows programmatically
- **n8n_update_workflow** - Update existing workflows
- **n8n_delete_workflow** - Delete workflows
- **n8n_get_executions** - Get execution history
- **n8n_get_execution_details** - Debug failed executions

### Resources
- Dynamic listing of all workflows as MCP resources
- Access workflow details via `n8n://workflow/{id}` URIs

### Prompts
- **create_simple_workflow** - Guided workflow creation
- **analyze_workflow** - Workflow optimization suggestions
- **debug_workflow** - Execution debugging assistance

## Prerequisites

- Node.js 20+ or Docker
- n8n instance (self-hosted or cloud)
- n8n API key

## Getting Your n8n API Key

1. Log into your n8n instance
2. Go to **Settings** → **API**
3. Click **Create API Key**
4. Copy the generated key

## Installation

### Option 1: Local Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your n8n credentials
# N8N_API_URL=http://localhost:5678/api/v1
# N8N_API_KEY=your_api_key_here

# Build the project
npm run build

# Run the server
npm start
```

### Option 2: Docker (Recommended)

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials

# Build and run with Docker Compose
docker-compose up -d

# Or build and run manually
docker build -t mcp-n8n-api .
docker run -it --env-file .env mcp-n8n-api
```

## Configuration with Claude Desktop / OpenCode

Add this server to your MCP settings configuration file:

### For macOS/Linux:
`~/Library/Application Support/Claude/claude_desktop_config.json` or OpenCode settings

### For Windows:
`%APPDATA%\Claude\claude_desktop_config.json`

### Local Installation Config:
```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-n8n-api/dist/index.js"],
      "env": {
        "N8N_API_URL": "http://localhost:5678/api/v1",
        "N8N_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Docker Installation Config:
```json
{
  "mcpServers": {
    "n8n": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "N8N_API_URL=http://host.docker.internal:5678/api/v1",
        "-e", "N8N_API_KEY=your_api_key_here",
        "mcp-n8n-api"
      ]
    }
  }
}
```

**Note:** Use `host.docker.internal` instead of `localhost` when accessing n8n from Docker.

## Usage Examples

### Search for Workflows
```
Find all workflows related to email processing
```

### Execute a Workflow
```
Execute workflow "Data Sync" with the following input:
{
  "userId": "123",
  "action": "sync"
}
```

### Create a New Workflow
```
Create a webhook workflow that:
1. Receives POST requests
2. Validates the data
3. Sends it to Slack
4. Stores it in a database
```

### Debug a Failed Execution
```
Use the debug_workflow prompt with execution ID abc-123
```

### Analyze and Optimize
```
Analyze workflow "Customer Onboarding" and suggest improvements
```

## API Reference

### Tools

#### n8n_search_workflows
Search for workflows by name or tags.

**Parameters:**
- `query` (optional): Search term
- `limit` (optional): Max results (default: 100)

#### n8n_get_workflow_details
Get complete workflow configuration including nodes and connections.

**Parameters:**
- `workflowId` (required): Workflow ID

#### n8n_execute_workflow
Execute a workflow with optional input data.

**Parameters:**
- `workflowId` (required): Workflow ID
- `inputs` (optional): Input data object

#### n8n_create_workflow
Create a new workflow.

**Parameters:**
- `name` (required): Workflow name
- `nodes` (required): Array of node definitions
- `connections` (optional): Node connections
- `active` (optional): Activation status
- `settings` (optional): Workflow settings

#### n8n_update_workflow
Update an existing workflow.

**Parameters:**
- `workflowId` (required): Workflow ID
- Any workflow properties to update

#### n8n_delete_workflow
Delete a workflow.

**Parameters:**
- `workflowId` (required): Workflow ID

#### n8n_get_executions
Get execution history for a workflow.

**Parameters:**
- `workflowId` (required): Workflow ID
- `limit` (optional): Max results
- `status` (optional): Filter by status (success/error/waiting/running)

#### n8n_get_execution_details
Get detailed information about a specific execution.

**Parameters:**
- `executionId` (required): Execution ID

## Development

```bash
# Watch mode for development
npm run watch

# In another terminal
npm start

# Build for production
npm run build
```

## Troubleshooting

### Connection Issues
- Verify n8n is accessible at the configured URL
- Check API key is correct and not expired
- Ensure network connectivity (especially with Docker)

### Docker Networking
- Use `host.docker.internal` for localhost n8n instances
- Ensure both containers are on the same network if n8n is also in Docker

### API Errors
- Check n8n logs for API rate limits
- Verify API version compatibility (this server uses v1)
- Ensure your API key has necessary permissions

## Architecture

```
┌─────────────────┐
│   Claude CLI    │
│   / OpenCode    │
└────────┬────────┘
         │ MCP Protocol (stdio)
         ↓
┌─────────────────┐
│  MCP n8n Server │
│  - Tools        │
│  - Resources    │
│  - Prompts      │
└────────┬────────┘
         │ HTTP/REST
         ↓
┌─────────────────┐
│   n8n Instance  │
│   (API v1)      │
└─────────────────┘
```

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Rotate API keys regularly** - Especially for production
3. **Use environment variables** - Don't hardcode credentials
4. **Restrict API key permissions** - If n8n supports granular permissions
5. **Run as non-root** - Docker image uses unprivileged user
6. **Network isolation** - Use Docker networks for container communication

## Contributing

Contributions are welcome! Please ensure:
- TypeScript compilation passes
- Code follows existing patterns
- Environment variables are documented
- Docker builds successfully

## License

MIT

## Support

For issues related to:
- **This MCP server**: Open an issue on GitHub
- **n8n API**: Check [n8n documentation](https://docs.n8n.io/api/)
- **MCP Protocol**: See [MCP specification](https://modelcontextprotocol.io/)

## Changelog

### v1.0.0
- Initial release
- Full CRUD operations for workflows
- Execution management
- Search and filter capabilities
- Docker support
- Predefined prompts for common tasks
