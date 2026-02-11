/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/[locale]/login/page";
exports.ids = ["app/[locale]/login/page"];
exports.modules = {

/***/ "(rsc)/./messages lazy recursive ^\\.\\/.*\\.json$":
/*!********************************************************!*\
  !*** ./messages/ lazy ^\.\/.*\.json$ namespace object ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./de.json": [
		"(rsc)/./messages/de.json",
		"_rsc_messages_de_json"
	],
	"./en.json": [
		"(rsc)/./messages/en.json",
		"_rsc_messages_en_json"
	],
	"./es.json": [
		"(rsc)/./messages/es.json",
		"_rsc_messages_es_json"
	],
	"./fr.json": [
		"(rsc)/./messages/fr.json",
		"_rsc_messages_fr_json"
	],
	"./ja.json": [
		"(rsc)/./messages/ja.json",
		"_rsc_messages_ja_json"
	],
	"./ko.json": [
		"(rsc)/./messages/ko.json",
		"_rsc_messages_ko_json"
	],
	"./zh.json": [
		"(rsc)/./messages/zh.json",
		"_rsc_messages_zh_json"
	]
};
function webpackAsyncContext(req) {
	if(!__webpack_require__.o(map, req)) {
		return Promise.resolve().then(() => {
			var e = new Error("Cannot find module '" + req + "'");
			e.code = 'MODULE_NOT_FOUND';
			throw e;
		});
	}

	var ids = map[req], id = ids[0];
	return __webpack_require__.e(ids[1]).then(() => {
		return __webpack_require__.t(id, 3 | 16);
	});
}
webpackAsyncContext.keys = () => (Object.keys(map));
webpackAsyncContext.id = "(rsc)/./messages lazy recursive ^\\.\\/.*\\.json$";
module.exports = webpackAsyncContext;

/***/ }),

