# Configuration Guide

## Environment Variables

### Required Variables

#### N8N_API_URL
The base URL for your n8n API endpoint.

**Examples:**
```bash
# Local n8n instance
N8N_API_URL=http://localhost:5678/api/v1

# n8n Cloud
N8N_API_URL=https://your-instance.app.n8n.cloud/api/v1

# Custom domain
N8N_API_URL=https://n8n.yourdomain.com/api/v1
```

**Important:** Always include `/api/v1` at the end of the URL.

#### N8N_API_KEY
Your n8n API authentication key.

**How to obtain:**
1. Login to your n8n instance
2. Navigate to: **Settings** → **API**
3. Click **"Create API Key"**
4. Copy the generated key
5. Store it securely

**Example:**
```bash
N8N_API_KEY=n8n_api_1234567890abcdef1234567890abcdef
```

### Optional Variables

#### LOG_LEVEL
Controls logging verbosity.

**Options:** `debug`, `info`, `warn`, `error`

**Default:** `info`

**Example:**
```bash
LOG_LEVEL=debug
```

## MCP Client Configuration

### Claude Desktop Configuration

**Location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**Basic Configuration:**
```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["/Users/yourname/projects/mcp-n8n-api/dist/index.js"],
      "env": {
        "N8N_API_URL": "http://localhost:5678/api/v1",
        "N8N_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### OpenCode Configuration

Add to your OpenCode MCP settings:

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

### Docker-based Configuration

**Using pre-built image:**
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

**Important Docker Notes:**
- Use `host.docker.internal` instead of `localhost` to access host services
- The `-i` flag enables interactive mode (required for MCP stdio transport)
- The `--rm` flag automatically removes the container after it stops

## Network Configuration

### Scenario 1: n8n and MCP Server on Same Host

```bash
N8N_API_URL=http://localhost:5678/api/v1
```

### Scenario 2: n8n in Docker, MCP Server on Host

```bash
N8N_API_URL=http://localhost:5678/api/v1
```

### Scenario 3: Both in Docker (Same Network)

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    networks:
      - n8n-network
    environment:
      - N8N_API_KEY_AUTH_ENABLED=true

  mcp-n8n-api:
    build: .
    environment:
      - N8N_API_URL=http://n8n:5678/api/v1
      - N8N_API_KEY=${N8N_API_KEY}
    networks:
      - n8n-network
    depends_on:
      - n8n

networks:
  n8n-network:
    driver: bridge
```

### Scenario 4: Remote n8n Instance

```bash
N8N_API_URL=https://your-instance.app.n8n.cloud/api/v1
N8N_API_KEY=your_cloud_api_key
```

## Firewall and Security

### Required Ports

- **n8n API:** Default 5678 (or your configured port)
- **MCP Server:** No inbound ports required (uses stdio)

### Security Checklist

- [ ] API key stored in environment variables, not in code
- [ ] `.env` file added to `.gitignore`
- [ ] n8n instance uses HTTPS in production
- [ ] API keys rotated regularly
- [ ] Network access restricted to necessary services
- [ ] Docker containers run as non-root user

## Testing Configuration

### 1. Test n8n API Access

```bash
curl -X GET \
  "${N8N_API_URL}/workflows" \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}"
```

Expected: JSON response with workflow list

### 2. Test MCP Server

```bash
# Build and start the server
npm run build
npm start
```

The server should output:
```
n8n MCP server running on stdio
```

### 3. Test from Claude Desktop

1. Restart Claude Desktop after configuration changes
2. Start a new conversation
3. Try: "List my n8n workflows"
4. Verify the server responds with workflow data

## Troubleshooting

### "Connection refused" Errors

**Problem:** Cannot connect to n8n API

**Solutions:**
1. Verify n8n is running: `curl http://localhost:5678`
2. Check API URL includes `/api/v1`
3. Ensure firewall allows connections
4. For Docker: Use `host.docker.internal` instead of `localhost`

### "Unauthorized" Errors

**Problem:** API key rejected

**Solutions:**
1. Verify API key is correct (copy-paste carefully)
2. Check key hasn't expired
3. Ensure n8n API authentication is enabled
4. Try generating a new API key

### "Server not responding" in Claude

**Problem:** MCP server doesn't start

**Solutions:**
1. Check server builds successfully: `npm run build`
2. Verify Node.js version is 20+
3. Check file paths are absolute in config
4. Restart Claude Desktop after config changes
5. Check Claude Desktop logs for errors

### Docker DNS Issues

**Problem:** Docker container can't resolve `host.docker.internal`

**Solutions:**
1. On Linux, add `--add-host=host.docker.internal:host-gateway`
2. Or use the host's IP address directly
3. Ensure Docker version is recent (>= 20.10)

### API Rate Limiting

**Problem:** Too many requests error

**Solutions:**
1. Implement request throttling in your usage
2. Check n8n rate limit settings
3. Use workflow caching where possible

## Advanced Configuration

### Custom Timeouts

Modify `src/n8n-client.ts`:

```typescript
this.client = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000, // 30 seconds
  headers: {
    'X-N8N-API-KEY': config.apiKey,
    'Content-Type': 'application/json',
  },
});
```

### Proxy Configuration

Add to axios client configuration:

```typescript
this.client = axios.create({
  baseURL: config.apiUrl,
  proxy: {
    host: 'proxy.example.com',
    port: 8080,
    auth: {
      username: 'proxy-user',
      password: 'proxy-pass',
    },
  },
  // ... other config
});
```

### SSL/TLS Configuration

For self-signed certificates:

```typescript
import https from 'https';

this.client = axios.create({
  baseURL: config.apiUrl,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // Only for development!
  }),
  // ... other config
});
```

## Production Deployment

### Recommended Setup

1. **n8n:** Run behind reverse proxy (nginx/Caddy) with HTTPS
2. **MCP Server:** Deploy as Docker container
3. **Configuration:** Use secrets management (not .env files)
4. **Monitoring:** Set up logging and alerting
5. **Backup:** Regular workflow exports

### Example Production Config

```json
{
  "mcpServers": {
    "n8n": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--network", "production",
        "-e", "N8N_API_URL=https://n8n.internal.company.com/api/v1",
        "-e", "N8N_API_KEY_FILE=/run/secrets/n8n_api_key",
        "-v", "/run/secrets:/run/secrets:ro",
        "mcp-n8n-api:1.0.0"
      ]
    }
  }
}
```

## Support

For configuration assistance:
- Check the [main README](README.md)
- Review [n8n API documentation](https://docs.n8n.io/api/)
- Open an issue on GitHub with configuration details (redact sensitive info)
