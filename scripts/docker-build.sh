#!/bin/bash

# Docker build and tag script

set -e

VERSION=${1:-latest}
IMAGE_NAME="mcp-n8n-api"

echo "🐳 Building Docker image: ${IMAGE_NAME}:${VERSION}"

# Build the image
docker build -t "${IMAGE_NAME}:${VERSION}" .

# Also tag as latest if version is specified
if [ "$VERSION" != "latest" ]; then
    docker tag "${IMAGE_NAME}:${VERSION}" "${IMAGE_NAME}:latest"
fi

echo ""
echo "✅ Docker image built successfully!"
echo ""
echo "Images:"
docker images | grep "${IMAGE_NAME}"
echo ""
echo "To run the container:"
echo "  docker run -it --rm --env-file .env ${IMAGE_NAME}:${VERSION}"
echo ""
echo "Or use docker-compose:"
echo "  docker-compose up"
echo ""