/***/ "./action-async-storage.external":
/*!****************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external" ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/client/components/action-async-storage.external");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "./request-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/client/components/request-async-storage.external");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "./static-generation-async-storage.external":
/*!***************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external" ***!
  \***************************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/client/components/static-generation-async-storage.external");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "tls":
/*!**********************!*\
  !*** external "tls" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2F%5Blocale%5D%2Flogin%2Fpage&page=%2F%5Blocale%5D%2Flogin%2Fpage&appPaths=%2F%5Blocale%5D%2Flogin%2Fpage&pagePath=private-next-app-dir%2F%5Blocale%5D%2Flogin%2Fpage.tsx&appDir=%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2F%5Blocale%5D%2Flogin%2Fpage&page=%2F%5Blocale%5D%2Flogin%2Fpage&appPaths=%2F%5Blocale%5D%2Flogin%2Fpage&pagePath=private-next-app-dir%2F%5Blocale%5D%2Flogin%2Fpage.tsx&appDir=%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GlobalError: () => (/* reexport default from dynamic */ next_dist_client_components_error_boundary__WEBPACK_IMPORTED_MODULE_2___default.a),\n/* harmony export */   __next_app__: () => (/* binding */ __next_app__),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   pages: () => (/* binding */ pages),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   tree: () => (/* binding */ tree)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_page_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-page/module.compiled */ \"(ssr)/./node_modules/next/dist/server/future/route-modules/app-page/module.compiled.js?d969\");\n/* harmony import */ var next_dist_server_future_route_modules_app_page_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_page_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_client_components_error_boundary__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/client/components/error-boundary */ \"(rsc)/./node_modules/next/dist/client/components/error-boundary.js\");\n/* harmony import */ var next_dist_client_components_error_boundary__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_client_components_error_boundary__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var next_dist_server_app_render_entry_base__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/dist/server/app-render/entry-base */ \"(rsc)/./node_modules/next/dist/server/app-render/entry-base.js\");\n/* harmony import */ var next_dist_server_app_render_entry_base__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_app_render_entry_base__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};\n/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in next_dist_server_app_render_entry_base__WEBPACK_IMPORTED_MODULE_3__) if([\"default\",\"tree\",\"pages\",\"GlobalError\",\"originalPathname\",\"__next_app__\",\"routeModule\"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => next_dist_server_app_render_entry_base__WEBPACK_IMPORTED_MODULE_3__[__WEBPACK_IMPORT_KEY__]\n/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);\n\"TURBOPACK { transition: next-ssr }\";\n\n\n// We inject the tree and pages here so that we can use them in the route\n// module.\nconst tree = {\n        children: [\n        '',\n        {\n        children: [\n        '[locale]',\n        {\n        children: [\n        'login',\n        {\n        children: ['__PAGE__', {}, {\n          page: [() => Promise.resolve(/*! import() eager */).then(__webpack_require__.bind(__webpack_require__, /*! ./src/app/[locale]/login/page.tsx */ \"(rsc)/./src/app/[locale]/login/page.tsx\")), \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\"],\n          \n        }]\n      },\n        {\n        \n        \n      }\n      ]\n      },\n        {\n        'layout': [() => Promise.resolve(/*! import() eager */).then(__webpack_require__.bind(__webpack_require__, /*! ./src/app/[locale]/layout.tsx */ \"(rsc)/./src/app/[locale]/layout.tsx\")), \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/layout.tsx\"],\n        metadata: {\n    icon: [(async (props) => (await Promise.resolve(/*! import() eager */).then(__webpack_require__.bind(__webpack_require__, /*! next-metadata-image-loader?type=icon&segment=&basePath=&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js!./src/app/icon.svg?__next_metadata__ */ \"(rsc)/./node_modules/next/dist/build/webpack/loaders/next-metadata-image-loader.js?type=icon&segment=&basePath=&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js!./src/app/icon.svg?__next_metadata__\"))).default(props))],\n    apple: [],\n    openGraph: [],\n    twitter: [],\n    manifest: undefined\n  }\n      }\n      ]\n      },\n        {\n        'layout': [() => Promise.resolve(/*! import() eager */).then(__webpack_require__.bind(__webpack_require__, /*! ./src/app/layout.tsx */ \"(rsc)/./src/app/layout.tsx\")), \"/Users/programs/ask-pdf/apps/web/src/app/layout.tsx\"],\n'not-found': [() => Promise.resolve(/*! import() eager */).then(__webpack_require__.t.bind(__webpack_require__, /*! next/dist/client/components/not-found-error */ \"(rsc)/./node_modules/next/dist/client/components/not-found-error.js\", 23)), \"next/dist/client/components/not-found-error\"],\n        metadata: {\n    icon: [(async (props) => (await Promise.resolve(/*! import() eager */).then(__webpack_require__.bind(__webpack_require__, /*! next-metadata-image-loader?type=icon&segment=&basePath=&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js!./src/app/icon.svg?__next_metadata__ */ \"(rsc)/./node_modules/next/dist/build/webpack/loaders/next-metadata-image-loader.js?type=icon&segment=&basePath=&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js!./src/app/icon.svg?__next_metadata__\"))).default(props))],\n    apple: [],\n    openGraph: [],\n    twitter: [],\n    manifest: undefined\n  }\n      }\n      ]\n      }.children;\nconst pages = [\"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\"];\n\n\nconst __next_app_require__ = __webpack_require__\nconst __next_app_load_chunk__ = () => Promise.resolve()\nconst originalPathname = \"/[locale]/login/page\";\nconst __next_app__ = {\n    require: __next_app_require__,\n    loadChunk: __next_app_load_chunk__\n};\n\n// Create and export the route module that will be consumed.\nconst routeModule = new next_dist_server_future_route_modules_app_page_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppPageRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_PAGE,\n        page: \"/[locale]/login/page\",\n        pathname: \"/[locale]/login\",\n        // The following aren't used in production.\n        bundlePath: \"\",\n        filename: \"\",\n        appPaths: []\n    },\n    userland: {\n        loaderTree: tree\n    }\n});\n\n//# sourceMappingURL=app-page.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkYlNUJsb2NhbGUlNUQlMkZsb2dpbiUyRnBhZ2UmcGFnZT0lMkYlNUJsb2NhbGUlNUQlMkZsb2dpbiUyRnBhZ2UmYXBwUGF0aHM9JTJGJTVCbG9jYWxlJTVEJTJGbG9naW4lMkZwYWdlJnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGJTVCbG9jYWxlJTVEJTJGbG9naW4lMkZwYWdlLnRzeCZhcHBEaXI9JTJGVXNlcnMlMkZwcm9ncmFtcyUyRmFzay1wZGYlMkZhcHBzJTJGd2ViJTJGc3JjJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRnByb2dyYW1zJTJGYXNrLXBkZiUyRmFwcHMlMkZ3ZWImaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxhQUFhLHNCQUFzQjtBQUNpRTtBQUNyQztBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUM7QUFDakMsdUJBQXVCLDhLQUFxRztBQUM1SDtBQUNBLFNBQVM7QUFDVCxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBLHlCQUF5QixzS0FBaUc7QUFDMUg7QUFDQSxvQ0FBb0MsMGVBQTBPO0FBQzlRO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0EseUJBQXlCLG9KQUF3RjtBQUNqSCxvQkFBb0IsME5BQWdGO0FBQ3BHO0FBQ0Esb0NBQW9DLDBlQUEwTztBQUM5UTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUN1QjtBQUM2RDtBQUNwRiw2QkFBNkIsbUJBQW1CO0FBQ2hEO0FBQ087QUFDQTtBQUNQO0FBQ0E7QUFDQTtBQUN1RDtBQUN2RDtBQUNPLHdCQUF3Qiw4R0FBa0I7QUFDakQ7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYXNrLXBkZi13ZWIvPzA1OGEiXSwic291cmNlc0NvbnRlbnQiOlsiXCJUVVJCT1BBQ0sgeyB0cmFuc2l0aW9uOiBuZXh0LXNzciB9XCI7XG5pbXBvcnQgeyBBcHBQYWdlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcGFnZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1raW5kXCI7XG4vLyBXZSBpbmplY3QgdGhlIHRyZWUgYW5kIHBhZ2VzIGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCB0cmVlID0ge1xuICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAnJyxcbiAgICAgICAge1xuICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAnW2xvY2FsZV0nLFxuICAgICAgICB7XG4gICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICdsb2dpbicsXG4gICAgICAgIHtcbiAgICAgICAgY2hpbGRyZW46IFsnX19QQUdFX18nLCB7fSwge1xuICAgICAgICAgIHBhZ2U6IFsoKSA9PiBpbXBvcnQoLyogd2VicGFja01vZGU6IFwiZWFnZXJcIiAqLyBcIi9Vc2Vycy9wcm9ncmFtcy9hc2stcGRmL2FwcHMvd2ViL3NyYy9hcHAvW2xvY2FsZV0vbG9naW4vcGFnZS50c3hcIiksIFwiL1VzZXJzL3Byb2dyYW1zL2Fzay1wZGYvYXBwcy93ZWIvc3JjL2FwcC9bbG9jYWxlXS9sb2dpbi9wYWdlLnRzeFwiXSxcbiAgICAgICAgICBcbiAgICAgICAgfV1cbiAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgfVxuICAgICAgXVxuICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAnbGF5b3V0JzogWygpID0+IGltcG9ydCgvKiB3ZWJwYWNrTW9kZTogXCJlYWdlclwiICovIFwiL1VzZXJzL3Byb2dyYW1zL2Fzay1wZGYvYXBwcy93ZWIvc3JjL2FwcC9bbG9jYWxlXS9sYXlvdXQudHN4XCIpLCBcIi9Vc2Vycy9wcm9ncmFtcy9hc2stcGRmL2FwcHMvd2ViL3NyYy9hcHAvW2xvY2FsZV0vbGF5b3V0LnRzeFwiXSxcbiAgICAgICAgbWV0YWRhdGE6IHtcbiAgICBpY29uOiBbKGFzeW5jIChwcm9wcykgPT4gKGF3YWl0IGltcG9ydCgvKiB3ZWJwYWNrTW9kZTogXCJlYWdlclwiICovIFwibmV4dC1tZXRhZGF0YS1pbWFnZS1sb2FkZXI/dHlwZT1pY29uJnNlZ21lbnQ9JmJhc2VQYXRoPSZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzIS9Vc2Vycy9wcm9ncmFtcy9hc2stcGRmL2FwcHMvd2ViL3NyYy9hcHAvaWNvbi5zdmc/X19uZXh0X21ldGFkYXRhX19cIikpLmRlZmF1bHQocHJvcHMpKV0sXG4gICAgYXBwbGU6IFtdLFxuICAgIG9wZW5HcmFwaDogW10sXG4gICAgdHdpdHRlcjogW10sXG4gICAgbWFuaWZlc3Q6IHVuZGVmaW5lZFxuICB9XG4gICAgICB9XG4gICAgICBdXG4gICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICdsYXlvdXQnOiBbKCkgPT4gaW1wb3J0KC8qIHdlYnBhY2tNb2RlOiBcImVhZ2VyXCIgKi8gXCIvVXNlcnMvcHJvZ3JhbXMvYXNrLXBkZi9hcHBzL3dlYi9zcmMvYXBwL2xheW91dC50c3hcIiksIFwiL1VzZXJzL3Byb2dyYW1zL2Fzay1wZGYvYXBwcy93ZWIvc3JjL2FwcC9sYXlvdXQudHN4XCJdLFxuJ25vdC1mb3VuZCc6IFsoKSA9PiBpbXBvcnQoLyogd2VicGFja01vZGU6IFwiZWFnZXJcIiAqLyBcIm5leHQvZGlzdC9jbGllbnQvY29tcG9uZW50cy9ub3QtZm91bmQtZXJyb3JcIiksIFwibmV4dC9kaXN0L2NsaWVudC9jb21wb25lbnRzL25vdC1mb3VuZC1lcnJvclwiXSxcbiAgICAgICAgbWV0YWRhdGE6IHtcbiAgICBpY29uOiBbKGFzeW5jIChwcm9wcykgPT4gKGF3YWl0IGltcG9ydCgvKiB3ZWJwYWNrTW9kZTogXCJlYWdlclwiICovIFwibmV4dC1tZXRhZGF0YS1pbWFnZS1sb2FkZXI/dHlwZT1pY29uJnNlZ21lbnQ9JmJhc2VQYXRoPSZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzIS9Vc2Vycy9wcm9ncmFtcy9hc2stcGRmL2FwcHMvd2ViL3NyYy9hcHAvaWNvbi5zdmc/X19uZXh0X21ldGFkYXRhX19cIikpLmRlZmF1bHQocHJvcHMpKV0sXG4gICAgYXBwbGU6IFtdLFxuICAgIG9wZW5HcmFwaDogW10sXG4gICAgdHdpdHRlcjogW10sXG4gICAgbWFuaWZlc3Q6IHVuZGVmaW5lZFxuICB9XG4gICAgICB9XG4gICAgICBdXG4gICAgICB9LmNoaWxkcmVuO1xuY29uc3QgcGFnZXMgPSBbXCIvVXNlcnMvcHJvZ3JhbXMvYXNrLXBkZi9hcHBzL3dlYi9zcmMvYXBwL1tsb2NhbGVdL2xvZ2luL3BhZ2UudHN4XCJdO1xuZXhwb3J0IHsgdHJlZSwgcGFnZXMgfTtcbmV4cG9ydCB7IGRlZmF1bHQgYXMgR2xvYmFsRXJyb3IgfSBmcm9tIFwibmV4dC9kaXN0L2NsaWVudC9jb21wb25lbnRzL2Vycm9yLWJvdW5kYXJ5XCI7XG5jb25zdCBfX25leHRfYXBwX3JlcXVpcmVfXyA9IF9fd2VicGFja19yZXF1aXJlX19cbmNvbnN0IF9fbmV4dF9hcHBfbG9hZF9jaHVua19fID0gKCkgPT4gUHJvbWlzZS5yZXNvbHZlKClcbmV4cG9ydCBjb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvW2xvY2FsZV0vbG9naW4vcGFnZVwiO1xuZXhwb3J0IGNvbnN0IF9fbmV4dF9hcHBfXyA9IHtcbiAgICByZXF1aXJlOiBfX25leHRfYXBwX3JlcXVpcmVfXyxcbiAgICBsb2FkQ2h1bms6IF9fbmV4dF9hcHBfbG9hZF9jaHVua19fXG59O1xuZXhwb3J0ICogZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvYXBwLXJlbmRlci9lbnRyeS1iYXNlXCI7XG4vLyBDcmVhdGUgYW5kIGV4cG9ydCB0aGUgcm91dGUgbW9kdWxlIHRoYXQgd2lsbCBiZSBjb25zdW1lZC5cbmV4cG9ydCBjb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBQYWdlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9QQUdFLFxuICAgICAgICBwYWdlOiBcIi9bbG9jYWxlXS9sb2dpbi9wYWdlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9bbG9jYWxlXS9sb2dpblwiLFxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGFyZW4ndCB1c2VkIGluIHByb2R1Y3Rpb24uXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcIlwiLFxuICAgICAgICBhcHBQYXRoczogW11cbiAgICB9LFxuICAgIHVzZXJsYW5kOiB7XG4gICAgICAgIGxvYWRlclRyZWU6IHRyZWVcbiAgICB9XG59KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXBhZ2UuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2F%5Blocale%5D%2Flogin%2Fpage&page=%2F%5Blocale%5D%2Flogin%2Fpage&appPaths=%2F%5Blocale%5D%2Flogin%2Fpage&pagePath=private-next-app-dir%2F%5Blocale%5D%2Flogin%2Fpage.tsx&appDir=%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fnode_modules%2Fnext%2Fdist%2Fclient%2Fcomponents%2Fapp-router.js%22%2C%22ids%22%3A%5B%5D%7D&modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fnode_modules%2Fnext%2Fdist%2Fclient%2Fcomponents%2Fclient-page.js%22%2C%22ids%22%3A%5B%5D%7D&modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fnode_modules%2Fnext%2Fdist%2Fclient%2Fcomponents%2Ferror-boundary.js%22%2C%22ids%22%3A%5B%5D%7D&modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fnode_modules%2Fnext%2Fdist%2Fclient%2Fcomponents%2Flayout-router.js%22%2C%22ids%22%3A%5B%5D%7D&modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fnode_modules%2Fnext%2Fdist%2Fclient%2Fcomponents%2Fnot-found-boundary.js%22%2C%22ids%22%3A%5B%5D%7D&modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fnode_modules%2Fnext%2Fdist%2Fclient%2Fcomponents%2Frender-from-template-context.js%22%2C%22ids%22%3A%5B%5D%7D&server=true!":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fnode_modules%2Fnext%2Fdist%2Fclient%2Fcomponents%2Fapp-router.js%22%2C%22ids%22%3A%5B%5D%7D&modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fnode_modules%2Fnext%2Fdist%2Fclient%2Fcomponents%2Fclient-page.js%22%2C%22ids%22%3A%5B%5D%7D&modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fnode_modules%2Fnext%2Fdist%2Fclient%2Fcomponents%2Ferror-boundary.js%22%2C%22ids%22%3A%5B%5D%7D&modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fnode_modules%2Fnext%2Fdist%2Fclient%2Fcomponents%2Flayout-router.js%22%2C%22ids%22%3A%5B%5D%7D&modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fnode_modules%2Fnext%2Fdist%2Fclient%2Fcomponents%2Fnot-found-boundary.js%22%2C%22ids%22%3A%5B%5D%7D&modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fnode_modules%2Fnext%2Fdist%2Fclient%2Fcomponents%2Frender-from-template-context.js%22%2C%22ids%22%3A%5B%5D%7D&server=true! ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("Promise.resolve(/*! import() eager */).then(__webpack_require__.t.bind(__webpack_require__, /*! ./node_modules/next/dist/client/components/app-router.js */ \"(ssr)/./node_modules/next/dist/client/components/app-router.js\", 23));\n;\nPromise.resolve(/*! import() eager */).then(__webpack_require__.t.bind(__webpack_require__, /*! ./node_modules/next/dist/client/components/client-page.js */ \"(ssr)/./node_modules/next/dist/client/components/client-page.js\", 23));\n;\nPromise.resolve(/*! import() eager */).then(__webpack_require__.t.bind(__webpack_require__, /*! ./node_modules/next/dist/client/components/error-boundary.js */ \"(ssr)/./node_modules/next/dist/client/components/error-boundary.js\", 23));\n;\nPromise.resolve(/*! import() eager */).then(__webpack_require__.t.bind(__webpack_require__, /*! ./node_modules/next/dist/client/components/layout-router.js */ \"(ssr)/./node_modules/next/dist/client/components/layout-router.js\", 23));\n;\nPromise.resolve(/*! import() eager */).then(__webpack_require__.t.bind(__webpack_require__, /*! ./node_modules/next/dist/client/components/not-found-boundary.js */ \"(ssr)/./node_modules/next/dist/client/components/not-found-boundary.js\", 23));\n;\nPromise.resolve(/*! import() eager */).then(__webpack_require__.t.bind(__webpack_require__, /*! ./node_modules/next/dist/client/components/render-from-template-context.js */ \"(ssr)/./node_modules/next/dist/client/components/render-from-template-context.js\", 23));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWZsaWdodC1jbGllbnQtZW50cnktbG9hZGVyLmpzP21vZHVsZXM9JTdCJTIycmVxdWVzdCUyMiUzQSUyMiUyRlVzZXJzJTJGcHJvZ3JhbXMlMkZhc2stcGRmJTJGYXBwcyUyRndlYiUyRm5vZGVfbW9kdWxlcyUyRm5leHQlMkZkaXN0JTJGY2xpZW50JTJGY29tcG9uZW50cyUyRmFwcC1yb3V0ZXIuanMlMjIlMkMlMjJpZHMlMjIlM0ElNUIlNUQlN0QmbW9kdWxlcz0lN0IlMjJyZXF1ZXN0JTIyJTNBJTIyJTJGVXNlcnMlMkZwcm9ncmFtcyUyRmFzay1wZGYlMkZhcHBzJTJGd2ViJTJGbm9kZV9tb2R1bGVzJTJGbmV4dCUyRmRpc3QlMkZjbGllbnQlMkZjb21wb25lbnRzJTJGY2xpZW50LXBhZ2UuanMlMjIlMkMlMjJpZHMlMjIlM0ElNUIlNUQlN0QmbW9kdWxlcz0lN0IlMjJyZXF1ZXN0JTIyJTNBJTIyJTJGVXNlcnMlMkZwcm9ncmFtcyUyRmFzay1wZGYlMkZhcHBzJTJGd2ViJTJGbm9kZV9tb2R1bGVzJTJGbmV4dCUyRmRpc3QlMkZjbGllbnQlMkZjb21wb25lbnRzJTJGZXJyb3ItYm91bmRhcnkuanMlMjIlMkMlMjJpZHMlMjIlM0ElNUIlNUQlN0QmbW9kdWxlcz0lN0IlMjJyZXF1ZXN0JTIyJTNBJTIyJTJGVXNlcnMlMkZwcm9ncmFtcyUyRmFzay1wZGYlMkZhcHBzJTJGd2ViJTJGbm9kZV9tb2R1bGVzJTJGbmV4dCUyRmRpc3QlMkZjbGllbnQlMkZjb21wb25lbnRzJTJGbGF5b3V0LXJvdXRlci5qcyUyMiUyQyUyMmlkcyUyMiUzQSU1QiU1RCU3RCZtb2R1bGVzPSU3QiUyMnJlcXVlc3QlMjIlM0ElMjIlMkZVc2VycyUyRnByb2dyYW1zJTJGYXNrLXBkZiUyRmFwcHMlMkZ3ZWIlMkZub2RlX21vZHVsZXMlMkZuZXh0JTJGZGlzdCUyRmNsaWVudCUyRmNvbXBvbmVudHMlMkZub3QtZm91bmQtYm91bmRhcnkuanMlMjIlMkMlMjJpZHMlMjIlM0ElNUIlNUQlN0QmbW9kdWxlcz0lN0IlMjJyZXF1ZXN0JTIyJTNBJTIyJTJGVXNlcnMlMkZwcm9ncmFtcyUyRmFzay1wZGYlMkZhcHBzJTJGd2ViJTJGbm9kZV9tb2R1bGVzJTJGbmV4dCUyRmRpc3QlMkZjbGllbnQlMkZjb21wb25lbnRzJTJGcmVuZGVyLWZyb20tdGVtcGxhdGUtY29udGV4dC5qcyUyMiUyQyUyMmlkcyUyMiUzQSU1QiU1RCU3RCZzZXJ2ZXI9dHJ1ZSEiLCJtYXBwaW5ncyI6IkFBQUEsa09BQTRIO0FBQzVIO0FBQ0Esb09BQTZIO0FBQzdIO0FBQ0EsME9BQWdJO0FBQ2hJO0FBQ0Esd09BQStIO0FBQy9IO0FBQ0Esa1BBQW9JO0FBQ3BJO0FBQ0Esc1FBQThJIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYXNrLXBkZi13ZWIvPzM1NTYiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0KC8qIHdlYnBhY2tNb2RlOiBcImVhZ2VyXCIgKi8gXCIvVXNlcnMvcHJvZ3JhbXMvYXNrLXBkZi9hcHBzL3dlYi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2NsaWVudC9jb21wb25lbnRzL2FwcC1yb3V0ZXIuanNcIik7XG47XG5pbXBvcnQoLyogd2VicGFja01vZGU6IFwiZWFnZXJcIiAqLyBcIi9Vc2Vycy9wcm9ncmFtcy9hc2stcGRmL2FwcHMvd2ViL25vZGVfbW9kdWxlcy9uZXh0L2Rpc3QvY2xpZW50L2NvbXBvbmVudHMvY2xpZW50LXBhZ2UuanNcIik7XG47XG5pbXBvcnQoLyogd2VicGFja01vZGU6IFwiZWFnZXJcIiAqLyBcIi9Vc2Vycy9wcm9ncmFtcy9hc2stcGRmL2FwcHMvd2ViL25vZGVfbW9kdWxlcy9uZXh0L2Rpc3QvY2xpZW50L2NvbXBvbmVudHMvZXJyb3ItYm91bmRhcnkuanNcIik7XG47XG5pbXBvcnQoLyogd2VicGFja01vZGU6IFwiZWFnZXJcIiAqLyBcIi9Vc2Vycy9wcm9ncmFtcy9hc2stcGRmL2FwcHMvd2ViL25vZGVfbW9kdWxlcy9uZXh0L2Rpc3QvY2xpZW50L2NvbXBvbmVudHMvbGF5b3V0LXJvdXRlci5qc1wiKTtcbjtcbmltcG9ydCgvKiB3ZWJwYWNrTW9kZTogXCJlYWdlclwiICovIFwiL1VzZXJzL3Byb2dyYW1zL2Fzay1wZGYvYXBwcy93ZWIvbm9kZV9tb2R1bGVzL25leHQvZGlzdC9jbGllbnQvY29tcG9uZW50cy9ub3QtZm91bmQtYm91bmRhcnkuanNcIik7XG47XG5pbXBvcnQoLyogd2VicGFja01vZGU6IFwiZWFnZXJcIiAqLyBcIi9Vc2Vycy9wcm9ncmFtcy9hc2stcGRmL2FwcHMvd2ViL25vZGVfbW9kdWxlcy9uZXh0L2Rpc3QvY2xpZW50L2NvbXBvbmVudHMvcmVuZGVyLWZyb20tdGVtcGxhdGUtY29udGV4dC5qc1wiKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fnode_modules%2Fnext%2Fdist%2Fclient%2Fcomponents%2Fapp-router.js%22%2C%22ids%22%3A%5B%5D%7D&modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fnode_modules%2Fnext%2Fdist%2Fclient%2Fcomponents%2Fclient-page.js%22%2C%22ids%22%3A%5B%5D%7D&modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fnode_modules%2Fnext%2Fdist%2Fclient%2Fcomponents%2Ferror-boundary.js%22%2C%22ids%22%3A%5B%5D%7D&modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fnode_modules%2Fnext%2Fdist%2Fclient%2Fcomponents%2Flayout-router.js%22%2C%22ids%22%3A%5B%5D%7D&modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fnode_modules%2Fnext%2Fdist%2Fclient%2Fcomponents%2Fnot-found-boundary.js%22%2C%22ids%22%3A%5B%5D%7D&modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fnode_modules%2Fnext%2Fdist%2Fclient%2Fcomponents%2Frender-from-template-context.js%22%2C%22ids%22%3A%5B%5D%7D&server=true!\n");

