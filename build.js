#!/usr/bin/env node
/* Regenerates wiki-files.js by scanning classes/ and standaloneFunctions/.
 *
 *   node build.js              rewrite wiki-files.js
 *   node build.js --check      exit 1 if wiki-files.js is out of date (no write)
 *   node build.js --inline     also write wiki.standalone.html — one self-contained
 *                              file with the viewer and every diagram baked in,
 *                              for emailing / dropping in a shared drive
 *
 * You only need this when you add or rename a FILE or FOLDER. Adding a diagram
 * to a file that wiki-files.js already lists needs nothing but a page refresh.
 *
 * Expected layout:
 *   classes/<Class>/<file>.js        class diagram first, then its methods
 *   classes/<Class>/<Sub>/<file>.js  a subclass, nested to any depth
 *   standaloneFunctions/<file>.js    standalone functions, one page per file
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const CLASSES_DIR = 'classes';
const FUNCS_DIR = 'standaloneFunctions';
const TYPES = [CLASSES_DIR, FUNCS_DIR];

function walk(dir, out) {
  let entries;
  try { entries = fs.readdirSync(dir, {withFileTypes: true}); }
  catch (e) { return out; }
  entries
    .filter(e => !e.name.startsWith('.'))
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(e => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full, out);
      else if (/\.js$/i.test(e.name)) out.push(path.relative(ROOT, full).split(path.sep).join('/'));
    });
  return out;
}

function scan() {
  const files = [];
  TYPES.forEach(t => walk(path.join(ROOT, t), files));
  return files;
}

function renderManifest(files) {
  const lines = files.map(f => '  "' + f + '",').join('\n');
  return [
    '/* wiki-files.js — the list of diagram files wiki.html loads.',
    ' *',
    ' * A browser opened from file:// cannot list a folder, so new FILES have to be',
    ' * named here. Two ways to do that:',
    ' *   1. add the one line yourself, or',
    ' *   2. run  node build.js  to rescan the folders and rewrite this list.',
    ' *',
    ' * Adding a diagram INSIDE a file that is already listed needs neither — just',
    ' * save the file and refresh wiki.html.',
    ' */',
    'WIKI_FILES = [',
    lines,
    '];',
    ''
  ].join('\n');
}

/* A diagram file assigns to a bare global, which is how wiki.html discovers
 * names with no boilerplate. These few window properties refuse assignment,
 * so a diagram named after one of them would vanish silently. Everything else
 * (name, status, length, open, close, self, parent, …) assigns fine.
 */
const UNASSIGNABLE = ['top', 'closed', 'history', 'location', 'navigator', 'document'];

