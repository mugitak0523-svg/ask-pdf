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
exports.id = "app/[locale]/signup/page";
exports.ids = ["app/[locale]/signup/page"];
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

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2F%5Blocale%5D%2Fsignup%2Fpage&page=%2F%5Blocale%5D%2Fsignup%2Fpage&appPaths=%2F%5Blocale%5D%2Fsignup%2Fpage&pagePath=private-next-app-dir%2F%5Blocale%5D%2Fsignup%2Fpage.tsx&appDir=%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2F%5Blocale%5D%2Fsignup%2Fpage&page=%2F%5Blocale%5D%2Fsignup%2Fpage&appPaths=%2F%5Blocale%5D%2Fsignup%2Fpage&pagePath=private-next-app-dir%2F%5Blocale%5D%2Fsignup%2Fpage.tsx&appDir=%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GlobalError: () => (/* reexport default from dynamic */ next_dist_client_components_error_boundary__WEBPACK_IMPORTED_MODULE_2___default.a),\n/* harmony export */   __next_app__: () => (/* binding */ __next_app__),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   pages: () => (/* binding */ pages),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   tree: () => (/* binding */ tree)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_page_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-page/module.compiled */ \"(ssr)/./node_modules/next/dist/server/future/route-modules/app-page/module.compiled.js?d969\");\n/* harmony import */ var next_dist_server_future_route_modules_app_page_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_page_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_client_components_error_boundary__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/client/components/error-boundary */ \"(rsc)/./node_modules/next/dist/client/components/error-boundary.js\");\n/* harmony import */ var next_dist_client_components_error_boundary__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_client_components_error_boundary__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var next_dist_server_app_render_entry_base__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/dist/server/app-render/entry-base */ \"(rsc)/./node_modules/next/dist/server/app-render/entry-base.js\");\n/* harmony import */ var next_dist_server_app_render_entry_base__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_app_render_entry_base__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};\n/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in next_dist_server_app_render_entry_base__WEBPACK_IMPORTED_MODULE_3__) if([\"default\",\"tree\",\"pages\",\"GlobalError\",\"originalPathname\",\"__next_app__\",\"routeModule\"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => next_dist_server_app_render_entry_base__WEBPACK_IMPORTED_MODULE_3__[__WEBPACK_IMPORT_KEY__]\n/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);\n\"TURBOPACK { transition: next-ssr }\";\n\n\n// We inject the tree and pages here so that we can use them in the route\n// module.\nconst tree = {\n        children: [\n        '',\n        {\n        children: [\n        '[locale]',\n        {\n        children: [\n        'signup',\n        {\n        children: ['__PAGE__', {}, {\n          page: [() => Promise.resolve(/*! import() eager */).then(__webpack_require__.bind(__webpack_require__, /*! ./src/app/[locale]/signup/page.tsx */ \"(rsc)/./src/app/[locale]/signup/page.tsx\")), \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\"],\n          \n        }]\n      },\n        {\n        \n        \n      }\n      ]\n      },\n        {\n        'layout': [() => Promise.resolve(/*! import() eager */).then(__webpack_require__.bind(__webpack_require__, /*! ./src/app/[locale]/layout.tsx */ \"(rsc)/./src/app/[locale]/layout.tsx\")), \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/layout.tsx\"],\n        \n      }\n      ]\n      },\n        {\n        'layout': [() => Promise.resolve(/*! import() eager */).then(__webpack_require__.bind(__webpack_require__, /*! ./src/app/layout.tsx */ \"(rsc)/./src/app/layout.tsx\")), \"/Users/programs/ask-pdf/apps/web/src/app/layout.tsx\"],\n'not-found': [() => Promise.resolve(/*! import() eager */).then(__webpack_require__.t.bind(__webpack_require__, /*! next/dist/client/components/not-found-error */ \"(rsc)/./node_modules/next/dist/client/components/not-found-error.js\", 23)), \"next/dist/client/components/not-found-error\"],\n        \n      }\n      ]\n      }.children;\nconst pages = [\"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\"];\n\n\nconst __next_app_require__ = __webpack_require__\nconst __next_app_load_chunk__ = () => Promise.resolve()\nconst originalPathname = \"/[locale]/signup/page\";\nconst __next_app__ = {\n    require: __next_app_require__,\n    loadChunk: __next_app_load_chunk__\n};\n\n// Create and export the route module that will be consumed.\nconst routeModule = new next_dist_server_future_route_modules_app_page_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppPageRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_PAGE,\n        page: \"/[locale]/signup/page\",\n        pathname: \"/[locale]/signup\",\n        // The following aren't used in production.\n        bundlePath: \"\",\n        filename: \"\",\n        appPaths: []\n    },\n    userland: {\n        loaderTree: tree\n    }\n});\n\n//# sourceMappingURL=app-page.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkYlNUJsb2NhbGUlNUQlMkZzaWdudXAlMkZwYWdlJnBhZ2U9JTJGJTVCbG9jYWxlJTVEJTJGc2lnbnVwJTJGcGFnZSZhcHBQYXRocz0lMkYlNUJsb2NhbGUlNUQlMkZzaWdudXAlMkZwYWdlJnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGJTVCbG9jYWxlJTVEJTJGc2lnbnVwJTJGcGFnZS50c3gmYXBwRGlyPSUyRlVzZXJzJTJGcHJvZ3JhbXMlMkZhc2stcGRmJTJGYXBwcyUyRndlYiUyRnNyYyUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGVXNlcnMlMkZwcm9ncmFtcyUyRmFzay1wZGYlMkZhcHBzJTJGd2ViJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsYUFBYSxzQkFBc0I7QUFDaUU7QUFDckM7QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDO0FBQ2pDLHVCQUF1QixnTEFBc0c7QUFDN0g7QUFDQSxTQUFTO0FBQ1QsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQSx5QkFBeUIsc0tBQWlHO0FBQzFIO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBLHlCQUF5QixvSkFBd0Y7QUFDakgsb0JBQW9CLDBOQUFnRjtBQUNwRztBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDdUI7QUFDNkQ7QUFDcEYsNkJBQTZCLG1CQUFtQjtBQUNoRDtBQUNPO0FBQ0E7QUFDUDtBQUNBO0FBQ0E7QUFDdUQ7QUFDdkQ7QUFDTyx3QkFBd0IsOEdBQWtCO0FBQ2pEO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRCIsInNvdXJjZXMiOlsid2VicGFjazovL2Fzay1wZGYtd2ViLz9hMjlmIl0sInNvdXJjZXNDb250ZW50IjpbIlwiVFVSQk9QQUNLIHsgdHJhbnNpdGlvbjogbmV4dC1zc3IgfVwiO1xuaW1wb3J0IHsgQXBwUGFnZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXBhZ2UvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuLy8gV2UgaW5qZWN0IHRoZSB0cmVlIGFuZCBwYWdlcyBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgdHJlZSA9IHtcbiAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgJycsXG4gICAgICAgIHtcbiAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgJ1tsb2NhbGVdJyxcbiAgICAgICAge1xuICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAnc2lnbnVwJyxcbiAgICAgICAge1xuICAgICAgICBjaGlsZHJlbjogWydfX1BBR0VfXycsIHt9LCB7XG4gICAgICAgICAgcGFnZTogWygpID0+IGltcG9ydCgvKiB3ZWJwYWNrTW9kZTogXCJlYWdlclwiICovIFwiL1VzZXJzL3Byb2dyYW1zL2Fzay1wZGYvYXBwcy93ZWIvc3JjL2FwcC9bbG9jYWxlXS9zaWdudXAvcGFnZS50c3hcIiksIFwiL1VzZXJzL3Byb2dyYW1zL2Fzay1wZGYvYXBwcy93ZWIvc3JjL2FwcC9bbG9jYWxlXS9zaWdudXAvcGFnZS50c3hcIl0sXG4gICAgICAgICAgXG4gICAgICAgIH1dXG4gICAgICB9LFxuICAgICAgICB7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgIH1cbiAgICAgIF1cbiAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgJ2xheW91dCc6IFsoKSA9PiBpbXBvcnQoLyogd2VicGFja01vZGU6IFwiZWFnZXJcIiAqLyBcIi9Vc2Vycy9wcm9ncmFtcy9hc2stcGRmL2FwcHMvd2ViL3NyYy9hcHAvW2xvY2FsZV0vbGF5b3V0LnRzeFwiKSwgXCIvVXNlcnMvcHJvZ3JhbXMvYXNrLXBkZi9hcHBzL3dlYi9zcmMvYXBwL1tsb2NhbGVdL2xheW91dC50c3hcIl0sXG4gICAgICAgIFxuICAgICAgfVxuICAgICAgXVxuICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAnbGF5b3V0JzogWygpID0+IGltcG9ydCgvKiB3ZWJwYWNrTW9kZTogXCJlYWdlclwiICovIFwiL1VzZXJzL3Byb2dyYW1zL2Fzay1wZGYvYXBwcy93ZWIvc3JjL2FwcC9sYXlvdXQudHN4XCIpLCBcIi9Vc2Vycy9wcm9ncmFtcy9hc2stcGRmL2FwcHMvd2ViL3NyYy9hcHAvbGF5b3V0LnRzeFwiXSxcbidub3QtZm91bmQnOiBbKCkgPT4gaW1wb3J0KC8qIHdlYnBhY2tNb2RlOiBcImVhZ2VyXCIgKi8gXCJuZXh0L2Rpc3QvY2xpZW50L2NvbXBvbmVudHMvbm90LWZvdW5kLWVycm9yXCIpLCBcIm5leHQvZGlzdC9jbGllbnQvY29tcG9uZW50cy9ub3QtZm91bmQtZXJyb3JcIl0sXG4gICAgICAgIFxuICAgICAgfVxuICAgICAgXVxuICAgICAgfS5jaGlsZHJlbjtcbmNvbnN0IHBhZ2VzID0gW1wiL1VzZXJzL3Byb2dyYW1zL2Fzay1wZGYvYXBwcy93ZWIvc3JjL2FwcC9bbG9jYWxlXS9zaWdudXAvcGFnZS50c3hcIl07XG5leHBvcnQgeyB0cmVlLCBwYWdlcyB9O1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBHbG9iYWxFcnJvciB9IGZyb20gXCJuZXh0L2Rpc3QvY2xpZW50L2NvbXBvbmVudHMvZXJyb3ItYm91bmRhcnlcIjtcbmNvbnN0IF9fbmV4dF9hcHBfcmVxdWlyZV9fID0gX193ZWJwYWNrX3JlcXVpcmVfX1xuY29uc3QgX19uZXh0X2FwcF9sb2FkX2NodW5rX18gPSAoKSA9PiBQcm9taXNlLnJlc29sdmUoKVxuZXhwb3J0IGNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9bbG9jYWxlXS9zaWdudXAvcGFnZVwiO1xuZXhwb3J0IGNvbnN0IF9fbmV4dF9hcHBfXyA9IHtcbiAgICByZXF1aXJlOiBfX25leHRfYXBwX3JlcXVpcmVfXyxcbiAgICBsb2FkQ2h1bms6IF9fbmV4dF9hcHBfbG9hZF9jaHVua19fXG59O1xuZXhwb3J0ICogZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvYXBwLXJlbmRlci9lbnRyeS1iYXNlXCI7XG4vLyBDcmVhdGUgYW5kIGV4cG9ydCB0aGUgcm91dGUgbW9kdWxlIHRoYXQgd2lsbCBiZSBjb25zdW1lZC5cbmV4cG9ydCBjb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBQYWdlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9QQUdFLFxuICAgICAgICBwYWdlOiBcIi9bbG9jYWxlXS9zaWdudXAvcGFnZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvW2xvY2FsZV0vc2lnbnVwXCIsXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgYXJlbid0IHVzZWQgaW4gcHJvZHVjdGlvbi5cbiAgICAgICAgYnVuZGxlUGF0aDogXCJcIixcbiAgICAgICAgZmlsZW5hbWU6IFwiXCIsXG4gICAgICAgIGFwcFBhdGhzOiBbXVxuICAgIH0sXG4gICAgdXNlcmxhbmQ6IHtcbiAgICAgICAgbG9hZGVyVHJlZTogdHJlZVxuICAgIH1cbn0pO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcGFnZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2F%5Blocale%5D%2Fsignup%2Fpage&page=%2F%5Blocale%5D%2Fsignup%2Fpage&appPaths=%2F%5Blocale%5D%2Fsignup%2Fpage&pagePath=private-next-app-dir%2F%5Blocale%5D%2Fsignup%2Fpage.tsx&appDir=%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fsrc%2Fapp%2F%5Blocale%5D%2Fsignup%2Fpage.tsx%22%2C%22ids%22%3A%5B%5D%7D&server=true!":
/*!*********************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fsrc%2Fapp%2F%5Blocale%5D%2Fsignup%2Fpage.tsx%22%2C%22ids%22%3A%5B%5D%7D&server=true! ***!
  \*********************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("Promise.resolve(/*! import() eager */).then(__webpack_require__.bind(__webpack_require__, /*! ./src/app/[locale]/signup/page.tsx */ \"(ssr)/./src/app/[locale]/signup/page.tsx\"));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWZsaWdodC1jbGllbnQtZW50cnktbG9hZGVyLmpzP21vZHVsZXM9JTdCJTIycmVxdWVzdCUyMiUzQSUyMiUyRlVzZXJzJTJGcHJvZ3JhbXMlMkZhc2stcGRmJTJGYXBwcyUyRndlYiUyRnNyYyUyRmFwcCUyRiU1QmxvY2FsZSU1RCUyRnNpZ251cCUyRnBhZ2UudHN4JTIyJTJDJTIyaWRzJTIyJTNBJTVCJTVEJTdEJnNlcnZlcj10cnVlISIsIm1hcHBpbmdzIjoiQUFBQSxnTEFBc0ciLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc2stcGRmLXdlYi8/NDdjYiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQoLyogd2VicGFja01vZGU6IFwiZWFnZXJcIiAqLyBcIi9Vc2Vycy9wcm9ncmFtcy9hc2stcGRmL2FwcHMvd2ViL3NyYy9hcHAvW2xvY2FsZV0vc2lnbnVwL3BhZ2UudHN4XCIpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fsrc%2Fapp%2F%5Blocale%5D%2Fsignup%2Fpage.tsx%22%2C%22ids%22%3A%5B%5D%7D&server=true!\n");

/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fsrc%2Fapp%2Fglobals.css%22%2C%22ids%22%3A%5B%5D%7D&server=true!":
/*!************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fsrc%2Fapp%2Fglobals.css%22%2C%22ids%22%3A%5B%5D%7D&server=true! ***!
  \************************************************************************************************************************************************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./src/app/[locale]/signup/page.tsx":
/*!******************************************!*\
  !*** ./src/app/[locale]/signup/page.tsx ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ SignupPage)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(ssr)/./node_modules/next/dist/server/future/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(ssr)/./node_modules/next/dist/server/future/route-modules/app-page/vendored/ssr/react.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _i18n_navigation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/i18n/navigation */ \"(ssr)/./src/i18n/navigation.ts\");\n/* harmony import */ var _lib_supabase__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/supabase */ \"(ssr)/./src/lib/supabase.ts\");\n/* __next_internal_client_entry_do_not_use__ default auto */ \n\n\n\nfunction SignupPage() {\n    const [email, setEmail] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(\"\");\n    const [password, setPassword] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(\"\");\n    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    const handleSignUp = async ()=>{\n        setError(null);\n        setLoading(true);\n        const { error: authError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_3__.supabase.auth.signUp({\n            email,\n            password\n        });\n        if (authError) setError(authError.message);\n        setLoading(false);\n    };\n    const handleGoogle = async ()=>{\n        setError(null);\n        setLoading(true);\n        const { error: authError } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_3__.supabase.auth.signInWithOAuth({\n            provider: \"google\"\n        });\n        if (authError) setError(authError.message);\n        setLoading(false);\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"main\", {\n        className: \"auth-page\",\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            className: \"auth-card\",\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: \"auth-brand\",\n                    children: [\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                            className: \"logo\",\n                            children: \"◎\"\n                        }, void 0, false, {\n                            fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n                            lineNumber: 38,\n                            columnNumber: 11\n                        }, this),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                            className: \"brand\",\n                            children: \"AskPDF\"\n                        }, void 0, false, {\n                            fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n                            lineNumber: 39,\n                            columnNumber: 11\n                        }, this)\n                    ]\n                }, void 0, true, {\n                    fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n                    lineNumber: 37,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h1\", {\n                    children: \"サインアップ\"\n                }, void 0, false, {\n                    fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n                    lineNumber: 41,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"label\", {\n                    className: \"field\",\n                    children: [\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                            children: \"Email\"\n                        }, void 0, false, {\n                            fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n                            lineNumber: 43,\n                            columnNumber: 11\n                        }, this),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"input\", {\n                            type: \"email\",\n                            value: email,\n                            onChange: (event)=>setEmail(event.target.value),\n                            placeholder: \"you@example.com\"\n                        }, void 0, false, {\n                            fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n                            lineNumber: 44,\n                            columnNumber: 11\n                        }, this)\n                    ]\n                }, void 0, true, {\n                    fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n                    lineNumber: 42,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"label\", {\n                    className: \"field\",\n                    children: [\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                            children: \"Password\"\n                        }, void 0, false, {\n                            fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n                            lineNumber: 52,\n                            columnNumber: 11\n                        }, this),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"input\", {\n                            type: \"password\",\n                            value: password,\n                            onChange: (event)=>setPassword(event.target.value),\n                            placeholder: \"••••••••\"\n                        }, void 0, false, {\n                            fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n                            lineNumber: 53,\n                            columnNumber: 11\n                        }, this)\n                    ]\n                }, void 0, true, {\n                    fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n                    lineNumber: 51,\n                    columnNumber: 9\n                }, this),\n                error ? /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                    className: \"auth-error\",\n                    children: error\n                }, void 0, false, {\n                    fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n                    lineNumber: 60,\n                    columnNumber: 18\n                }, this) : null,\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                    className: \"primary\",\n                    type: \"button\",\n                    onClick: handleSignUp,\n                    disabled: loading,\n                    children: \"サインアップ\"\n                }, void 0, false, {\n                    fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n                    lineNumber: 61,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                    className: \"ghost oauth\",\n                    type: \"button\",\n                    onClick: handleGoogle,\n                    disabled: loading,\n                    children: [\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                            className: \"g-icon\",\n                            \"aria-hidden\": \"true\",\n                            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"svg\", {\n                                viewBox: \"0 0 48 48\",\n                                children: [\n                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"path\", {\n                                        fill: \"#EA4335\",\n                                        d: \"M24 9.5c3.54 0 6.7 1.22 9.2 3.62l6.86-6.86C35.8 2.38 30.2 0 24 0 14.64 0 6.4 5.38 2.54 13.22l7.98 6.2C12.5 13.4 17.8 9.5 24 9.5z\"\n                                    }, void 0, false, {\n                                        fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n                                        lineNumber: 67,\n                                        columnNumber: 15\n                                    }, this),\n                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"path\", {\n                                        fill: \"#4285F4\",\n                                        d: \"M46.5 24c0-1.64-.15-3.2-.44-4.73H24v9.01h12.7c-.55 2.98-2.22 5.5-4.74 7.18l7.65 5.94C43.93 37.16 46.5 31.03 46.5 24z\"\n                                    }, void 0, false, {\n                                        fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n                                        lineNumber: 71,\n                                        columnNumber: 15\n                                    }, this),\n                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"path\", {\n                                        fill: \"#FBBC05\",\n                                        d: \"M10.52 28.42A14.99 14.99 0 019 24c0-1.53.26-3.01.73-4.42l-7.98-6.2A23.9 23.9 0 000 24c0 3.88.93 7.56 2.58 10.8l7.94-6.38z\"\n                                    }, void 0, false, {\n                                        fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n                                        lineNumber: 75,\n                                        columnNumber: 15\n                                    }, this),\n                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"path\", {\n                                        fill: \"#34A853\",\n                                        d: \"M24 48c6.2 0 11.4-2.05 15.2-5.57l-7.65-5.94c-2.13 1.43-4.86 2.28-7.55 2.28-6.2 0-11.5-3.9-13.48-9.35l-7.94 6.38C6.4 42.62 14.64 48 24 48z\"\n                                    }, void 0, false, {\n                                        fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n                                        lineNumber: 79,\n                                        columnNumber: 15\n                                    }, this)\n                                ]\n                            }, void 0, true, {\n                                fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n                                lineNumber: 66,\n                                columnNumber: 13\n                            }, this)\n                        }, void 0, false, {\n                            fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n                            lineNumber: 65,\n                            columnNumber: 11\n                        }, this),\n                        \"Googleで続行\"\n                    ]\n                }, void 0, true, {\n                    fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n                    lineNumber: 64,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                    className: \"auth-alt\",\n                    children: [\n                        \"すでにアカウントがある場合は \",\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_i18n_navigation__WEBPACK_IMPORTED_MODULE_2__.Link, {\n                            href: \"/login\",\n                            children: \"サインイン\"\n                        }, void 0, false, {\n                            fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n                            lineNumber: 88,\n                            columnNumber: 26\n                        }, this)\n                    ]\n                }, void 0, true, {\n                    fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n                    lineNumber: 87,\n                    columnNumber: 9\n                }, this)\n            ]\n        }, void 0, true, {\n            fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n            lineNumber: 36,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx\",\n        lineNumber: 35,\n        columnNumber: 5\n    }, this);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9zcmMvYXBwL1tsb2NhbGVdL3NpZ251cC9wYWdlLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUVpQztBQUNRO0FBQ0M7QUFFM0IsU0FBU0c7SUFDdEIsTUFBTSxDQUFDQyxPQUFPQyxTQUFTLEdBQUdMLCtDQUFRQSxDQUFDO0lBQ25DLE1BQU0sQ0FBQ00sVUFBVUMsWUFBWSxHQUFHUCwrQ0FBUUEsQ0FBQztJQUN6QyxNQUFNLENBQUNRLE9BQU9DLFNBQVMsR0FBR1QsK0NBQVFBLENBQWdCO0lBQ2xELE1BQU0sQ0FBQ1UsU0FBU0MsV0FBVyxHQUFHWCwrQ0FBUUEsQ0FBQztJQUV2QyxNQUFNWSxlQUFlO1FBQ25CSCxTQUFTO1FBQ1RFLFdBQVc7UUFDWCxNQUFNLEVBQUVILE9BQU9LLFNBQVMsRUFBRSxHQUFHLE1BQU1YLG1EQUFRQSxDQUFDWSxJQUFJLENBQUNDLE1BQU0sQ0FBQztZQUN0RFg7WUFDQUU7UUFDRjtRQUNBLElBQUlPLFdBQVdKLFNBQVNJLFVBQVVHLE9BQU87UUFDekNMLFdBQVc7SUFDYjtJQUVBLE1BQU1NLGVBQWU7UUFDbkJSLFNBQVM7UUFDVEUsV0FBVztRQUNYLE1BQU0sRUFBRUgsT0FBT0ssU0FBUyxFQUFFLEdBQUcsTUFBTVgsbURBQVFBLENBQUNZLElBQUksQ0FBQ0ksZUFBZSxDQUFDO1lBQy9EQyxVQUFVO1FBQ1o7UUFDQSxJQUFJTixXQUFXSixTQUFTSSxVQUFVRyxPQUFPO1FBQ3pDTCxXQUFXO0lBQ2I7SUFFQSxxQkFDRSw4REFBQ1M7UUFBS0MsV0FBVTtrQkFDZCw0RUFBQ0M7WUFBSUQsV0FBVTs7OEJBQ2IsOERBQUNDO29CQUFJRCxXQUFVOztzQ0FDYiw4REFBQ0U7NEJBQUtGLFdBQVU7c0NBQU87Ozs7OztzQ0FDdkIsOERBQUNFOzRCQUFLRixXQUFVO3NDQUFROzs7Ozs7Ozs7Ozs7OEJBRTFCLDhEQUFDRzs4QkFBRzs7Ozs7OzhCQUNKLDhEQUFDQztvQkFBTUosV0FBVTs7c0NBQ2YsOERBQUNFO3NDQUFLOzs7Ozs7c0NBQ04sOERBQUNHOzRCQUNDQyxNQUFLOzRCQUNMQyxPQUFPeEI7NEJBQ1B5QixVQUFVLENBQUNDLFFBQVV6QixTQUFTeUIsTUFBTUMsTUFBTSxDQUFDSCxLQUFLOzRCQUNoREksYUFBWTs7Ozs7Ozs7Ozs7OzhCQUdoQiw4REFBQ1A7b0JBQU1KLFdBQVU7O3NDQUNmLDhEQUFDRTtzQ0FBSzs7Ozs7O3NDQUNOLDhEQUFDRzs0QkFDQ0MsTUFBSzs0QkFDTEMsT0FBT3RCOzRCQUNQdUIsVUFBVSxDQUFDQyxRQUFVdkIsWUFBWXVCLE1BQU1DLE1BQU0sQ0FBQ0gsS0FBSzs0QkFDbkRJLGFBQVk7Ozs7Ozs7Ozs7OztnQkFHZnhCLHNCQUFRLDhEQUFDeUI7b0JBQUVaLFdBQVU7OEJBQWNiOzs7OzsyQkFBYTs4QkFDakQsOERBQUMwQjtvQkFBT2IsV0FBVTtvQkFBVU0sTUFBSztvQkFBU1EsU0FBU3ZCO29CQUFjd0IsVUFBVTFCOzhCQUFTOzs7Ozs7OEJBR3BGLDhEQUFDd0I7b0JBQU9iLFdBQVU7b0JBQWNNLE1BQUs7b0JBQVNRLFNBQVNsQjtvQkFBY21CLFVBQVUxQjs7c0NBQzdFLDhEQUFDYTs0QkFBS0YsV0FBVTs0QkFBU2dCLGVBQVk7c0NBQ25DLDRFQUFDQztnQ0FBSUMsU0FBUTs7a0RBQ1gsOERBQUNDO3dDQUNDQyxNQUFLO3dDQUNMQyxHQUFFOzs7Ozs7a0RBRUosOERBQUNGO3dDQUNDQyxNQUFLO3dDQUNMQyxHQUFFOzs7Ozs7a0RBRUosOERBQUNGO3dDQUNDQyxNQUFLO3dDQUNMQyxHQUFFOzs7Ozs7a0RBRUosOERBQUNGO3dDQUNDQyxNQUFLO3dDQUNMQyxHQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozt3QkFHRDs7Ozs7Ozs4QkFHVCw4REFBQ1Q7b0JBQUVaLFdBQVU7O3dCQUFXO3NDQUNQLDhEQUFDcEIsa0RBQUlBOzRCQUFDMEMsTUFBSztzQ0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFLN0MiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc2stcGRmLXdlYi8uL3NyYy9hcHAvW2xvY2FsZV0vc2lnbnVwL3BhZ2UudHN4PzU2YzAiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgY2xpZW50XCI7XG5cbmltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBMaW5rIH0gZnJvbSBcIkAvaTE4bi9uYXZpZ2F0aW9uXCI7XG5pbXBvcnQgeyBzdXBhYmFzZSB9IGZyb20gXCJAL2xpYi9zdXBhYmFzZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBTaWdudXBQYWdlKCkge1xuICBjb25zdCBbZW1haWwsIHNldEVtYWlsXSA9IHVzZVN0YXRlKFwiXCIpO1xuICBjb25zdCBbcGFzc3dvcmQsIHNldFBhc3N3b3JkXSA9IHVzZVN0YXRlKFwiXCIpO1xuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgY29uc3QgaGFuZGxlU2lnblVwID0gYXN5bmMgKCkgPT4ge1xuICAgIHNldEVycm9yKG51bGwpO1xuICAgIHNldExvYWRpbmcodHJ1ZSk7XG4gICAgY29uc3QgeyBlcnJvcjogYXV0aEVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLnNpZ25VcCh7XG4gICAgICBlbWFpbCxcbiAgICAgIHBhc3N3b3JkLFxuICAgIH0pO1xuICAgIGlmIChhdXRoRXJyb3IpIHNldEVycm9yKGF1dGhFcnJvci5tZXNzYWdlKTtcbiAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVHb29nbGUgPSBhc3luYyAoKSA9PiB7XG4gICAgc2V0RXJyb3IobnVsbCk7XG4gICAgc2V0TG9hZGluZyh0cnVlKTtcbiAgICBjb25zdCB7IGVycm9yOiBhdXRoRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguc2lnbkluV2l0aE9BdXRoKHtcbiAgICAgIHByb3ZpZGVyOiBcImdvb2dsZVwiLFxuICAgIH0pO1xuICAgIGlmIChhdXRoRXJyb3IpIHNldEVycm9yKGF1dGhFcnJvci5tZXNzYWdlKTtcbiAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxtYWluIGNsYXNzTmFtZT1cImF1dGgtcGFnZVwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJhdXRoLWNhcmRcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhdXRoLWJyYW5kXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibG9nb1wiPuKXjjwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJicmFuZFwiPkFza1BERjwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxoMT7jgrXjgqTjg7PjgqLjg4Pjg5c8L2gxPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiZmllbGRcIj5cbiAgICAgICAgICA8c3Bhbj5FbWFpbDwvc3Bhbj5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHR5cGU9XCJlbWFpbFwiXG4gICAgICAgICAgICB2YWx1ZT17ZW1haWx9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRFbWFpbChldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJ5b3VAZXhhbXBsZS5jb21cIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJmaWVsZFwiPlxuICAgICAgICAgIDxzcGFuPlBhc3N3b3JkPC9zcGFuPlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgIHZhbHVlPXtwYXNzd29yZH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldFBhc3N3b3JkKGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIuKAouKAouKAouKAouKAouKAouKAouKAolwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgICAge2Vycm9yID8gPHAgY2xhc3NOYW1lPVwiYXV0aC1lcnJvclwiPntlcnJvcn08L3A+IDogbnVsbH1cbiAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJwcmltYXJ5XCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e2hhbmRsZVNpZ25VcH0gZGlzYWJsZWQ9e2xvYWRpbmd9PlxuICAgICAgICAgIOOCteOCpOODs+OCouODg+ODl1xuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJnaG9zdCBvYXV0aFwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXtoYW5kbGVHb29nbGV9IGRpc2FibGVkPXtsb2FkaW5nfT5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJnLWljb25cIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgIDxzdmcgdmlld0JveD1cIjAgMCA0OCA0OFwiPlxuICAgICAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgICAgIGZpbGw9XCIjRUE0MzM1XCJcbiAgICAgICAgICAgICAgICBkPVwiTTI0IDkuNWMzLjU0IDAgNi43IDEuMjIgOS4yIDMuNjJsNi44Ni02Ljg2QzM1LjggMi4zOCAzMC4yIDAgMjQgMCAxNC42NCAwIDYuNCA1LjM4IDIuNTQgMTMuMjJsNy45OCA2LjJDMTIuNSAxMy40IDE3LjggOS41IDI0IDkuNXpcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgICAgIGZpbGw9XCIjNDI4NUY0XCJcbiAgICAgICAgICAgICAgICBkPVwiTTQ2LjUgMjRjMC0xLjY0LS4xNS0zLjItLjQ0LTQuNzNIMjR2OS4wMWgxMi43Yy0uNTUgMi45OC0yLjIyIDUuNS00Ljc0IDcuMThsNy42NSA1Ljk0QzQzLjkzIDM3LjE2IDQ2LjUgMzEuMDMgNDYuNSAyNHpcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgICAgIGZpbGw9XCIjRkJCQzA1XCJcbiAgICAgICAgICAgICAgICBkPVwiTTEwLjUyIDI4LjQyQTE0Ljk5IDE0Ljk5IDAgMDE5IDI0YzAtMS41My4yNi0zLjAxLjczLTQuNDJsLTcuOTgtNi4yQTIzLjkgMjMuOSAwIDAwMCAyNGMwIDMuODguOTMgNy41NiAyLjU4IDEwLjhsNy45NC02LjM4elwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgICAgZmlsbD1cIiMzNEE4NTNcIlxuICAgICAgICAgICAgICAgIGQ9XCJNMjQgNDhjNi4yIDAgMTEuNC0yLjA1IDE1LjItNS41N2wtNy42NS01Ljk0Yy0yLjEzIDEuNDMtNC44NiAyLjI4LTcuNTUgMi4yOC02LjIgMC0xMS41LTMuOS0xMy40OC05LjM1bC03Ljk0IDYuMzhDNi40IDQyLjYyIDE0LjY0IDQ4IDI0IDQ4elwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgR29vZ2xl44Gn57aa6KGMXG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8cCBjbGFzc05hbWU9XCJhdXRoLWFsdFwiPlxuICAgICAgICAgIOOBmeOBp+OBq+OCouOCq+OCpuODs+ODiOOBjOOBguOCi+WgtOWQiOOBryA8TGluayBocmVmPVwiL2xvZ2luXCI+44K144Kk44Oz44Kk44OzPC9MaW5rPlxuICAgICAgICA8L3A+XG4gICAgICA8L2Rpdj5cbiAgICA8L21haW4+XG4gICk7XG59XG4iXSwibmFtZXMiOlsidXNlU3RhdGUiLCJMaW5rIiwic3VwYWJhc2UiLCJTaWdudXBQYWdlIiwiZW1haWwiLCJzZXRFbWFpbCIsInBhc3N3b3JkIiwic2V0UGFzc3dvcmQiLCJlcnJvciIsInNldEVycm9yIiwibG9hZGluZyIsInNldExvYWRpbmciLCJoYW5kbGVTaWduVXAiLCJhdXRoRXJyb3IiLCJhdXRoIiwic2lnblVwIiwibWVzc2FnZSIsImhhbmRsZUdvb2dsZSIsInNpZ25JbldpdGhPQXV0aCIsInByb3ZpZGVyIiwibWFpbiIsImNsYXNzTmFtZSIsImRpdiIsInNwYW4iLCJoMSIsImxhYmVsIiwiaW5wdXQiLCJ0eXBlIiwidmFsdWUiLCJvbkNoYW5nZSIsImV2ZW50IiwidGFyZ2V0IiwicGxhY2Vob2xkZXIiLCJwIiwiYnV0dG9uIiwib25DbGljayIsImRpc2FibGVkIiwiYXJpYS1oaWRkZW4iLCJzdmciLCJ2aWV3Qm94IiwicGF0aCIsImZpbGwiLCJkIiwiaHJlZiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./src/app/[locale]/signup/page.tsx\n");

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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   supabase: () => (/* binding */ supabase)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"(ssr)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n\nconst supabaseUrl = \"https://gukirqskbgdqfwsqbwcy.supabase.co\" ?? 0;\nconst supabaseAnonKey = \"sb_publishable_xXGnu5bhgtrZrsccdGPk7w_T6Vb3QNL\" ?? 0;\nif (!supabaseUrl || !supabaseAnonKey) {\n    throw new Error(\"Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY\");\n}\nconst supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(supabaseUrl, supabaseAnonKey);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9zcmMvbGliL3N1cGFiYXNlLnRzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQXFEO0FBRXJELE1BQU1DLGNBQWNDLDBDQUFvQyxJQUFJLENBQUU7QUFDOUQsTUFBTUcsa0JBQWtCSCxnREFBeUMsSUFBSSxDQUFFO0FBRXZFLElBQUksQ0FBQ0QsZUFBZSxDQUFDSSxpQkFBaUI7SUFDcEMsTUFBTSxJQUFJRSxNQUFNO0FBQ2xCO0FBRU8sTUFBTUMsV0FBV1IsbUVBQVlBLENBQUNDLGFBQWFJLGlCQUFpQiIsInNvdXJjZXMiOlsid2VicGFjazovL2Fzay1wZGYtd2ViLy4vc3JjL2xpYi9zdXBhYmFzZS50cz8wNmUxIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gXCJAc3VwYWJhc2Uvc3VwYWJhc2UtanNcIjtcblxuY29uc3Qgc3VwYWJhc2VVcmwgPSBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwgPz8gXCJcIjtcbmNvbnN0IHN1cGFiYXNlQW5vbktleSA9IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZID8/IFwiXCI7XG5cbmlmICghc3VwYWJhc2VVcmwgfHwgIXN1cGFiYXNlQW5vbktleSkge1xuICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIE5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCBvciBORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWVwiKTtcbn1cblxuZXhwb3J0IGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KHN1cGFiYXNlVXJsLCBzdXBhYmFzZUFub25LZXkpO1xuIl0sIm5hbWVzIjpbImNyZWF0ZUNsaWVudCIsInN1cGFiYXNlVXJsIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsInN1cGFiYXNlQW5vbktleSIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZIiwiRXJyb3IiLCJzdXBhYmFzZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./src/lib/supabase.ts\n");