/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fnode_modules%2Fnext-intl%2Fdist%2Fesm%2Fdevelopment%2Fshared%2FNextIntlClientProvider.js%22%2C%22ids%22%3A%5B%22default%22%5D%7D&server=true!":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fnode_modules%2Fnext-intl%2Fdist%2Fesm%2Fdevelopment%2Fshared%2FNextIntlClientProvider.js%22%2C%22ids%22%3A%5B%22default%22%5D%7D&server=true! ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("Promise.resolve(/*! import() eager */).then(__webpack_require__.bind(__webpack_require__, /*! ./node_modules/next-intl/dist/esm/development/shared/NextIntlClientProvider.js */ \"(ssr)/./node_modules/next-intl/dist/esm/development/shared/NextIntlClientProvider.js\"));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWZsaWdodC1jbGllbnQtZW50cnktbG9hZGVyLmpzP21vZHVsZXM9JTdCJTIycmVxdWVzdCUyMiUzQSUyMiUyRlVzZXJzJTJGcHJvZ3JhbXMlMkZhc2stcGRmJTJGYXBwcyUyRndlYiUyRm5vZGVfbW9kdWxlcyUyRm5leHQtaW50bCUyRmRpc3QlMkZlc20lMkZkZXZlbG9wbWVudCUyRnNoYXJlZCUyRk5leHRJbnRsQ2xpZW50UHJvdmlkZXIuanMlMjIlMkMlMjJpZHMlMjIlM0ElNUIlMjJkZWZhdWx0JTIyJTVEJTdEJnNlcnZlcj10cnVlISIsIm1hcHBpbmdzIjoiQUFBQSx3UUFBK0siLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc2stcGRmLXdlYi8/Y2NmNiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQoLyogd2VicGFja01vZGU6IFwiZWFnZXJcIiwgd2VicGFja0V4cG9ydHM6IFtcImRlZmF1bHRcIl0gKi8gXCIvVXNlcnMvcHJvZ3JhbXMvYXNrLXBkZi9hcHBzL3dlYi9ub2RlX21vZHVsZXMvbmV4dC1pbnRsL2Rpc3QvZXNtL2RldmVsb3BtZW50L3NoYXJlZC9OZXh0SW50bENsaWVudFByb3ZpZGVyLmpzXCIpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fnode_modules%2Fnext-intl%2Fdist%2Fesm%2Fdevelopment%2Fshared%2FNextIntlClientProvider.js%22%2C%22ids%22%3A%5B%22default%22%5D%7D&server=true!\n");

/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fsrc%2Fapp%2F%5Blocale%5D%2Flogin%2Fpage.tsx%22%2C%22ids%22%3A%5B%5D%7D&server=true!":
/*!********************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fsrc%2Fapp%2F%5Blocale%5D%2Flogin%2Fpage.tsx%22%2C%22ids%22%3A%5B%5D%7D&server=true! ***!
  \********************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("Promise.resolve(/*! import() eager */).then(__webpack_require__.bind(__webpack_require__, /*! ./src/app/[locale]/login/page.tsx */ \"(ssr)/./src/app/[locale]/login/page.tsx\"));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWZsaWdodC1jbGllbnQtZW50cnktbG9hZGVyLmpzP21vZHVsZXM9JTdCJTIycmVxdWVzdCUyMiUzQSUyMiUyRlVzZXJzJTJGcHJvZ3JhbXMlMkZhc2stcGRmJTJGYXBwcyUyRndlYiUyRnNyYyUyRmFwcCUyRiU1QmxvY2FsZSU1RCUyRmxvZ2luJTJGcGFnZS50c3glMjIlMkMlMjJpZHMlMjIlM0ElNUIlNUQlN0Qmc2VydmVyPXRydWUhIiwibWFwcGluZ3MiOiJBQUFBLDhLQUFxRyIsInNvdXJjZXMiOlsid2VicGFjazovL2Fzay1wZGYtd2ViLz9hZWZmIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCgvKiB3ZWJwYWNrTW9kZTogXCJlYWdlclwiICovIFwiL1VzZXJzL3Byb2dyYW1zL2Fzay1wZGYvYXBwcy93ZWIvc3JjL2FwcC9bbG9jYWxlXS9sb2dpbi9wYWdlLnRzeFwiKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fsrc%2Fapp%2F%5Blocale%5D%2Flogin%2Fpage.tsx%22%2C%22ids%22%3A%5B%5D%7D&server=true!\n");

/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fsrc%2Fapp%2Fglobals.css%22%2C%22ids%22%3A%5B%5D%7D&server=true!":
/*!************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fsrc%2Fapp%2Fglobals.css%22%2C%22ids%22%3A%5B%5D%7D&server=true! ***!
  \************************************************************************************************************************************************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./src/app/[locale]/login/page.tsx":
/*!*****************************************!*\
  !*** ./src/app/[locale]/login/page.tsx ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ LoginPage)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(ssr)/./node_modules/next/dist/server/future/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(ssr)/./node_modules/next/dist/server/future/route-modules/app-page/vendored/ssr/react.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _i18n_navigation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/i18n/navigation */ \"(ssr)/./src/i18n/navigation.ts\");\n/* harmony import */ var _lib_supabase__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/supabase */ \"(ssr)/./src/lib/supabase.ts\");\n/* __next_internal_client_entry_do_not_use__ default auto */ \n\n\n\nfunction LoginPage() {\n    const [email, setEmail] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(\"\");\n    const [password, setPassword] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(\"\");\n    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    const handleSignIn = async ()=>{\n        setError(null);\n        setLoading(true);\n        const { error: authError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_3__.supabase.auth.signInWithPassword({\n            email,\n            password\n        });\n        if (authError) setError(authError.message);\n        setLoading(false);\n    };\n    const handleGoogle = async ()=>{\n        setError(null);\n        setLoading(true);\n        const { error: authError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_3__.supabase.auth.signInWithOAuth({\n            provider: \"google\"\n        });\n        if (authError) setError(authError.message);\n        setLoading(false);\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"main\", {\n        className: \"auth-page\",\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            className: \"auth-card\",\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: \"auth-brand\",\n                    children: [\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                            className: \"logo\",\n                            \"aria-hidden\": \"true\",\n                            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"img\", {\n                                className: \"logo__icon\",\n                                src: \"/icon.svg\",\n                                alt: \"\"\n                            }, void 0, false, {\n                                fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n                                lineNumber: 39,\n                                columnNumber: 13\n                            }, this)\n                        }, void 0, false, {\n                            fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n                            lineNumber: 38,\n                            columnNumber: 11\n                        }, this),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                            className: \"brand\",\n                            children: \"AskPDF\"\n                        }, void 0, false, {\n                            fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n                            lineNumber: 41,\n                            columnNumber: 11\n                        }, this)\n                    ]\n                }, void 0, true, {\n                    fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n                    lineNumber: 37,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h1\", {\n                    children: \"サインイン\"\n                }, void 0, false, {\n                    fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n                    lineNumber: 43,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"label\", {\n                    className: \"field\",\n                    children: [\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                            children: \"Email\"\n                        }, void 0, false, {\n                            fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n                            lineNumber: 45,\n                            columnNumber: 11\n                        }, this),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"input\", {\n                            type: \"email\",\n                            value: email,\n                            onChange: (event)=>setEmail(event.target.value),\n                            placeholder: \"you@example.com\"\n                        }, void 0, false, {\n                            fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n                            lineNumber: 46,\n                            columnNumber: 11\n                        }, this)\n                    ]\n                }, void 0, true, {\n                    fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n                    lineNumber: 44,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"label\", {\n                    className: \"field\",\n                    children: [\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                            children: \"Password\"\n                        }, void 0, false, {\n                            fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n                            lineNumber: 54,\n                            columnNumber: 11\n                        }, this),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"input\", {\n                            type: \"password\",\n                            value: password,\n                            onChange: (event)=>setPassword(event.target.value),\n                            placeholder: \"••••••••\"\n                        }, void 0, false, {\n                            fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n                            lineNumber: 55,\n                            columnNumber: 11\n                        }, this)\n                    ]\n                }, void 0, true, {\n                    fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n                    lineNumber: 53,\n                    columnNumber: 9\n                }, this),\n                error ? /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                    className: \"auth-error\",\n                    children: error\n                }, void 0, false, {\n                    fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n                    lineNumber: 62,\n                    columnNumber: 18\n                }, this) : null,\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                    className: \"primary\",\n                    type: \"button\",\n                    onClick: handleSignIn,\n                    disabled: loading,\n                    children: \"ログイン\"\n                }, void 0, false, {\n                    fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n                    lineNumber: 63,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                    className: \"ghost oauth\",\n                    type: \"button\",\n                    onClick: handleGoogle,\n                    disabled: loading,\n                    children: [\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                            className: \"g-icon\",\n                            \"aria-hidden\": \"true\",\n                            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"svg\", {\n                                viewBox: \"0 0 48 48\",\n                                children: [\n                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"path\", {\n                                        fill: \"#EA4335\",\n                                        d: \"M24 9.5c3.54 0 6.7 1.22 9.2 3.62l6.86-6.86C35.8 2.38 30.2 0 24 0 14.64 0 6.4 5.38 2.54 13.22l7.98 6.2C12.5 13.4 17.8 9.5 24 9.5z\"\n                                    }, void 0, false, {\n                                        fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n                                        lineNumber: 69,\n                                        columnNumber: 15\n                                    }, this),\n                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"path\", {\n                                        fill: \"#4285F4\",\n                                        d: \"M46.5 24c0-1.64-.15-3.2-.44-4.73H24v9.01h12.7c-.55 2.98-2.22 5.5-4.74 7.18l7.65 5.94C43.93 37.16 46.5 31.03 46.5 24z\"\n                                    }, void 0, false, {\n                                        fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n                                        lineNumber: 73,\n                                        columnNumber: 15\n                                    }, this),\n                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"path\", {\n                                        fill: \"#FBBC05\",\n                                        d: \"M10.52 28.42A14.99 14.99 0 019 24c0-1.53.26-3.01.73-4.42l-7.98-6.2A23.9 23.9 0 000 24c0 3.88.93 7.56 2.58 10.8l7.94-6.38z\"\n                                    }, void 0, false, {\n                                        fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n                                        lineNumber: 77,\n                                        columnNumber: 15\n                                    }, this),\n                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"path\", {\n                                        fill: \"#34A853\",\n                                        d: \"M24 48c6.2 0 11.4-2.05 15.2-5.57l-7.65-5.94c-2.13 1.43-4.86 2.28-7.55 2.28-6.2 0-11.5-3.9-13.48-9.35l-7.94 6.38C6.4 42.62 14.64 48 24 48z\"\n                                    }, void 0, false, {\n                                        fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n                                        lineNumber: 81,\n                                        columnNumber: 15\n                                    }, this)\n                                ]\n                            }, void 0, true, {\n                                fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n                                lineNumber: 68,\n                                columnNumber: 13\n                            }, this)\n                        }, void 0, false, {\n                            fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n                            lineNumber: 67,\n                            columnNumber: 11\n                        }, this),\n                        \"Googleで続行\"\n                    ]\n                }, void 0, true, {\n                    fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n                    lineNumber: 66,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                    className: \"auth-alt\",\n                    children: [\n                        \"アカウントが無い場合は \",\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_i18n_navigation__WEBPACK_IMPORTED_MODULE_2__.Link, {\n                            href: \"/signup\",\n                            children: \"新規登録\"\n                        }, void 0, false, {\n                            fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n                            lineNumber: 90,\n                            columnNumber: 23\n                        }, this)\n                    ]\n                }, void 0, true, {\n                    fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n                    lineNumber: 89,\n                    columnNumber: 9\n                }, this)\n            ]\n        }, void 0, true, {\n            fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n            lineNumber: 36,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx\",\n        lineNumber: 35,\n        columnNumber: 5\n    }, this);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9zcmMvYXBwL1tsb2NhbGVdL2xvZ2luL3BhZ2UudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBRWlDO0FBQ1E7QUFDQztBQUUzQixTQUFTRztJQUN0QixNQUFNLENBQUNDLE9BQU9DLFNBQVMsR0FBR0wsK0NBQVFBLENBQUM7SUFDbkMsTUFBTSxDQUFDTSxVQUFVQyxZQUFZLEdBQUdQLCtDQUFRQSxDQUFDO0lBQ3pDLE1BQU0sQ0FBQ1EsT0FBT0MsU0FBUyxHQUFHVCwrQ0FBUUEsQ0FBZ0I7SUFDbEQsTUFBTSxDQUFDVSxTQUFTQyxXQUFXLEdBQUdYLCtDQUFRQSxDQUFDO0lBRXZDLE1BQU1ZLGVBQWU7UUFDbkJILFNBQVM7UUFDVEUsV0FBVztRQUNYLE1BQU0sRUFBRUgsT0FBT0ssU0FBUyxFQUFFLEdBQUcsTUFBTVgsbURBQVFBLENBQUNZLElBQUksQ0FBQ0Msa0JBQWtCLENBQUM7WUFDbEVYO1lBQ0FFO1FBQ0Y7UUFDQSxJQUFJTyxXQUFXSixTQUFTSSxVQUFVRyxPQUFPO1FBQ3pDTCxXQUFXO0lBQ2I7SUFFQSxNQUFNTSxlQUFlO1FBQ25CUixTQUFTO1FBQ1RFLFdBQVc7UUFDWCxNQUFNLEVBQUVILE9BQU9LLFNBQVMsRUFBRSxHQUFHLE1BQU1YLG1EQUFRQSxDQUFDWSxJQUFJLENBQUNJLGVBQWUsQ0FBQztZQUMvREMsVUFBVTtRQUNaO1FBQ0EsSUFBSU4sV0FBV0osU0FBU0ksVUFBVUcsT0FBTztRQUN6Q0wsV0FBVztJQUNiO0lBRUEscUJBQ0UsOERBQUNTO1FBQUtDLFdBQVU7a0JBQ2QsNEVBQUNDO1lBQUlELFdBQVU7OzhCQUNiLDhEQUFDQztvQkFBSUQsV0FBVTs7c0NBQ2IsOERBQUNFOzRCQUFLRixXQUFVOzRCQUFPRyxlQUFZO3NDQUNqQyw0RUFBQ0M7Z0NBQUlKLFdBQVU7Z0NBQWFLLEtBQUk7Z0NBQVlDLEtBQUk7Ozs7Ozs7Ozs7O3NDQUVsRCw4REFBQ0o7NEJBQUtGLFdBQVU7c0NBQVE7Ozs7Ozs7Ozs7Ozs4QkFFMUIsOERBQUNPOzhCQUFHOzs7Ozs7OEJBQ0osOERBQUNDO29CQUFNUixXQUFVOztzQ0FDZiw4REFBQ0U7c0NBQUs7Ozs7OztzQ0FDTiw4REFBQ087NEJBQ0NDLE1BQUs7NEJBQ0xDLE9BQU81Qjs0QkFDUDZCLFVBQVUsQ0FBQ0MsUUFBVTdCLFNBQVM2QixNQUFNQyxNQUFNLENBQUNILEtBQUs7NEJBQ2hESSxhQUFZOzs7Ozs7Ozs7Ozs7OEJBR2hCLDhEQUFDUDtvQkFBTVIsV0FBVTs7c0NBQ2YsOERBQUNFO3NDQUFLOzs7Ozs7c0NBQ04sOERBQUNPOzRCQUNDQyxNQUFLOzRCQUNMQyxPQUFPMUI7NEJBQ1AyQixVQUFVLENBQUNDLFFBQVUzQixZQUFZMkIsTUFBTUMsTUFBTSxDQUFDSCxLQUFLOzRCQUNuREksYUFBWTs7Ozs7Ozs7Ozs7O2dCQUdmNUIsc0JBQVEsOERBQUM2QjtvQkFBRWhCLFdBQVU7OEJBQWNiOzs7OzsyQkFBYTs4QkFDakQsOERBQUM4QjtvQkFBT2pCLFdBQVU7b0JBQVVVLE1BQUs7b0JBQVNRLFNBQVMzQjtvQkFBYzRCLFVBQVU5Qjs4QkFBUzs7Ozs7OzhCQUdwRiw4REFBQzRCO29CQUFPakIsV0FBVTtvQkFBY1UsTUFBSztvQkFBU1EsU0FBU3RCO29CQUFjdUIsVUFBVTlCOztzQ0FDN0UsOERBQUNhOzRCQUFLRixXQUFVOzRCQUFTRyxlQUFZO3NDQUNuQyw0RUFBQ2lCO2dDQUFJQyxTQUFROztrREFDWCw4REFBQ0M7d0NBQ0NDLE1BQUs7d0NBQ0xDLEdBQUU7Ozs7OztrREFFSiw4REFBQ0Y7d0NBQ0NDLE1BQUs7d0NBQ0xDLEdBQUU7Ozs7OztrREFFSiw4REFBQ0Y7d0NBQ0NDLE1BQUs7d0NBQ0xDLEdBQUU7Ozs7OztrREFFSiw4REFBQ0Y7d0NBQ0NDLE1BQUs7d0NBQ0xDLEdBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7O3dCQUdEOzs7Ozs7OzhCQUdULDhEQUFDUjtvQkFBRWhCLFdBQVU7O3dCQUFXO3NDQUNWLDhEQUFDcEIsa0RBQUlBOzRCQUFDNkMsTUFBSztzQ0FBVTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFLM0MiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc2stcGRmLXdlYi8uL3NyYy9hcHAvW2xvY2FsZV0vbG9naW4vcGFnZS50c3g/ZmQ1NiJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBjbGllbnRcIjtcblxuaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IExpbmsgfSBmcm9tIFwiQC9pMThuL25hdmlnYXRpb25cIjtcbmltcG9ydCB7IHN1cGFiYXNlIH0gZnJvbSBcIkAvbGliL3N1cGFiYXNlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIExvZ2luUGFnZSgpIHtcbiAgY29uc3QgW2VtYWlsLCBzZXRFbWFpbF0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgW3Bhc3N3b3JkLCBzZXRQYXNzd29yZF0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKTtcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXG4gIGNvbnN0IGhhbmRsZVNpZ25JbiA9IGFzeW5jICgpID0+IHtcbiAgICBzZXRFcnJvcihudWxsKTtcbiAgICBzZXRMb2FkaW5nKHRydWUpO1xuICAgIGNvbnN0IHsgZXJyb3I6IGF1dGhFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5zaWduSW5XaXRoUGFzc3dvcmQoe1xuICAgICAgZW1haWwsXG4gICAgICBwYXNzd29yZCxcbiAgICB9KTtcbiAgICBpZiAoYXV0aEVycm9yKSBzZXRFcnJvcihhdXRoRXJyb3IubWVzc2FnZSk7XG4gICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlR29vZ2xlID0gYXN5bmMgKCkgPT4ge1xuICAgIHNldEVycm9yKG51bGwpO1xuICAgIHNldExvYWRpbmcodHJ1ZSk7XG4gICAgY29uc3QgeyBlcnJvcjogYXV0aEVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLnNpZ25JbldpdGhPQXV0aCh7XG4gICAgICBwcm92aWRlcjogXCJnb29nbGVcIixcbiAgICB9KTtcbiAgICBpZiAoYXV0aEVycm9yKSBzZXRFcnJvcihhdXRoRXJyb3IubWVzc2FnZSk7XG4gICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8bWFpbiBjbGFzc05hbWU9XCJhdXRoLXBhZ2VcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXV0aC1jYXJkXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXV0aC1icmFuZFwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImxvZ29cIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgIDxpbWcgY2xhc3NOYW1lPVwibG9nb19faWNvblwiIHNyYz1cIi9pY29uLnN2Z1wiIGFsdD1cIlwiIC8+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImJyYW5kXCI+QXNrUERGPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGgxPuOCteOCpOODs+OCpOODszwvaDE+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJmaWVsZFwiPlxuICAgICAgICAgIDxzcGFuPkVtYWlsPC9zcGFuPlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgdHlwZT1cImVtYWlsXCJcbiAgICAgICAgICAgIHZhbHVlPXtlbWFpbH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEVtYWlsKGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cInlvdUBleGFtcGxlLmNvbVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImZpZWxkXCI+XG4gICAgICAgICAgPHNwYW4+UGFzc3dvcmQ8L3NwYW4+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICB0eXBlPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgdmFsdWU9e3Bhc3N3b3JkfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0UGFzc3dvcmQoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwi4oCi4oCi4oCi4oCi4oCi4oCi4oCi4oCiXCJcbiAgICAgICAgICAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgICB7ZXJyb3IgPyA8cCBjbGFzc05hbWU9XCJhdXRoLWVycm9yXCI+e2Vycm9yfTwvcD4gOiBudWxsfVxuICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cInByaW1hcnlcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17aGFuZGxlU2lnbklufSBkaXNhYmxlZD17bG9hZGluZ30+XG4gICAgICAgICAg44Ot44Kw44Kk44OzXG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImdob3N0IG9hdXRoXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e2hhbmRsZUdvb2dsZX0gZGlzYWJsZWQ9e2xvYWRpbmd9PlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImctaWNvblwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDQ4IDQ4XCI+XG4gICAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgICAgZmlsbD1cIiNFQTQzMzVcIlxuICAgICAgICAgICAgICAgIGQ9XCJNMjQgOS41YzMuNTQgMCA2LjcgMS4yMiA5LjIgMy42Mmw2Ljg2LTYuODZDMzUuOCAyLjM4IDMwLjIgMCAyNCAwIDE0LjY0IDAgNi40IDUuMzggMi41NCAxMy4yMmw3Ljk4IDYuMkMxMi41IDEzLjQgMTcuOCA5LjUgMjQgOS41elwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgICAgZmlsbD1cIiM0Mjg1RjRcIlxuICAgICAgICAgICAgICAgIGQ9XCJNNDYuNSAyNGMwLTEuNjQtLjE1LTMuMi0uNDQtNC43M0gyNHY5LjAxaDEyLjdjLS41NSAyLjk4LTIuMjIgNS41LTQuNzQgNy4xOGw3LjY1IDUuOTRDNDMuOTMgMzcuMTYgNDYuNSAzMS4wMyA0Ni41IDI0elwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgICAgZmlsbD1cIiNGQkJDMDVcIlxuICAgICAgICAgICAgICAgIGQ9XCJNMTAuNTIgMjguNDJBMTQuOTkgMTQuOTkgMCAwMTkgMjRjMC0xLjUzLjI2LTMuMDEuNzMtNC40MmwtNy45OC02LjJBMjMuOSAyMy45IDAgMDAwIDI0YzAgMy44OC45MyA3LjU2IDIuNTggMTAuOGw3Ljk0LTYuMzh6XCJcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgICBmaWxsPVwiIzM0QTg1M1wiXG4gICAgICAgICAgICAgICAgZD1cIk0yNCA0OGM2LjIgMCAxMS40LTIuMDUgMTUuMi01LjU3bC03LjY1LTUuOTRjLTIuMTMgMS40My00Ljg2IDIuMjgtNy41NSAyLjI4LTYuMiAwLTExLjUtMy45LTEzLjQ4LTkuMzVsLTcuOTQgNi4zOEM2LjQgNDIuNjIgMTQuNjQgNDggMjQgNDh6XCJcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICBHb29nbGXjgafntprooYxcbiAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDxwIGNsYXNzTmFtZT1cImF1dGgtYWx0XCI+XG4gICAgICAgICAg44Ki44Kr44Km44Oz44OI44GM54Sh44GE5aC05ZCI44GvIDxMaW5rIGhyZWY9XCIvc2lnbnVwXCI+5paw6KaP55m76YyyPC9MaW5rPlxuICAgICAgICA8L3A+XG4gICAgICA8L2Rpdj5cbiAgICA8L21haW4+XG4gICk7XG59XG4iXSwibmFtZXMiOlsidXNlU3RhdGUiLCJMaW5rIiwic3VwYWJhc2UiLCJMb2dpblBhZ2UiLCJlbWFpbCIsInNldEVtYWlsIiwicGFzc3dvcmQiLCJzZXRQYXNzd29yZCIsImVycm9yIiwic2V0RXJyb3IiLCJsb2FkaW5nIiwic2V0TG9hZGluZyIsImhhbmRsZVNpZ25JbiIsImF1dGhFcnJvciIsImF1dGgiLCJzaWduSW5XaXRoUGFzc3dvcmQiLCJtZXNzYWdlIiwiaGFuZGxlR29vZ2xlIiwic2lnbkluV2l0aE9BdXRoIiwicHJvdmlkZXIiLCJtYWluIiwiY2xhc3NOYW1lIiwiZGl2Iiwic3BhbiIsImFyaWEtaGlkZGVuIiwiaW1nIiwic3JjIiwiYWx0IiwiaDEiLCJsYWJlbCIsImlucHV0IiwidHlwZSIsInZhbHVlIiwib25DaGFuZ2UiLCJldmVudCIsInRhcmdldCIsInBsYWNlaG9sZGVyIiwicCIsImJ1dHRvbiIsIm9uQ2xpY2siLCJkaXNhYmxlZCIsInN2ZyIsInZpZXdCb3giLCJwYXRoIiwiZmlsbCIsImQiLCJocmVmIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./src/app/[locale]/login/page.tsx\n");

