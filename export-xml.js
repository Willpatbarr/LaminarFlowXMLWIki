#!/usr/bin/env node
/* export-xml.js — writes every card's raw draw.io XML to its own file under xml/.
 *
 *   node export-xml.js         rebuild xml/ from classes/ and standaloneFunctions/
 *
 * `node build.js` runs this for you, so you rarely call it directly.
 *
 * The wiki keeps each diagram as a JS string literal so wiki.html can load it
 * from file://. That is the right shape for the page and the wrong shape for
 * anything else — you cannot double-click a .js file into draw.io, and copying
 * a card out of the XML tab is a manual step. This writes the same XML, byte
 * for byte, as one .drawio file per diagram:
 *
 *   classes/Service/document_go.js            -> xml/classes/Service/document_go/Service.drawio
 *                                                xml/classes/Service/document_go/Save.drawio
 *   standaloneFunctions/backend/main_go.js    -> xml/standaloneFunctions/backend/main_go/main.drawio
 *
 * The folder mirrors the wiki file's path (minus .js) so two files with the
 * same diagram name never collide. Each .drawio holds a bare <mxGraphModel>,
 * which draw.io opens directly (File → Open, drag-and-drop, or Extras → Edit
 * Diagram → paste).
 *
 * xml/ is GENERATED. Edit the .js card, rerun, and the .drawio follows. Editing
 * a .drawio does nothing to the wiki.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = __dirname;
const OUT_DIR = 'xml';
const TYPES = ['classes', 'standaloneFunctions'];

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

/* Diagram names in file order — the same regex build.js and wiki.html use. */
function namesIn(src) {
  const re = /^[ \t]*(?:(D)\.)?([A-Za-z_$][\w$]*)[ \t]*=[ \t]*[`'"]/gm;
  const out = [];
  let m;
  while ((m = re.exec(src))) out.push({name: m[2], explicit: !!m[1]});
  return out;
}

/* Run the file the way wiki.html does — as sloppy-mode script whose bare
 * assignments land on the global — but inside a throwaway context, so the
 * JS engine does the unescaping (\' and \\) and we get the exact XML string
 * the page renders. */
function diagramsIn(file) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const sandbox = {D: {}};
  vm.createContext(sandbox);
  try {
    vm.runInContext(src, sandbox, {filename: file});
  } catch (e) {
    return {error: e.message, diagrams: []};
  }
  const diagrams = [];
  namesIn(src).forEach(n => {
    const value = n.explicit ? sandbox.D[n.name] : sandbox[n.name];
    if (typeof value === 'string') diagrams.push({name: n.name, xml: value});
  });
  return {error: null, diagrams};
}

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, {recursive: true, force: true});
}

function exportAll(files, opts) {
  const quiet = opts && opts.quiet;
  const outRoot = path.join(ROOT, OUT_DIR);
  rmrf(outRoot);
  fs.mkdirSync(outRoot, {recursive: true});
  fs.writeFileSync(path.join(outRoot, 'README.md'),
    '# xml/ — generated, do not edit\n\n' +
    'One `.drawio` per card, holding exactly the `<mxGraphModel>` the wiki renders.\n' +
    'Folders mirror the wiki file that owns the card, minus `.js`.\n\n' +
    'Regenerate with `node build.js` (or `node export-xml.js`). Edits here are\n' +
    'overwritten on the next run — change the `.js` card instead.\n');

  let count = 0;
  const problems = [];
  files.forEach(file => {
    const {error, diagrams} = diagramsIn(file);
    if (error) { problems.push(file + ': ' + error); return; }
    if (!diagrams.length) return;
    const dir = path.join(outRoot, file.replace(/\.js$/i, ''));
    fs.mkdirSync(dir, {recursive: true});
    diagrams.forEach(d => {
      fs.writeFileSync(path.join(dir, d.name + '.drawio'), d.xml.trim() + '\n');
      count += 1;
    });
  });

  if (!quiet) {
    console.log(OUT_DIR + '/ written — ' + count + ' diagram file(s) from ' + files.length + ' card file(s).');
    problems.forEach(p => console.warn('  warning: ' + p));
  }
  return {count, problems};
}

module.exports = {exportAll, walk, TYPES};

if (require.main === module) {
  const files = [];
  TYPES.forEach(t => walk(path.join(ROOT, t), files));
  const {problems} = exportAll(files);
  process.exit(problems.length ? 1 : 0);
}
