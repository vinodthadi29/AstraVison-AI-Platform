#!/usr/bin/env node

import { execSync } from 'child_process';
import { resolve } from 'path';

const projectRoot = resolve(process.cwd(), '.');

console.log('Regenerating pnpm lock file...');

try {
  // Run pnpm install with frozen-lockfile disabled to update the lock file
  execSync('pnpm install --frozen-lockfile=false', {
    cwd: projectRoot,
    stdio: 'inherit'
  });
  
  console.log('✓ pnpm lock file regenerated successfully');
} catch (error) {
  console.error('✗ Failed to regenerate lock file:', error.message);
  process.exit(1);
}
