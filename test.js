"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
require("reflect-metadata");
function accessors(_a) {
    var _b = _a.set, set = _b === void 0 ? function (x) { return x; } : _b, _c = _a.get, get = _c === void 0 ? function (x) { return x; } : _c;
    return function (target, key) {
        var val = target[key];
        var getter = function () {
            return get(val);
        };
        var setter = function (next) {
            val = set(next);
        };
        Object.defineProperty(target, key, {
            get: getter,
            set: setter
        });
    };
}
var MyClass = /** @class */ (function () {
    function MyClass() {
    }
    __decorate([
        accessors({
            set: function (x) { return x; }
        })
    ], MyClass.prototype, "age");
    __decorate([
        log
    ], MyClass.prototype, "name");
    return MyClass;
}());
function log(target, property) {
    return Reflect.metadata("log", true);
}
var a = new MyClass();
var proxy = new Proxy(a, {
    get: function (target, p) {
        if (Reflect.getMetadata("log", target, p)) {
            console.log(p, " has log");
        }
        else {
            console.log(p, " has no log");
        }
        return target[p];
    }
});
proxy.age;
proxy.name;
console.log(a.age);