/***/ }),

/***/ "(ssr)/./src/i18n/navigation.ts":
/*!********************************!*\
  !*** ./src/i18n/navigation.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Link: () => (/* binding */ Link),\n/* harmony export */   redirect: () => (/* binding */ redirect),\n/* harmony export */   usePathname: () => (/* binding */ usePathname),\n/* harmony export */   useRouter: () => (/* binding */ useRouter)\n/* harmony export */ });\n/* harmony import */ var next_intl_navigation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-intl/navigation */ \"(ssr)/./node_modules/next-intl/dist/esm/development/navigation/react-client/createNavigation.js\");\n/* harmony import */ var _routing__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./routing */ \"(ssr)/./src/i18n/routing.ts\");\n\n\nconst { Link, redirect, usePathname, useRouter } = (0,next_intl_navigation__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(_routing__WEBPACK_IMPORTED_MODULE_0__.routing);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9zcmMvaTE4bi9uYXZpZ2F0aW9uLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUF3RDtBQUVwQjtBQUU3QixNQUFNLEVBQUVFLElBQUksRUFBRUMsUUFBUSxFQUFFQyxXQUFXLEVBQUVDLFNBQVMsRUFBRSxHQUFHTCxnRUFBZ0JBLENBQUNDLDZDQUFPQSxFQUFFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYXNrLXBkZi13ZWIvLi9zcmMvaTE4bi9uYXZpZ2F0aW9uLnRzPzhmMzIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlTmF2aWdhdGlvbiB9IGZyb20gXCJuZXh0LWludGwvbmF2aWdhdGlvblwiO1xuXG5pbXBvcnQgeyByb3V0aW5nIH0gZnJvbSBcIi4vcm91dGluZ1wiO1xuXG5leHBvcnQgY29uc3QgeyBMaW5rLCByZWRpcmVjdCwgdXNlUGF0aG5hbWUsIHVzZVJvdXRlciB9ID0gY3JlYXRlTmF2aWdhdGlvbihyb3V0aW5nKTtcbiJdLCJuYW1lcyI6WyJjcmVhdGVOYXZpZ2F0aW9uIiwicm91dGluZyIsIkxpbmsiLCJyZWRpcmVjdCIsInVzZVBhdGhuYW1lIiwidXNlUm91dGVyIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./src/i18n/navigation.ts\n");

