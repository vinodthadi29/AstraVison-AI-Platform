#!/bin/bash

# Regenerate pnpm lock file
cd /vercel/share/v0-project
pnpm install --frozen-lockfile=false
echo "pnpm lock file regenerated successfully"
