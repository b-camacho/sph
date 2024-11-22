#!/bin/bash

set -euox pipefail

REMOTE="do"
REMOTE_APP_DIR="~/sph"
REMOTE_STATIC_DIR="~/sph/static"

echo "Building React application..."
npm run build

echo "Creating remote directories..."
ssh $REMOTE "mkdir -p $REMOTE_APP_DIR/server"

echo "Copying built files to remote static directory..."
rsync -zaP dist/* $REMOTE:$REMOTE_STATIC_DIR/

echo "Copying server files..."
rsync -zaP package.json $REMOTE:$REMOTE_APP_DIR/
rsync -zaP src/server/* $REMOTE:$REMOTE_APP_DIR/server/

echo "Installing dependencies and starting server..."
ssh $REMOTE "source ~/.zshrc && cd $REMOTE_APP_DIR && \
  cd $REMOTE_APP_DIR && \
  bun install --production && \
  pm2 delete sph 2>/dev/null || true && \
  pm2 start server/index.ts --name sph --interpreter bun 
"

echo "Deployment completed!" 