/***/ }),

/***/ "(ssr)/./src/i18n/routing.ts":
/*!*****************************!*\
  !*** ./src/i18n/routing.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   routing: () => (/* binding */ routing)\n/* harmony export */ });\n/* harmony import */ var next_intl_routing__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-intl/routing */ \"(ssr)/./node_modules/next-intl/dist/esm/development/routing/defineRouting.js\");\n\nconst routing = (0,next_intl_routing__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n    locales: [\n        \"ja\",\n        \"en\",\n        \"es\",\n        \"fr\",\n        \"de\",\n        \"ko\",\n        \"zh\"\n    ],\n    defaultLocale: \"ja\",\n    localePrefix: \"always\"\n});\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9zcmMvaTE4bi9yb3V0aW5nLnRzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQWtEO0FBRTNDLE1BQU1DLFVBQVVELDZEQUFhQSxDQUFDO0lBQ25DRSxTQUFTO1FBQUM7UUFBTTtRQUFNO1FBQU07UUFBTTtRQUFNO1FBQU07S0FBSztJQUNuREMsZUFBZTtJQUNmQyxjQUFjO0FBQ2hCLEdBQUciLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc2stcGRmLXdlYi8uL3NyYy9pMThuL3JvdXRpbmcudHM/MDY4MiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkZWZpbmVSb3V0aW5nIH0gZnJvbSBcIm5leHQtaW50bC9yb3V0aW5nXCI7XG5cbmV4cG9ydCBjb25zdCByb3V0aW5nID0gZGVmaW5lUm91dGluZyh7XG4gIGxvY2FsZXM6IFtcImphXCIsIFwiZW5cIiwgXCJlc1wiLCBcImZyXCIsIFwiZGVcIiwgXCJrb1wiLCBcInpoXCJdLFxuICBkZWZhdWx0TG9jYWxlOiBcImphXCIsXG4gIGxvY2FsZVByZWZpeDogXCJhbHdheXNcIixcbn0pO1xuXG5leHBvcnQgdHlwZSBMb2NhbGUgPSAodHlwZW9mIHJvdXRpbmcubG9jYWxlcylbbnVtYmVyXTtcbiJdLCJuYW1lcyI6WyJkZWZpbmVSb3V0aW5nIiwicm91dGluZyIsImxvY2FsZXMiLCJkZWZhdWx0TG9jYWxlIiwibG9jYWxlUHJlZml4Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./src/i18n/routing.ts\n");

