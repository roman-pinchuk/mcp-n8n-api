# Deployment Guide

This guide covers deployment strategies and CI/CD setup for the MCP n8n API server.

## Table of Contents

- [GitHub Actions CI/CD](#github-actions-cicd)
- [Docker Image Distribution](#docker-image-distribution)
- [Production Deployment](#production-deployment)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## GitHub Actions CI/CD

### Workflows Overview

The project includes two GitHub Actions workflows:

#### 1. Docker Release Workflow (`docker-release.yml`)

**Triggers:**
- On release publication (recommended)
- Manual workflow dispatch

**Actions:**
- Builds multi-platform Docker images (amd64, arm64)
- Pushes to GitHub Container Registry (ghcr.io)
- Tags with semantic versioning
- Generates build attestation for security

**Image Tags Created:**
- `{version}` - Specific version (e.g., 1.0.0)
- `{major}.{minor}` - Minor version (e.g., 1.0)
- `{major}` - Major version (e.g., 1)
- `latest` - Latest release
- `{branch}-{sha}` - Commit-specific

#### 2. Docker Test Workflow (`docker-test.yml`)

**Triggers:**
- Pull requests to main/master
- Pushes to main/master
- Changes to Dockerfile, source code, or workflows

**Actions:**
- Tests Docker build on multiple platforms
- Verifies image structure
- Scans for security vulnerabilities with Trivy
- Uploads security results to GitHub Security tab

### Setting Up GitHub Actions

#### Step 1: Enable GitHub Packages

1. Go to your repository **Settings**
2. Navigate to **Actions** → **General**
3. Under **Workflow permissions**, select:
   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create and approve pull requests

#### Step 2: Configure Container Registry

GitHub Container Registry (ghcr.io) is automatically available for your repository. No additional configuration needed!

#### Step 3: Create a Release

**Option A: Via GitHub UI**

1. Go to your repository
2. Click **Releases** → **Create a new release**
3. Choose or create a tag (e.g., `v1.0.0`)
4. Fill in release details
5. Click **Publish release**

The workflow will automatically:
- Build the Docker image
- Tag it with the version
- Push to ghcr.io

**Option B: Via Command Line**

```bash
# Create and push a tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Create release via GitHub CLI
gh release create v1.0.0 \
  --title "v1.0.0" \
  --notes "Release notes here"
```

#### Step 4: Manual Trigger (Optional)

You can manually trigger the build workflow:

```bash
# Via GitHub CLI
gh workflow run docker-release.yml -f tag=custom-tag

# Or via GitHub UI
# Actions → Docker Release → Run workflow
```

### Workflow Configuration

#### Customizing Image Registry

To use Docker Hub instead of ghcr.io:

```yaml
env:
  REGISTRY: docker.io
  IMAGE_NAME: your-username/mcp-n8n-api
```

Then add Docker Hub credentials as repository secrets:
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

Update the login step:

```yaml
- name: Log in to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}
```

#### Adding Additional Platforms

To add more platforms (e.g., arm/v7):

```yaml
platforms: linux/amd64,linux/arm64,linux/arm/v7
```

## Docker Image Distribution

### Using Pre-built Images

#### From GitHub Container Registry

```bash
# Pull latest
docker pull ghcr.io/[username]/mcp-n8n-api:latest

# Pull specific version
docker pull ghcr.io/[username]/mcp-n8n-api:1.0.0

# Run the image
docker run -it --rm \
  -e N8N_API_URL=http://host.docker.internal:5678/api/v1 \
  -e N8N_API_KEY=your_api_key \
  ghcr.io/[username]/mcp-n8n-api:latest
```

#### Configuring MCP Client with Pre-built Image

**Claude Desktop / OpenCode configuration:**

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
        "ghcr.io/[username]/mcp-n8n-api:latest"
      ]
    }
  }
}
```

### Image Versioning Strategy

**Semantic Versioning:**
- `MAJOR.MINOR.PATCH` (e.g., 1.0.0)
- `MAJOR.MINOR` (e.g., 1.0) - Tracks minor versions
- `MAJOR` (e.g., 1) - Tracks major versions
- `latest` - Always points to newest release

**Recommendations:**
- **Production:** Pin to specific version (e.g., `1.0.0`)
- **Staging:** Use minor version (e.g., `1.0`)
- **Development:** Use `latest` or build from source

**Example:**

```json
{
  "mcpServers": {
    "n8n-prod": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "...", "ghcr.io/user/mcp-n8n-api:1.0.0"]
    },
    "n8n-staging": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "...", "ghcr.io/user/mcp-n8n-api:1.0"]
    },
    "n8n-dev": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "...", "ghcr.io/user/mcp-n8n-api:latest"]
    }
  }
}
```

## Production Deployment

### Deployment Checklist

- [ ] Environment variables configured securely
- [ ] API keys rotated and stored in secrets management
- [ ] n8n instance secured with HTTPS
- [ ] Docker image pinned to specific version
- [ ] Monitoring and logging configured
- [ ] Backup strategy for n8n workflows
- [ ] Network security configured (firewall, VPN)
- [ ] Health checks implemented
- [ ] Resource limits set (CPU, memory)

### Kubernetes Deployment

**deployment.yaml:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-n8n-api
  labels:
    app: mcp-n8n-api
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mcp-n8n-api
  template:
    metadata:
      labels:
        app: mcp-n8n-api
    spec:
      containers:
      - name: mcp-n8n-api
        image: ghcr.io/[username]/mcp-n8n-api:1.0.0
        env:
        - name: N8N_API_URL
          valueFrom:
            configMapKeyRef:
              name: mcp-n8n-config
              key: n8n_api_url
        - name: N8N_API_KEY
          valueFrom:
            secretKeyRef:
              name: mcp-n8n-secrets
              key: n8n_api_key
        - name: LOG_LEVEL
          value: "info"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        stdin: true
        tty: true
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: mcp-n8n-config
data:
  n8n_api_url: "https://n8n.internal.company.com/api/v1"
---
apiVersion: v1
kind: Secret
metadata:
  name: mcp-n8n-secrets
type: Opaque
stringData:
  n8n_api_key: "your_api_key_here"
```

