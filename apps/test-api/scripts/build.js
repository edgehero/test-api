
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src/handlers');
const distDir = path.join(__dirname, '../dist/handlers');

/**
 * Build each handler using esbuild
 * Who needs typescipt :D i'm to lazy to write it in typescript and run it with ts-node now :D
 * - Entry point is the TypeScript file
 * - Output file is the same name but with .js extension
 * - Bundle the output
 * - Minify the output
 * - Platform is Node.js
 * - Exclude @aws-sdk/* from the bundle as it's provided by AWS Lambda
 * - Output format is CommonJS
 */

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Get all TypeScript files from handlers directory
const handlers = fs.readdirSync(srcDir)
  .filter(file => file.endsWith('.ts'));

handlers.forEach(async handler => {
  try {
    await esbuild.build({
      entryPoints: [path.join(srcDir, handler)],
      outfile: path.join(distDir, handler.replace('.ts', '.js')),
      bundle: true,
      minify: true,
      platform: 'node',
      target: 'node22',
      format: 'cjs',
      external: ['@aws-sdk/*'],  // Don't bundle AWS SDK
    });
    console.log(`✓ Built ${handler}`);
  } catch (error) {
    console.error(`✗ Error building ${handler}:`, error);
    process.exit(1);
  }
});