/***/ }),

/***/ "(ssr)/./src/lib/supabase.ts":
/*!*****************************!*\
  !*** ./src/lib/supabase.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   supabase: () => (/* binding */ supabase)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"(ssr)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n\nconst supabaseUrl = \"https://gukirqskbgdqfwsqbwcy.supabase.co/\" ?? 0;\nconst supabaseAnonKey = \"sb_publishable_xXGnu5bhgtrZrsccdGPk7w_T6Vb3QNL\" ?? 0;\nif (!supabaseUrl || !supabaseAnonKey) {\n    throw new Error(\"Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY\");\n}\nconst supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(supabaseUrl, supabaseAnonKey);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9zcmMvbGliL3N1cGFiYXNlLnRzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQXFEO0FBRXJELE1BQU1DLGNBQWNDLDJDQUFvQyxJQUFJLENBQUU7QUFDOUQsTUFBTUcsa0JBQWtCSCxnREFBeUMsSUFBSSxDQUFFO0FBRXZFLElBQUksQ0FBQ0QsZUFBZSxDQUFDSSxpQkFBaUI7SUFDcEMsTUFBTSxJQUFJRSxNQUFNO0FBQ2xCO0FBRU8sTUFBTUMsV0FBV1IsbUVBQVlBLENBQUNDLGFBQWFJLGlCQUFpQiIsInNvdXJjZXMiOlsid2VicGFjazovL2Fzay1wZGYtd2ViLy4vc3JjL2xpYi9zdXBhYmFzZS50cz8wNmUxIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gXCJAc3VwYWJhc2Uvc3VwYWJhc2UtanNcIjtcblxuY29uc3Qgc3VwYWJhc2VVcmwgPSBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwgPz8gXCJcIjtcbmNvbnN0IHN1cGFiYXNlQW5vbktleSA9IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZID8/IFwiXCI7XG5cbmlmICghc3VwYWJhc2VVcmwgfHwgIXN1cGFiYXNlQW5vbktleSkge1xuICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIE5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCBvciBORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWVwiKTtcbn1cblxuZXhwb3J0IGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KHN1cGFiYXNlVXJsLCBzdXBhYmFzZUFub25LZXkpO1xuIl0sIm5hbWVzIjpbImNyZWF0ZUNsaWVudCIsInN1cGFiYXNlVXJsIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsInN1cGFiYXNlQW5vbktleSIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZIiwiRXJyb3IiLCJzdXBhYmFzZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./src/lib/supabase.ts\n");

/***/ }),

