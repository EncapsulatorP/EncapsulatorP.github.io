#!/usr/bin/env node
/* Optional build-time export. Uses exactly the browser's Canvas + GIF engine. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { fileURLToPath, pathToFileURL } = require('node:url');
const reveal = require('../assets/atlas-reveal.js');

function dependency(name) {
  try { return require(name); }
  catch (error) {
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) return require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, name));
    throw new Error('Install the optional Canvas renderer with npm install before using this CLI.', { cause: error });
  }
}

async function main() {
  const [input, output, ...flags] = process.argv.slice(2);
  if (!input || !output || flags.some(flag => !['--quick', '--loop'].includes(flag))) {
    throw new Error('Usage: node atlas/export_gif.cjs atlas/README.html output.gif [--quick] [--loop]');
  }
  const inputPath = path.resolve(input);
  const match = fs.readFileSync(inputPath, 'utf8').match(/<script\b[^>]*\bid=["']reader-config["'][^>]*>([\s\S]*?)<\/script>/);
  if (!match) throw new Error('The selected HTML has no complete reader configuration.');
  const config = JSON.parse(match[1]);
  const { createCanvas, loadImage } = dependency('@napi-rs/canvas');
  const signal = new AbortController();
  process.on('SIGINT', () => signal.abort());
  let lastPage = 0;
  const result = await reveal.exportGifData(config, {
    createCanvas,
    loadImage: value => loadImage(String(value).startsWith('file:') ? fileURLToPath(value) : value),
    baseURL: pathToFileURL(inputPath).href,
    resolveImage: value => {
      const url = new URL(value, pathToFileURL(inputPath));
      if (url.protocol !== 'file:') throw new Error('CLI exports accept only local image assets.');
      return fileURLToPath(url);
    },
    signal: signal.signal,
    ...(flags.includes('--quick') ? { readHoldMs: 3500, readPerWordMs: 0 } : {}),
    ...(flags.includes('--loop') ? { loop: 0 } : {}),
    onProgress(progress) {
      if (progress.page !== lastPage && (progress.page % 5 === 0 || progress.page === progress.pages)) {
        lastPage = progress.page;
        console.log(`Exporting page ${progress.page}/${progress.pages} (${progress.frame}/${progress.frames} frames)`);
      }
    },
  });
  const outputPath = path.resolve(output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, result.bytes);
  const summary = { ...result.summary, input: path.relative(process.cwd(), inputPath), bytes: result.bytes.length, mime: result.mime, quickPreview: flags.includes('--quick') };
  fs.writeFileSync(outputPath + '.json', JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify({ output: outputPath, pages: summary.pages, blocks: summary.blocks, frames: summary.frames, seconds: summary.durationMs / 1000, bytes: summary.bytes }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
