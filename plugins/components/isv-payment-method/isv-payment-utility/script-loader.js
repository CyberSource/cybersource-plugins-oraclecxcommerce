let __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let __generator = (this && this.__generator) || function (thisArg, body) {
    let _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
export default function loadScript(url, scriptId) {
    return new Promise(function (resolve, reject) {
        let scriptExists = document.getElementById(scriptId);
        if (scriptExists) {
            if(  'Flex' === scriptId ){
                scriptExists.setAttribute('src', url?.ctx[0]?.data?.clientLibrary);
                scriptExists.setAttribute('integrity', url?.ctx[0]?.data?.clientLibraryIntegrity);
                scriptExists.setAttribute('crossorigin', 'anonymous');
            }
            else{
                scriptExists.setAttribute('src', url);
            }
            return resolve();
        }
        
        let scriptToLoad = document.createElement('script');

        scriptToLoad.setAttribute('src',  (scriptId === 'Flex'? url?.ctx[0]?.data?.clientLibrary:url));
        if('Flex' === scriptId){
            scriptToLoad.setAttribute('integrity',url?.ctx[0]?.data?.clientLibraryIntegrity);
            scriptToLoad.setAttribute('crossorigin', 'anonymous');
        }
        scriptToLoad.id = scriptId;
        scriptToLoad.onload = function () { return resolve(); };
        scriptToLoad.onerror = function () { return reject(); };
        document.body.appendChild(scriptToLoad);
    });
}
let isAmd = function () { return 'function' == typeof window.require; };
export function amdJsLoad(url, globalEnvName) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (isAmd()) {
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                            try {
                                window.require([url], function (module) {
                                    resolve(module);
                                    // Reassigning AMD exported module as global variable
                                    window[globalEnvName] = module[globalEnvName];
                                });
                            }
                            catch (err) {
                                reject(err);
                            }
                        })];
                    }
                    return [4 /*yield*/, loadScript(url, globalEnvName)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, window[globalEnvName]];
            }
        });
    });
}