/***/ "(rsc)/./src/app/globals.css":
/*!*****************************!*\
  !*** ./src/app/globals.css ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (\"022dce1d37a5\");\nif (false) {}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2dsb2JhbHMuY3NzIiwibWFwcGluZ3MiOiI7Ozs7QUFBQSxpRUFBZSxjQUFjO0FBQzdCLElBQUksS0FBVSxFQUFFLEVBQXVCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYXNrLXBkZi13ZWIvLi9zcmMvYXBwL2dsb2JhbHMuY3NzPzYxYTgiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgXCIwMjJkY2UxZDM3YTVcIlxuaWYgKG1vZHVsZS5ob3QpIHsgbW9kdWxlLmhvdC5hY2NlcHQoKSB9XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/globals.css\n");

/***/ }),

/***/ "(rsc)/./src/app/[locale]/layout.tsx":
/*!*************************************!*\
  !*** ./src/app/[locale]/layout.tsx ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ LocaleLayout),\n/* harmony export */   generateStaticParams: () => (/* binding */ generateStaticParams)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_intl__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! next-intl */ \"(rsc)/./node_modules/next-intl/dist/esm/development/react-server/NextIntlClientProviderServer.js\");\n/* harmony import */ var next_intl_server__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-intl/server */ \"(rsc)/./node_modules/next-intl/dist/esm/development/server/react-server/RequestLocaleCache.js\");\n/* harmony import */ var next_intl_server__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next-intl/server */ \"(rsc)/./node_modules/next-intl/dist/esm/development/server/react-server/getMessages.js\");\n/* harmony import */ var _i18n_routing__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/i18n/routing */ \"(rsc)/./src/i18n/routing.ts\");\n\n\n\n\nfunction generateStaticParams() {\n    return _i18n_routing__WEBPACK_IMPORTED_MODULE_1__.routing.locales.map((locale)=>({\n            locale\n        }));\n}\nasync function LocaleLayout({ children, params: { locale } }) {\n    if (!_i18n_routing__WEBPACK_IMPORTED_MODULE_1__.routing.locales.includes(locale)) {\n        locale = _i18n_routing__WEBPACK_IMPORTED_MODULE_1__.routing.defaultLocale;\n    }\n    (0,next_intl_server__WEBPACK_IMPORTED_MODULE_2__.setCachedRequestLocale)(locale);\n    const messages = await (0,next_intl_server__WEBPACK_IMPORTED_MODULE_3__[\"default\"])();\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(next_intl__WEBPACK_IMPORTED_MODULE_4__[\"default\"], {\n        locale: locale,\n        messages: messages,\n        children: children\n    }, void 0, false, {\n        fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/layout.tsx\",\n        lineNumber: 25,\n        columnNumber: 5\n    }, this);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL1tsb2NhbGVdL2xheW91dC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQ21EO0FBQ2M7QUFFeEI7QUFFbEMsU0FBU0k7SUFDZCxPQUFPRCxrREFBT0EsQ0FBQ0UsT0FBTyxDQUFDQyxHQUFHLENBQUMsQ0FBQ0MsU0FBWTtZQUFFQTtRQUFPO0FBQ25EO0FBRWUsZUFBZUMsYUFBYSxFQUN6Q0MsUUFBUSxFQUNSQyxRQUFRLEVBQUVILE1BQU0sRUFBRSxFQUluQjtJQUNDLElBQUksQ0FBQ0osa0RBQU9BLENBQUNFLE9BQU8sQ0FBQ00sUUFBUSxDQUFDSixTQUFTO1FBQ3JDQSxTQUFTSixrREFBT0EsQ0FBQ1MsYUFBYTtJQUNoQztJQUNBVix3RUFBZ0JBLENBQUNLO0lBQ2pCLE1BQU1NLFdBQVcsTUFBTVosNERBQVdBO0lBRWxDLHFCQUNFLDhEQUFDRCxpREFBc0JBO1FBQUNPLFFBQVFBO1FBQVFNLFVBQVVBO2tCQUMvQ0o7Ozs7OztBQUdQIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYXNrLXBkZi13ZWIvLi9zcmMvYXBwL1tsb2NhbGVdL2xheW91dC50c3g/ODUzOCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFJlYWN0Tm9kZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgTmV4dEludGxDbGllbnRQcm92aWRlciB9IGZyb20gXCJuZXh0LWludGxcIjtcbmltcG9ydCB7IGdldE1lc3NhZ2VzLCBzZXRSZXF1ZXN0TG9jYWxlIH0gZnJvbSBcIm5leHQtaW50bC9zZXJ2ZXJcIjtcblxuaW1wb3J0IHsgcm91dGluZyB9IGZyb20gXCJAL2kxOG4vcm91dGluZ1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVTdGF0aWNQYXJhbXMoKSB7XG4gIHJldHVybiByb3V0aW5nLmxvY2FsZXMubWFwKChsb2NhbGUpID0+ICh7IGxvY2FsZSB9KSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIExvY2FsZUxheW91dCh7XG4gIGNoaWxkcmVuLFxuICBwYXJhbXM6IHsgbG9jYWxlIH0sXG59OiB7XG4gIGNoaWxkcmVuOiBSZWFjdE5vZGU7XG4gIHBhcmFtczogeyBsb2NhbGU6IHN0cmluZyB9O1xufSkge1xuICBpZiAoIXJvdXRpbmcubG9jYWxlcy5pbmNsdWRlcyhsb2NhbGUpKSB7XG4gICAgbG9jYWxlID0gcm91dGluZy5kZWZhdWx0TG9jYWxlO1xuICB9XG4gIHNldFJlcXVlc3RMb2NhbGUobG9jYWxlKTtcbiAgY29uc3QgbWVzc2FnZXMgPSBhd2FpdCBnZXRNZXNzYWdlcygpO1xuXG4gIHJldHVybiAoXG4gICAgPE5leHRJbnRsQ2xpZW50UHJvdmlkZXIgbG9jYWxlPXtsb2NhbGV9IG1lc3NhZ2VzPXttZXNzYWdlc30+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9OZXh0SW50bENsaWVudFByb3ZpZGVyPlxuICApO1xufVxuIl0sIm5hbWVzIjpbIk5leHRJbnRsQ2xpZW50UHJvdmlkZXIiLCJnZXRNZXNzYWdlcyIsInNldFJlcXVlc3RMb2NhbGUiLCJyb3V0aW5nIiwiZ2VuZXJhdGVTdGF0aWNQYXJhbXMiLCJsb2NhbGVzIiwibWFwIiwibG9jYWxlIiwiTG9jYWxlTGF5b3V0IiwiY2hpbGRyZW4iLCJwYXJhbXMiLCJpbmNsdWRlcyIsImRlZmF1bHRMb2NhbGUiLCJtZXNzYWdlcyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/[locale]/layout.tsx\n");

/***/ }),

/***/ "(rsc)/./src/app/[locale]/login/page.tsx":
/*!*****************************************!*\
  !*** ./src/app/[locale]/login/page.tsx ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $$typeof: () => (/* binding */ $$typeof),
/* harmony export */   __esModule: () => (/* binding */ __esModule),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var next_dist_build_webpack_loaders_next_flight_loader_module_proxy__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/build/webpack/loaders/next-flight-loader/module-proxy */ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-loader/module-proxy.js");

const proxy = (0,next_dist_build_webpack_loaders_next_flight_loader_module_proxy__WEBPACK_IMPORTED_MODULE_0__.createProxy)(String.raw`/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx`)

// Accessing the __esModule property and exporting $$typeof are required here.
// The __esModule getter forces the proxy target to create the default export
// and the $$typeof value is for rendering logic to determine if the module
// is a client boundary.
const { __esModule, $$typeof } = proxy;
const __default__ = proxy.default;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,next_dist_build_webpack_loaders_next_flight_loader_module_proxy__WEBPACK_IMPORTED_MODULE_0__.createProxy)(String.raw`/Users/programs/ask-pdf/apps/web/src/app/[locale]/login/page.tsx#default`));


/***/ }),

/***/ "(rsc)/./src/app/layout.tsx":
/*!****************************!*\
  !*** ./src/app/layout.tsx ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ RootLayout),\n/* harmony export */   metadata: () => (/* binding */ metadata)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./globals.css */ \"(rsc)/./src/app/globals.css\");\n\n\nconst metadata = {\n    title: \"AskPDF\",\n    description: \"AskPDF UI\"\n};\nfunction RootLayout({ children }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"html\", {\n        lang: \"ja\",\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"body\", {\n            children: children\n        }, void 0, false, {\n            fileName: \"/Users/programs/ask-pdf/apps/web/src/app/layout.tsx\",\n            lineNumber: 12,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/Users/programs/ask-pdf/apps/web/src/app/layout.tsx\",\n        lineNumber: 11,\n        columnNumber: 5\n    }, this);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2xheW91dC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQXVCO0FBR2hCLE1BQU1BLFdBQVc7SUFDdEJDLE9BQU87SUFDUEMsYUFBYTtBQUNmLEVBQUU7QUFFYSxTQUFTQyxXQUFXLEVBQUVDLFFBQVEsRUFBMkI7SUFDdEUscUJBQ0UsOERBQUNDO1FBQUtDLE1BQUs7a0JBQ1QsNEVBQUNDO3NCQUFNSDs7Ozs7Ozs7Ozs7QUFHYiIsInNvdXJjZXMiOlsid2VicGFjazovL2Fzay1wZGYtd2ViLy4vc3JjL2FwcC9sYXlvdXQudHN4PzU3YTkiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFwiLi9nbG9iYWxzLmNzc1wiO1xuaW1wb3J0IHR5cGUgeyBSZWFjdE5vZGUgfSBmcm9tIFwicmVhY3RcIjtcblxuZXhwb3J0IGNvbnN0IG1ldGFkYXRhID0ge1xuICB0aXRsZTogXCJBc2tQREZcIixcbiAgZGVzY3JpcHRpb246IFwiQXNrUERGIFVJXCIsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBSb290TGF5b3V0KHsgY2hpbGRyZW4gfTogeyBjaGlsZHJlbjogUmVhY3ROb2RlIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8aHRtbCBsYW5nPVwiamFcIj5cbiAgICAgIDxib2R5PntjaGlsZHJlbn08L2JvZHk+XG4gICAgPC9odG1sPlxuICApO1xufVxuIl0sIm5hbWVzIjpbIm1ldGFkYXRhIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsIlJvb3RMYXlvdXQiLCJjaGlsZHJlbiIsImh0bWwiLCJsYW5nIiwiYm9keSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/layout.tsx\n");

