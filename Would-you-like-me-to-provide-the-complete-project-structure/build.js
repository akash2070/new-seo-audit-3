#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building client...');
execSync('vite build', { stdio: 'inherit' });

console.log('Building server...');
execSync('esbuild server/production.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });

// Ensure the dist/public directory exists and copy client build
const distPublicDir = path.join('dist', 'public');
const clientDistDir = path.join('client', 'dist');

if (fs.existsSync(clientDistDir)) {
  if (fs.existsSync(distPublicDir)) {
    fs.rmSync(distPublicDir, { recursive: true, force: true });
  }
  fs.cpSync(clientDistDir, distPublicDir, { recursive: true });
  console.log('Client build copied to dist/public');
} else {
  console.error('Client build not found at client/dist');
  process.exit(1);
}

console.log('Build completed successfully!');