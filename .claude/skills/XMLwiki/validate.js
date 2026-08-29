#!/usr/bin/env node
/* validate.js — structural check for XMLwiki diagram files.
 *
 *   node validate.js <wikiRoot> [file ...]
 *
 * With no files, checks every .js under classes/ and standaloneFunctions/.
 * Paths may be absolute or relative to <wikiRoot>.
 *
 * Catches what `node build.js` does not: leftover template hint text, boxes that
 * are not the house 620 width, y values that gap or overlap, function cards
 * missing their mandatory Returns / -> boxes, class folders whose first diagram
 * is named something else, and method refs that forgot their class.
 *
 * Exit 0 = clean, 1 = findings, 2 = bad usage.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const CARD_WIDTH = 620;

/* Hint text that ships in the README templates. If any of it survives into a
 * real diagram, the box was copied but never filled in. */
const PLACEHOLDERS = [
  'Location path from source root',
  'only include this box if',
  'Or other keywords',
  'one param per line',
  'underline class-scoped members',
  'link any type that has its own card',
  'one signature per line',
  'dagum long',
  'return info datatype',
  'one statement per line, real code',
  'fit at this width',
  'group the body into beats',
  'comments say why, not what',
  'Constructor Args',
  'OuterClassName',
  'BaseClassName',
  'OtherClassName',
  'NestedClassName',
  'CONSTANT_NAME',
  'constructorParam',
  'publicAttribute',
  'privateAttribute',
  'protectedAttribute',
  'packageAttribute',
  'methodName',
  'otherMethod',
  'helperThing',
  'functionName',
  'otherFunction',
  'otherClass',
];

const METHOD_REF = /#(?:func|function|fn|f|method|m)#([A-Za-z_$][\w$]*)(?![\w$.])/gi;

/* ------------------------------------------------------------------ parsing */

/* Pull `name = '<xml>'` assignments out of a file, in order, honouring \escapes
 * so an apostrophe inside code does not end the literal early. */