/***/ }),

/***/ "(rsc)/./src/i18n/request.ts":
/*!*****************************!*\
  !*** ./src/i18n/request.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var next_intl_server__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-intl/server */ \"(rsc)/./node_modules/next-intl/dist/esm/development/server/react-server/getRequestConfig.js\");\n/* harmony import */ var _routing__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./routing */ \"(rsc)/./src/i18n/routing.ts\");\n\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,next_intl_server__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(async ({ locale, requestLocale })=>{\n    const requested = locale ?? await requestLocale;\n    const resolvedLocale = _routing__WEBPACK_IMPORTED_MODULE_0__.routing.locales.includes(requested) ? requested : _routing__WEBPACK_IMPORTED_MODULE_0__.routing.defaultLocale;\n    return {\n        locale: resolvedLocale,\n        messages: (await __webpack_require__(\"(rsc)/./messages lazy recursive ^\\\\.\\\\/.*\\\\.json$\")(`./${resolvedLocale}.json`)).default\n    };\n}));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvaTE4bi9yZXF1ZXN0LnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFvRDtBQUVoQjtBQUVwQyxpRUFBZUEsNERBQWdCQSxDQUFDLE9BQU8sRUFBRUUsTUFBTSxFQUFFQyxhQUFhLEVBQUU7SUFDOUQsTUFBTUMsWUFBWUYsVUFBVyxNQUFNQztJQUNuQyxNQUFNRSxpQkFBaUJKLDZDQUFPQSxDQUFDSyxPQUFPLENBQUNDLFFBQVEsQ0FBQ0gsYUFDNUNBLFlBQ0FILDZDQUFPQSxDQUFDTyxhQUFhO0lBQ3pCLE9BQU87UUFDTE4sUUFBUUc7UUFDUkksVUFBVSxDQUFDLE1BQU0seUVBQU8sR0FBZ0IsRUFBRUosZUFBZSxNQUFNLEdBQUdLLE9BQU87SUFDM0U7QUFDRixFQUFFLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc2stcGRmLXdlYi8uL3NyYy9pMThuL3JlcXVlc3QudHM/ZWJlMyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRSZXF1ZXN0Q29uZmlnIH0gZnJvbSBcIm5leHQtaW50bC9zZXJ2ZXJcIjtcblxuaW1wb3J0IHsgcm91dGluZyB9IGZyb20gXCIuL3JvdXRpbmdcIjtcblxuZXhwb3J0IGRlZmF1bHQgZ2V0UmVxdWVzdENvbmZpZyhhc3luYyAoeyBsb2NhbGUsIHJlcXVlc3RMb2NhbGUgfSkgPT4ge1xuICBjb25zdCByZXF1ZXN0ZWQgPSBsb2NhbGUgPz8gKGF3YWl0IHJlcXVlc3RMb2NhbGUpO1xuICBjb25zdCByZXNvbHZlZExvY2FsZSA9IHJvdXRpbmcubG9jYWxlcy5pbmNsdWRlcyhyZXF1ZXN0ZWQpXG4gICAgPyByZXF1ZXN0ZWRcbiAgICA6IHJvdXRpbmcuZGVmYXVsdExvY2FsZTtcbiAgcmV0dXJuIHtcbiAgICBsb2NhbGU6IHJlc29sdmVkTG9jYWxlLFxuICAgIG1lc3NhZ2VzOiAoYXdhaXQgaW1wb3J0KGAuLi8uLi9tZXNzYWdlcy8ke3Jlc29sdmVkTG9jYWxlfS5qc29uYCkpLmRlZmF1bHQsXG4gIH07XG59KTtcbiJdLCJuYW1lcyI6WyJnZXRSZXF1ZXN0Q29uZmlnIiwicm91dGluZyIsImxvY2FsZSIsInJlcXVlc3RMb2NhbGUiLCJyZXF1ZXN0ZWQiLCJyZXNvbHZlZExvY2FsZSIsImxvY2FsZXMiLCJpbmNsdWRlcyIsImRlZmF1bHRMb2NhbGUiLCJtZXNzYWdlcyIsImRlZmF1bHQiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/i18n/request.ts\n");

/***/ }),

/***/ "(rsc)/./src/i18n/routing.ts":
/*!*****************************!*\
  !*** ./src/i18n/routing.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   routing: () => (/* binding */ routing)\n/* harmony export */ });\n/* harmony import */ var next_intl_routing__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-intl/routing */ \"(rsc)/./node_modules/next-intl/dist/esm/development/routing/defineRouting.js\");\n\nconst routing = (0,next_intl_routing__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n    locales: [\n        \"ja\",\n        \"en\",\n        \"es\",\n        \"fr\",\n        \"de\",\n        \"ko\",\n        \"zh\"\n    ],\n    defaultLocale: \"ja\",\n    localePrefix: \"always\"\n});\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvaTE4bi9yb3V0aW5nLnRzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQWtEO0FBRTNDLE1BQU1DLFVBQVVELDZEQUFhQSxDQUFDO0lBQ25DRSxTQUFTO1FBQUM7UUFBTTtRQUFNO1FBQU07UUFBTTtRQUFNO1FBQU07S0FBSztJQUNuREMsZUFBZTtJQUNmQyxjQUFjO0FBQ2hCLEdBQUciLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc2stcGRmLXdlYi8uL3NyYy9pMThuL3JvdXRpbmcudHM/MDY4MiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkZWZpbmVSb3V0aW5nIH0gZnJvbSBcIm5leHQtaW50bC9yb3V0aW5nXCI7XG5cbmV4cG9ydCBjb25zdCByb3V0aW5nID0gZGVmaW5lUm91dGluZyh7XG4gIGxvY2FsZXM6IFtcImphXCIsIFwiZW5cIiwgXCJlc1wiLCBcImZyXCIsIFwiZGVcIiwgXCJrb1wiLCBcInpoXCJdLFxuICBkZWZhdWx0TG9jYWxlOiBcImphXCIsXG4gIGxvY2FsZVByZWZpeDogXCJhbHdheXNcIixcbn0pO1xuXG5leHBvcnQgdHlwZSBMb2NhbGUgPSAodHlwZW9mIHJvdXRpbmcubG9jYWxlcylbbnVtYmVyXTtcbiJdLCJuYW1lcyI6WyJkZWZpbmVSb3V0aW5nIiwicm91dGluZyIsImxvY2FsZXMiLCJkZWZhdWx0TG9jYWxlIiwibG9jYWxlUHJlZml4Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/i18n/routing.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-metadata-image-loader.js?type=icon&segment=&basePath=&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js!./src/app/icon.svg?__next_metadata__":
/*!********************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-metadata-image-loader.js?type=icon&segment=&basePath=&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js!./src/app/icon.svg?__next_metadata__ ***!
  \********************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var next_dist_lib_metadata_get_metadata_route__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/lib/metadata/get-metadata-route */ \"(rsc)/./node_modules/next/dist/lib/metadata/get-metadata-route.js\");\n/* harmony import */ var next_dist_lib_metadata_get_metadata_route__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_lib_metadata_get_metadata_route__WEBPACK_IMPORTED_MODULE_0__);\n  \n\n  /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((props) => {\n    const imageData = {\"type\":\"image/svg+xml\",\"sizes\":\"any\"}\n    const imageUrl = (0,next_dist_lib_metadata_get_metadata_route__WEBPACK_IMPORTED_MODULE_0__.fillMetadataSegment)(\".\", props.params, \"icon.svg\")\n\n    return [{\n      ...imageData,\n      url: imageUrl + \"?e94f492e6d40aeb3\",\n    }]\n  });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LW1ldGFkYXRhLWltYWdlLWxvYWRlci5qcz90eXBlPWljb24mc2VnbWVudD0mYmFzZVBhdGg9JnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMhLi9zcmMvYXBwL2ljb24uc3ZnP19fbmV4dF9tZXRhZGF0YV9fIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLEVBQWlGOztBQUVqRixFQUFFLGlFQUFlO0FBQ2pCLHVCQUF1QjtBQUN2QixxQkFBcUIsOEZBQW1COztBQUV4QztBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc2stcGRmLXdlYi8uL3NyYy9hcHAvaWNvbi5zdmc/MmFhNSJdLCJzb3VyY2VzQ29udGVudCI6WyIgIGltcG9ydCB7IGZpbGxNZXRhZGF0YVNlZ21lbnQgfSBmcm9tICduZXh0L2Rpc3QvbGliL21ldGFkYXRhL2dldC1tZXRhZGF0YS1yb3V0ZSdcblxuICBleHBvcnQgZGVmYXVsdCAocHJvcHMpID0+IHtcbiAgICBjb25zdCBpbWFnZURhdGEgPSB7XCJ0eXBlXCI6XCJpbWFnZS9zdmcreG1sXCIsXCJzaXplc1wiOlwiYW55XCJ9XG4gICAgY29uc3QgaW1hZ2VVcmwgPSBmaWxsTWV0YWRhdGFTZWdtZW50KFwiLlwiLCBwcm9wcy5wYXJhbXMsIFwiaWNvbi5zdmdcIilcblxuICAgIHJldHVybiBbe1xuICAgICAgLi4uaW1hZ2VEYXRhLFxuICAgICAgdXJsOiBpbWFnZVVybCArIFwiP2U5NGY0OTJlNmQ0MGFlYjNcIixcbiAgICB9XVxuICB9Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-metadata-image-loader.js?type=icon&segment=&basePath=&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js!./src/app/icon.svg?__next_metadata__\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/@formatjs","vendor-chunks/use-intl","vendor-chunks/whatwg-url","vendor-chunks/next-intl","vendor-chunks/intl-messageformat","vendor-chunks/webidl-conversions","vendor-chunks/@swc"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2F%5Blocale%5D%2Flogin%2Fpage&page=%2F%5Blocale%5D%2Flogin%2Fpage&appPaths=%2F%5Blocale%5D%2Flogin%2Fpage&pagePath=private-next-app-dir%2F%5Blocale%5D%2Flogin%2Fpage.tsx&appDir=%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();