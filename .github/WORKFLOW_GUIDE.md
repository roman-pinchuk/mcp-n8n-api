# GitHub Actions Workflow Guide

## Overview

This project includes two automated workflows for Docker image management:

1. **docker-release.yml** - Builds and publishes Docker images on release
2. **docker-test.yml** - Tests Docker builds on PRs and commits

## Quick Start

### 1. Create Your First Release

```bash
# Tag your commit
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0

# Create release via GitHub CLI
gh release create v1.0.0 \
  --title "v1.0.0 - Initial Release" \
  --notes "First production release with full n8n MCP functionality"
```

Or via GitHub UI:
1. Go to **Releases** → **Create a new release**
2. Tag: `v1.0.0`
3. Title: `v1.0.0 - Initial Release`
4. Click **Publish release**

### 2. Workflow Runs Automatically

The workflow will:
- ✅ Build Docker image for amd64 and arm64
- ✅ Tag with semantic versioning
- ✅ Push to GitHub Container Registry
- ✅ Generate security attestation

### 3. Use Your Image

```bash
docker pull ghcr.io/YOUR_USERNAME/mcp-n8n-api:1.0.0
```

## Workflow Details

### docker-release.yml

**Triggers:**
- ✅ Release published
- ✅ Manual dispatch (with custom tag)

**Created Tags:**
- `1.0.0` - Exact version
- `1.0` - Minor version track
- `1` - Major version track
- `latest` - Latest release
- `main-abc1234` - Commit SHA

**Platforms Built:**
- linux/amd64 (Intel/AMD)
- linux/arm64 (Apple Silicon, ARM servers)

**Registry:** ghcr.io (GitHub Container Registry)

### docker-test.yml

**Triggers:**
- ✅ Pull requests to main/master
- ✅ Pushes to main/master
- ✅ Changes to Dockerfile or source code

**Actions:**
- Builds image (no push)
- Tests image structure
- Scans for vulnerabilities (Trivy)
- Reports to GitHub Security

## Common Tasks

### Manual Workflow Trigger

```bash
# Via GitHub CLI
gh workflow run docker-release.yml -f tag=custom-v1.0.1

# Or via GitHub UI
Actions → Build and Push Docker Image → Run workflow
```

### Check Workflow Status

```bash
# List recent runs
gh run list --workflow=docker-release.yml

# View specific run
gh run view RUN_ID --log

# Watch live
gh run watch
```

### View Published Images

```bash
# List all versions
gh api /user/packages/container/mcp-n8n-api/versions

# Or visit: https://github.com/users/YOUR_USERNAME/packages/container/mcp-n8n-api
```

## Configuration

### Repository Settings Required

**1. Enable Actions:**
- Settings → Actions → General
- ✅ Allow all actions and reusable workflows

**2. Workflow Permissions:**
- Settings → Actions → General → Workflow permissions
- ✅ Read and write permissions
- ✅ Allow GitHub Actions to create and approve pull requests

**3. Package Visibility (Optional):**
- Packages → mcp-n8n-api → Package settings
- Make public or keep private

### Secrets (Optional)

No secrets required for ghcr.io! The `GITHUB_TOKEN` is automatically provided.

For Docker Hub, add these secrets:
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

## Image Usage

### Pull and Run

```bash
# Latest version
docker pull ghcr.io/YOUR_USERNAME/mcp-n8n-api:latest

# Specific version
docker pull ghcr.io/YOUR_USERNAME/mcp-n8n-api:1.0.0

# Run
docker run -it --rm \
  -e N8N_API_URL=http://host.docker.internal:5678/api/v1 \
  -e N8N_API_KEY=your_key \
  ghcr.io/YOUR_USERNAME/mcp-n8n-api:latest
```

### MCP Client Configuration

**Claude Desktop / OpenCode:**

```json
{
  "mcpServers": {
    "n8n": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "N8N_API_URL=http://host.docker.internal:5678/api/v1",
        "-e", "N8N_API_KEY=your_api_key_here",
        "ghcr.io/YOUR_USERNAME/mcp-n8n-api:1.0.0"
      ]
    }
  }
}
```

## Security

### Vulnerability Scanning

Trivy scans every build for:
- Critical vulnerabilities
- High severity issues
- OS package vulnerabilities
- Dependency vulnerabilities

**View results:**
- GitHub → Security → Code scanning alerts

### Build Attestation

Each release includes provenance attestation:
- Who built it
- When it was built
- What source code was used
- Build environment details

**Verify attestation:**

```bash
gh attestation verify \
  ghcr.io/YOUR_USERNAME/mcp-n8n-api:1.0.0 \
  --owner YOUR_USERNAME
```

## Troubleshooting

### Workflow Failed

**Check logs:**
```bash
gh run view --log
```

**Common issues:**
1. **Permission denied**
   - Solution: Check workflow permissions in settings

2. **Docker build failed**
   - Solution: Test locally with `docker build .`

3. **Push failed**
   - Solution: Verify package permissions

### Image Not Found

**Make package public:**
1. Go to package settings
2. Change visibility to public
3. Or authenticate: `docker login ghcr.io`

### Platform Not Supported

**Add more platforms:**

Edit `.github/workflows/docker-release.yml`:

```yaml
platforms: linux/amd64,linux/arm64,linux/arm/v7
```

## Best Practices

### Version Numbering

Follow [Semantic Versioning](https://semver.org/):
- `v1.0.0` - Initial release
- `v1.0.1` - Patch (bug fixes)
- `v1.1.0` - Minor (new features)
- `v2.0.0` - Major (breaking changes)

### Release Workflow

1. **Development**
   - Create feature branch
   - Make changes
   - Open PR (triggers test workflow)

2. **Testing**
   - Review test results
   - Check vulnerability scan
   - Merge when passing

3. **Release**
   - Tag the commit: `git tag v1.0.0`
   - Push tag: `git push origin v1.0.0`
   - Create GitHub release
   - Workflow builds and publishes

4. **Deploy**
   - Pull new image
   - Update deployments
   - Monitor for issues

### Production Recommendations

- ✅ Pin to specific versions (not `latest`)
- ✅ Test new versions in staging first
- ✅ Review security scan results
- ✅ Keep a rollback plan ready
- ✅ Monitor for new vulnerabilities
- ✅ Update dependencies regularly

## Advanced

### Multi-Registry Publishing

Publish to both ghcr.io and Docker Hub:

```yaml
- name: Build and push to multiple registries
  uses: docker/build-push-action@v5
  with:
    push: true
    tags: |
      ghcr.io/${{ github.repository }}:${{ steps.meta.outputs.version }}
      docker.io/${{ secrets.DOCKERHUB_USERNAME }}/mcp-n8n-api:${{ steps.meta.outputs.version }}
```

### Private Registry

For private registries:

```yaml
- name: Log in to private registry
  uses: docker/login-action@v3
  with:
    registry: registry.company.com
    username: ${{ secrets.REGISTRY_USERNAME }}
    password: ${{ secrets.REGISTRY_PASSWORD }}
```

### Notifications

Add Slack notifications:

```yaml
- name: Notify on success
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [GitHub Packages Documentation](https://docs.github.com/en/packages)
- [Semantic Versioning](https://semver.org/)
- [Trivy Security Scanner](https://github.com/aquasecurity/trivy)

## Support

For workflow issues:
- Check GitHub Actions logs
- Review this guide
- Consult [DEPLOYMENT.md](../DEPLOYMENT.md) for deployment details
- Open an issue with workflow logs
