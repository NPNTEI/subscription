// Builds the single-file template: src/* -> index.html (CSS, JS and font inlined).
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';

const js = (await build({
  entryPoints: ['src/app.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2019',
  write: false,
  legalComments: 'none',
})).outputFiles[0].text.trim();

const css = (await build({
  entryPoints: ['src/style.css'],
  minify: true,
  write: false,
})).outputFiles[0].text.trim();

const font = readFileSync('node_modules/vazirmatn/fonts/webfonts/Vazirmatn[wght].woff2').toString('base64');
const fontFace =
  `@font-face{font-family:Vazirmatn;font-weight:100 900;font-display:swap;` +
  `src:url(data:font/woff2;base64,${font}) format("woff2")}`;

for (const [name, text] of [['js', js], ['css', css]]) {
  if (/\{%-?\s*endraw/.test(text)) throw new Error(`${name} output contains a Jinja endraw tag`);
}

const html = readFileSync('src/template.html', 'utf8')
  .replace('/*__CSS__*/', () => fontFace + css)
  .replace('/*__JS__*/', () => js);

writeFileSync('index.html', html);
console.log(`index.html written (${(html.length / 1024).toFixed(0)} KB)`);
