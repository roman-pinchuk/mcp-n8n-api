# Quick Start Guide

Get your n8n MCP server running in 5 minutes!

## Prerequisites

- ✅ Node.js 20+ installed
- ✅ n8n instance running (local or cloud)
- ✅ n8n API key

## Step 1: Get Your n8n API Key

1. Open your n8n instance (e.g., http://localhost:5678)
2. Go to **Settings** → **API**
3. Click **Create API Key**
4. Copy the key (starts with `n8n_api_...`)

## Step 2: Install and Configure

### Option A: Quick Setup Script (Recommended)

```bash
# Clone or download this repository
cd mcp-n8n-api

# Run setup script
./scripts/setup.sh

# Edit .env with your credentials
nano .env
```

### Option B: Manual Setup

```bash
# Install dependencies
npm install

# Create configuration
cp .env.example .env

# Edit .env
# N8N_API_URL=http://localhost:5678/api/v1
# N8N_API_KEY=your_key_here

# Build
npm run build
```

## Step 3: Test the Server

```bash
# Start the server
npm start
```

You should see:
```
n8n MCP server running on stdio
```

Press `Ctrl+C` to stop.

## Step 4: Configure Your MCP Client

### For Claude Desktop

**Location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**Add this configuration:**

```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["/FULL/PATH/TO/mcp-n8n-api/dist/index.js"],
      "env": {
        "N8N_API_URL": "http://localhost:5678/api/v1",
        "N8N_API_KEY": "your_n8n_api_key_here"
      }
    }
  }
}
```

**Important:** Replace `/FULL/PATH/TO/` with the actual absolute path!

### For OpenCode

Add to your OpenCode MCP settings (same format as above).

## Step 5: Test with Claude

1. Restart Claude Desktop or OpenCode
2. Start a new conversation
3. Try these commands:

```
Show me my n8n workflows
```

```
List all active workflows
```

```
Get details for workflow [workflow-id]
```

## Docker Quick Start

### Build and Run

```bash
# Copy and edit .env
cp .env.example .env
nano .env

# Build Docker image
./scripts/docker-build.sh

# Run with docker-compose
docker-compose up
```

### Claude Desktop Config for Docker

```json
{
  "mcpServers": {
    "n8n": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "N8N_API_URL=http://host.docker.internal:5678/api/v1",
        "-e", "N8N_API_KEY=your_api_key",
        "mcp-n8n-api"
      ]
    }
  }
}
```

## Common Issues

### "Connection refused"
- ✅ Check n8n is running: `curl http://localhost:5678`
- ✅ Verify API URL includes `/api/v1`

### "Unauthorized"
- ✅ Double-check API key (no extra spaces)
- ✅ Ensure API key is enabled in n8n

### "Server not responding" in Claude
- ✅ Use absolute paths in config
- ✅ Restart Claude Desktop
- ✅ Check `npm run build` completed successfully

### Docker "host not found"
- ✅ Use `host.docker.internal` instead of `localhost`
- ✅ Ensure Docker Desktop is running

## What You Can Do

Once configured, try these prompts in Claude:

### Basic Operations
- "List my workflows"
- "Show workflow details for [name or id]"
- "Execute workflow [name]"
- "Search for workflows about email"

### Creating Workflows
- "Create a simple webhook workflow"
- "Build a scheduled workflow that runs daily"
- "Help me create a workflow to send Slack notifications"

### Managing Workflows
- "Activate workflow [name]"
- "Update workflow [id] to change the email subject"
- "Delete workflow [id]"

### Debugging
- "Show recent executions for workflow [name]"
- "Why did execution [id] fail?"
- "Analyze workflow [name] for improvements"

### Using Prompts
- "Use the create_simple_workflow prompt"
- "Use analyze_workflow for [workflow-id]"
- "Use debug_workflow for [execution-id]"

## Available Tools

The MCP server provides these tools:

1. **n8n_search_workflows** - Find workflows
2. **n8n_get_workflow_details** - View configuration
3. **n8n_execute_workflow** - Run workflows
4. **n8n_create_workflow** - Create new workflows
5. **n8n_update_workflow** - Modify workflows
6. **n8n_delete_workflow** - Remove workflows
7. **n8n_get_executions** - View execution history
8. **n8n_get_execution_details** - Debug executions

## Available Prompts

1. **create_simple_workflow** - Guided workflow creation
2. **analyze_workflow** - Optimization suggestions
3. **debug_workflow** - Troubleshooting help

## Next Steps

- 📖 Read [EXAMPLES.md](EXAMPLES.md) for detailed usage examples
- 🔧 See [CONFIGURATION.md](CONFIGURATION.md) for advanced setup
- 📚 Check [README.md](README.md) for full documentation

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review the [CONFIGURATION.md](CONFIGURATION.md) guide
3. Test n8n API directly: `curl -H "X-N8N-API-KEY: your_key" http://localhost:5678/api/v1/workflows`
4. Open an issue on GitHub with:
   - Error messages
   - Configuration (without sensitive data)
   - n8n version
   - Node.js version

## Project Structure

```
mcp-n8n-api/
├── src/
│   ├── index.ts          # Main MCP server
│   ├── n8n-client.ts     # n8n API wrapper
│   └── types.ts          # TypeScript types
├── dist/                 # Compiled JavaScript
├── scripts/
│   ├── setup.sh         # Quick setup
│   └── docker-build.sh  # Docker build helper
├── .env                 # Your configuration
├── Dockerfile           # Docker image definition
├── docker-compose.yml   # Docker Compose config
└── package.json         # Dependencies

Documentation:
├── README.md           # Full documentation
├── QUICKSTART.md       # This file
├── CONFIGURATION.md    # Configuration guide
└── EXAMPLES.md         # Usage examples
```

## Success Checklist

- [ ] n8n is running and accessible
- [ ] API key obtained from n8n
- [ ] Project dependencies installed (`npm install`)
- [ ] Project built successfully (`npm run build`)
- [ ] .env file configured with credentials
- [ ] Server starts without errors (`npm start`)
- [ ] Claude Desktop / OpenCode configured with absolute paths
- [ ] Claude Desktop / OpenCode restarted
- [ ] Test prompt works in Claude

## Resources

- [n8n Documentation](https://docs.n8n.io/)
- [n8n API Reference](https://docs.n8n.io/api/)
- [MCP Specification](https://modelcontextprotocol.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

**Ready to go?** Start with: `npm start`

Then ask Claude: **"Show me my n8n workflows"**