### Docker Compose Production Setup

**docker-compose.prod.yml:**

```yaml
version: '3.8'

services:
  mcp-n8n-api:
    image: ghcr.io/[username]/mcp-n8n-api:1.0.0
    container_name: mcp-n8n-api
    restart: unless-stopped
    environment:
      - N8N_API_URL=${N8N_API_URL}
      - N8N_API_KEY=${N8N_API_KEY}
      - LOG_LEVEL=info
    stdin_open: true
    tty: true
    networks:
      - n8n-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M

networks:
  n8n-network:
    external: true
```

### Secrets Management

#### Using Docker Secrets

```yaml
version: '3.8'

services:
  mcp-n8n-api:
    image: ghcr.io/[username]/mcp-n8n-api:1.0.0
    secrets:
      - n8n_api_key
    environment:
      - N8N_API_URL=${N8N_API_URL}
      - N8N_API_KEY_FILE=/run/secrets/n8n_api_key

secrets:
  n8n_api_key:
    file: ./secrets/n8n_api_key.txt
```

#### Using HashiCorp Vault

```bash
# Store secret in Vault
vault kv put secret/mcp-n8n api_key="your_key_here"

# Retrieve and use
export N8N_API_KEY=$(vault kv get -field=api_key secret/mcp-n8n)
docker run -e N8N_API_KEY=$N8N_API_KEY ...
```

## Monitoring and Maintenance

### Health Checks

Add to your deployment:

```yaml
healthcheck:
  test: ["CMD", "node", "-e", "process.exit(0)"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Logging

**Structured logging with JSON:**

```yaml
environment:
  - LOG_LEVEL=info
  - LOG_FORMAT=json
```

**Centralized logging with Loki:**

```yaml
logging:
  driver: loki
  options:
    loki-url: "http://loki:3100/loki/api/v1/push"
    loki-external-labels: "job=mcp-n8n-api,environment=production"
```

### Metrics and Monitoring

**Prometheus integration example:**

Add to `src/index.ts`:

```typescript
import promClient from 'prom-client';

const register = new promClient.Registry();
const toolCallCounter = new promClient.Counter({
  name: 'mcp_n8n_tool_calls_total',
  help: 'Total number of MCP tool calls',
  labelNames: ['tool_name', 'status'],
  registers: [register],
});

// In your tool handler:
toolCallCounter.labels(toolName, 'success').inc();
```

### Updating the Deployment

#### Rolling Update

```bash
# Pull latest image
docker pull ghcr.io/[username]/mcp-n8n-api:latest

# Update with docker-compose
docker-compose pull
docker-compose up -d

# Kubernetes rolling update
kubectl set image deployment/mcp-n8n-api \
  mcp-n8n-api=ghcr.io/[username]/mcp-n8n-api:1.1.0

# Monitor rollout
kubectl rollout status deployment/mcp-n8n-api
```

#### Rollback

```bash
# Docker Compose
docker-compose down
docker-compose up -d

# Kubernetes
kubectl rollout undo deployment/mcp-n8n-api
```

### Backup Strategy

**Backup n8n workflows:**

```bash
# Export all workflows
curl -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  ${N8N_API_URL}/workflows > workflows_backup.json

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
curl -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  ${N8N_API_URL}/workflows > "backups/workflows_${DATE}.json"

# Keep only last 30 days
find backups/ -name "workflows_*.json" -mtime +30 -delete
```

### Security Updates

**Dependabot configuration:**

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10

  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

### Troubleshooting Deployments

**Check workflow logs:**

```bash
# Via GitHub CLI
gh run list --workflow=docker-release.yml
gh run view [run-id] --log
```

**Test image locally:**

```bash
# Pull and test
docker pull ghcr.io/[username]/mcp-n8n-api:latest
docker run -it --rm \
  -e N8N_API_URL=http://host.docker.internal:5678/api/v1 \
  -e N8N_API_KEY=test_key \
  ghcr.io/[username]/mcp-n8n-api:latest
```

**Verify image platforms:**

```bash
docker manifest inspect ghcr.io/[username]/mcp-n8n-api:latest
```

## Best Practices

1. **Version Control:** Always tag releases with semantic versioning
2. **Image Scanning:** Review Trivy security scan results before deploying
3. **Pin Versions:** Use specific versions in production, not `latest`
4. **Secrets Rotation:** Rotate API keys regularly
5. **Monitoring:** Set up alerts for failures and performance issues
6. **Testing:** Test new images in staging before production
7. **Documentation:** Keep deployment runbooks up to date
8. **Rollback Plan:** Always have a tested rollback procedure

## Support

For deployment issues:
- Check GitHub Actions logs
- Review [CONFIGURATION.md](CONFIGURATION.md) for setup details
- Consult [README.md](README.md) for general documentation
- Open an issue with deployment logs and configuration (redact secrets)
