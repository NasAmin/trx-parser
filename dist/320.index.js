"use strict";
exports.id = 320;
exports.ids = [320];
exports.modules = {

/***/ 74320:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getMachineId = void 0;
const api_1 = __webpack_require__(63914);
async function getMachineId() {
    api_1.diag.debug('could not read machine-id: unsupported platform');
    return undefined;
}
exports.getMachineId = getMachineId;
//# sourceMappingURL=getMachineId-unsupported.js.map

/***/ })

};
;
//# sourceMappingURL=320.index.js.map