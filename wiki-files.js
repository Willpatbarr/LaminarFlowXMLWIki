/* wiki-files.js — the list of diagram files wiki.html loads.
 *
 * A browser opened from file:// cannot list a folder, so new FILES have to be
 * named here. Two ways to do that:
 *   1. add the one line yourself, or
 *   2. run  node build.js  to rescan the folders and rewrite this list.
 *
 * Adding a diagram INSIDE a file that is already listed needs neither — just
 * save the file and refresh wiki.html.
 */
WIKI_FILES = [
  "standaloneFunctions/backend/main_go.js",
  "standaloneFunctions/frontend/App_tsx.js",
  "standaloneFunctions/frontend/main_tsx.js",
];
