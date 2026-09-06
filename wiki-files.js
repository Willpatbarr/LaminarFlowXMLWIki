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
  "classes/Config/config_go.js",
  "classes/handler/frontend_go.js",
  "classes/indexedDoc/document_go.js",
  "classes/Migration/migrate_go.js",
  "classes/PingBody/ping_go.js",
  "classes/PingOutput/ping_go.js",
  "classes/Record/migrate_go.js",
  "classes/Service/document_go.js",
  "standaloneFunctions/backend/api_go.js",
  "standaloneFunctions/backend/cmd/migrate/main_go.js",
  "standaloneFunctions/backend/cmd/openapi/main_go.js",
  "standaloneFunctions/backend/cmd/reindex/main_go.js",
  "standaloneFunctions/backend/config_go.js",
  "standaloneFunctions/backend/db_go.js",
  "standaloneFunctions/backend/document_go.js",
  "standaloneFunctions/backend/frontend_go.js",
  "standaloneFunctions/backend/health_go.js",
  "standaloneFunctions/backend/main_go.js",
  "standaloneFunctions/backend/migrate_go.js",
  "standaloneFunctions/backend/openapi_go.js",
  "standaloneFunctions/backend/ping_go.js",
  "standaloneFunctions/backend/routes_go.js",
  "standaloneFunctions/backend/runner_go.js",
  "standaloneFunctions/backend/text_go.js",
  "standaloneFunctions/frontend/__root_tsx.js",
  "standaloneFunctions/frontend/Button_tsx.js",
  "standaloneFunctions/frontend/client_ts.js",
  "standaloneFunctions/frontend/index_tsx.js",
  "standaloneFunctions/frontend/main_tsx.js",
  "standaloneFunctions/frontend/ping_ts.js",
  "standaloneFunctions/frontend/TicketList_tsx.js",
];
