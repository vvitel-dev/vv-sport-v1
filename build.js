#!/usr/bin/env node

/**
 * Build script for vV Sport PWA.
 *
 * Prefer real parsers/minifiers instead of regex-based JS/CSS rewrites.
 * Run `npm install` once to enable esbuild minification.
 */

const fs = require('fs');
const path = require('path');

const root = __dirname;
const outputs = [
  ['index.html', 'index.html.min'],
  ['styles.css', 'styles.css.min'],
  ['app.js', 'app.js.min']
];

function sizeLabel(bytes) {
  return bytes < 1024 ? `${bytes}B` : `${(bytes / 1024).toFixed(1)}KB`;
}

function copyFile(source, target, reason) {
  const sourcePath = path.join(root, source);
  const targetPath = path.join(root, target);
  if (!fs.existsSync(sourcePath)) return;
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`- ${source} -> ${target} copied (${reason})`);
}

async function buildWithEsbuild(esbuild) {
  await esbuild.build({
    entryPoints: [path.join(root, 'app.js')],
    outfile: path.join(root, 'app.js.min'),
    bundle: false,
    minify: true,
    target: ['es2019'],
    legalComments: 'none'
  });

  await esbuild.build({
    entryPoints: [path.join(root, 'styles.css')],
    outfile: path.join(root, 'styles.css.min'),
    bundle: false,
    minify: true,
    loader: { '.css': 'css' },
    legalComments: 'none'
  });

  copyFile('index.html', 'index.html.min', 'HTML is served as source to avoid unsafe regex minification');
}

function printSavings() {
  for (const [source, target] of outputs) {
    const sourcePath = path.join(root, source);
    const targetPath = path.join(root, target);
    if (!fs.existsSync(sourcePath) || !fs.existsSync(targetPath)) continue;
    const sourceSize = fs.statSync(sourcePath).size;
    const targetSize = fs.statSync(targetPath).size;
    const reduction = sourceSize ? ((1 - targetSize / sourceSize) * 100).toFixed(1) : '0.0';
    console.log(`- ${source}: ${sizeLabel(sourceSize)} -> ${sizeLabel(targetSize)} (${reduction}% smaller)`);
  }
}

(async function main() {
  console.log('\nBuilding vV Sport PWA...\n');

  let esbuild = null;
  try {
    esbuild = require('esbuild');
  } catch (error) {
    console.warn('esbuild is not installed. Run `npm install` to enable safe minification.');
  }

  if (esbuild) {
    await buildWithEsbuild(esbuild);
  } else {
    outputs.forEach(([source, target]) => copyFile(source, target, 'safe fallback, not minified'));
  }

  console.log('\nOutput sizes:');
  printSavings();
  console.log('\nDone.\n');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