/* Read the diagram names out of a file, in order. */
function namesIn(file) {
  let src;
  try { src = fs.readFileSync(path.join(ROOT, file), 'utf8'); } catch (e) { return []; }
  const re = /^[ \t]*(?:(D)\.)?([A-Za-z_$][\w$]*)[ \t]*=[ \t]*[`'"]/gm;
  const out = [];
  let m;
  while ((m = re.exec(src))) out.push({name: m[2], explicit: !!m[1]});
  return out;
}

/* Mirrors what wiki.html does, so the warnings match what you will see. */
function checkNames(files) {
  const warnings = [];
  const classes = new Map();     // ClassName -> folder
  const funcs = new Map();       // funcName  -> file
  const methods = new Map();     // Class.method -> file

  files.forEach(f => {
    const parts = f.split('/');
    const isClass = parts[0] === CLASSES_DIR;
    const names = namesIn(f);

    names.forEach(n => {
      if (!n.explicit && UNASSIGNABLE.includes(n.name)) {
        warnings.push(f + ': "' + n.name + '" is a read-only window property, so this diagram ' +
          'will not load. Rename it, or write  D.' + n.name + ' = `…`  instead.');
      }
    });

    if (isClass) {
      if (parts.length < 3) {
        warnings.push(f + ': files directly in ' + CLASSES_DIR + '/ are skipped. A class needs ' +
          'its own folder, e.g. ' + CLASSES_DIR + '/MyClass/MyClass.js');
        return;
      }
      const className = parts[parts.length - 2];
      if (!names.length) {
        warnings.push(f + ': no diagrams found, so class "' + className + '" has nothing to show.');
        return;
      }
      // First diagram is the class; the rest are its methods.
      if (classes.has(className)) {
        warnings.push(f + ': class "' + className + '" already defined in ' +
          classes.get(className) + '. #class#' + className + ' can only reach one of them.');
      } else classes.set(className, f);

      names.slice(1).forEach(n => {
        const key = className + '.' + n.name;
        if (methods.has(key)) {
          warnings.push(f + ': method "' + key + '" already defined in ' + methods.get(key) + '.');
        } else methods.set(key, f);
      });
    } else {
      names.forEach(n => {
        if (funcs.has(n.name)) {
          warnings.push(f + ': standalone function "' + n.name + '" already defined in ' +
            funcs.get(n.name) + '. #func#' + n.name + ' can only reach one of them.');
        } else funcs.set(n.name, f);
      });
    }
  });

  return warnings;
}

function countDiagrams(files) {
  let classes = 0, methods = 0, funcs = 0;
  files.forEach(f => {
    const n = namesIn(f).length;
    if (f.split('/')[0] === CLASSES_DIR) { if (n) { classes += 1; methods += n - 1; } }
    else funcs += n;
  });
  return {classes, methods, funcs,
    text: classes + ' class(es), ' + methods + ' method(s), ' + funcs + ' standalone function(s)'};
}

/* Encode JS source as a JS string literal with every "<" written as <.
 * This matters more than it looks. Pasting minified draw.io straight into a
 * <script> tag corrupts it: its source contains "<!--" followed later by
 * "<script", which flips the HTML tokenizer into script-data-escaped state,
 * and from there the tag closes in the wrong place. Removing every literal
 * "<" makes the payload inert to the HTML parser, and < is exactly "<"
 * once JS parses the string, so the code that finally runs is byte-identical.
 */
function jsString(src) {
  return JSON.stringify(src).replace(/</g, '\\u003c');
}

function inline(files) {
  const wiki = fs.readFileSync(path.join(ROOT, 'wiki.html'), 'utf8');
  const viewer = fs.readFileSync(path.join(ROOT, 'vendor/viewer-static.min.js'), 'utf8');

  // Injecting a real <script> element (rather than eval) keeps everything in
  // true global scope, so the payload behaves exactly as an external file would.
  const injector =
    'function __wikiInject(code){var s=document.createElement("script");' +
    's.textContent=code;document.head.appendChild(s);' +
    'if(s.parentNode)s.parentNode.removeChild(s);}\n';

  const viewerTag = '<script>' + injector + '__wikiInject(' + jsString(viewer) + ');\x3c/script>';

  const sources = files.map(f =>
    '  ' + JSON.stringify(f) + ': ' + jsString(fs.readFileSync(path.join(ROOT, f), 'utf8')) + ','
  ).join('\n');

  const filesTag = '<script>' + renderManifest(files) + '\n' +
    'WIKI_INLINE_SRC = {\n' + sources + '\n};\n\x3c/script>';

  const VIEWER_TAG = '<script src="vendor/viewer-static.min.js">\x3c/script>';
  const FILES_TAG = '<script src="wiki-files.js">\x3c/script>';
  if (wiki.indexOf(VIEWER_TAG) === -1 || wiki.indexOf(FILES_TAG) === -1) {
    throw new Error('wiki.html no longer contains the expected <script src> tags to replace.');
  }

  // Replacer FUNCTIONS, not strings: a replacement string would expand "$&",
  // "$'" and "$`" as patterns, and minified draw.io contains "$&".
  const out = wiki.replace(VIEWER_TAG, () => viewerTag).replace(FILES_TAG, () => filesTag);
  fs.writeFileSync(path.join(ROOT, 'wiki.standalone.html'), out);
  return out.length;
}

/* ---------------------------------------------------------------- main */
const args = process.argv.slice(2);
const files = scan();
const next = renderManifest(files);
const manifestPath = path.join(ROOT, 'wiki-files.js');
let current = '';
try { current = fs.readFileSync(manifestPath, 'utf8'); } catch (e) {}

if (args.includes('--check')) {
  if (current === next) { console.log('wiki-files.js is up to date (' + files.length + ' files).'); process.exit(0); }
  console.error('wiki-files.js is out of date. Run: node build.js');
  process.exit(1);
}

if (current === next) {
  console.log('wiki-files.js already lists all ' + files.length + ' file(s).');
} else {
  fs.writeFileSync(manifestPath, next);
  console.log('wiki-files.js written — ' + files.length + ' file(s): ' + countDiagrams(files).text + '.');
}

files.forEach(f => console.log('  ' + f));

const warnings = checkNames(files);
if (warnings.length) {
  console.log('');
  warnings.forEach(w => console.warn('  warning: ' + w));
}

if (args.includes('--inline')) {
  const size = inline(files);
  console.log('\nwiki.standalone.html written (' + (size / 1048576).toFixed(1) + ' MB, fully self-contained).');
}
