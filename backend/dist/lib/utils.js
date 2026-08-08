"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParam = getParam;
/**
 * Safely extracts a single string parameter from Express 5 req.params
 */
function getParam(val) {
    if (Array.isArray(val)) {
        return val[0] ?? "";
    }
    return val ?? "";
}
//# sourceMappingURL=utils.js.map