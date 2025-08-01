"use strict";
exports.id = 272;
exports.ids = [272];
exports.modules = {

/***/ 31223:
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
exports.execAsync = void 0;
const child_process = __webpack_require__(35317);
const util = __webpack_require__(39023);
exports.execAsync = util.promisify(child_process.exec);
//# sourceMappingURL=execAsync.js.map

/***/ }),

/***/ 37272:
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
const execAsync_1 = __webpack_require__(31223);
const api_1 = __webpack_require__(63914);
async function getMachineId() {
    try {
        const result = await (0, execAsync_1.execAsync)('ioreg -rd1 -c "IOPlatformExpertDevice"');
        const idLine = result.stdout
            .split('\n')
            .find(line => line.includes('IOPlatformUUID'));
        if (!idLine) {
            return undefined;
        }
        const parts = idLine.split('" = "');
        if (parts.length === 2) {
            return parts[1].slice(0, -1);
        }
    }
    catch (e) {
        api_1.diag.debug(`error reading machine id: ${e}`);
    }
    return undefined;
}
exports.getMachineId = getMachineId;
//# sourceMappingURL=getMachineId-darwin.js.map

/***/ })

};
;
//# sourceMappingURL=272.index.js.map