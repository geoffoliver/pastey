#!/bin/bash
set -e

# Install pm2
npm install -g pm2

# Install pm2-logrotate
pm2 install pm2-logrotate

# Install app dependencies and start via pm2
yarn install
pm2 start src/index.ts --interpreter bun --name pastey
pm2 save

# Generate and run the startup hook (requires sudo)
pm2 startup | tail -n 1 | sudo bash
