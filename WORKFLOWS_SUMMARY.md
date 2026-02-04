# GitHub Actions Workflows Summary

## Overview

Two automated workflows have been added to build and test Docker images for the MCP n8n API server.

## Workflows

### 1. docker-release.yml - Production Builds

**Purpose:** Automatically build and publish Docker images when a release is created.

**Triggers:**
- GitHub release publication
- Manual workflow dispatch

**Features:**
- Multi-platform builds (amd64, arm64)
- Semantic version tagging
- GitHub Container Registry (ghcr.io)
- Build provenance attestation
- Layer caching for speed

**Generated Tags:**
```
ghcr.io/[username]/mcp-n8n-api:1.0.0
ghcr.io/[username]/mcp-n8n-api:1.0
ghcr.io/[username]/mcp-n8n-api:1
ghcr.io/[username]/mcp-n8n-api:latest
ghcr.io/[username]/mcp-n8n-api:main-abc1234
```

### 2. docker-test.yml - CI Testing

**Purpose:** Test Docker builds on pull requests and commits.

**Triggers:**
- Pull requests to main/master
- Pushes to main/master
- Changes to Dockerfile or source code

**Features:**
- Multi-platform test builds
- Image structure validation
- Trivy security scanning
- GitHub Security integration
- No image push (test only)

## Quick Start

### Step 1: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/mcp-n8n-api.git
git push -u origin main
```

### Step 2: Enable GitHub Actions

1. Go to repository **Settings**
2. Navigate to **Actions** → **General**
3. Under **Workflow permissions**:
   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create and approve pull requests
4. Click **Save**

### Step 3: Create a Release

**Option A: GitHub CLI**
```bash
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0
gh release create v1.0.0 --title "v1.0.0" --notes "Initial release"
```

**Option B: GitHub UI**
1. Go to **Releases** → **Create a new release**
2. Choose tag: `v1.0.0`
3. Release title: `v1.0.0`
4. Description: Release notes
5. Click **Publish release**

### Step 4: Monitor Build

1. Go to **Actions** tab
2. Click on "Build and Push Docker Image"
3. Watch the build progress
4. Verify all steps complete successfully

### Step 5: Use the Image

```bash
# Pull the image
docker pull ghcr.io/YOUR_USERNAME/mcp-n8n-api:1.0.0

# Test it
docker run -it --rm \
  -e N8N_API_URL=http://host.docker.internal:5678/api/v1 \
  -e N8N_API_KEY=your_api_key \
  ghcr.io/YOUR_USERNAME/mcp-n8n-api:1.0.0
```

## Configuration in MCP Clients

### Claude Desktop / OpenCode

Update your MCP settings to use the pre-built image:

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
        "ghcr.io/YOUR_USERNAME/mcp-n8n-api:1.0.0"
      ]
    }
  }
}
```

**Important:** Replace `YOUR_USERNAME` with your GitHub username.

## File Structure

```
.github/
├── workflows/
│   ├── docker-release.yml  # Production builds on release
│   └── docker-test.yml     # CI testing on PRs
└── WORKFLOW_GUIDE.md       # Detailed workflow documentation

DEPLOYMENT.md               # Complete deployment guide
README.md                   # Updated with CI/CD info
```

## Security

### Vulnerability Scanning

Every PR and push triggers Trivy security scanning:
- Scans for CRITICAL and HIGH severity issues
- Checks OS packages and dependencies
- Results uploaded to GitHub Security tab
- Automatic security alerts

### Build Attestation

Release builds include provenance attestation:
- Cryptographically signed
- Records build environment
- Verifies build integrity
- Supply chain security

**Verify attestation:**
```bash
gh attestation verify \
  ghcr.io/YOUR_USERNAME/mcp-n8n-api:1.0.0 \
  --owner YOUR_USERNAME
```

## Versioning Strategy

Use semantic versioning (MAJOR.MINOR.PATCH):

- **v1.0.0** - Initial release
- **v1.0.1** - Bug fix (patch)
- **v1.1.0** - New feature (minor)
- **v2.0.0** - Breaking change (major)

Workflow automatically creates tags:
- Pin to exact version in production: `1.0.0`
- Track minor updates in staging: `1.0`
- Track major updates in dev: `1`
- Always get latest: `latest`

## Troubleshooting

### Workflow Doesn't Trigger

**Check:**
1. Actions are enabled in repository settings
2. Workflow files are in `.github/workflows/`
3. YAML syntax is valid
4. Branch protection rules don't block Actions

### Build Fails

**Check logs:**
```bash
gh run list --workflow=docker-release.yml
gh run view RUN_ID --log
```

**Common issues:**
- TypeScript compilation errors → Fix in source
- Docker build errors → Test locally first
- Permission errors → Check workflow permissions

### Image Not Found

**Make package public:**
1. Go to package settings
2. Change visibility → Public
3. Or authenticate: `docker login ghcr.io`

### Security Scan Fails

**Review vulnerabilities:**
1. Go to **Security** → **Code scanning**
2. Review Trivy findings
3. Update dependencies if needed
4. Rebuild after fixes

## Documentation

Comprehensive documentation available:

- **[.github/WORKFLOW_GUIDE.md](.github/WORKFLOW_GUIDE.md)** - Workflow quick reference
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[README.md](README.md)** - Main project documentation
- **[CONFIGURATION.md](CONFIGURATION.md)** - Configuration options

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Enable GitHub Actions
3. ✅ Create first release
4. ✅ Verify build succeeds
5. ✅ Pull and test image
6. ✅ Update MCP client configuration
7. ✅ Use with Claude or OpenCode

## Benefits

✅ **Automated** - No manual Docker commands
✅ **Consistent** - Same build process every time
✅ **Secure** - Vulnerability scanning built-in
✅ **Fast** - Layer caching speeds up builds
✅ **Multi-platform** - Works on Intel, AMD, and ARM
✅ **Versioned** - Semantic version tagging
✅ **Tested** - CI tests before merge
✅ **Documented** - Comprehensive guides included
✅ **Free** - GitHub Actions free for public repos
✅ **Professional** - Production-ready CI/CD

## Support

For workflow issues:
- Check GitHub Actions logs
- Review [WORKFLOW_GUIDE.md](.github/WORKFLOW_GUIDE.md)
- Consult [DEPLOYMENT.md](DEPLOYMENT.md)
- Open an issue with logs

---

**Status:** ✅ Ready for production use!
