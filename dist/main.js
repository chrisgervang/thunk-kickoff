"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/** state object initializer */
function state(data) {
    return {
        status: "pending",
        data: data
    };
}
exports.state = state;
var defaultReducerOptions = {
    changeDataOn: ['success']
};
function reducer(state, action, options) {
    if (options === void 0) { options = defaultReducerOptions; }
    if (options.changeDataOn.some(function (s) { return s === action.status; })) {
        return __assign({}, state, { data: action.data, status: action.status, error: action.error });
    }
    else {
        return __assign({}, state, { status: action.status, error: action.error });
    }
}
exports.reducer = reducer;
function getRequest(state) {
    return { status: state.status, error: state.error };
}
function getStatus(state) {
    return state.status;
}
function getData(state) {
    return state.data;
}
function isSuccess(state) {
    return state.status === "success";
}
function isFail(state) {
    return { failed: state.status === "fail", why: state.error };
}
function isPending(state) {
    return state.status === "pending";
}
/** basic helper functions to pull out of the kickoff store */
exports.selectors = {
    getRequest: getRequest,
    getStatus: getStatus,
    getData: getData,
    isSuccess: isSuccess,
    isFail: isFail,
    isPending: isPending
};
/** redux-thunk wrapper for calling an async function */
function wrap(creator) {
    var _this = this;
    return function (dispatch, getState) {
        /** define and then call an async function */
        (function (dispatch, getState) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, creator(dispatch, getState)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); })(dispatch, getState);
    };
}
exports.wrap = wrap;
/** action creator for kicking off a promise and loading it into the store */
function kickoff(type, endpoint, options) {
    var _this = this;
    var defaultActionCreatorOptions = {
        defaultResponse: undefined,
        format: function (data) { return data; }
    };
    if (!options)
        options = defaultActionCreatorOptions;
    return wrap(function (dispatch, getState) { return __awaiter(_this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = !!options.defaultResponse ? options.format(options.defaultResponse) : null;
                    dispatch({ type: type, status: "pending", data: data });
                    if (!!options.onPending)
                        options.onPending(dispatch, getState, data);
                    return [4 /*yield*/, endpoint.then(function (data) {
                            dispatch({ type: type, status: "success", data: options.format(data) });
                            if (!!options.onSuccess)
                                options.onSuccess(dispatch, getState, options.format(data));
                        }, function (why) {
                            dispatch({ type: type, status: "fail", error: why, data: data });
                            if (!!options.onFail)
                                options.onFail(dispatch, getState, data);
                            console.error(why);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
}
exports.default = kickoff;
//# sourceMappingURL=main.js.map