/***/ }),

/***/ "(rsc)/./src/app/globals.css":
/*!*****************************!*\
  !*** ./src/app/globals.css ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (\"483086d6b65c\");\nif (false) {}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2dsb2JhbHMuY3NzIiwibWFwcGluZ3MiOiI7Ozs7QUFBQSxpRUFBZSxjQUFjO0FBQzdCLElBQUksS0FBVSxFQUFFLEVBQXVCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYXNrLXBkZi13ZWIvLi9zcmMvYXBwL2dsb2JhbHMuY3NzPzYxYTgiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgXCI0ODMwODZkNmI2NWNcIlxuaWYgKG1vZHVsZS5ob3QpIHsgbW9kdWxlLmhvdC5hY2NlcHQoKSB9XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/globals.css\n");

/***/ }),

/***/ "(rsc)/./src/app/[locale]/layout.tsx":
/*!*************************************!*\
  !*** ./src/app/[locale]/layout.tsx ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ LocaleLayout),\n/* harmony export */   generateStaticParams: () => (/* binding */ generateStaticParams)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_intl__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! next-intl */ \"(rsc)/./node_modules/next-intl/dist/esm/development/react-server/NextIntlClientProviderServer.js\");\n/* harmony import */ var next_intl_server__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-intl/server */ \"(rsc)/./node_modules/next-intl/dist/esm/development/server/react-server/RequestLocaleCache.js\");\n/* harmony import */ var next_intl_server__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next-intl/server */ \"(rsc)/./node_modules/next-intl/dist/esm/development/server/react-server/getMessages.js\");\n/* harmony import */ var _i18n_routing__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/i18n/routing */ \"(rsc)/./src/i18n/routing.ts\");\n\n\n\n\nfunction generateStaticParams() {\n    return _i18n_routing__WEBPACK_IMPORTED_MODULE_1__.routing.locales.map((locale)=>({\n            locale\n        }));\n}\nasync function LocaleLayout({ children, params: { locale } }) {\n    if (!_i18n_routing__WEBPACK_IMPORTED_MODULE_1__.routing.locales.includes(locale)) {\n        locale = _i18n_routing__WEBPACK_IMPORTED_MODULE_1__.routing.defaultLocale;\n    }\n    (0,next_intl_server__WEBPACK_IMPORTED_MODULE_2__.setCachedRequestLocale)(locale);\n    const messages = await (0,next_intl_server__WEBPACK_IMPORTED_MODULE_3__[\"default\"])();\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(next_intl__WEBPACK_IMPORTED_MODULE_4__[\"default\"], {\n        locale: locale,\n        messages: messages,\n        children: children\n    }, void 0, false, {\n        fileName: \"/Users/programs/ask-pdf/apps/web/src/app/[locale]/layout.tsx\",\n        lineNumber: 25,\n        columnNumber: 5\n    }, this);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL1tsb2NhbGVdL2xheW91dC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQ21EO0FBQ2M7QUFFeEI7QUFFbEMsU0FBU0k7SUFDZCxPQUFPRCxrREFBT0EsQ0FBQ0UsT0FBTyxDQUFDQyxHQUFHLENBQUMsQ0FBQ0MsU0FBWTtZQUFFQTtRQUFPO0FBQ25EO0FBRWUsZUFBZUMsYUFBYSxFQUN6Q0MsUUFBUSxFQUNSQyxRQUFRLEVBQUVILE1BQU0sRUFBRSxFQUluQjtJQUNDLElBQUksQ0FBQ0osa0RBQU9BLENBQUNFLE9BQU8sQ0FBQ00sUUFBUSxDQUFDSixTQUFTO1FBQ3JDQSxTQUFTSixrREFBT0EsQ0FBQ1MsYUFBYTtJQUNoQztJQUNBVix3RUFBZ0JBLENBQUNLO0lBQ2pCLE1BQU1NLFdBQVcsTUFBTVosNERBQVdBO0lBRWxDLHFCQUNFLDhEQUFDRCxpREFBc0JBO1FBQUNPLFFBQVFBO1FBQVFNLFVBQVVBO2tCQUMvQ0o7Ozs7OztBQUdQIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYXNrLXBkZi13ZWIvLi9zcmMvYXBwL1tsb2NhbGVdL2xheW91dC50c3g/ODUzOCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFJlYWN0Tm9kZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgTmV4dEludGxDbGllbnRQcm92aWRlciB9IGZyb20gXCJuZXh0LWludGxcIjtcbmltcG9ydCB7IGdldE1lc3NhZ2VzLCBzZXRSZXF1ZXN0TG9jYWxlIH0gZnJvbSBcIm5leHQtaW50bC9zZXJ2ZXJcIjtcblxuaW1wb3J0IHsgcm91dGluZyB9IGZyb20gXCJAL2kxOG4vcm91dGluZ1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVTdGF0aWNQYXJhbXMoKSB7XG4gIHJldHVybiByb3V0aW5nLmxvY2FsZXMubWFwKChsb2NhbGUpID0+ICh7IGxvY2FsZSB9KSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIExvY2FsZUxheW91dCh7XG4gIGNoaWxkcmVuLFxuICBwYXJhbXM6IHsgbG9jYWxlIH0sXG59OiB7XG4gIGNoaWxkcmVuOiBSZWFjdE5vZGU7XG4gIHBhcmFtczogeyBsb2NhbGU6IHN0cmluZyB9O1xufSkge1xuICBpZiAoIXJvdXRpbmcubG9jYWxlcy5pbmNsdWRlcyhsb2NhbGUpKSB7XG4gICAgbG9jYWxlID0gcm91dGluZy5kZWZhdWx0TG9jYWxlO1xuICB9XG4gIHNldFJlcXVlc3RMb2NhbGUobG9jYWxlKTtcbiAgY29uc3QgbWVzc2FnZXMgPSBhd2FpdCBnZXRNZXNzYWdlcygpO1xuXG4gIHJldHVybiAoXG4gICAgPE5leHRJbnRsQ2xpZW50UHJvdmlkZXIgbG9jYWxlPXtsb2NhbGV9IG1lc3NhZ2VzPXttZXNzYWdlc30+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9OZXh0SW50bENsaWVudFByb3ZpZGVyPlxuICApO1xufVxuIl0sIm5hbWVzIjpbIk5leHRJbnRsQ2xpZW50UHJvdmlkZXIiLCJnZXRNZXNzYWdlcyIsInNldFJlcXVlc3RMb2NhbGUiLCJyb3V0aW5nIiwiZ2VuZXJhdGVTdGF0aWNQYXJhbXMiLCJsb2NhbGVzIiwibWFwIiwibG9jYWxlIiwiTG9jYWxlTGF5b3V0IiwiY2hpbGRyZW4iLCJwYXJhbXMiLCJpbmNsdWRlcyIsImRlZmF1bHRMb2NhbGUiLCJtZXNzYWdlcyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/[locale]/layout.tsx\n");