function diagramsIn(src) {
  const re = /^[ \t]*(?:(D)\.)?([A-Za-z_$][\w$]*)[ \t]*=[ \t]*(['"`])/gm;
  const out = [];
  let m;
  while ((m = re.exec(src))) {
    const quote = m[3];
    let i = m.index + m[0].length;
    let xml = '';
    while (i < src.length) {
      const c = src[i];
      if (c === '\\') { xml += src[i + 1] || ''; i += 2; continue; }
      if (c === quote) break;
      xml += c;
      i += 1;
    }
    out.push({name: m[2], explicit: !!m[1], quote: quote, xml: xml,
      line: src.slice(0, m.index).split('\n').length});
    re.lastIndex = i;
  }
  return out;
}

function unescapeXml(s) {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

/* value="..." holds XML-escaped HTML. Unescape once, turn block tags into
 * newlines, drop the rest of the tags, unescape again — the result is the plain
 * text a reader actually sees. */
function boxText(rawValue) {
  const html = unescapeXml(rawValue);
  const lines = html
    .replace(/<\/div>|<br\s*\/?>|<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .split('\n');
  return lines.map(l => unescapeXml(l).replace(/ /g, ' ').trimEnd()).join('\n');
}

function attr(tag, name) {
  const m = new RegExp(name + '="([^"]*)"').exec(tag);
  return m ? m[1] : null;
}

/* Every vertex cell with a geometry, in document order. Self-closing cells are
 * handled explicitly — letting them fall through to a `>…</mxCell>` match makes
 * <mxCell id="0"/> swallow the first real box. */
function boxesIn(xml) {
  const out = [];
  const CLOSE = '</mxCell>';
  const re = /<mxCell\b([^>]*?)(\/?)>/g;
  let m;
  while ((m = re.exec(xml))) {
    const head = m[1];
    let body = '';
    if (!m[2]) {
      const end = xml.indexOf(CLOSE, re.lastIndex);
      body = end === -1 ? xml.slice(re.lastIndex) : xml.slice(re.lastIndex, end);
      if (end !== -1) re.lastIndex = end + CLOSE.length;
    }
    if (attr(head, 'vertex') !== '1') continue;
    const geo = /<mxGeometry\b([^>]*)/.exec(body);
    if (!geo) continue;
    out.push({
      id: attr(head, 'id'),
      style: attr(head, 'style') || '',
      value: attr(head, 'value') || '',
      width: Number(attr(geo[1], 'width')),
      height: Number(attr(geo[1], 'height')),
      x: attr(geo[1], 'x') === null ? 0 : Number(attr(geo[1], 'x')),
      y: attr(geo[1], 'y') === null ? 0 : Number(attr(geo[1], 'y')),
    });
  }
  return out;
}

/* A template card is a stack of fixed-width auto-height rows. Anything else
 * (freehand draw.io, legacy demos) is left alone. */
function isCardBox(b) {
  return /fixedWidth=1/.test(b.style) && /resizeHeight=1/.test(b.style);
}

/* -------------------------------------------------------------- name indexes */

function walk(dir, root, out) {
  let entries;
  try { entries = fs.readdirSync(dir, {withFileTypes: true}); } catch (e) { return out; }
  entries.filter(e => !e.name.startsWith('.')).sort((a, b) => a.name.localeCompare(b.name))
    .forEach(e => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full, root, out);
      else if (/\.js$/i.test(e.name)) out.push(path.relative(root, full).split(path.sep).join('/'));
    });
  return out;
}

function allFiles(root) {
  const out = [];
  walk(path.join(root, 'classes'), root, out);
  walk(path.join(root, 'standaloneFunctions'), root, out);
  return out;
}

function nameIndex(root) {
  const methods = new Set();
  const funcs = new Set();
  allFiles(root).forEach(rel => {
    let src;
    try { src = fs.readFileSync(path.join(root, rel), 'utf8'); } catch (e) { return; }
    const names = diagramsIn(src).map(d => d.name);
    if (rel.split('/')[0] === 'classes') names.slice(1).forEach(n => methods.add(n));
    else names.forEach(n => funcs.add(n));
  });
  return {methods, funcs};
}

/* -------------------------------------------------------------------- checks */

function checkFile(root, rel, index, findings) {
  const abs = path.join(root, rel);
  let src;
  try { src = fs.readFileSync(abs, 'utf8'); }
  catch (e) { findings.push({file: rel, msg: 'cannot read: ' + e.message}); return; }

  const parts = rel.split('/');
  const isClassFile = parts[0] === 'classes';
  const diagrams = diagramsIn(src);

  if (!diagrams.length) {
    findings.push({file: rel, msg: 'no diagrams found — nothing will render.'});
    return;
  }

  if (isClassFile) {
    if (parts.length < 3) {
      findings.push({file: rel, msg: 'files directly in classes/ are ignored by the wiki; ' +
        'a class needs its own folder.'});
    } else {
      const folder = parts[parts.length - 2];
      if (diagrams[0].name !== folder) {
        findings.push({file: rel, diagram: diagrams[0].name, msg: 'first diagram must be named "' +
          folder + '" to match its folder — the Doctor tab flags this mismatch.'});
      }
    }
  }

  diagrams.forEach((d, di) => {
    const where = {file: rel, diagram: d.name, line: d.line};
    const push = msg => findings.push(Object.assign({}, where, {msg: msg}));

    /* Only a template literal is at risk. A backtick inside a single-quoted
     * literal is fine and LaminarFlow needs it — Go raw strings are backticked
     * (see healthzHandler). ${ is the hazard, in a template literal or in TS
     * source quoted inside one. */
    if (d.quote === '`' && /\$\{/.test(d.xml)) {
      push('template literal contains ${ — it will interpolate and corrupt the diagram. ' +
        'Rewrite the diagram as a single-quoted literal.');
    }
    if (!/^\s*<mxGraphModel\b/.test(d.xml) || !/<\/mxGraphModel>\s*$/.test(d.xml)) {
      push('the JS string literal does not hold a whole <mxGraphModel>…</mxGraphModel>. ' +
        'Usually an unescaped apostrophe inside the code truncates it — write \\\' instead.');
      return;
    }

    const boxes = boxesIn(d.xml);
    const cards = boxes.filter(isCardBox);
    if (cards.length < 2) return;   // freehand diagram, not a template card

    const texts = cards.map(b => boxText(b.value));
    const joined = texts.join('\n');

    PLACEHOLDERS.forEach(p => {
      if (joined.indexOf(p) !== -1) push('unfilled template text: "' + p + '"');
    });

    /* 620 is the house width, but a card may be widened as a whole for long
     * signatures. What is never allowed is boxes disagreeing, or going narrower. */
    const widths = [...new Set(cards.map(b => b.width))];
    if (widths.length > 1) {
      push('boxes disagree on width (' + widths.join(', ') + ') — widen every box ' +
        'together, never one alone.');
    }
    widths.filter(w => w < CARD_WIDTH).forEach(w => {
      push('box width ' + w + ' is under the ' + CARD_WIDTH + ' house minimum.');
    });

    const xs = new Set(cards.map(b => b.x));
    if (xs.size > 1) push('boxes disagree on x (' + [...xs].join(', ') + '); a card is one column.');

    const stacked = cards.slice().sort((a, b) => a.y - b.y);
    for (let i = 1; i < stacked.length; i += 1) {
      const expected = stacked[i - 1].y + stacked[i - 1].height;
      if (stacked[i].y !== expected) {
        push('box ' + stacked[i].id + ' starts at y=' + stacked[i].y + ' but box ' +
          stacked[i - 1].id + ' ends at y=' + expected +
          (stacked[i].y > expected ? ' — gap.' : ' — overlap.'));
      }
    }

    /* Go:  func main(          func (s *Server) Handle(          func(   (anonymous)
     * TS:  function App(       const App = (                     async function
     * Kotlin/Python kept so a card copied from the upstream wiki still validates. */
    const isFunctionCard =
      /^\s*(?:\S+\s+)*fun\s+\w+\s*\(/m.test(joined) ||
      /^\s*(?:\S+\s+)*(?:def|function)\s+\w+\s*\(/m.test(joined) ||
      /^\s*func\s*(?:\([^)]*\)\s*)?\w*\s*\(/m.test(joined) ||
      /^\s*(?:export\s+)?(?:default\s+)?const\s+\w+\s*=\s*(?:async\s*)?\(/m.test(joined);
    if (isFunctionCard) {
      if (!texts.some(t => /^\s*Returns\b/m.test(t))) {
        push('function card has no Returns box — it is mandatory even for Unit/void.');
      }
      if (!texts.some(t => /^\s*->/m.test(t))) {
        push('function card has no "-> return statement" box — it is mandatory ' +
          '(-> Unit / -> void when nothing is returned).');
      }
      if (isClassFile && di > 0 && !texts.some(t => /::/.test(t))) {
        push('method card is missing its "ClassName::" box.');
      }
    }

    let r;
    METHOD_REF.lastIndex = 0;
    while ((r = METHOD_REF.exec(d.xml))) {
      const target = r[1];
      if (index.methods.has(target) && !index.funcs.has(target)) {
        push('ref "' + r[0] + '" names a method without its class — it will resolve to ' +
          'nothing. Qualify it: #func#<ClassName>.' + target);
      }
    }
  });
}

/* ---------------------------------------------------------------------- main */

const argv = process.argv.slice(2);
if (!argv.length) {
  console.error('usage: node validate.js <wikiRoot> [file ...]');
  process.exit(2);
}

const root = path.resolve(argv[0]);
if (!fs.existsSync(path.join(root, 'build.js')) || !fs.existsSync(path.join(root, 'classes'))) {
  console.error(root + ' does not look like an XMLwiki root (no build.js / classes/).');
  process.exit(2);
}

let targets = argv.slice(1).map(f => {
  const abs = path.isAbsolute(f) ? f : path.resolve(process.cwd(), f);
  const rel = path.relative(root, fs.existsSync(abs) ? abs : path.join(root, f));
  return rel.split(path.sep).join('/');
});
if (!targets.length) targets = allFiles(root);

const index = nameIndex(root);
const findings = [];
targets.forEach(rel => checkFile(root, rel, index, findings));

if (!findings.length) {
  console.log('validate: clean — ' + targets.length + ' file(s) checked.');
  process.exit(0);
}

let last = '';
findings.forEach(f => {
  if (f.file !== last) { console.log('\n' + f.file); last = f.file; }
  const tag = f.diagram ? '  [' + f.diagram + (f.line ? ':' + f.line : '') + '] ' : '  ';
  console.log(tag + f.msg);
});
console.log('\nvalidate: ' + findings.length + ' finding(s) in ' + targets.length + ' file(s).');
process.exit(1);