/***/ }),

/***/ "(rsc)/./src/app/[locale]/signup/page.tsx":
/*!******************************************!*\
  !*** ./src/app/[locale]/signup/page.tsx ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $$typeof: () => (/* binding */ $$typeof),
/* harmony export */   __esModule: () => (/* binding */ __esModule),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var next_dist_build_webpack_loaders_next_flight_loader_module_proxy__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/build/webpack/loaders/next-flight-loader/module-proxy */ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-loader/module-proxy.js");

const proxy = (0,next_dist_build_webpack_loaders_next_flight_loader_module_proxy__WEBPACK_IMPORTED_MODULE_0__.createProxy)(String.raw`/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx`)

// Accessing the __esModule property and exporting $$typeof are required here.
// The __esModule getter forces the proxy target to create the default export
// and the $$typeof value is for rendering logic to determine if the module
// is a client boundary.
const { __esModule, $$typeof } = proxy;
const __default__ = proxy.default;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,next_dist_build_webpack_loaders_next_flight_loader_module_proxy__WEBPACK_IMPORTED_MODULE_0__.createProxy)(String.raw`/Users/programs/ask-pdf/apps/web/src/app/[locale]/signup/page.tsx#default`));


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

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/@formatjs","vendor-chunks/use-intl","vendor-chunks/whatwg-url","vendor-chunks/next-intl","vendor-chunks/intl-messageformat","vendor-chunks/webidl-conversions","vendor-chunks/@swc"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2F%5Blocale%5D%2Fsignup%2Fpage&page=%2F%5Blocale%5D%2Fsignup%2Fpage&appPaths=%2F%5Blocale%5D%2Fsignup%2Fpage&pagePath=private-next-app-dir%2F%5Blocale%5D%2Fsignup%2Fpage.tsx&appDir=%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fprograms%2Fask-pdf%2Fapps%2Fweb&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();