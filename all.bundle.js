var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// vendor/dexie.mjs
var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
  };
  return extendStatics(d, b);
};
function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
    throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var __assign = function() {
  __assign = Object.assign || function __assign2(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}
var _global = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
var keys = Object.keys;
var isArray = Array.isArray;
if (typeof Promise !== "undefined" && !_global.Promise) {
  _global.Promise = Promise;
}
function extend(obj, extension) {
  if (typeof extension !== "object")
    return obj;
  keys(extension).forEach(function(key) {
    obj[key] = extension[key];
  });
  return obj;
}
var getProto = Object.getPrototypeOf;
var _hasOwn = {}.hasOwnProperty;
function hasOwn(obj, prop) {
  return _hasOwn.call(obj, prop);
}
function props(proto, extension) {
  if (typeof extension === "function")
    extension = extension(getProto(proto));
  (typeof Reflect === "undefined" ? keys : Reflect.ownKeys)(extension).forEach(function(key) {
    setProp(proto, key, extension[key]);
  });
}
var defineProperty = Object.defineProperty;
function setProp(obj, prop, functionOrGetSet, options) {
  defineProperty(obj, prop, extend(functionOrGetSet && hasOwn(functionOrGetSet, "get") && typeof functionOrGetSet.get === "function" ? { get: functionOrGetSet.get, set: functionOrGetSet.set, configurable: true } : { value: functionOrGetSet, configurable: true, writable: true }, options));
}
function derive(Child) {
  return {
    from: function(Parent) {
      Child.prototype = Object.create(Parent.prototype);
      setProp(Child.prototype, "constructor", Child);
      return {
        extend: props.bind(null, Child.prototype)
      };
    }
  };
}
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
function getPropertyDescriptor(obj, prop) {
  var pd = getOwnPropertyDescriptor(obj, prop);
  var proto;
  return pd || (proto = getProto(obj)) && getPropertyDescriptor(proto, prop);
}
var _slice = [].slice;
function slice(args, start, end) {
  return _slice.call(args, start, end);
}
function override(origFunc, overridedFactory) {
  return overridedFactory(origFunc);
}
function assert(b) {
  if (!b)
    throw new Error("Assertion Failed");
}
function asap$1(fn) {
  if (_global.setImmediate)
    setImmediate(fn);
  else
    setTimeout(fn, 0);
}
function arrayToObject(array, extractor) {
  return array.reduce(function(result, item, i) {
    var nameAndValue = extractor(item, i);
    if (nameAndValue)
      result[nameAndValue[0]] = nameAndValue[1];
    return result;
  }, {});
}
function getByKeyPath(obj, keyPath) {
  if (typeof keyPath === "string" && hasOwn(obj, keyPath))
    return obj[keyPath];
  if (!keyPath)
    return obj;
  if (typeof keyPath !== "string") {
    var rv = [];
    for (var i = 0, l = keyPath.length; i < l; ++i) {
      var val = getByKeyPath(obj, keyPath[i]);
      rv.push(val);
    }
    return rv;
  }
  var period = keyPath.indexOf(".");
  if (period !== -1) {
    var innerObj = obj[keyPath.substr(0, period)];
    return innerObj == null ? void 0 : getByKeyPath(innerObj, keyPath.substr(period + 1));
  }
  return void 0;
}
function setByKeyPath(obj, keyPath, value) {
  if (!obj || keyPath === void 0)
    return;
  if ("isFrozen" in Object && Object.isFrozen(obj))
    return;
  if (typeof keyPath !== "string" && "length" in keyPath) {
    assert(typeof value !== "string" && "length" in value);
    for (var i = 0, l = keyPath.length; i < l; ++i) {
      setByKeyPath(obj, keyPath[i], value[i]);
    }
  } else {
    var period = keyPath.indexOf(".");
    if (period !== -1) {
      var currentKeyPath = keyPath.substr(0, period);
      var remainingKeyPath = keyPath.substr(period + 1);
      if (remainingKeyPath === "")
        if (value === void 0) {
          if (isArray(obj) && !isNaN(parseInt(currentKeyPath)))
            obj.splice(currentKeyPath, 1);
          else
            delete obj[currentKeyPath];
        } else
          obj[currentKeyPath] = value;
      else {
        var innerObj = obj[currentKeyPath];
        if (!innerObj || !hasOwn(obj, currentKeyPath))
          innerObj = obj[currentKeyPath] = {};
        setByKeyPath(innerObj, remainingKeyPath, value);
      }
    } else {
      if (value === void 0) {
        if (isArray(obj) && !isNaN(parseInt(keyPath)))
          obj.splice(keyPath, 1);
        else
          delete obj[keyPath];
      } else
        obj[keyPath] = value;
    }
  }
}
function delByKeyPath(obj, keyPath) {
  if (typeof keyPath === "string")
    setByKeyPath(obj, keyPath, void 0);
  else if ("length" in keyPath)
    [].map.call(keyPath, function(kp) {
      setByKeyPath(obj, kp, void 0);
    });
}
function shallowClone(obj) {
  var rv = {};
  for (var m in obj) {
    if (hasOwn(obj, m))
      rv[m] = obj[m];
  }
  return rv;
}
var concat = [].concat;
function flatten(a) {
  return concat.apply([], a);
}
var intrinsicTypeNames = "BigUint64Array,BigInt64Array,Array,Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,FileSystemDirectoryHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey".split(",").concat(flatten([8, 16, 32, 64].map(function(num) {
  return ["Int", "Uint", "Float"].map(function(t) {
    return t + num + "Array";
  });
}))).filter(function(t) {
  return _global[t];
});
var intrinsicTypes = new Set(intrinsicTypeNames.map(function(t) {
  return _global[t];
}));
function cloneSimpleObjectTree(o) {
  var rv = {};
  for (var k in o)
    if (hasOwn(o, k)) {
      var v = o[k];
      rv[k] = !v || typeof v !== "object" || intrinsicTypes.has(v.constructor) ? v : cloneSimpleObjectTree(v);
    }
  return rv;
}
function objectIsEmpty(o) {
  for (var k in o)
    if (hasOwn(o, k))
      return false;
  return true;
}
var circularRefs = null;
function deepClone(any) {
  circularRefs = /* @__PURE__ */ new WeakMap();
  var rv = innerDeepClone(any);
  circularRefs = null;
  return rv;
}
function innerDeepClone(x) {
  if (!x || typeof x !== "object")
    return x;
  var rv = circularRefs.get(x);
  if (rv)
    return rv;
  if (isArray(x)) {
    rv = [];
    circularRefs.set(x, rv);
    for (var i = 0, l = x.length; i < l; ++i) {
      rv.push(innerDeepClone(x[i]));
    }
  } else if (intrinsicTypes.has(x.constructor)) {
    rv = x;
  } else {
    var proto = getProto(x);
    rv = proto === Object.prototype ? {} : Object.create(proto);
    circularRefs.set(x, rv);
    for (var prop in x) {
      if (hasOwn(x, prop)) {
        rv[prop] = innerDeepClone(x[prop]);
      }
    }
  }
  return rv;
}
var toString = {}.toString;
function toStringTag(o) {
  return toString.call(o).slice(8, -1);
}
var iteratorSymbol = typeof Symbol !== "undefined" ? Symbol.iterator : "@@iterator";
var getIteratorOf = typeof iteratorSymbol === "symbol" ? function(x) {
  var i;
  return x != null && (i = x[iteratorSymbol]) && i.apply(x);
} : function() {
  return null;
};
function delArrayItem(a, x) {
  var i = a.indexOf(x);
  if (i >= 0)
    a.splice(i, 1);
  return i >= 0;
}
var NO_CHAR_ARRAY = {};
function getArrayOf(arrayLike) {
  var i, a, x, it;
  if (arguments.length === 1) {
    if (isArray(arrayLike))
      return arrayLike.slice();
    if (this === NO_CHAR_ARRAY && typeof arrayLike === "string")
      return [arrayLike];
    if (it = getIteratorOf(arrayLike)) {
      a = [];
      while (x = it.next(), !x.done)
        a.push(x.value);
      return a;
    }
    if (arrayLike == null)
      return [arrayLike];
    i = arrayLike.length;
    if (typeof i === "number") {
      a = new Array(i);
      while (i--)
        a[i] = arrayLike[i];
      return a;
    }
    return [arrayLike];
  }
  i = arguments.length;
  a = new Array(i);
  while (i--)
    a[i] = arguments[i];
  return a;
}
var isAsyncFunction = typeof Symbol !== "undefined" ? function(fn) {
  return fn[Symbol.toStringTag] === "AsyncFunction";
} : function() {
  return false;
};
var dexieErrorNames = [
  "Modify",
  "Bulk",
  "OpenFailed",
  "VersionChange",
  "Schema",
  "Upgrade",
  "InvalidTable",
  "MissingAPI",
  "NoSuchDatabase",
  "InvalidArgument",
  "SubTransaction",
  "Unsupported",
  "Internal",
  "DatabaseClosed",
  "PrematureCommit",
  "ForeignAwait"
];
var idbDomErrorNames = [
  "Unknown",
  "Constraint",
  "Data",
  "TransactionInactive",
  "ReadOnly",
  "Version",
  "NotFound",
  "InvalidState",
  "InvalidAccess",
  "Abort",
  "Timeout",
  "QuotaExceeded",
  "Syntax",
  "DataClone"
];
var errorList = dexieErrorNames.concat(idbDomErrorNames);
var defaultTexts = {
  VersionChanged: "Database version changed by other database connection",
  DatabaseClosed: "Database has been closed",
  Abort: "Transaction aborted",
  TransactionInactive: "Transaction has already completed or failed",
  MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"
};
function DexieError(name, msg) {
  this.name = name;
  this.message = msg;
}
derive(DexieError).from(Error).extend({
  toString: function() {
    return this.name + ": " + this.message;
  }
});
function getMultiErrorMessage(msg, failures) {
  return msg + ". Errors: " + Object.keys(failures).map(function(key) {
    return failures[key].toString();
  }).filter(function(v, i, s) {
    return s.indexOf(v) === i;
  }).join("\n");
}
function ModifyError(msg, failures, successCount, failedKeys) {
  this.failures = failures;
  this.failedKeys = failedKeys;
  this.successCount = successCount;
  this.message = getMultiErrorMessage(msg, failures);
}
derive(ModifyError).from(DexieError);
function BulkError(msg, failures) {
  this.name = "BulkError";
  this.failures = Object.keys(failures).map(function(pos) {
    return failures[pos];
  });
  this.failuresByPos = failures;
  this.message = getMultiErrorMessage(msg, this.failures);
}
derive(BulkError).from(DexieError);
var errnames = errorList.reduce(function(obj, name) {
  return obj[name] = name + "Error", obj;
}, {});
var BaseException = DexieError;
var exceptions = errorList.reduce(function(obj, name) {
  var fullName = name + "Error";
  function DexieError2(msgOrInner, inner) {
    this.name = fullName;
    if (!msgOrInner) {
      this.message = defaultTexts[name] || fullName;
      this.inner = null;
    } else if (typeof msgOrInner === "string") {
      this.message = "".concat(msgOrInner).concat(!inner ? "" : "\n " + inner);
      this.inner = inner || null;
    } else if (typeof msgOrInner === "object") {
      this.message = "".concat(msgOrInner.name, " ").concat(msgOrInner.message);
      this.inner = msgOrInner;
    }
  }
  derive(DexieError2).from(BaseException);
  obj[name] = DexieError2;
  return obj;
}, {});
exceptions.Syntax = SyntaxError;
exceptions.Type = TypeError;
exceptions.Range = RangeError;
var exceptionMap = idbDomErrorNames.reduce(function(obj, name) {
  obj[name + "Error"] = exceptions[name];
  return obj;
}, {});
function mapError(domError, message) {
  if (!domError || domError instanceof DexieError || domError instanceof TypeError || domError instanceof SyntaxError || !domError.name || !exceptionMap[domError.name])
    return domError;
  var rv = new exceptionMap[domError.name](message || domError.message, domError);
  if ("stack" in domError) {
    setProp(rv, "stack", { get: function() {
      return this.inner.stack;
    } });
  }
  return rv;
}
var fullNameExceptions = errorList.reduce(function(obj, name) {
  if (["Syntax", "Type", "Range"].indexOf(name) === -1)
    obj[name + "Error"] = exceptions[name];
  return obj;
}, {});
fullNameExceptions.ModifyError = ModifyError;
fullNameExceptions.DexieError = DexieError;
fullNameExceptions.BulkError = BulkError;
function nop() {
}
function mirror(val) {
  return val;
}
function pureFunctionChain(f1, f2) {
  if (f1 == null || f1 === mirror)
    return f2;
  return function(val) {
    return f2(f1(val));
  };
}
function callBoth(on1, on2) {
  return function() {
    on1.apply(this, arguments);
    on2.apply(this, arguments);
  };
}
function hookCreatingChain(f1, f2) {
  if (f1 === nop)
    return f2;
  return function() {
    var res = f1.apply(this, arguments);
    if (res !== void 0)
      arguments[0] = res;
    var onsuccess = this.onsuccess, onerror = this.onerror;
    this.onsuccess = null;
    this.onerror = null;
    var res2 = f2.apply(this, arguments);
    if (onsuccess)
      this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
    if (onerror)
      this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
    return res2 !== void 0 ? res2 : res;
  };
}
function hookDeletingChain(f1, f2) {
  if (f1 === nop)
    return f2;
  return function() {
    f1.apply(this, arguments);
    var onsuccess = this.onsuccess, onerror = this.onerror;
    this.onsuccess = this.onerror = null;
    f2.apply(this, arguments);
    if (onsuccess)
      this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
    if (onerror)
      this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
  };
}
function hookUpdatingChain(f1, f2) {
  if (f1 === nop)
    return f2;
  return function(modifications) {
    var res = f1.apply(this, arguments);
    extend(modifications, res);
    var onsuccess = this.onsuccess, onerror = this.onerror;
    this.onsuccess = null;
    this.onerror = null;
    var res2 = f2.apply(this, arguments);
    if (onsuccess)
      this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
    if (onerror)
      this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
    return res === void 0 ? res2 === void 0 ? void 0 : res2 : extend(res, res2);
  };
}
function reverseStoppableEventChain(f1, f2) {
  if (f1 === nop)
    return f2;
  return function() {
    if (f2.apply(this, arguments) === false)
      return false;
    return f1.apply(this, arguments);
  };
}
function promisableChain(f1, f2) {
  if (f1 === nop)
    return f2;
  return function() {
    var res = f1.apply(this, arguments);
    if (res && typeof res.then === "function") {
      var thiz = this, i = arguments.length, args = new Array(i);
      while (i--)
        args[i] = arguments[i];
      return res.then(function() {
        return f2.apply(thiz, args);
      });
    }
    return f2.apply(this, arguments);
  };
}
var debug = typeof location !== "undefined" && /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
function setDebug(value, filter) {
  debug = value;
}
var INTERNAL = {};
var ZONE_ECHO_LIMIT = 100;
var _a$1 = typeof Promise === "undefined" ? [] : (function() {
  var globalP = Promise.resolve();
  if (typeof crypto === "undefined" || !crypto.subtle)
    return [globalP, getProto(globalP), globalP];
  var nativeP = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
  return [
    nativeP,
    getProto(nativeP),
    globalP
  ];
})();
var resolvedNativePromise = _a$1[0];
var nativePromiseProto = _a$1[1];
var resolvedGlobalPromise = _a$1[2];
var nativePromiseThen = nativePromiseProto && nativePromiseProto.then;
var NativePromise = resolvedNativePromise && resolvedNativePromise.constructor;
var patchGlobalPromise = !!resolvedGlobalPromise;
function schedulePhysicalTick() {
  queueMicrotask(physicalTick);
}
var asap = function(callback, args) {
  microtickQueue.push([callback, args]);
  if (needsNewPhysicalTick) {
    schedulePhysicalTick();
    needsNewPhysicalTick = false;
  }
};
var isOutsideMicroTick = true;
var needsNewPhysicalTick = true;
var unhandledErrors = [];
var rejectingErrors = [];
var rejectionMapper = mirror;
var globalPSD = {
  id: "global",
  global: true,
  ref: 0,
  unhandleds: [],
  onunhandled: nop,
  pgp: false,
  env: {},
  finalize: nop
};
var PSD = globalPSD;
var microtickQueue = [];
var numScheduledCalls = 0;
var tickFinalizers = [];
function DexiePromise(fn) {
  if (typeof this !== "object")
    throw new TypeError("Promises must be constructed via new");
  this._listeners = [];
  this._lib = false;
  var psd = this._PSD = PSD;
  if (typeof fn !== "function") {
    if (fn !== INTERNAL)
      throw new TypeError("Not a function");
    this._state = arguments[1];
    this._value = arguments[2];
    if (this._state === false)
      handleRejection(this, this._value);
    return;
  }
  this._state = null;
  this._value = null;
  ++psd.ref;
  executePromiseTask(this, fn);
}
var thenProp = {
  get: function() {
    var psd = PSD, microTaskId = totalEchoes;
    function then(onFulfilled, onRejected) {
      var _this = this;
      var possibleAwait = !psd.global && (psd !== PSD || microTaskId !== totalEchoes);
      var cleanup = possibleAwait && !decrementExpectedAwaits();
      var rv = new DexiePromise(function(resolve, reject) {
        propagateToListener(_this, new Listener(nativeAwaitCompatibleWrap(onFulfilled, psd, possibleAwait, cleanup), nativeAwaitCompatibleWrap(onRejected, psd, possibleAwait, cleanup), resolve, reject, psd));
      });
      if (this._consoleTask)
        rv._consoleTask = this._consoleTask;
      return rv;
    }
    then.prototype = INTERNAL;
    return then;
  },
  set: function(value) {
    setProp(this, "then", value && value.prototype === INTERNAL ? thenProp : {
      get: function() {
        return value;
      },
      set: thenProp.set
    });
  }
};
props(DexiePromise.prototype, {
  then: thenProp,
  _then: function(onFulfilled, onRejected) {
    propagateToListener(this, new Listener(null, null, onFulfilled, onRejected, PSD));
  },
  catch: function(onRejected) {
    if (arguments.length === 1)
      return this.then(null, onRejected);
    var type2 = arguments[0], handler = arguments[1];
    return typeof type2 === "function" ? this.then(null, function(err) {
      return err instanceof type2 ? handler(err) : PromiseReject(err);
    }) : this.then(null, function(err) {
      return err && err.name === type2 ? handler(err) : PromiseReject(err);
    });
  },
  finally: function(onFinally) {
    return this.then(function(value) {
      return DexiePromise.resolve(onFinally()).then(function() {
        return value;
      });
    }, function(err) {
      return DexiePromise.resolve(onFinally()).then(function() {
        return PromiseReject(err);
      });
    });
  },
  timeout: function(ms, msg) {
    var _this = this;
    return ms < Infinity ? new DexiePromise(function(resolve, reject) {
      var handle = setTimeout(function() {
        return reject(new exceptions.Timeout(msg));
      }, ms);
      _this.then(resolve, reject).finally(clearTimeout.bind(null, handle));
    }) : this;
  }
});
if (typeof Symbol !== "undefined" && Symbol.toStringTag)
  setProp(DexiePromise.prototype, Symbol.toStringTag, "Dexie.Promise");
globalPSD.env = snapShot();
function Listener(onFulfilled, onRejected, resolve, reject, zone) {
  this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
  this.onRejected = typeof onRejected === "function" ? onRejected : null;
  this.resolve = resolve;
  this.reject = reject;
  this.psd = zone;
}
props(DexiePromise, {
  all: function() {
    var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
    return new DexiePromise(function(resolve, reject) {
      if (values.length === 0)
        resolve([]);
      var remaining = values.length;
      values.forEach(function(a, i) {
        return DexiePromise.resolve(a).then(function(x) {
          values[i] = x;
          if (!--remaining)
            resolve(values);
        }, reject);
      });
    });
  },
  resolve: function(value) {
    if (value instanceof DexiePromise)
      return value;
    if (value && typeof value.then === "function")
      return new DexiePromise(function(resolve, reject) {
        value.then(resolve, reject);
      });
    var rv = new DexiePromise(INTERNAL, true, value);
    return rv;
  },
  reject: PromiseReject,
  race: function() {
    var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
    return new DexiePromise(function(resolve, reject) {
      values.map(function(value) {
        return DexiePromise.resolve(value).then(resolve, reject);
      });
    });
  },
  PSD: {
    get: function() {
      return PSD;
    },
    set: function(value) {
      return PSD = value;
    }
  },
  totalEchoes: { get: function() {
    return totalEchoes;
  } },
  newPSD: newScope,
  usePSD,
  scheduler: {
    get: function() {
      return asap;
    },
    set: function(value) {
      asap = value;
    }
  },
  rejectionMapper: {
    get: function() {
      return rejectionMapper;
    },
    set: function(value) {
      rejectionMapper = value;
    }
  },
  follow: function(fn, zoneProps) {
    return new DexiePromise(function(resolve, reject) {
      return newScope(function(resolve2, reject2) {
        var psd = PSD;
        psd.unhandleds = [];
        psd.onunhandled = reject2;
        psd.finalize = callBoth(function() {
          var _this = this;
          run_at_end_of_this_or_next_physical_tick(function() {
            _this.unhandleds.length === 0 ? resolve2() : reject2(_this.unhandleds[0]);
          });
        }, psd.finalize);
        fn();
      }, zoneProps, resolve, reject);
    });
  }
});
if (NativePromise) {
  if (NativePromise.allSettled)
    setProp(DexiePromise, "allSettled", function() {
      var possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
      return new DexiePromise(function(resolve) {
        if (possiblePromises.length === 0)
          resolve([]);
        var remaining = possiblePromises.length;
        var results = new Array(remaining);
        possiblePromises.forEach(function(p, i) {
          return DexiePromise.resolve(p).then(function(value) {
            return results[i] = { status: "fulfilled", value };
          }, function(reason) {
            return results[i] = { status: "rejected", reason };
          }).then(function() {
            return --remaining || resolve(results);
          });
        });
      });
    });
  if (NativePromise.any && typeof AggregateError !== "undefined")
    setProp(DexiePromise, "any", function() {
      var possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
      return new DexiePromise(function(resolve, reject) {
        if (possiblePromises.length === 0)
          reject(new AggregateError([]));
        var remaining = possiblePromises.length;
        var failures = new Array(remaining);
        possiblePromises.forEach(function(p, i) {
          return DexiePromise.resolve(p).then(function(value) {
            return resolve(value);
          }, function(failure) {
            failures[i] = failure;
            if (!--remaining)
              reject(new AggregateError(failures));
          });
        });
      });
    });
  if (NativePromise.withResolvers)
    DexiePromise.withResolvers = NativePromise.withResolvers;
}
function executePromiseTask(promise, fn) {
  try {
    fn(function(value) {
      if (promise._state !== null)
        return;
      if (value === promise)
        throw new TypeError("A promise cannot be resolved with itself.");
      var shouldExecuteTick = promise._lib && beginMicroTickScope();
      if (value && typeof value.then === "function") {
        executePromiseTask(promise, function(resolve, reject) {
          value instanceof DexiePromise ? value._then(resolve, reject) : value.then(resolve, reject);
        });
      } else {
        promise._state = true;
        promise._value = value;
        propagateAllListeners(promise);
      }
      if (shouldExecuteTick)
        endMicroTickScope();
    }, handleRejection.bind(null, promise));
  } catch (ex) {
    handleRejection(promise, ex);
  }
}
function handleRejection(promise, reason) {
  rejectingErrors.push(reason);
  if (promise._state !== null)
    return;
  var shouldExecuteTick = promise._lib && beginMicroTickScope();
  reason = rejectionMapper(reason);
  promise._state = false;
  promise._value = reason;
  addPossiblyUnhandledError(promise);
  propagateAllListeners(promise);
  if (shouldExecuteTick)
    endMicroTickScope();
}
function propagateAllListeners(promise) {
  var listeners = promise._listeners;
  promise._listeners = [];
  for (var i = 0, len = listeners.length; i < len; ++i) {
    propagateToListener(promise, listeners[i]);
  }
  var psd = promise._PSD;
  --psd.ref || psd.finalize();
  if (numScheduledCalls === 0) {
    ++numScheduledCalls;
    asap(function() {
      if (--numScheduledCalls === 0)
        finalizePhysicalTick();
    }, []);
  }
}
function propagateToListener(promise, listener) {
  if (promise._state === null) {
    promise._listeners.push(listener);
    return;
  }
  var cb = promise._state ? listener.onFulfilled : listener.onRejected;
  if (cb === null) {
    return (promise._state ? listener.resolve : listener.reject)(promise._value);
  }
  ++listener.psd.ref;
  ++numScheduledCalls;
  asap(callListener, [cb, promise, listener]);
}
function callListener(cb, promise, listener) {
  try {
    var ret, value = promise._value;
    if (!promise._state && rejectingErrors.length)
      rejectingErrors = [];
    ret = debug && promise._consoleTask ? promise._consoleTask.run(function() {
      return cb(value);
    }) : cb(value);
    if (!promise._state && rejectingErrors.indexOf(value) === -1) {
      markErrorAsHandled(promise);
    }
    listener.resolve(ret);
  } catch (e) {
    listener.reject(e);
  } finally {
    if (--numScheduledCalls === 0)
      finalizePhysicalTick();
    --listener.psd.ref || listener.psd.finalize();
  }
}
function physicalTick() {
  usePSD(globalPSD, function() {
    beginMicroTickScope() && endMicroTickScope();
  });
}
function beginMicroTickScope() {
  var wasRootExec = isOutsideMicroTick;
  isOutsideMicroTick = false;
  needsNewPhysicalTick = false;
  return wasRootExec;
}
function endMicroTickScope() {
  var callbacks, i, l;
  do {
    while (microtickQueue.length > 0) {
      callbacks = microtickQueue;
      microtickQueue = [];
      l = callbacks.length;
      for (i = 0; i < l; ++i) {
        var item = callbacks[i];
        item[0].apply(null, item[1]);
      }
    }
  } while (microtickQueue.length > 0);
  isOutsideMicroTick = true;
  needsNewPhysicalTick = true;
}
function finalizePhysicalTick() {
  var unhandledErrs = unhandledErrors;
  unhandledErrors = [];
  unhandledErrs.forEach(function(p) {
    p._PSD.onunhandled.call(null, p._value, p);
  });
  var finalizers = tickFinalizers.slice(0);
  var i = finalizers.length;
  while (i)
    finalizers[--i]();
}
function run_at_end_of_this_or_next_physical_tick(fn) {
  function finalizer() {
    fn();
    tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
  }
  tickFinalizers.push(finalizer);
  ++numScheduledCalls;
  asap(function() {
    if (--numScheduledCalls === 0)
      finalizePhysicalTick();
  }, []);
}
function addPossiblyUnhandledError(promise) {
  if (!unhandledErrors.some(function(p) {
    return p._value === promise._value;
  }))
    unhandledErrors.push(promise);
}
function markErrorAsHandled(promise) {
  var i = unhandledErrors.length;
  while (i)
    if (unhandledErrors[--i]._value === promise._value) {
      unhandledErrors.splice(i, 1);
      return;
    }
}
function PromiseReject(reason) {
  return new DexiePromise(INTERNAL, false, reason);
}
function wrap(fn, errorCatcher) {
  var psd = PSD;
  return function() {
    var wasRootExec = beginMicroTickScope(), outerScope = PSD;
    try {
      switchToZone(psd, true);
      return fn.apply(this, arguments);
    } catch (e) {
      errorCatcher && errorCatcher(e);
    } finally {
      switchToZone(outerScope, false);
      if (wasRootExec)
        endMicroTickScope();
    }
  };
}
var task = { awaits: 0, echoes: 0, id: 0 };
var taskCounter = 0;
var zoneStack = [];
var zoneEchoes = 0;
var totalEchoes = 0;
var zone_id_counter = 0;
function newScope(fn, props2, a1, a2) {
  var parent = PSD, psd = Object.create(parent);
  psd.parent = parent;
  psd.ref = 0;
  psd.global = false;
  psd.id = ++zone_id_counter;
  globalPSD.env;
  psd.env = patchGlobalPromise ? {
    Promise: DexiePromise,
    PromiseProp: { value: DexiePromise, configurable: true, writable: true },
    all: DexiePromise.all,
    race: DexiePromise.race,
    allSettled: DexiePromise.allSettled,
    any: DexiePromise.any,
    resolve: DexiePromise.resolve,
    reject: DexiePromise.reject
  } : {};
  if (props2)
    extend(psd, props2);
  ++parent.ref;
  psd.finalize = function() {
    --this.parent.ref || this.parent.finalize();
  };
  var rv = usePSD(psd, fn, a1, a2);
  if (psd.ref === 0)
    psd.finalize();
  return rv;
}
function incrementExpectedAwaits() {
  if (!task.id)
    task.id = ++taskCounter;
  ++task.awaits;
  task.echoes += ZONE_ECHO_LIMIT;
  return task.id;
}
function decrementExpectedAwaits() {
  if (!task.awaits)
    return false;
  if (--task.awaits === 0)
    task.id = 0;
  task.echoes = task.awaits * ZONE_ECHO_LIMIT;
  return true;
}
if (("" + nativePromiseThen).indexOf("[native code]") === -1) {
  incrementExpectedAwaits = decrementExpectedAwaits = nop;
}
function onPossibleParallellAsync(possiblePromise) {
  if (task.echoes && possiblePromise && possiblePromise.constructor === NativePromise) {
    incrementExpectedAwaits();
    return possiblePromise.then(function(x) {
      decrementExpectedAwaits();
      return x;
    }, function(e) {
      decrementExpectedAwaits();
      return rejection(e);
    });
  }
  return possiblePromise;
}
function zoneEnterEcho(targetZone) {
  ++totalEchoes;
  if (!task.echoes || --task.echoes === 0) {
    task.echoes = task.awaits = task.id = 0;
  }
  zoneStack.push(PSD);
  switchToZone(targetZone, true);
}
function zoneLeaveEcho() {
  var zone = zoneStack[zoneStack.length - 1];
  zoneStack.pop();
  switchToZone(zone, false);
}
function switchToZone(targetZone, bEnteringZone) {
  var currentZone = PSD;
  if (bEnteringZone ? task.echoes && (!zoneEchoes++ || targetZone !== PSD) : zoneEchoes && (!--zoneEchoes || targetZone !== PSD)) {
    queueMicrotask(bEnteringZone ? zoneEnterEcho.bind(null, targetZone) : zoneLeaveEcho);
  }
  if (targetZone === PSD)
    return;
  PSD = targetZone;
  if (currentZone === globalPSD)
    globalPSD.env = snapShot();
  if (patchGlobalPromise) {
    var GlobalPromise = globalPSD.env.Promise;
    var targetEnv = targetZone.env;
    if (currentZone.global || targetZone.global) {
      Object.defineProperty(_global, "Promise", targetEnv.PromiseProp);
      GlobalPromise.all = targetEnv.all;
      GlobalPromise.race = targetEnv.race;
      GlobalPromise.resolve = targetEnv.resolve;
      GlobalPromise.reject = targetEnv.reject;
      if (targetEnv.allSettled)
        GlobalPromise.allSettled = targetEnv.allSettled;
      if (targetEnv.any)
        GlobalPromise.any = targetEnv.any;
    }
  }
}
function snapShot() {
  var GlobalPromise = _global.Promise;
  return patchGlobalPromise ? {
    Promise: GlobalPromise,
    PromiseProp: Object.getOwnPropertyDescriptor(_global, "Promise"),
    all: GlobalPromise.all,
    race: GlobalPromise.race,
    allSettled: GlobalPromise.allSettled,
    any: GlobalPromise.any,
    resolve: GlobalPromise.resolve,
    reject: GlobalPromise.reject
  } : {};
}
function usePSD(psd, fn, a1, a2, a3) {
  var outerScope = PSD;
  try {
    switchToZone(psd, true);
    return fn(a1, a2, a3);
  } finally {
    switchToZone(outerScope, false);
  }
}
function nativeAwaitCompatibleWrap(fn, zone, possibleAwait, cleanup) {
  return typeof fn !== "function" ? fn : function() {
    var outerZone = PSD;
    if (possibleAwait)
      incrementExpectedAwaits();
    switchToZone(zone, true);
    try {
      return fn.apply(this, arguments);
    } finally {
      switchToZone(outerZone, false);
      if (cleanup)
        queueMicrotask(decrementExpectedAwaits);
    }
  };
}
function execInGlobalContext(cb) {
  if (Promise === NativePromise && task.echoes === 0) {
    if (zoneEchoes === 0) {
      cb();
    } else {
      enqueueNativeMicroTask(cb);
    }
  } else {
    setTimeout(cb, 0);
  }
}
var rejection = DexiePromise.reject;
function tempTransaction(db2, mode, storeNames, fn) {
  if (!db2.idbdb || !db2._state.openComplete && (!PSD.letThrough && !db2._vip)) {
    if (db2._state.openComplete) {
      return rejection(new exceptions.DatabaseClosed(db2._state.dbOpenError));
    }
    if (!db2._state.isBeingOpened) {
      if (!db2._state.autoOpen)
        return rejection(new exceptions.DatabaseClosed());
      db2.open().catch(nop);
    }
    return db2._state.dbReadyPromise.then(function() {
      return tempTransaction(db2, mode, storeNames, fn);
    });
  } else {
    var trans = db2._createTransaction(mode, storeNames, db2._dbSchema);
    try {
      trans.create();
      db2._state.PR1398_maxLoop = 3;
    } catch (ex) {
      if (ex.name === errnames.InvalidState && db2.isOpen() && --db2._state.PR1398_maxLoop > 0) {
        console.warn("Dexie: Need to reopen db");
        db2.close({ disableAutoOpen: false });
        return db2.open().then(function() {
          return tempTransaction(db2, mode, storeNames, fn);
        });
      }
      return rejection(ex);
    }
    return trans._promise(mode, function(resolve, reject) {
      return newScope(function() {
        PSD.trans = trans;
        return fn(resolve, reject, trans);
      });
    }).then(function(result) {
      if (mode === "readwrite")
        try {
          trans.idbtrans.commit();
        } catch (_a2) {
        }
      return mode === "readonly" ? result : trans._completion.then(function() {
        return result;
      });
    });
  }
}
var DEXIE_VERSION = "4.3.0";
var maxString = String.fromCharCode(65535);
var minKey = -Infinity;
var INVALID_KEY_ARGUMENT = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
var STRING_EXPECTED = "String expected.";
var connections = [];
var DBNAMES_DB = "__dbnames";
var READONLY = "readonly";
var READWRITE = "readwrite";
function combine(filter1, filter2) {
  return filter1 ? filter2 ? function() {
    return filter1.apply(this, arguments) && filter2.apply(this, arguments);
  } : filter1 : filter2;
}
var AnyRange = {
  type: 3,
  lower: -Infinity,
  lowerOpen: false,
  upper: [[]],
  upperOpen: false
};
function workaroundForUndefinedPrimKey(keyPath) {
  return typeof keyPath === "string" && !/\./.test(keyPath) ? function(obj) {
    if (obj[keyPath] === void 0 && keyPath in obj) {
      obj = deepClone(obj);
      delete obj[keyPath];
    }
    return obj;
  } : function(obj) {
    return obj;
  };
}
function Entity() {
  throw exceptions.Type("Entity instances must never be new:ed. Instances are generated by the framework bypassing the constructor.");
}
function cmp(a, b) {
  try {
    var ta = type(a);
    var tb = type(b);
    if (ta !== tb) {
      if (ta === "Array")
        return 1;
      if (tb === "Array")
        return -1;
      if (ta === "binary")
        return 1;
      if (tb === "binary")
        return -1;
      if (ta === "string")
        return 1;
      if (tb === "string")
        return -1;
      if (ta === "Date")
        return 1;
      if (tb !== "Date")
        return NaN;
      return -1;
    }
    switch (ta) {
      case "number":
      case "Date":
      case "string":
        return a > b ? 1 : a < b ? -1 : 0;
      case "binary": {
        return compareUint8Arrays(getUint8Array(a), getUint8Array(b));
      }
      case "Array":
        return compareArrays(a, b);
    }
  } catch (_a2) {
  }
  return NaN;
}
function compareArrays(a, b) {
  var al = a.length;
  var bl = b.length;
  var l = al < bl ? al : bl;
  for (var i = 0; i < l; ++i) {
    var res = cmp(a[i], b[i]);
    if (res !== 0)
      return res;
  }
  return al === bl ? 0 : al < bl ? -1 : 1;
}
function compareUint8Arrays(a, b) {
  var al = a.length;
  var bl = b.length;
  var l = al < bl ? al : bl;
  for (var i = 0; i < l; ++i) {
    if (a[i] !== b[i])
      return a[i] < b[i] ? -1 : 1;
  }
  return al === bl ? 0 : al < bl ? -1 : 1;
}
function type(x) {
  var t = typeof x;
  if (t !== "object")
    return t;
  if (ArrayBuffer.isView(x))
    return "binary";
  var tsTag = toStringTag(x);
  return tsTag === "ArrayBuffer" ? "binary" : tsTag;
}
function getUint8Array(a) {
  if (a instanceof Uint8Array)
    return a;
  if (ArrayBuffer.isView(a))
    return new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
  return new Uint8Array(a);
}
function builtInDeletionTrigger(table, keys2, res) {
  var yProps = table.schema.yProps;
  if (!yProps)
    return res;
  if (keys2 && res.numFailures > 0)
    keys2 = keys2.filter(function(_, i) {
      return !res.failures[i];
    });
  return Promise.all(yProps.map(function(_a2) {
    var updatesTable = _a2.updatesTable;
    return keys2 ? table.db.table(updatesTable).where("k").anyOf(keys2).delete() : table.db.table(updatesTable).clear();
  })).then(function() {
    return res;
  });
}
var PropModification = (function() {
  function PropModification2(spec) {
    this["@@propmod"] = spec;
  }
  PropModification2.prototype.execute = function(value) {
    var _a2;
    var spec = this["@@propmod"];
    if (spec.add !== void 0) {
      var term = spec.add;
      if (isArray(term)) {
        return __spreadArray(__spreadArray([], isArray(value) ? value : [], true), term, true).sort();
      }
      if (typeof term === "number")
        return (Number(value) || 0) + term;
      if (typeof term === "bigint") {
        try {
          return BigInt(value) + term;
        } catch (_b) {
          return BigInt(0) + term;
        }
      }
      throw new TypeError("Invalid term ".concat(term));
    }
    if (spec.remove !== void 0) {
      var subtrahend_1 = spec.remove;
      if (isArray(subtrahend_1)) {
        return isArray(value) ? value.filter(function(item) {
          return !subtrahend_1.includes(item);
        }).sort() : [];
      }
      if (typeof subtrahend_1 === "number")
        return Number(value) - subtrahend_1;
      if (typeof subtrahend_1 === "bigint") {
        try {
          return BigInt(value) - subtrahend_1;
        } catch (_c) {
          return BigInt(0) - subtrahend_1;
        }
      }
      throw new TypeError("Invalid subtrahend ".concat(subtrahend_1));
    }
    var prefixToReplace = (_a2 = spec.replacePrefix) === null || _a2 === void 0 ? void 0 : _a2[0];
    if (prefixToReplace && typeof value === "string" && value.startsWith(prefixToReplace)) {
      return spec.replacePrefix[1] + value.substring(prefixToReplace.length);
    }
    return value;
  };
  return PropModification2;
})();
function applyUpdateSpec(obj, changes) {
  var keyPaths = keys(changes);
  var numKeys = keyPaths.length;
  var anythingModified = false;
  for (var i = 0; i < numKeys; ++i) {
    var keyPath = keyPaths[i];
    var value = changes[keyPath];
    var origValue = getByKeyPath(obj, keyPath);
    if (value instanceof PropModification) {
      setByKeyPath(obj, keyPath, value.execute(origValue));
      anythingModified = true;
    } else if (origValue !== value) {
      setByKeyPath(obj, keyPath, value);
      anythingModified = true;
    }
  }
  return anythingModified;
}
var Table = (function() {
  function Table2() {
  }
  Table2.prototype._trans = function(mode, fn, writeLocked) {
    var trans = this._tx || PSD.trans;
    var tableName = this.name;
    var task2 = debug && typeof console !== "undefined" && console.createTask && console.createTask("Dexie: ".concat(mode === "readonly" ? "read" : "write", " ").concat(this.name));
    function checkTableInTransaction(resolve, reject, trans2) {
      if (!trans2.schema[tableName])
        throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
      return fn(trans2.idbtrans, trans2);
    }
    var wasRootExec = beginMicroTickScope();
    try {
      var p = trans && trans.db._novip === this.db._novip ? trans === PSD.trans ? trans._promise(mode, checkTableInTransaction, writeLocked) : newScope(function() {
        return trans._promise(mode, checkTableInTransaction, writeLocked);
      }, { trans, transless: PSD.transless || PSD }) : tempTransaction(this.db, mode, [this.name], checkTableInTransaction);
      if (task2) {
        p._consoleTask = task2;
        p = p.catch(function(err) {
          console.trace(err);
          return rejection(err);
        });
      }
      return p;
    } finally {
      if (wasRootExec)
        endMicroTickScope();
    }
  };
  Table2.prototype.get = function(keyOrCrit, cb) {
    var _this = this;
    if (keyOrCrit && keyOrCrit.constructor === Object)
      return this.where(keyOrCrit).first(cb);
    if (keyOrCrit == null)
      return rejection(new exceptions.Type("Invalid argument to Table.get()"));
    return this._trans("readonly", function(trans) {
      return _this.core.get({ trans, key: keyOrCrit }).then(function(res) {
        return _this.hook.reading.fire(res);
      });
    }).then(cb);
  };
  Table2.prototype.where = function(indexOrCrit) {
    if (typeof indexOrCrit === "string")
      return new this.db.WhereClause(this, indexOrCrit);
    if (isArray(indexOrCrit))
      return new this.db.WhereClause(this, "[".concat(indexOrCrit.join("+"), "]"));
    var keyPaths = keys(indexOrCrit);
    if (keyPaths.length === 1)
      return this.where(keyPaths[0]).equals(indexOrCrit[keyPaths[0]]);
    var compoundIndex = this.schema.indexes.concat(this.schema.primKey).filter(function(ix) {
      if (ix.compound && keyPaths.every(function(keyPath) {
        return ix.keyPath.indexOf(keyPath) >= 0;
      })) {
        for (var i = 0; i < keyPaths.length; ++i) {
          if (keyPaths.indexOf(ix.keyPath[i]) === -1)
            return false;
        }
        return true;
      }
      return false;
    }).sort(function(a, b) {
      return a.keyPath.length - b.keyPath.length;
    })[0];
    if (compoundIndex && this.db._maxKey !== maxString) {
      var keyPathsInValidOrder = compoundIndex.keyPath.slice(0, keyPaths.length);
      return this.where(keyPathsInValidOrder).equals(keyPathsInValidOrder.map(function(kp) {
        return indexOrCrit[kp];
      }));
    }
    if (!compoundIndex && debug)
      console.warn("The query ".concat(JSON.stringify(indexOrCrit), " on ").concat(this.name, " would benefit from a ") + "compound index [".concat(keyPaths.join("+"), "]"));
    var idxByName = this.schema.idxByName;
    function equals(a, b) {
      return cmp(a, b) === 0;
    }
    var _a2 = keyPaths.reduce(function(_a3, keyPath) {
      var prevIndex = _a3[0], prevFilterFn = _a3[1];
      var index = idxByName[keyPath];
      var value = indexOrCrit[keyPath];
      return [
        prevIndex || index,
        prevIndex || !index ? combine(prevFilterFn, index && index.multi ? function(x) {
          var prop = getByKeyPath(x, keyPath);
          return isArray(prop) && prop.some(function(item) {
            return equals(value, item);
          });
        } : function(x) {
          return equals(value, getByKeyPath(x, keyPath));
        }) : prevFilterFn
      ];
    }, [null, null]), idx = _a2[0], filterFunction = _a2[1];
    return idx ? this.where(idx.name).equals(indexOrCrit[idx.keyPath]).filter(filterFunction) : compoundIndex ? this.filter(filterFunction) : this.where(keyPaths).equals("");
  };
  Table2.prototype.filter = function(filterFunction) {
    return this.toCollection().and(filterFunction);
  };
  Table2.prototype.count = function(thenShortcut) {
    return this.toCollection().count(thenShortcut);
  };
  Table2.prototype.offset = function(offset) {
    return this.toCollection().offset(offset);
  };
  Table2.prototype.limit = function(numRows) {
    return this.toCollection().limit(numRows);
  };
  Table2.prototype.each = function(callback) {
    return this.toCollection().each(callback);
  };
  Table2.prototype.toArray = function(thenShortcut) {
    return this.toCollection().toArray(thenShortcut);
  };
  Table2.prototype.toCollection = function() {
    return new this.db.Collection(new this.db.WhereClause(this));
  };
  Table2.prototype.orderBy = function(index) {
    return new this.db.Collection(new this.db.WhereClause(this, isArray(index) ? "[".concat(index.join("+"), "]") : index));
  };
  Table2.prototype.reverse = function() {
    return this.toCollection().reverse();
  };
  Table2.prototype.mapToClass = function(constructor) {
    var _a2 = this, db2 = _a2.db, tableName = _a2.name;
    this.schema.mappedClass = constructor;
    if (constructor.prototype instanceof Entity) {
      constructor = (function(_super) {
        __extends(class_1, _super);
        function class_1() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(class_1.prototype, "db", {
          get: function() {
            return db2;
          },
          enumerable: false,
          configurable: true
        });
        class_1.prototype.table = function() {
          return tableName;
        };
        return class_1;
      })(constructor);
    }
    var inheritedProps = /* @__PURE__ */ new Set();
    for (var proto = constructor.prototype; proto; proto = getProto(proto)) {
      Object.getOwnPropertyNames(proto).forEach(function(propName) {
        return inheritedProps.add(propName);
      });
    }
    var readHook = function(obj) {
      if (!obj)
        return obj;
      var res = Object.create(constructor.prototype);
      for (var m in obj)
        if (!inheritedProps.has(m))
          try {
            res[m] = obj[m];
          } catch (_) {
          }
      return res;
    };
    if (this.schema.readHook) {
      this.hook.reading.unsubscribe(this.schema.readHook);
    }
    this.schema.readHook = readHook;
    this.hook("reading", readHook);
    return constructor;
  };
  Table2.prototype.defineClass = function() {
    function Class(content) {
      extend(this, content);
    }
    return this.mapToClass(Class);
  };
  Table2.prototype.add = function(obj, key) {
    var _this = this;
    var _a2 = this.schema.primKey, auto = _a2.auto, keyPath = _a2.keyPath;
    var objToAdd = obj;
    if (keyPath && auto) {
      objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
    }
    return this._trans("readwrite", function(trans) {
      return _this.core.mutate({ trans, type: "add", keys: key != null ? [key] : null, values: [objToAdd] });
    }).then(function(res) {
      return res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult;
    }).then(function(lastResult) {
      if (keyPath) {
        try {
          setByKeyPath(obj, keyPath, lastResult);
        } catch (_) {
        }
      }
      return lastResult;
    });
  };
  Table2.prototype.upsert = function(key, modifications) {
    var _this = this;
    var keyPath = this.schema.primKey.keyPath;
    return this._trans("readwrite", function(trans) {
      return _this.core.get({ trans, key }).then(function(existing) {
        var obj = existing !== null && existing !== void 0 ? existing : {};
        applyUpdateSpec(obj, modifications);
        if (keyPath)
          setByKeyPath(obj, keyPath, key);
        return _this.core.mutate({
          trans,
          type: "put",
          values: [obj],
          keys: [key],
          upsert: true,
          updates: { keys: [key], changeSpecs: [modifications] }
        }).then(function(res) {
          return res.numFailures ? DexiePromise.reject(res.failures[0]) : !!existing;
        });
      });
    });
  };
  Table2.prototype.update = function(keyOrObject, modifications) {
    if (typeof keyOrObject === "object" && !isArray(keyOrObject)) {
      var key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
      if (key === void 0)
        return rejection(new exceptions.InvalidArgument("Given object does not contain its primary key"));
      return this.where(":id").equals(key).modify(modifications);
    } else {
      return this.where(":id").equals(keyOrObject).modify(modifications);
    }
  };
  Table2.prototype.put = function(obj, key) {
    var _this = this;
    var _a2 = this.schema.primKey, auto = _a2.auto, keyPath = _a2.keyPath;
    var objToAdd = obj;
    if (keyPath && auto) {
      objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
    }
    return this._trans("readwrite", function(trans) {
      return _this.core.mutate({ trans, type: "put", values: [objToAdd], keys: key != null ? [key] : null });
    }).then(function(res) {
      return res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult;
    }).then(function(lastResult) {
      if (keyPath) {
        try {
          setByKeyPath(obj, keyPath, lastResult);
        } catch (_) {
        }
      }
      return lastResult;
    });
  };
  Table2.prototype.delete = function(key) {
    var _this = this;
    return this._trans("readwrite", function(trans) {
      return _this.core.mutate({ trans, type: "delete", keys: [key] }).then(function(res) {
        return builtInDeletionTrigger(_this, [key], res);
      }).then(function(res) {
        return res.numFailures ? DexiePromise.reject(res.failures[0]) : void 0;
      });
    });
  };
  Table2.prototype.clear = function() {
    var _this = this;
    return this._trans("readwrite", function(trans) {
      return _this.core.mutate({ trans, type: "deleteRange", range: AnyRange }).then(function(res) {
        return builtInDeletionTrigger(_this, null, res);
      });
    }).then(function(res) {
      return res.numFailures ? DexiePromise.reject(res.failures[0]) : void 0;
    });
  };
  Table2.prototype.bulkGet = function(keys2) {
    var _this = this;
    return this._trans("readonly", function(trans) {
      return _this.core.getMany({
        keys: keys2,
        trans
      }).then(function(result) {
        return result.map(function(res) {
          return _this.hook.reading.fire(res);
        });
      });
    });
  };
  Table2.prototype.bulkAdd = function(objects, keysOrOptions, options) {
    var _this = this;
    var keys2 = Array.isArray(keysOrOptions) ? keysOrOptions : void 0;
    options = options || (keys2 ? void 0 : keysOrOptions);
    var wantResults = options ? options.allKeys : void 0;
    return this._trans("readwrite", function(trans) {
      var _a2 = _this.schema.primKey, auto = _a2.auto, keyPath = _a2.keyPath;
      if (keyPath && keys2)
        throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
      if (keys2 && keys2.length !== objects.length)
        throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
      var numObjects = objects.length;
      var objectsToAdd = keyPath && auto ? objects.map(workaroundForUndefinedPrimKey(keyPath)) : objects;
      return _this.core.mutate({ trans, type: "add", keys: keys2, values: objectsToAdd, wantResults }).then(function(_a3) {
        var numFailures = _a3.numFailures, results = _a3.results, lastResult = _a3.lastResult, failures = _a3.failures;
        var result = wantResults ? results : lastResult;
        if (numFailures === 0)
          return result;
        throw new BulkError("".concat(_this.name, ".bulkAdd(): ").concat(numFailures, " of ").concat(numObjects, " operations failed"), failures);
      });
    });
  };
  Table2.prototype.bulkPut = function(objects, keysOrOptions, options) {
    var _this = this;
    var keys2 = Array.isArray(keysOrOptions) ? keysOrOptions : void 0;
    options = options || (keys2 ? void 0 : keysOrOptions);
    var wantResults = options ? options.allKeys : void 0;
    return this._trans("readwrite", function(trans) {
      var _a2 = _this.schema.primKey, auto = _a2.auto, keyPath = _a2.keyPath;
      if (keyPath && keys2)
        throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
      if (keys2 && keys2.length !== objects.length)
        throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
      var numObjects = objects.length;
      var objectsToPut = keyPath && auto ? objects.map(workaroundForUndefinedPrimKey(keyPath)) : objects;
      return _this.core.mutate({ trans, type: "put", keys: keys2, values: objectsToPut, wantResults }).then(function(_a3) {
        var numFailures = _a3.numFailures, results = _a3.results, lastResult = _a3.lastResult, failures = _a3.failures;
        var result = wantResults ? results : lastResult;
        if (numFailures === 0)
          return result;
        throw new BulkError("".concat(_this.name, ".bulkPut(): ").concat(numFailures, " of ").concat(numObjects, " operations failed"), failures);
      });
    });
  };
  Table2.prototype.bulkUpdate = function(keysAndChanges) {
    var _this = this;
    var coreTable = this.core;
    var keys2 = keysAndChanges.map(function(entry) {
      return entry.key;
    });
    var changeSpecs = keysAndChanges.map(function(entry) {
      return entry.changes;
    });
    var offsetMap = [];
    return this._trans("readwrite", function(trans) {
      return coreTable.getMany({ trans, keys: keys2, cache: "clone" }).then(function(objs) {
        var resultKeys = [];
        var resultObjs = [];
        keysAndChanges.forEach(function(_a2, idx) {
          var key = _a2.key, changes = _a2.changes;
          var obj = objs[idx];
          if (obj) {
            for (var _i = 0, _b = Object.keys(changes); _i < _b.length; _i++) {
              var keyPath = _b[_i];
              var value = changes[keyPath];
              if (keyPath === _this.schema.primKey.keyPath) {
                if (cmp(value, key) !== 0) {
                  throw new exceptions.Constraint("Cannot update primary key in bulkUpdate()");
                }
              } else {
                setByKeyPath(obj, keyPath, value);
              }
            }
            offsetMap.push(idx);
            resultKeys.push(key);
            resultObjs.push(obj);
          }
        });
        var numEntries = resultKeys.length;
        return coreTable.mutate({
          trans,
          type: "put",
          keys: resultKeys,
          values: resultObjs,
          updates: {
            keys: keys2,
            changeSpecs
          }
        }).then(function(_a2) {
          var numFailures = _a2.numFailures, failures = _a2.failures;
          if (numFailures === 0)
            return numEntries;
          for (var _i = 0, _b = Object.keys(failures); _i < _b.length; _i++) {
            var offset = _b[_i];
            var mappedOffset = offsetMap[Number(offset)];
            if (mappedOffset != null) {
              var failure = failures[offset];
              delete failures[offset];
              failures[mappedOffset] = failure;
            }
          }
          throw new BulkError("".concat(_this.name, ".bulkUpdate(): ").concat(numFailures, " of ").concat(numEntries, " operations failed"), failures);
        });
      });
    });
  };
  Table2.prototype.bulkDelete = function(keys2) {
    var _this = this;
    var numKeys = keys2.length;
    return this._trans("readwrite", function(trans) {
      return _this.core.mutate({ trans, type: "delete", keys: keys2 }).then(function(res) {
        return builtInDeletionTrigger(_this, keys2, res);
      });
    }).then(function(_a2) {
      var numFailures = _a2.numFailures, lastResult = _a2.lastResult, failures = _a2.failures;
      if (numFailures === 0)
        return lastResult;
      throw new BulkError("".concat(_this.name, ".bulkDelete(): ").concat(numFailures, " of ").concat(numKeys, " operations failed"), failures);
    });
  };
  return Table2;
})();
function Events(ctx) {
  var evs = {};
  var rv = function(eventName, subscriber) {
    if (subscriber) {
      var i2 = arguments.length, args = new Array(i2 - 1);
      while (--i2)
        args[i2 - 1] = arguments[i2];
      evs[eventName].subscribe.apply(null, args);
      return ctx;
    } else if (typeof eventName === "string") {
      return evs[eventName];
    }
  };
  rv.addEventType = add;
  for (var i = 1, l = arguments.length; i < l; ++i) {
    add(arguments[i]);
  }
  return rv;
  function add(eventName, chainFunction, defaultFunction) {
    if (typeof eventName === "object")
      return addConfiguredEvents(eventName);
    if (!chainFunction)
      chainFunction = reverseStoppableEventChain;
    if (!defaultFunction)
      defaultFunction = nop;
    var context = {
      subscribers: [],
      fire: defaultFunction,
      subscribe: function(cb) {
        if (context.subscribers.indexOf(cb) === -1) {
          context.subscribers.push(cb);
          context.fire = chainFunction(context.fire, cb);
        }
      },
      unsubscribe: function(cb) {
        context.subscribers = context.subscribers.filter(function(fn) {
          return fn !== cb;
        });
        context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
      }
    };
    evs[eventName] = rv[eventName] = context;
    return context;
  }
  function addConfiguredEvents(cfg) {
    keys(cfg).forEach(function(eventName) {
      var args = cfg[eventName];
      if (isArray(args)) {
        add(eventName, cfg[eventName][0], cfg[eventName][1]);
      } else if (args === "asap") {
        var context = add(eventName, mirror, function fire() {
          var i2 = arguments.length, args2 = new Array(i2);
          while (i2--)
            args2[i2] = arguments[i2];
          context.subscribers.forEach(function(fn) {
            asap$1(function fireEvent() {
              fn.apply(null, args2);
            });
          });
        });
      } else
        throw new exceptions.InvalidArgument("Invalid event config");
    });
  }
}
function makeClassConstructor(prototype, constructor) {
  derive(constructor).from({ prototype });
  return constructor;
}
function createTableConstructor(db2) {
  return makeClassConstructor(Table.prototype, function Table2(name, tableSchema, trans) {
    this.db = db2;
    this._tx = trans;
    this.name = name;
    this.schema = tableSchema;
    this.hook = db2._allTables[name] ? db2._allTables[name].hook : Events(null, {
      "creating": [hookCreatingChain, nop],
      "reading": [pureFunctionChain, mirror],
      "updating": [hookUpdatingChain, nop],
      "deleting": [hookDeletingChain, nop]
    });
  });
}
function isPlainKeyRange(ctx, ignoreLimitFilter) {
  return !(ctx.filter || ctx.algorithm || ctx.or) && (ignoreLimitFilter ? ctx.justLimit : !ctx.replayFilter);
}
function addFilter(ctx, fn) {
  ctx.filter = combine(ctx.filter, fn);
}
function addReplayFilter(ctx, factory, isLimitFilter) {
  var curr = ctx.replayFilter;
  ctx.replayFilter = curr ? function() {
    return combine(curr(), factory());
  } : factory;
  ctx.justLimit = isLimitFilter && !curr;
}
function addMatchFilter(ctx, fn) {
  ctx.isMatch = combine(ctx.isMatch, fn);
}
function getIndexOrStore(ctx, coreSchema) {
  if (ctx.isPrimKey)
    return coreSchema.primaryKey;
  var index = coreSchema.getIndexByKeyPath(ctx.index);
  if (!index)
    throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + coreSchema.name + " is not indexed");
  return index;
}
function openCursor(ctx, coreTable, trans) {
  var index = getIndexOrStore(ctx, coreTable.schema);
  return coreTable.openCursor({
    trans,
    values: !ctx.keysOnly,
    reverse: ctx.dir === "prev",
    unique: !!ctx.unique,
    query: {
      index,
      range: ctx.range
    }
  });
}
function iter(ctx, fn, coreTrans, coreTable) {
  var filter = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;
  if (!ctx.or) {
    return iterate(openCursor(ctx, coreTable, coreTrans), combine(ctx.algorithm, filter), fn, !ctx.keysOnly && ctx.valueMapper);
  } else {
    var set_1 = {};
    var union = function(item, cursor, advance) {
      if (!filter || filter(cursor, advance, function(result) {
        return cursor.stop(result);
      }, function(err) {
        return cursor.fail(err);
      })) {
        var primaryKey = cursor.primaryKey;
        var key = "" + primaryKey;
        if (key === "[object ArrayBuffer]")
          key = "" + new Uint8Array(primaryKey);
        if (!hasOwn(set_1, key)) {
          set_1[key] = true;
          fn(item, cursor, advance);
        }
      }
    };
    return Promise.all([
      ctx.or._iterate(union, coreTrans),
      iterate(openCursor(ctx, coreTable, coreTrans), ctx.algorithm, union, !ctx.keysOnly && ctx.valueMapper)
    ]);
  }
}
function iterate(cursorPromise, filter, fn, valueMapper) {
  var mappedFn = valueMapper ? function(x, c, a) {
    return fn(valueMapper(x), c, a);
  } : fn;
  var wrappedFn = wrap(mappedFn);
  return cursorPromise.then(function(cursor) {
    if (cursor) {
      return cursor.start(function() {
        var c = function() {
          return cursor.continue();
        };
        if (!filter || filter(cursor, function(advancer) {
          return c = advancer;
        }, function(val) {
          cursor.stop(val);
          c = nop;
        }, function(e) {
          cursor.fail(e);
          c = nop;
        }))
          wrappedFn(cursor.value, cursor, function(advancer) {
            return c = advancer;
          });
        c();
      });
    }
  });
}
var Collection = (function() {
  function Collection2() {
  }
  Collection2.prototype._read = function(fn, cb) {
    var ctx = this._ctx;
    return ctx.error ? ctx.table._trans(null, rejection.bind(null, ctx.error)) : ctx.table._trans("readonly", fn).then(cb);
  };
  Collection2.prototype._write = function(fn) {
    var ctx = this._ctx;
    return ctx.error ? ctx.table._trans(null, rejection.bind(null, ctx.error)) : ctx.table._trans("readwrite", fn, "locked");
  };
  Collection2.prototype._addAlgorithm = function(fn) {
    var ctx = this._ctx;
    ctx.algorithm = combine(ctx.algorithm, fn);
  };
  Collection2.prototype._iterate = function(fn, coreTrans) {
    return iter(this._ctx, fn, coreTrans, this._ctx.table.core);
  };
  Collection2.prototype.clone = function(props2) {
    var rv = Object.create(this.constructor.prototype), ctx = Object.create(this._ctx);
    if (props2)
      extend(ctx, props2);
    rv._ctx = ctx;
    return rv;
  };
  Collection2.prototype.raw = function() {
    this._ctx.valueMapper = null;
    return this;
  };
  Collection2.prototype.each = function(fn) {
    var ctx = this._ctx;
    return this._read(function(trans) {
      return iter(ctx, fn, trans, ctx.table.core);
    });
  };
  Collection2.prototype.count = function(cb) {
    var _this = this;
    return this._read(function(trans) {
      var ctx = _this._ctx;
      var coreTable = ctx.table.core;
      if (isPlainKeyRange(ctx, true)) {
        return coreTable.count({
          trans,
          query: {
            index: getIndexOrStore(ctx, coreTable.schema),
            range: ctx.range
          }
        }).then(function(count2) {
          return Math.min(count2, ctx.limit);
        });
      } else {
        var count = 0;
        return iter(ctx, function() {
          ++count;
          return false;
        }, trans, coreTable).then(function() {
          return count;
        });
      }
    }).then(cb);
  };
  Collection2.prototype.sortBy = function(keyPath, cb) {
    var parts = keyPath.split(".").reverse(), lastPart = parts[0], lastIndex = parts.length - 1;
    function getval(obj, i) {
      if (i)
        return getval(obj[parts[i]], i - 1);
      return obj[lastPart];
    }
    var order = this._ctx.dir === "next" ? 1 : -1;
    function sorter(a, b) {
      var aVal = getval(a, lastIndex), bVal = getval(b, lastIndex);
      return cmp(aVal, bVal) * order;
    }
    return this.toArray(function(a) {
      return a.sort(sorter);
    }).then(cb);
  };
  Collection2.prototype.toArray = function(cb) {
    var _this = this;
    return this._read(function(trans) {
      var ctx = _this._ctx;
      if (ctx.dir === "next" && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
        var valueMapper_1 = ctx.valueMapper;
        var index = getIndexOrStore(ctx, ctx.table.core.schema);
        return ctx.table.core.query({
          trans,
          limit: ctx.limit,
          values: true,
          query: {
            index,
            range: ctx.range
          }
        }).then(function(_a2) {
          var result = _a2.result;
          return valueMapper_1 ? result.map(valueMapper_1) : result;
        });
      } else {
        var a_1 = [];
        return iter(ctx, function(item) {
          return a_1.push(item);
        }, trans, ctx.table.core).then(function() {
          return a_1;
        });
      }
    }, cb);
  };
  Collection2.prototype.offset = function(offset) {
    var ctx = this._ctx;
    if (offset <= 0)
      return this;
    ctx.offset += offset;
    if (isPlainKeyRange(ctx)) {
      addReplayFilter(ctx, function() {
        var offsetLeft = offset;
        return function(cursor, advance) {
          if (offsetLeft === 0)
            return true;
          if (offsetLeft === 1) {
            --offsetLeft;
            return false;
          }
          advance(function() {
            cursor.advance(offsetLeft);
            offsetLeft = 0;
          });
          return false;
        };
      });
    } else {
      addReplayFilter(ctx, function() {
        var offsetLeft = offset;
        return function() {
          return --offsetLeft < 0;
        };
      });
    }
    return this;
  };
  Collection2.prototype.limit = function(numRows) {
    this._ctx.limit = Math.min(this._ctx.limit, numRows);
    addReplayFilter(this._ctx, function() {
      var rowsLeft = numRows;
      return function(cursor, advance, resolve) {
        if (--rowsLeft <= 0)
          advance(resolve);
        return rowsLeft >= 0;
      };
    }, true);
    return this;
  };
  Collection2.prototype.until = function(filterFunction, bIncludeStopEntry) {
    addFilter(this._ctx, function(cursor, advance, resolve) {
      if (filterFunction(cursor.value)) {
        advance(resolve);
        return bIncludeStopEntry;
      } else {
        return true;
      }
    });
    return this;
  };
  Collection2.prototype.first = function(cb) {
    return this.limit(1).toArray(function(a) {
      return a[0];
    }).then(cb);
  };
  Collection2.prototype.last = function(cb) {
    return this.reverse().first(cb);
  };
  Collection2.prototype.filter = function(filterFunction) {
    addFilter(this._ctx, function(cursor) {
      return filterFunction(cursor.value);
    });
    addMatchFilter(this._ctx, filterFunction);
    return this;
  };
  Collection2.prototype.and = function(filter) {
    return this.filter(filter);
  };
  Collection2.prototype.or = function(indexName) {
    return new this.db.WhereClause(this._ctx.table, indexName, this);
  };
  Collection2.prototype.reverse = function() {
    this._ctx.dir = this._ctx.dir === "prev" ? "next" : "prev";
    if (this._ondirectionchange)
      this._ondirectionchange(this._ctx.dir);
    return this;
  };
  Collection2.prototype.desc = function() {
    return this.reverse();
  };
  Collection2.prototype.eachKey = function(cb) {
    var ctx = this._ctx;
    ctx.keysOnly = !ctx.isMatch;
    return this.each(function(val, cursor) {
      cb(cursor.key, cursor);
    });
  };
  Collection2.prototype.eachUniqueKey = function(cb) {
    this._ctx.unique = "unique";
    return this.eachKey(cb);
  };
  Collection2.prototype.eachPrimaryKey = function(cb) {
    var ctx = this._ctx;
    ctx.keysOnly = !ctx.isMatch;
    return this.each(function(val, cursor) {
      cb(cursor.primaryKey, cursor);
    });
  };
  Collection2.prototype.keys = function(cb) {
    var ctx = this._ctx;
    ctx.keysOnly = !ctx.isMatch;
    var a = [];
    return this.each(function(item, cursor) {
      a.push(cursor.key);
    }).then(function() {
      return a;
    }).then(cb);
  };
  Collection2.prototype.primaryKeys = function(cb) {
    var ctx = this._ctx;
    if (ctx.dir === "next" && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
      return this._read(function(trans) {
        var index = getIndexOrStore(ctx, ctx.table.core.schema);
        return ctx.table.core.query({
          trans,
          values: false,
          limit: ctx.limit,
          query: {
            index,
            range: ctx.range
          }
        });
      }).then(function(_a2) {
        var result = _a2.result;
        return result;
      }).then(cb);
    }
    ctx.keysOnly = !ctx.isMatch;
    var a = [];
    return this.each(function(item, cursor) {
      a.push(cursor.primaryKey);
    }).then(function() {
      return a;
    }).then(cb);
  };
  Collection2.prototype.uniqueKeys = function(cb) {
    this._ctx.unique = "unique";
    return this.keys(cb);
  };
  Collection2.prototype.firstKey = function(cb) {
    return this.limit(1).keys(function(a) {
      return a[0];
    }).then(cb);
  };
  Collection2.prototype.lastKey = function(cb) {
    return this.reverse().firstKey(cb);
  };
  Collection2.prototype.distinct = function() {
    var ctx = this._ctx, idx = ctx.index && ctx.table.schema.idxByName[ctx.index];
    if (!idx || !idx.multi)
      return this;
    var set = {};
    addFilter(this._ctx, function(cursor) {
      var strKey = cursor.primaryKey.toString();
      var found = hasOwn(set, strKey);
      set[strKey] = true;
      return !found;
    });
    return this;
  };
  Collection2.prototype.modify = function(changes) {
    var _this = this;
    var ctx = this._ctx;
    return this._write(function(trans) {
      var modifyer;
      if (typeof changes === "function") {
        modifyer = changes;
      } else {
        modifyer = function(item) {
          return applyUpdateSpec(item, changes);
        };
      }
      var coreTable = ctx.table.core;
      var _a2 = coreTable.schema.primaryKey, outbound = _a2.outbound, extractKey = _a2.extractKey;
      var limit = 200;
      var modifyChunkSize = _this.db._options.modifyChunkSize;
      if (modifyChunkSize) {
        if (typeof modifyChunkSize == "object") {
          limit = modifyChunkSize[coreTable.name] || modifyChunkSize["*"] || 200;
        } else {
          limit = modifyChunkSize;
        }
      }
      var totalFailures = [];
      var successCount = 0;
      var failedKeys = [];
      var applyMutateResult = function(expectedCount, res) {
        var failures = res.failures, numFailures = res.numFailures;
        successCount += expectedCount - numFailures;
        for (var _i = 0, _a3 = keys(failures); _i < _a3.length; _i++) {
          var pos = _a3[_i];
          totalFailures.push(failures[pos]);
        }
      };
      var isUnconditionalDelete = changes === deleteCallback;
      return _this.clone().primaryKeys().then(function(keys2) {
        var criteria = isPlainKeyRange(ctx) && ctx.limit === Infinity && (typeof changes !== "function" || isUnconditionalDelete) && {
          index: ctx.index,
          range: ctx.range
        };
        var nextChunk = function(offset) {
          var count = Math.min(limit, keys2.length - offset);
          var keysInChunk = keys2.slice(offset, offset + count);
          return (isUnconditionalDelete ? Promise.resolve([]) : coreTable.getMany({
            trans,
            keys: keysInChunk,
            cache: "immutable"
          })).then(function(values) {
            var addValues = [];
            var putValues = [];
            var putKeys = outbound ? [] : null;
            var deleteKeys = isUnconditionalDelete ? keysInChunk : [];
            if (!isUnconditionalDelete)
              for (var i = 0; i < count; ++i) {
                var origValue = values[i];
                var ctx_1 = {
                  value: deepClone(origValue),
                  primKey: keys2[offset + i]
                };
                if (modifyer.call(ctx_1, ctx_1.value, ctx_1) !== false) {
                  if (ctx_1.value == null) {
                    deleteKeys.push(keys2[offset + i]);
                  } else if (!outbound && cmp(extractKey(origValue), extractKey(ctx_1.value)) !== 0) {
                    deleteKeys.push(keys2[offset + i]);
                    addValues.push(ctx_1.value);
                  } else {
                    putValues.push(ctx_1.value);
                    if (outbound)
                      putKeys.push(keys2[offset + i]);
                  }
                }
              }
            return Promise.resolve(addValues.length > 0 && coreTable.mutate({ trans, type: "add", values: addValues }).then(function(res) {
              for (var pos in res.failures) {
                deleteKeys.splice(parseInt(pos), 1);
              }
              applyMutateResult(addValues.length, res);
            })).then(function() {
              return (putValues.length > 0 || criteria && typeof changes === "object") && coreTable.mutate({
                trans,
                type: "put",
                keys: putKeys,
                values: putValues,
                criteria,
                changeSpec: typeof changes !== "function" && changes,
                isAdditionalChunk: offset > 0
              }).then(function(res) {
                return applyMutateResult(putValues.length, res);
              });
            }).then(function() {
              return (deleteKeys.length > 0 || criteria && isUnconditionalDelete) && coreTable.mutate({
                trans,
                type: "delete",
                keys: deleteKeys,
                criteria,
                isAdditionalChunk: offset > 0
              }).then(function(res) {
                return builtInDeletionTrigger(ctx.table, deleteKeys, res);
              }).then(function(res) {
                return applyMutateResult(deleteKeys.length, res);
              });
            }).then(function() {
              return keys2.length > offset + count && nextChunk(offset + limit);
            });
          });
        };
        return nextChunk(0).then(function() {
          if (totalFailures.length > 0)
            throw new ModifyError("Error modifying one or more objects", totalFailures, successCount, failedKeys);
          return keys2.length;
        });
      });
    });
  };
  Collection2.prototype.delete = function() {
    var ctx = this._ctx, range = ctx.range;
    if (isPlainKeyRange(ctx) && !ctx.table.schema.yProps && (ctx.isPrimKey || range.type === 3)) {
      return this._write(function(trans) {
        var primaryKey = ctx.table.core.schema.primaryKey;
        var coreRange = range;
        return ctx.table.core.count({ trans, query: { index: primaryKey, range: coreRange } }).then(function(count) {
          return ctx.table.core.mutate({ trans, type: "deleteRange", range: coreRange }).then(function(_a2) {
            var failures = _a2.failures, numFailures = _a2.numFailures;
            if (numFailures)
              throw new ModifyError("Could not delete some values", Object.keys(failures).map(function(pos) {
                return failures[pos];
              }), count - numFailures);
            return count - numFailures;
          });
        });
      });
    }
    return this.modify(deleteCallback);
  };
  return Collection2;
})();
var deleteCallback = function(value, ctx) {
  return ctx.value = null;
};
function createCollectionConstructor(db2) {
  return makeClassConstructor(Collection.prototype, function Collection2(whereClause, keyRangeGenerator) {
    this.db = db2;
    var keyRange = AnyRange, error = null;
    if (keyRangeGenerator)
      try {
        keyRange = keyRangeGenerator();
      } catch (ex) {
        error = ex;
      }
    var whereCtx = whereClause._ctx;
    var table = whereCtx.table;
    var readingHook = table.hook.reading.fire;
    this._ctx = {
      table,
      index: whereCtx.index,
      isPrimKey: !whereCtx.index || table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name,
      range: keyRange,
      keysOnly: false,
      dir: "next",
      unique: "",
      algorithm: null,
      filter: null,
      replayFilter: null,
      justLimit: true,
      isMatch: null,
      offset: 0,
      limit: Infinity,
      error,
      or: whereCtx.or,
      valueMapper: readingHook !== mirror ? readingHook : null
    };
  });
}
function simpleCompare(a, b) {
  return a < b ? -1 : a === b ? 0 : 1;
}
function simpleCompareReverse(a, b) {
  return a > b ? -1 : a === b ? 0 : 1;
}
function fail(collectionOrWhereClause, err, T) {
  var collection = collectionOrWhereClause instanceof WhereClause ? new collectionOrWhereClause.Collection(collectionOrWhereClause) : collectionOrWhereClause;
  collection._ctx.error = T ? new T(err) : new TypeError(err);
  return collection;
}
function emptyCollection(whereClause) {
  return new whereClause.Collection(whereClause, function() {
    return rangeEqual("");
  }).limit(0);
}
function upperFactory(dir) {
  return dir === "next" ? function(s) {
    return s.toUpperCase();
  } : function(s) {
    return s.toLowerCase();
  };
}
function lowerFactory(dir) {
  return dir === "next" ? function(s) {
    return s.toLowerCase();
  } : function(s) {
    return s.toUpperCase();
  };
}
function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp2, dir) {
  var length = Math.min(key.length, lowerNeedle.length);
  var llp = -1;
  for (var i = 0; i < length; ++i) {
    var lwrKeyChar = lowerKey[i];
    if (lwrKeyChar !== lowerNeedle[i]) {
      if (cmp2(key[i], upperNeedle[i]) < 0)
        return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
      if (cmp2(key[i], lowerNeedle[i]) < 0)
        return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
      if (llp >= 0)
        return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
      return null;
    }
    if (cmp2(key[i], lwrKeyChar) < 0)
      llp = i;
  }
  if (length < lowerNeedle.length && dir === "next")
    return key + upperNeedle.substr(key.length);
  if (length < key.length && dir === "prev")
    return key.substr(0, upperNeedle.length);
  return llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1);
}
function addIgnoreCaseAlgorithm(whereClause, match, needles, suffix) {
  var upper, lower, compare, upperNeedles, lowerNeedles, direction, nextKeySuffix, needlesLen = needles.length;
  if (!needles.every(function(s) {
    return typeof s === "string";
  })) {
    return fail(whereClause, STRING_EXPECTED);
  }
  function initDirection(dir) {
    upper = upperFactory(dir);
    lower = lowerFactory(dir);
    compare = dir === "next" ? simpleCompare : simpleCompareReverse;
    var needleBounds = needles.map(function(needle) {
      return { lower: lower(needle), upper: upper(needle) };
    }).sort(function(a, b) {
      return compare(a.lower, b.lower);
    });
    upperNeedles = needleBounds.map(function(nb) {
      return nb.upper;
    });
    lowerNeedles = needleBounds.map(function(nb) {
      return nb.lower;
    });
    direction = dir;
    nextKeySuffix = dir === "next" ? "" : suffix;
  }
  initDirection("next");
  var c = new whereClause.Collection(whereClause, function() {
    return createRange(upperNeedles[0], lowerNeedles[needlesLen - 1] + suffix);
  });
  c._ondirectionchange = function(direction2) {
    initDirection(direction2);
  };
  var firstPossibleNeedle = 0;
  c._addAlgorithm(function(cursor, advance, resolve) {
    var key = cursor.key;
    if (typeof key !== "string")
      return false;
    var lowerKey = lower(key);
    if (match(lowerKey, lowerNeedles, firstPossibleNeedle)) {
      return true;
    } else {
      var lowestPossibleCasing = null;
      for (var i = firstPossibleNeedle; i < needlesLen; ++i) {
        var casing = nextCasing(key, lowerKey, upperNeedles[i], lowerNeedles[i], compare, direction);
        if (casing === null && lowestPossibleCasing === null)
          firstPossibleNeedle = i + 1;
        else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
          lowestPossibleCasing = casing;
        }
      }
      if (lowestPossibleCasing !== null) {
        advance(function() {
          cursor.continue(lowestPossibleCasing + nextKeySuffix);
        });
      } else {
        advance(resolve);
      }
      return false;
    }
  });
  return c;
}
function createRange(lower, upper, lowerOpen, upperOpen) {
  return {
    type: 2,
    lower,
    upper,
    lowerOpen,
    upperOpen
  };
}
function rangeEqual(value) {
  return {
    type: 1,
    lower: value,
    upper: value
  };
}
var WhereClause = (function() {
  function WhereClause2() {
  }
  Object.defineProperty(WhereClause2.prototype, "Collection", {
    get: function() {
      return this._ctx.table.db.Collection;
    },
    enumerable: false,
    configurable: true
  });
  WhereClause2.prototype.between = function(lower, upper, includeLower, includeUpper) {
    includeLower = includeLower !== false;
    includeUpper = includeUpper === true;
    try {
      if (this._cmp(lower, upper) > 0 || this._cmp(lower, upper) === 0 && (includeLower || includeUpper) && !(includeLower && includeUpper))
        return emptyCollection(this);
      return new this.Collection(this, function() {
        return createRange(lower, upper, !includeLower, !includeUpper);
      });
    } catch (e) {
      return fail(this, INVALID_KEY_ARGUMENT);
    }
  };
  WhereClause2.prototype.equals = function(value) {
    if (value == null)
      return fail(this, INVALID_KEY_ARGUMENT);
    return new this.Collection(this, function() {
      return rangeEqual(value);
    });
  };
  WhereClause2.prototype.above = function(value) {
    if (value == null)
      return fail(this, INVALID_KEY_ARGUMENT);
    return new this.Collection(this, function() {
      return createRange(value, void 0, true);
    });
  };
  WhereClause2.prototype.aboveOrEqual = function(value) {
    if (value == null)
      return fail(this, INVALID_KEY_ARGUMENT);
    return new this.Collection(this, function() {
      return createRange(value, void 0, false);
    });
  };
  WhereClause2.prototype.below = function(value) {
    if (value == null)
      return fail(this, INVALID_KEY_ARGUMENT);
    return new this.Collection(this, function() {
      return createRange(void 0, value, false, true);
    });
  };
  WhereClause2.prototype.belowOrEqual = function(value) {
    if (value == null)
      return fail(this, INVALID_KEY_ARGUMENT);
    return new this.Collection(this, function() {
      return createRange(void 0, value);
    });
  };
  WhereClause2.prototype.startsWith = function(str) {
    if (typeof str !== "string")
      return fail(this, STRING_EXPECTED);
    return this.between(str, str + maxString, true, true);
  };
  WhereClause2.prototype.startsWithIgnoreCase = function(str) {
    if (str === "")
      return this.startsWith(str);
    return addIgnoreCaseAlgorithm(this, function(x, a) {
      return x.indexOf(a[0]) === 0;
    }, [str], maxString);
  };
  WhereClause2.prototype.equalsIgnoreCase = function(str) {
    return addIgnoreCaseAlgorithm(this, function(x, a) {
      return x === a[0];
    }, [str], "");
  };
  WhereClause2.prototype.anyOfIgnoreCase = function() {
    var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
    if (set.length === 0)
      return emptyCollection(this);
    return addIgnoreCaseAlgorithm(this, function(x, a) {
      return a.indexOf(x) !== -1;
    }, set, "");
  };
  WhereClause2.prototype.startsWithAnyOfIgnoreCase = function() {
    var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
    if (set.length === 0)
      return emptyCollection(this);
    return addIgnoreCaseAlgorithm(this, function(x, a) {
      return a.some(function(n) {
        return x.indexOf(n) === 0;
      });
    }, set, maxString);
  };
  WhereClause2.prototype.anyOf = function() {
    var _this = this;
    var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
    var compare = this._cmp;
    try {
      set.sort(compare);
    } catch (e) {
      return fail(this, INVALID_KEY_ARGUMENT);
    }
    if (set.length === 0)
      return emptyCollection(this);
    var c = new this.Collection(this, function() {
      return createRange(set[0], set[set.length - 1]);
    });
    c._ondirectionchange = function(direction) {
      compare = direction === "next" ? _this._ascending : _this._descending;
      set.sort(compare);
    };
    var i = 0;
    c._addAlgorithm(function(cursor, advance, resolve) {
      var key = cursor.key;
      while (compare(key, set[i]) > 0) {
        ++i;
        if (i === set.length) {
          advance(resolve);
          return false;
        }
      }
      if (compare(key, set[i]) === 0) {
        return true;
      } else {
        advance(function() {
          cursor.continue(set[i]);
        });
        return false;
      }
    });
    return c;
  };
  WhereClause2.prototype.notEqual = function(value) {
    return this.inAnyRange([[minKey, value], [value, this.db._maxKey]], { includeLowers: false, includeUppers: false });
  };
  WhereClause2.prototype.noneOf = function() {
    var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
    if (set.length === 0)
      return new this.Collection(this);
    try {
      set.sort(this._ascending);
    } catch (e) {
      return fail(this, INVALID_KEY_ARGUMENT);
    }
    var ranges = set.reduce(function(res, val) {
      return res ? res.concat([[res[res.length - 1][1], val]]) : [[minKey, val]];
    }, null);
    ranges.push([set[set.length - 1], this.db._maxKey]);
    return this.inAnyRange(ranges, { includeLowers: false, includeUppers: false });
  };
  WhereClause2.prototype.inAnyRange = function(ranges, options) {
    var _this = this;
    var cmp2 = this._cmp, ascending = this._ascending, descending = this._descending, min = this._min, max = this._max;
    if (ranges.length === 0)
      return emptyCollection(this);
    if (!ranges.every(function(range) {
      return range[0] !== void 0 && range[1] !== void 0 && ascending(range[0], range[1]) <= 0;
    })) {
      return fail(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", exceptions.InvalidArgument);
    }
    var includeLowers = !options || options.includeLowers !== false;
    var includeUppers = options && options.includeUppers === true;
    function addRange2(ranges2, newRange) {
      var i = 0, l = ranges2.length;
      for (; i < l; ++i) {
        var range = ranges2[i];
        if (cmp2(newRange[0], range[1]) < 0 && cmp2(newRange[1], range[0]) > 0) {
          range[0] = min(range[0], newRange[0]);
          range[1] = max(range[1], newRange[1]);
          break;
        }
      }
      if (i === l)
        ranges2.push(newRange);
      return ranges2;
    }
    var sortDirection = ascending;
    function rangeSorter(a, b) {
      return sortDirection(a[0], b[0]);
    }
    var set;
    try {
      set = ranges.reduce(addRange2, []);
      set.sort(rangeSorter);
    } catch (ex) {
      return fail(this, INVALID_KEY_ARGUMENT);
    }
    var rangePos = 0;
    var keyIsBeyondCurrentEntry = includeUppers ? function(key) {
      return ascending(key, set[rangePos][1]) > 0;
    } : function(key) {
      return ascending(key, set[rangePos][1]) >= 0;
    };
    var keyIsBeforeCurrentEntry = includeLowers ? function(key) {
      return descending(key, set[rangePos][0]) > 0;
    } : function(key) {
      return descending(key, set[rangePos][0]) >= 0;
    };
    function keyWithinCurrentRange(key) {
      return !keyIsBeyondCurrentEntry(key) && !keyIsBeforeCurrentEntry(key);
    }
    var checkKey = keyIsBeyondCurrentEntry;
    var c = new this.Collection(this, function() {
      return createRange(set[0][0], set[set.length - 1][1], !includeLowers, !includeUppers);
    });
    c._ondirectionchange = function(direction) {
      if (direction === "next") {
        checkKey = keyIsBeyondCurrentEntry;
        sortDirection = ascending;
      } else {
        checkKey = keyIsBeforeCurrentEntry;
        sortDirection = descending;
      }
      set.sort(rangeSorter);
    };
    c._addAlgorithm(function(cursor, advance, resolve) {
      var key = cursor.key;
      while (checkKey(key)) {
        ++rangePos;
        if (rangePos === set.length) {
          advance(resolve);
          return false;
        }
      }
      if (keyWithinCurrentRange(key)) {
        return true;
      } else if (_this._cmp(key, set[rangePos][1]) === 0 || _this._cmp(key, set[rangePos][0]) === 0) {
        return false;
      } else {
        advance(function() {
          if (sortDirection === ascending)
            cursor.continue(set[rangePos][0]);
          else
            cursor.continue(set[rangePos][1]);
        });
        return false;
      }
    });
    return c;
  };
  WhereClause2.prototype.startsWithAnyOf = function() {
    var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
    if (!set.every(function(s) {
      return typeof s === "string";
    })) {
      return fail(this, "startsWithAnyOf() only works with strings");
    }
    if (set.length === 0)
      return emptyCollection(this);
    return this.inAnyRange(set.map(function(str) {
      return [str, str + maxString];
    }));
  };
  return WhereClause2;
})();
function createWhereClauseConstructor(db2) {
  return makeClassConstructor(WhereClause.prototype, function WhereClause2(table, index, orCollection) {
    this.db = db2;
    this._ctx = {
      table,
      index: index === ":id" ? null : index,
      or: orCollection
    };
    this._cmp = this._ascending = cmp;
    this._descending = function(a, b) {
      return cmp(b, a);
    };
    this._max = function(a, b) {
      return cmp(a, b) > 0 ? a : b;
    };
    this._min = function(a, b) {
      return cmp(a, b) < 0 ? a : b;
    };
    this._IDBKeyRange = db2._deps.IDBKeyRange;
    if (!this._IDBKeyRange)
      throw new exceptions.MissingAPI();
  });
}
function eventRejectHandler(reject) {
  return wrap(function(event) {
    preventDefault(event);
    reject(event.target.error);
    return false;
  });
}
function preventDefault(event) {
  if (event.stopPropagation)
    event.stopPropagation();
  if (event.preventDefault)
    event.preventDefault();
}
var DEXIE_STORAGE_MUTATED_EVENT_NAME = "storagemutated";
var STORAGE_MUTATED_DOM_EVENT_NAME = "x-storagemutated-1";
var globalEvents = Events(null, DEXIE_STORAGE_MUTATED_EVENT_NAME);
var Transaction = (function() {
  function Transaction2() {
  }
  Transaction2.prototype._lock = function() {
    assert(!PSD.global);
    ++this._reculock;
    if (this._reculock === 1 && !PSD.global)
      PSD.lockOwnerFor = this;
    return this;
  };
  Transaction2.prototype._unlock = function() {
    assert(!PSD.global);
    if (--this._reculock === 0) {
      if (!PSD.global)
        PSD.lockOwnerFor = null;
      while (this._blockedFuncs.length > 0 && !this._locked()) {
        var fnAndPSD = this._blockedFuncs.shift();
        try {
          usePSD(fnAndPSD[1], fnAndPSD[0]);
        } catch (e) {
        }
      }
    }
    return this;
  };
  Transaction2.prototype._locked = function() {
    return this._reculock && PSD.lockOwnerFor !== this;
  };
  Transaction2.prototype.create = function(idbtrans) {
    var _this = this;
    if (!this.mode)
      return this;
    var idbdb = this.db.idbdb;
    var dbOpenError = this.db._state.dbOpenError;
    assert(!this.idbtrans);
    if (!idbtrans && !idbdb) {
      switch (dbOpenError && dbOpenError.name) {
        case "DatabaseClosedError":
          throw new exceptions.DatabaseClosed(dbOpenError);
        case "MissingAPIError":
          throw new exceptions.MissingAPI(dbOpenError.message, dbOpenError);
        default:
          throw new exceptions.OpenFailed(dbOpenError);
      }
    }
    if (!this.active)
      throw new exceptions.TransactionInactive();
    assert(this._completion._state === null);
    idbtrans = this.idbtrans = idbtrans || (this.db.core ? this.db.core.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }) : idbdb.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }));
    idbtrans.onerror = wrap(function(ev) {
      preventDefault(ev);
      _this._reject(idbtrans.error);
    });
    idbtrans.onabort = wrap(function(ev) {
      preventDefault(ev);
      _this.active && _this._reject(new exceptions.Abort(idbtrans.error));
      _this.active = false;
      _this.on("abort").fire(ev);
    });
    idbtrans.oncomplete = wrap(function() {
      _this.active = false;
      _this._resolve();
      if ("mutatedParts" in idbtrans) {
        globalEvents.storagemutated.fire(idbtrans["mutatedParts"]);
      }
    });
    return this;
  };
  Transaction2.prototype._promise = function(mode, fn, bWriteLock) {
    var _this = this;
    if (mode === "readwrite" && this.mode !== "readwrite")
      return rejection(new exceptions.ReadOnly("Transaction is readonly"));
    if (!this.active)
      return rejection(new exceptions.TransactionInactive());
    if (this._locked()) {
      return new DexiePromise(function(resolve, reject) {
        _this._blockedFuncs.push([function() {
          _this._promise(mode, fn, bWriteLock).then(resolve, reject);
        }, PSD]);
      });
    } else if (bWriteLock) {
      return newScope(function() {
        var p2 = new DexiePromise(function(resolve, reject) {
          _this._lock();
          var rv = fn(resolve, reject, _this);
          if (rv && rv.then)
            rv.then(resolve, reject);
        });
        p2.finally(function() {
          return _this._unlock();
        });
        p2._lib = true;
        return p2;
      });
    } else {
      var p = new DexiePromise(function(resolve, reject) {
        var rv = fn(resolve, reject, _this);
        if (rv && rv.then)
          rv.then(resolve, reject);
      });
      p._lib = true;
      return p;
    }
  };
  Transaction2.prototype._root = function() {
    return this.parent ? this.parent._root() : this;
  };
  Transaction2.prototype.waitFor = function(promiseLike) {
    var root = this._root();
    var promise = DexiePromise.resolve(promiseLike);
    if (root._waitingFor) {
      root._waitingFor = root._waitingFor.then(function() {
        return promise;
      });
    } else {
      root._waitingFor = promise;
      root._waitingQueue = [];
      var store = root.idbtrans.objectStore(root.storeNames[0]);
      (function spin() {
        ++root._spinCount;
        while (root._waitingQueue.length)
          root._waitingQueue.shift()();
        if (root._waitingFor)
          store.get(-Infinity).onsuccess = spin;
      })();
    }
    var currentWaitPromise = root._waitingFor;
    return new DexiePromise(function(resolve, reject) {
      promise.then(function(res) {
        return root._waitingQueue.push(wrap(resolve.bind(null, res)));
      }, function(err) {
        return root._waitingQueue.push(wrap(reject.bind(null, err)));
      }).finally(function() {
        if (root._waitingFor === currentWaitPromise) {
          root._waitingFor = null;
        }
      });
    });
  };
  Transaction2.prototype.abort = function() {
    if (this.active) {
      this.active = false;
      if (this.idbtrans)
        this.idbtrans.abort();
      this._reject(new exceptions.Abort());
    }
  };
  Transaction2.prototype.table = function(tableName) {
    var memoizedTables = this._memoizedTables || (this._memoizedTables = {});
    if (hasOwn(memoizedTables, tableName))
      return memoizedTables[tableName];
    var tableSchema = this.schema[tableName];
    if (!tableSchema) {
      throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
    }
    var transactionBoundTable = new this.db.Table(tableName, tableSchema, this);
    transactionBoundTable.core = this.db.core.table(tableName);
    memoizedTables[tableName] = transactionBoundTable;
    return transactionBoundTable;
  };
  return Transaction2;
})();
function createTransactionConstructor(db2) {
  return makeClassConstructor(Transaction.prototype, function Transaction2(mode, storeNames, dbschema, chromeTransactionDurability, parent) {
    var _this = this;
    if (mode !== "readonly")
      storeNames.forEach(function(storeName) {
        var _a2;
        var yProps = (_a2 = dbschema[storeName]) === null || _a2 === void 0 ? void 0 : _a2.yProps;
        if (yProps)
          storeNames = storeNames.concat(yProps.map(function(p) {
            return p.updatesTable;
          }));
      });
    this.db = db2;
    this.mode = mode;
    this.storeNames = storeNames;
    this.schema = dbschema;
    this.chromeTransactionDurability = chromeTransactionDurability;
    this.idbtrans = null;
    this.on = Events(this, "complete", "error", "abort");
    this.parent = parent || null;
    this.active = true;
    this._reculock = 0;
    this._blockedFuncs = [];
    this._resolve = null;
    this._reject = null;
    this._waitingFor = null;
    this._waitingQueue = null;
    this._spinCount = 0;
    this._completion = new DexiePromise(function(resolve, reject) {
      _this._resolve = resolve;
      _this._reject = reject;
    });
    this._completion.then(function() {
      _this.active = false;
      _this.on.complete.fire();
    }, function(e) {
      var wasActive = _this.active;
      _this.active = false;
      _this.on.error.fire(e);
      _this.parent ? _this.parent._reject(e) : wasActive && _this.idbtrans && _this.idbtrans.abort();
      return rejection(e);
    });
  });
}
function createIndexSpec(name, keyPath, unique, multi, auto, compound, isPrimKey, type2) {
  return {
    name,
    keyPath,
    unique,
    multi,
    auto,
    compound,
    src: (unique && !isPrimKey ? "&" : "") + (multi ? "*" : "") + (auto ? "++" : "") + nameFromKeyPath(keyPath),
    type: type2
  };
}
function nameFromKeyPath(keyPath) {
  return typeof keyPath === "string" ? keyPath : keyPath ? "[" + [].join.call(keyPath, "+") + "]" : "";
}
function createTableSchema(name, primKey, indexes) {
  return {
    name,
    primKey,
    indexes,
    mappedClass: null,
    idxByName: arrayToObject(indexes, function(index) {
      return [index.name, index];
    })
  };
}
function safariMultiStoreFix(storeNames) {
  return storeNames.length === 1 ? storeNames[0] : storeNames;
}
var getMaxKey = function(IdbKeyRange) {
  try {
    IdbKeyRange.only([[]]);
    getMaxKey = function() {
      return [[]];
    };
    return [[]];
  } catch (e) {
    getMaxKey = function() {
      return maxString;
    };
    return maxString;
  }
};
function getKeyExtractor(keyPath) {
  if (keyPath == null) {
    return function() {
      return void 0;
    };
  } else if (typeof keyPath === "string") {
    return getSinglePathKeyExtractor(keyPath);
  } else {
    return function(obj) {
      return getByKeyPath(obj, keyPath);
    };
  }
}
function getSinglePathKeyExtractor(keyPath) {
  var split = keyPath.split(".");
  if (split.length === 1) {
    return function(obj) {
      return obj[keyPath];
    };
  } else {
    return function(obj) {
      return getByKeyPath(obj, keyPath);
    };
  }
}
function arrayify(arrayLike) {
  return [].slice.call(arrayLike);
}
var _id_counter = 0;
function getKeyPathAlias(keyPath) {
  return keyPath == null ? ":id" : typeof keyPath === "string" ? keyPath : "[".concat(keyPath.join("+"), "]");
}
function createDBCore(db2, IdbKeyRange, tmpTrans) {
  function extractSchema(db3, trans) {
    var tables2 = arrayify(db3.objectStoreNames);
    return {
      schema: {
        name: db3.name,
        tables: tables2.map(function(table) {
          return trans.objectStore(table);
        }).map(function(store) {
          var keyPath = store.keyPath, autoIncrement = store.autoIncrement;
          var compound = isArray(keyPath);
          var outbound = keyPath == null;
          var indexByKeyPath = {};
          var result = {
            name: store.name,
            primaryKey: {
              name: null,
              isPrimaryKey: true,
              outbound,
              compound,
              keyPath,
              autoIncrement,
              unique: true,
              extractKey: getKeyExtractor(keyPath)
            },
            indexes: arrayify(store.indexNames).map(function(indexName) {
              return store.index(indexName);
            }).map(function(index) {
              var name = index.name, unique = index.unique, multiEntry = index.multiEntry, keyPath2 = index.keyPath;
              var compound2 = isArray(keyPath2);
              var result2 = {
                name,
                compound: compound2,
                keyPath: keyPath2,
                unique,
                multiEntry,
                extractKey: getKeyExtractor(keyPath2)
              };
              indexByKeyPath[getKeyPathAlias(keyPath2)] = result2;
              return result2;
            }),
            getIndexByKeyPath: function(keyPath2) {
              return indexByKeyPath[getKeyPathAlias(keyPath2)];
            }
          };
          indexByKeyPath[":id"] = result.primaryKey;
          if (keyPath != null) {
            indexByKeyPath[getKeyPathAlias(keyPath)] = result.primaryKey;
          }
          return result;
        })
      },
      hasGetAll: tables2.length > 0 && "getAll" in trans.objectStore(tables2[0]) && !(typeof navigator !== "undefined" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604)
    };
  }
  function makeIDBKeyRange(range) {
    if (range.type === 3)
      return null;
    if (range.type === 4)
      throw new Error("Cannot convert never type to IDBKeyRange");
    var lower = range.lower, upper = range.upper, lowerOpen = range.lowerOpen, upperOpen = range.upperOpen;
    var idbRange = lower === void 0 ? upper === void 0 ? null : IdbKeyRange.upperBound(upper, !!upperOpen) : upper === void 0 ? IdbKeyRange.lowerBound(lower, !!lowerOpen) : IdbKeyRange.bound(lower, upper, !!lowerOpen, !!upperOpen);
    return idbRange;
  }
  function createDbCoreTable(tableSchema) {
    var tableName = tableSchema.name;
    function mutate(_a3) {
      var trans = _a3.trans, type2 = _a3.type, keys2 = _a3.keys, values = _a3.values, range = _a3.range;
      return new Promise(function(resolve, reject) {
        resolve = wrap(resolve);
        var store = trans.objectStore(tableName);
        var outbound = store.keyPath == null;
        var isAddOrPut = type2 === "put" || type2 === "add";
        if (!isAddOrPut && type2 !== "delete" && type2 !== "deleteRange")
          throw new Error("Invalid operation type: " + type2);
        var length = (keys2 || values || { length: 1 }).length;
        if (keys2 && values && keys2.length !== values.length) {
          throw new Error("Given keys array must have same length as given values array.");
        }
        if (length === 0)
          return resolve({ numFailures: 0, failures: {}, results: [], lastResult: void 0 });
        var req;
        var reqs = [];
        var failures = [];
        var numFailures = 0;
        var errorHandler = function(event) {
          ++numFailures;
          preventDefault(event);
        };
        if (type2 === "deleteRange") {
          if (range.type === 4)
            return resolve({ numFailures, failures, results: [], lastResult: void 0 });
          if (range.type === 3)
            reqs.push(req = store.clear());
          else
            reqs.push(req = store.delete(makeIDBKeyRange(range)));
        } else {
          var _a4 = isAddOrPut ? outbound ? [values, keys2] : [values, null] : [keys2, null], args1 = _a4[0], args2 = _a4[1];
          if (isAddOrPut) {
            for (var i = 0; i < length; ++i) {
              reqs.push(req = args2 && args2[i] !== void 0 ? store[type2](args1[i], args2[i]) : store[type2](args1[i]));
              req.onerror = errorHandler;
            }
          } else {
            for (var i = 0; i < length; ++i) {
              reqs.push(req = store[type2](args1[i]));
              req.onerror = errorHandler;
            }
          }
        }
        var done = function(event) {
          var lastResult = event.target.result;
          reqs.forEach(function(req2, i2) {
            return req2.error != null && (failures[i2] = req2.error);
          });
          resolve({
            numFailures,
            failures,
            results: type2 === "delete" ? keys2 : reqs.map(function(req2) {
              return req2.result;
            }),
            lastResult
          });
        };
        req.onerror = function(event) {
          errorHandler(event);
          done(event);
        };
        req.onsuccess = done;
      });
    }
    function openCursor2(_a3) {
      var trans = _a3.trans, values = _a3.values, query2 = _a3.query, reverse = _a3.reverse, unique = _a3.unique;
      return new Promise(function(resolve, reject) {
        resolve = wrap(resolve);
        var index = query2.index, range = query2.range;
        var store = trans.objectStore(tableName);
        var source = index.isPrimaryKey ? store : store.index(index.name);
        var direction = reverse ? unique ? "prevunique" : "prev" : unique ? "nextunique" : "next";
        var req = values || !("openKeyCursor" in source) ? source.openCursor(makeIDBKeyRange(range), direction) : source.openKeyCursor(makeIDBKeyRange(range), direction);
        req.onerror = eventRejectHandler(reject);
        req.onsuccess = wrap(function(ev) {
          var cursor = req.result;
          if (!cursor) {
            resolve(null);
            return;
          }
          cursor.___id = ++_id_counter;
          cursor.done = false;
          var _cursorContinue = cursor.continue.bind(cursor);
          var _cursorContinuePrimaryKey = cursor.continuePrimaryKey;
          if (_cursorContinuePrimaryKey)
            _cursorContinuePrimaryKey = _cursorContinuePrimaryKey.bind(cursor);
          var _cursorAdvance = cursor.advance.bind(cursor);
          var doThrowCursorIsNotStarted = function() {
            throw new Error("Cursor not started");
          };
          var doThrowCursorIsStopped = function() {
            throw new Error("Cursor not stopped");
          };
          cursor.trans = trans;
          cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsNotStarted;
          cursor.fail = wrap(reject);
          cursor.next = function() {
            var _this = this;
            var gotOne = 1;
            return this.start(function() {
              return gotOne-- ? _this.continue() : _this.stop();
            }).then(function() {
              return _this;
            });
          };
          cursor.start = function(callback) {
            var iterationPromise = new Promise(function(resolveIteration, rejectIteration) {
              resolveIteration = wrap(resolveIteration);
              req.onerror = eventRejectHandler(rejectIteration);
              cursor.fail = rejectIteration;
              cursor.stop = function(value) {
                cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsStopped;
                resolveIteration(value);
              };
            });
            var guardedCallback = function() {
              if (req.result) {
                try {
                  callback();
                } catch (err) {
                  cursor.fail(err);
                }
              } else {
                cursor.done = true;
                cursor.start = function() {
                  throw new Error("Cursor behind last entry");
                };
                cursor.stop();
              }
            };
            req.onsuccess = wrap(function(ev2) {
              req.onsuccess = guardedCallback;
              guardedCallback();
            });
            cursor.continue = _cursorContinue;
            cursor.continuePrimaryKey = _cursorContinuePrimaryKey;
            cursor.advance = _cursorAdvance;
            guardedCallback();
            return iterationPromise;
          };
          resolve(cursor);
        }, reject);
      });
    }
    function query(hasGetAll2) {
      return function(request) {
        return new Promise(function(resolve, reject) {
          resolve = wrap(resolve);
          var trans = request.trans, values = request.values, limit = request.limit, query2 = request.query;
          var nonInfinitLimit = limit === Infinity ? void 0 : limit;
          var index = query2.index, range = query2.range;
          var store = trans.objectStore(tableName);
          var source = index.isPrimaryKey ? store : store.index(index.name);
          var idbKeyRange = makeIDBKeyRange(range);
          if (limit === 0)
            return resolve({ result: [] });
          if (hasGetAll2) {
            var req = values ? source.getAll(idbKeyRange, nonInfinitLimit) : source.getAllKeys(idbKeyRange, nonInfinitLimit);
            req.onsuccess = function(event) {
              return resolve({ result: event.target.result });
            };
            req.onerror = eventRejectHandler(reject);
          } else {
            var count_1 = 0;
            var req_1 = values || !("openKeyCursor" in source) ? source.openCursor(idbKeyRange) : source.openKeyCursor(idbKeyRange);
            var result_1 = [];
            req_1.onsuccess = function(event) {
              var cursor = req_1.result;
              if (!cursor)
                return resolve({ result: result_1 });
              result_1.push(values ? cursor.value : cursor.primaryKey);
              if (++count_1 === limit)
                return resolve({ result: result_1 });
              cursor.continue();
            };
            req_1.onerror = eventRejectHandler(reject);
          }
        });
      };
    }
    return {
      name: tableName,
      schema: tableSchema,
      mutate,
      getMany: function(_a3) {
        var trans = _a3.trans, keys2 = _a3.keys;
        return new Promise(function(resolve, reject) {
          resolve = wrap(resolve);
          var store = trans.objectStore(tableName);
          var length = keys2.length;
          var result = new Array(length);
          var keyCount = 0;
          var callbackCount = 0;
          var req;
          var successHandler = function(event) {
            var req2 = event.target;
            if ((result[req2._pos] = req2.result) != null)
              ;
            if (++callbackCount === keyCount)
              resolve(result);
          };
          var errorHandler = eventRejectHandler(reject);
          for (var i = 0; i < length; ++i) {
            var key = keys2[i];
            if (key != null) {
              req = store.get(keys2[i]);
              req._pos = i;
              req.onsuccess = successHandler;
              req.onerror = errorHandler;
              ++keyCount;
            }
          }
          if (keyCount === 0)
            resolve(result);
        });
      },
      get: function(_a3) {
        var trans = _a3.trans, key = _a3.key;
        return new Promise(function(resolve, reject) {
          resolve = wrap(resolve);
          var store = trans.objectStore(tableName);
          var req = store.get(key);
          req.onsuccess = function(event) {
            return resolve(event.target.result);
          };
          req.onerror = eventRejectHandler(reject);
        });
      },
      query: query(hasGetAll),
      openCursor: openCursor2,
      count: function(_a3) {
        var query2 = _a3.query, trans = _a3.trans;
        var index = query2.index, range = query2.range;
        return new Promise(function(resolve, reject) {
          var store = trans.objectStore(tableName);
          var source = index.isPrimaryKey ? store : store.index(index.name);
          var idbKeyRange = makeIDBKeyRange(range);
          var req = idbKeyRange ? source.count(idbKeyRange) : source.count();
          req.onsuccess = wrap(function(ev) {
            return resolve(ev.target.result);
          });
          req.onerror = eventRejectHandler(reject);
        });
      }
    };
  }
  var _a2 = extractSchema(db2, tmpTrans), schema = _a2.schema, hasGetAll = _a2.hasGetAll;
  var tables = schema.tables.map(function(tableSchema) {
    return createDbCoreTable(tableSchema);
  });
  var tableMap = {};
  tables.forEach(function(table) {
    return tableMap[table.name] = table;
  });
  return {
    stack: "dbcore",
    transaction: db2.transaction.bind(db2),
    table: function(name) {
      var result = tableMap[name];
      if (!result)
        throw new Error("Table '".concat(name, "' not found"));
      return tableMap[name];
    },
    MIN_KEY: -Infinity,
    MAX_KEY: getMaxKey(IdbKeyRange),
    schema
  };
}
function createMiddlewareStack(stackImpl, middlewares) {
  return middlewares.reduce(function(down, _a2) {
    var create = _a2.create;
    return __assign(__assign({}, down), create(down));
  }, stackImpl);
}
function createMiddlewareStacks(middlewares, idbdb, _a2, tmpTrans) {
  var IDBKeyRange = _a2.IDBKeyRange;
  _a2.indexedDB;
  var dbcore = createMiddlewareStack(createDBCore(idbdb, IDBKeyRange, tmpTrans), middlewares.dbcore);
  return {
    dbcore
  };
}
function generateMiddlewareStacks(db2, tmpTrans) {
  var idbdb = tmpTrans.db;
  var stacks = createMiddlewareStacks(db2._middlewares, idbdb, db2._deps, tmpTrans);
  db2.core = stacks.dbcore;
  db2.tables.forEach(function(table) {
    var tableName = table.name;
    if (db2.core.schema.tables.some(function(tbl) {
      return tbl.name === tableName;
    })) {
      table.core = db2.core.table(tableName);
      if (db2[tableName] instanceof db2.Table) {
        db2[tableName].core = table.core;
      }
    }
  });
}
function setApiOnPlace(db2, objs, tableNames, dbschema) {
  tableNames.forEach(function(tableName) {
    var schema = dbschema[tableName];
    objs.forEach(function(obj) {
      var propDesc = getPropertyDescriptor(obj, tableName);
      if (!propDesc || "value" in propDesc && propDesc.value === void 0) {
        if (obj === db2.Transaction.prototype || obj instanceof db2.Transaction) {
          setProp(obj, tableName, {
            get: function() {
              return this.table(tableName);
            },
            set: function(value) {
              defineProperty(this, tableName, { value, writable: true, configurable: true, enumerable: true });
            }
          });
        } else {
          obj[tableName] = new db2.Table(tableName, schema);
        }
      }
    });
  });
}
function removeTablesApi(db2, objs) {
  objs.forEach(function(obj) {
    for (var key in obj) {
      if (obj[key] instanceof db2.Table)
        delete obj[key];
    }
  });
}
function lowerVersionFirst(a, b) {
  return a._cfg.version - b._cfg.version;
}
function runUpgraders(db2, oldVersion, idbUpgradeTrans, reject) {
  var globalSchema = db2._dbSchema;
  if (idbUpgradeTrans.objectStoreNames.contains("$meta") && !globalSchema.$meta) {
    globalSchema.$meta = createTableSchema("$meta", parseIndexSyntax("")[0], []);
    db2._storeNames.push("$meta");
  }
  var trans = db2._createTransaction("readwrite", db2._storeNames, globalSchema);
  trans.create(idbUpgradeTrans);
  trans._completion.catch(reject);
  var rejectTransaction = trans._reject.bind(trans);
  var transless = PSD.transless || PSD;
  newScope(function() {
    PSD.trans = trans;
    PSD.transless = transless;
    if (oldVersion === 0) {
      keys(globalSchema).forEach(function(tableName) {
        createTable(idbUpgradeTrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
      });
      generateMiddlewareStacks(db2, idbUpgradeTrans);
      DexiePromise.follow(function() {
        return db2.on.populate.fire(trans);
      }).catch(rejectTransaction);
    } else {
      generateMiddlewareStacks(db2, idbUpgradeTrans);
      return getExistingVersion(db2, trans, oldVersion).then(function(oldVersion2) {
        return updateTablesAndIndexes(db2, oldVersion2, trans, idbUpgradeTrans);
      }).catch(rejectTransaction);
    }
  });
}
function patchCurrentVersion(db2, idbUpgradeTrans) {
  createMissingTables(db2._dbSchema, idbUpgradeTrans);
  if (idbUpgradeTrans.db.version % 10 === 0 && !idbUpgradeTrans.objectStoreNames.contains("$meta")) {
    idbUpgradeTrans.db.createObjectStore("$meta").add(Math.ceil(idbUpgradeTrans.db.version / 10 - 1), "version");
  }
  var globalSchema = buildGlobalSchema(db2, db2.idbdb, idbUpgradeTrans);
  adjustToExistingIndexNames(db2, db2._dbSchema, idbUpgradeTrans);
  var diff = getSchemaDiff(globalSchema, db2._dbSchema);
  var _loop_1 = function(tableChange2) {
    if (tableChange2.change.length || tableChange2.recreate) {
      console.warn("Unable to patch indexes of table ".concat(tableChange2.name, " because it has changes on the type of index or primary key."));
      return { value: void 0 };
    }
    var store = idbUpgradeTrans.objectStore(tableChange2.name);
    tableChange2.add.forEach(function(idx) {
      if (debug)
        console.debug("Dexie upgrade patch: Creating missing index ".concat(tableChange2.name, ".").concat(idx.src));
      addIndex(store, idx);
    });
  };
  for (var _i = 0, _a2 = diff.change; _i < _a2.length; _i++) {
    var tableChange = _a2[_i];
    var state_1 = _loop_1(tableChange);
    if (typeof state_1 === "object")
      return state_1.value;
  }
}
function getExistingVersion(db2, trans, oldVersion) {
  if (trans.storeNames.includes("$meta")) {
    return trans.table("$meta").get("version").then(function(metaVersion) {
      return metaVersion != null ? metaVersion : oldVersion;
    });
  } else {
    return DexiePromise.resolve(oldVersion);
  }
}
function updateTablesAndIndexes(db2, oldVersion, trans, idbUpgradeTrans) {
  var queue = [];
  var versions = db2._versions;
  var globalSchema = db2._dbSchema = buildGlobalSchema(db2, db2.idbdb, idbUpgradeTrans);
  var versToRun = versions.filter(function(v) {
    return v._cfg.version >= oldVersion;
  });
  if (versToRun.length === 0) {
    return DexiePromise.resolve();
  }
  versToRun.forEach(function(version) {
    queue.push(function() {
      var oldSchema = globalSchema;
      var newSchema = version._cfg.dbschema;
      adjustToExistingIndexNames(db2, oldSchema, idbUpgradeTrans);
      adjustToExistingIndexNames(db2, newSchema, idbUpgradeTrans);
      globalSchema = db2._dbSchema = newSchema;
      var diff = getSchemaDiff(oldSchema, newSchema);
      diff.add.forEach(function(tuple) {
        createTable(idbUpgradeTrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
      });
      diff.change.forEach(function(change) {
        if (change.recreate) {
          throw new exceptions.Upgrade("Not yet support for changing primary key");
        } else {
          var store_1 = idbUpgradeTrans.objectStore(change.name);
          change.add.forEach(function(idx) {
            return addIndex(store_1, idx);
          });
          change.change.forEach(function(idx) {
            store_1.deleteIndex(idx.name);
            addIndex(store_1, idx);
          });
          change.del.forEach(function(idxName) {
            return store_1.deleteIndex(idxName);
          });
        }
      });
      var contentUpgrade = version._cfg.contentUpgrade;
      if (contentUpgrade && version._cfg.version > oldVersion) {
        generateMiddlewareStacks(db2, idbUpgradeTrans);
        trans._memoizedTables = {};
        var upgradeSchema_1 = shallowClone(newSchema);
        diff.del.forEach(function(table) {
          upgradeSchema_1[table] = oldSchema[table];
        });
        removeTablesApi(db2, [db2.Transaction.prototype]);
        setApiOnPlace(db2, [db2.Transaction.prototype], keys(upgradeSchema_1), upgradeSchema_1);
        trans.schema = upgradeSchema_1;
        var contentUpgradeIsAsync_1 = isAsyncFunction(contentUpgrade);
        if (contentUpgradeIsAsync_1) {
          incrementExpectedAwaits();
        }
        var returnValue_1;
        var promiseFollowed = DexiePromise.follow(function() {
          returnValue_1 = contentUpgrade(trans);
          if (returnValue_1) {
            if (contentUpgradeIsAsync_1) {
              var decrementor = decrementExpectedAwaits.bind(null, null);
              returnValue_1.then(decrementor, decrementor);
            }
          }
        });
        return returnValue_1 && typeof returnValue_1.then === "function" ? DexiePromise.resolve(returnValue_1) : promiseFollowed.then(function() {
          return returnValue_1;
        });
      }
    });
    queue.push(function(idbtrans) {
      var newSchema = version._cfg.dbschema;
      deleteRemovedTables(newSchema, idbtrans);
      removeTablesApi(db2, [db2.Transaction.prototype]);
      setApiOnPlace(db2, [db2.Transaction.prototype], db2._storeNames, db2._dbSchema);
      trans.schema = db2._dbSchema;
    });
    queue.push(function(idbtrans) {
      if (db2.idbdb.objectStoreNames.contains("$meta")) {
        if (Math.ceil(db2.idbdb.version / 10) === version._cfg.version) {
          db2.idbdb.deleteObjectStore("$meta");
          delete db2._dbSchema.$meta;
          db2._storeNames = db2._storeNames.filter(function(name) {
            return name !== "$meta";
          });
        } else {
          idbtrans.objectStore("$meta").put(version._cfg.version, "version");
        }
      }
    });
  });
  function runQueue() {
    return queue.length ? DexiePromise.resolve(queue.shift()(trans.idbtrans)).then(runQueue) : DexiePromise.resolve();
  }
  return runQueue().then(function() {
    createMissingTables(globalSchema, idbUpgradeTrans);
  });
}
function getSchemaDiff(oldSchema, newSchema) {
  var diff = {
    del: [],
    add: [],
    change: []
  };
  var table;
  for (table in oldSchema) {
    if (!newSchema[table])
      diff.del.push(table);
  }
  for (table in newSchema) {
    var oldDef = oldSchema[table], newDef = newSchema[table];
    if (!oldDef) {
      diff.add.push([table, newDef]);
    } else {
      var change = {
        name: table,
        def: newDef,
        recreate: false,
        del: [],
        add: [],
        change: []
      };
      if ("" + (oldDef.primKey.keyPath || "") !== "" + (newDef.primKey.keyPath || "") || oldDef.primKey.auto !== newDef.primKey.auto) {
        change.recreate = true;
        diff.change.push(change);
      } else {
        var oldIndexes = oldDef.idxByName;
        var newIndexes = newDef.idxByName;
        var idxName = void 0;
        for (idxName in oldIndexes) {
          if (!newIndexes[idxName])
            change.del.push(idxName);
        }
        for (idxName in newIndexes) {
          var oldIdx = oldIndexes[idxName], newIdx = newIndexes[idxName];
          if (!oldIdx)
            change.add.push(newIdx);
          else if (oldIdx.src !== newIdx.src)
            change.change.push(newIdx);
        }
        if (change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
          diff.change.push(change);
        }
      }
    }
  }
  return diff;
}
function createTable(idbtrans, tableName, primKey, indexes) {
  var store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ? { keyPath: primKey.keyPath, autoIncrement: primKey.auto } : { autoIncrement: primKey.auto });
  indexes.forEach(function(idx) {
    return addIndex(store, idx);
  });
  return store;
}
function createMissingTables(newSchema, idbtrans) {
  keys(newSchema).forEach(function(tableName) {
    if (!idbtrans.db.objectStoreNames.contains(tableName)) {
      if (debug)
        console.debug("Dexie: Creating missing table", tableName);
      createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
    }
  });
}
function deleteRemovedTables(newSchema, idbtrans) {
  [].slice.call(idbtrans.db.objectStoreNames).forEach(function(storeName) {
    return newSchema[storeName] == null && idbtrans.db.deleteObjectStore(storeName);
  });
}
function addIndex(store, idx) {
  store.createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multi });
}
function buildGlobalSchema(db2, idbdb, tmpTrans) {
  var globalSchema = {};
  var dbStoreNames = slice(idbdb.objectStoreNames, 0);
  dbStoreNames.forEach(function(storeName) {
    var store = tmpTrans.objectStore(storeName);
    var keyPath = store.keyPath;
    var primKey = createIndexSpec(nameFromKeyPath(keyPath), keyPath || "", true, false, !!store.autoIncrement, keyPath && typeof keyPath !== "string", true);
    var indexes = [];
    for (var j = 0; j < store.indexNames.length; ++j) {
      var idbindex = store.index(store.indexNames[j]);
      keyPath = idbindex.keyPath;
      var index = createIndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== "string", false);
      indexes.push(index);
    }
    globalSchema[storeName] = createTableSchema(storeName, primKey, indexes);
  });
  return globalSchema;
}
function readGlobalSchema(db2, idbdb, tmpTrans) {
  db2.verno = idbdb.version / 10;
  var globalSchema = db2._dbSchema = buildGlobalSchema(db2, idbdb, tmpTrans);
  db2._storeNames = slice(idbdb.objectStoreNames, 0);
  setApiOnPlace(db2, [db2._allTables], keys(globalSchema), globalSchema);
}
function verifyInstalledSchema(db2, tmpTrans) {
  var installedSchema = buildGlobalSchema(db2, db2.idbdb, tmpTrans);
  var diff = getSchemaDiff(installedSchema, db2._dbSchema);
  return !(diff.add.length || diff.change.some(function(ch) {
    return ch.add.length || ch.change.length;
  }));
}
function adjustToExistingIndexNames(db2, schema, idbtrans) {
  var storeNames = idbtrans.db.objectStoreNames;
  for (var i = 0; i < storeNames.length; ++i) {
    var storeName = storeNames[i];
    var store = idbtrans.objectStore(storeName);
    db2._hasGetAll = "getAll" in store;
    for (var j = 0; j < store.indexNames.length; ++j) {
      var indexName = store.indexNames[j];
      var keyPath = store.index(indexName).keyPath;
      var dexieName = typeof keyPath === "string" ? keyPath : "[" + slice(keyPath).join("+") + "]";
      if (schema[storeName]) {
        var indexSpec = schema[storeName].idxByName[dexieName];
        if (indexSpec) {
          indexSpec.name = indexName;
          delete schema[storeName].idxByName[dexieName];
          schema[storeName].idxByName[indexName] = indexSpec;
        }
      }
    }
  }
  if (typeof navigator !== "undefined" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && _global.WorkerGlobalScope && _global instanceof _global.WorkerGlobalScope && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604) {
    db2._hasGetAll = false;
  }
}
function parseIndexSyntax(primKeyAndIndexes) {
  return primKeyAndIndexes.split(",").map(function(index, indexNum) {
    var _a2;
    var typeSplit = index.split(":");
    var type2 = (_a2 = typeSplit[1]) === null || _a2 === void 0 ? void 0 : _a2.trim();
    index = typeSplit[0].trim();
    var name = index.replace(/([&*]|\+\+)/g, "");
    var keyPath = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split("+") : name;
    return createIndexSpec(name, keyPath || null, /\&/.test(index), /\*/.test(index), /\+\+/.test(index), isArray(keyPath), indexNum === 0, type2);
  });
}
var Version = (function() {
  function Version2() {
  }
  Version2.prototype._createTableSchema = function(name, primKey, indexes) {
    return createTableSchema(name, primKey, indexes);
  };
  Version2.prototype._parseIndexSyntax = function(primKeyAndIndexes) {
    return parseIndexSyntax(primKeyAndIndexes);
  };
  Version2.prototype._parseStoresSpec = function(stores, outSchema) {
    var _this = this;
    keys(stores).forEach(function(tableName) {
      if (stores[tableName] !== null) {
        var indexes = _this._parseIndexSyntax(stores[tableName]);
        var primKey = indexes.shift();
        if (!primKey) {
          throw new exceptions.Schema("Invalid schema for table " + tableName + ": " + stores[tableName]);
        }
        primKey.unique = true;
        if (primKey.multi)
          throw new exceptions.Schema("Primary key cannot be multiEntry*");
        indexes.forEach(function(idx) {
          if (idx.auto)
            throw new exceptions.Schema("Only primary key can be marked as autoIncrement (++)");
          if (!idx.keyPath)
            throw new exceptions.Schema("Index must have a name and cannot be an empty string");
        });
        var tblSchema = _this._createTableSchema(tableName, primKey, indexes);
        outSchema[tableName] = tblSchema;
      }
    });
  };
  Version2.prototype.stores = function(stores) {
    var db2 = this.db;
    this._cfg.storesSource = this._cfg.storesSource ? extend(this._cfg.storesSource, stores) : stores;
    var versions = db2._versions;
    var storesSpec = {};
    var dbschema = {};
    versions.forEach(function(version) {
      extend(storesSpec, version._cfg.storesSource);
      dbschema = version._cfg.dbschema = {};
      version._parseStoresSpec(storesSpec, dbschema);
    });
    db2._dbSchema = dbschema;
    removeTablesApi(db2, [db2._allTables, db2, db2.Transaction.prototype]);
    setApiOnPlace(db2, [db2._allTables, db2, db2.Transaction.prototype, this._cfg.tables], keys(dbschema), dbschema);
    db2._storeNames = keys(dbschema);
    return this;
  };
  Version2.prototype.upgrade = function(upgradeFunction) {
    this._cfg.contentUpgrade = promisableChain(this._cfg.contentUpgrade || nop, upgradeFunction);
    return this;
  };
  return Version2;
})();
function createVersionConstructor(db2) {
  return makeClassConstructor(Version.prototype, function Version2(versionNumber) {
    this.db = db2;
    this._cfg = {
      version: versionNumber,
      storesSource: null,
      dbschema: {},
      tables: {},
      contentUpgrade: null
    };
  });
}
function getDbNamesTable(indexedDB2, IDBKeyRange) {
  var dbNamesDB = indexedDB2["_dbNamesDB"];
  if (!dbNamesDB) {
    dbNamesDB = indexedDB2["_dbNamesDB"] = new Dexie$1(DBNAMES_DB, {
      addons: [],
      indexedDB: indexedDB2,
      IDBKeyRange
    });
    dbNamesDB.version(1).stores({ dbnames: "name" });
  }
  return dbNamesDB.table("dbnames");
}
function hasDatabasesNative(indexedDB2) {
  return indexedDB2 && typeof indexedDB2.databases === "function";
}
function getDatabaseNames(_a2) {
  var indexedDB2 = _a2.indexedDB, IDBKeyRange = _a2.IDBKeyRange;
  return hasDatabasesNative(indexedDB2) ? Promise.resolve(indexedDB2.databases()).then(function(infos) {
    return infos.map(function(info) {
      return info.name;
    }).filter(function(name) {
      return name !== DBNAMES_DB;
    });
  }) : getDbNamesTable(indexedDB2, IDBKeyRange).toCollection().primaryKeys();
}
function _onDatabaseCreated(_a2, name) {
  var indexedDB2 = _a2.indexedDB, IDBKeyRange = _a2.IDBKeyRange;
  !hasDatabasesNative(indexedDB2) && name !== DBNAMES_DB && getDbNamesTable(indexedDB2, IDBKeyRange).put({ name }).catch(nop);
}
function _onDatabaseDeleted(_a2, name) {
  var indexedDB2 = _a2.indexedDB, IDBKeyRange = _a2.IDBKeyRange;
  !hasDatabasesNative(indexedDB2) && name !== DBNAMES_DB && getDbNamesTable(indexedDB2, IDBKeyRange).delete(name).catch(nop);
}
function vip(fn) {
  return newScope(function() {
    PSD.letThrough = true;
    return fn();
  });
}
function idbReady() {
  var isSafari = !navigator.userAgentData && /Safari\//.test(navigator.userAgent) && !/Chrom(e|ium)\//.test(navigator.userAgent);
  if (!isSafari || !indexedDB.databases)
    return Promise.resolve();
  var intervalId;
  return new Promise(function(resolve) {
    var tryIdb = function() {
      return indexedDB.databases().finally(resolve);
    };
    intervalId = setInterval(tryIdb, 100);
    tryIdb();
  }).finally(function() {
    return clearInterval(intervalId);
  });
}
var _a;
function isEmptyRange(node) {
  return !("from" in node);
}
var RangeSet = function(fromOrTree, to) {
  if (this) {
    extend(this, arguments.length ? { d: 1, from: fromOrTree, to: arguments.length > 1 ? to : fromOrTree } : { d: 0 });
  } else {
    var rv = new RangeSet();
    if (fromOrTree && "d" in fromOrTree) {
      extend(rv, fromOrTree);
    }
    return rv;
  }
};
props(RangeSet.prototype, (_a = {
  add: function(rangeSet) {
    mergeRanges(this, rangeSet);
    return this;
  },
  addKey: function(key) {
    addRange(this, key, key);
    return this;
  },
  addKeys: function(keys2) {
    var _this = this;
    keys2.forEach(function(key) {
      return addRange(_this, key, key);
    });
    return this;
  },
  hasKey: function(key) {
    var node = getRangeSetIterator(this).next(key).value;
    return node && cmp(node.from, key) <= 0 && cmp(node.to, key) >= 0;
  }
}, _a[iteratorSymbol] = function() {
  return getRangeSetIterator(this);
}, _a));
function addRange(target, from, to) {
  var diff = cmp(from, to);
  if (isNaN(diff))
    return;
  if (diff > 0)
    throw RangeError();
  if (isEmptyRange(target))
    return extend(target, { from, to, d: 1 });
  var left = target.l;
  var right = target.r;
  if (cmp(to, target.from) < 0) {
    left ? addRange(left, from, to) : target.l = { from, to, d: 1, l: null, r: null };
    return rebalance(target);
  }
  if (cmp(from, target.to) > 0) {
    right ? addRange(right, from, to) : target.r = { from, to, d: 1, l: null, r: null };
    return rebalance(target);
  }
  if (cmp(from, target.from) < 0) {
    target.from = from;
    target.l = null;
    target.d = right ? right.d + 1 : 1;
  }
  if (cmp(to, target.to) > 0) {
    target.to = to;
    target.r = null;
    target.d = target.l ? target.l.d + 1 : 1;
  }
  var rightWasCutOff = !target.r;
  if (left && !target.l) {
    mergeRanges(target, left);
  }
  if (right && rightWasCutOff) {
    mergeRanges(target, right);
  }
}
function mergeRanges(target, newSet) {
  function _addRangeSet(target2, _a2) {
    var from = _a2.from, to = _a2.to, l = _a2.l, r = _a2.r;
    addRange(target2, from, to);
    if (l)
      _addRangeSet(target2, l);
    if (r)
      _addRangeSet(target2, r);
  }
  if (!isEmptyRange(newSet))
    _addRangeSet(target, newSet);
}
function rangesOverlap(rangeSet1, rangeSet2) {
  var i1 = getRangeSetIterator(rangeSet2);
  var nextResult1 = i1.next();
  if (nextResult1.done)
    return false;
  var a = nextResult1.value;
  var i2 = getRangeSetIterator(rangeSet1);
  var nextResult2 = i2.next(a.from);
  var b = nextResult2.value;
  while (!nextResult1.done && !nextResult2.done) {
    if (cmp(b.from, a.to) <= 0 && cmp(b.to, a.from) >= 0)
      return true;
    cmp(a.from, b.from) < 0 ? a = (nextResult1 = i1.next(b.from)).value : b = (nextResult2 = i2.next(a.from)).value;
  }
  return false;
}
function getRangeSetIterator(node) {
  var state = isEmptyRange(node) ? null : { s: 0, n: node };
  return {
    next: function(key) {
      var keyProvided = arguments.length > 0;
      while (state) {
        switch (state.s) {
          case 0:
            state.s = 1;
            if (keyProvided) {
              while (state.n.l && cmp(key, state.n.from) < 0)
                state = { up: state, n: state.n.l, s: 1 };
            } else {
              while (state.n.l)
                state = { up: state, n: state.n.l, s: 1 };
            }
          case 1:
            state.s = 2;
            if (!keyProvided || cmp(key, state.n.to) <= 0)
              return { value: state.n, done: false };
          case 2:
            if (state.n.r) {
              state.s = 3;
              state = { up: state, n: state.n.r, s: 0 };
              continue;
            }
          case 3:
            state = state.up;
        }
      }
      return { done: true };
    }
  };
}
function rebalance(target) {
  var _a2, _b;
  var diff = (((_a2 = target.r) === null || _a2 === void 0 ? void 0 : _a2.d) || 0) - (((_b = target.l) === null || _b === void 0 ? void 0 : _b.d) || 0);
  var r = diff > 1 ? "r" : diff < -1 ? "l" : "";
  if (r) {
    var l = r === "r" ? "l" : "r";
    var rootClone = __assign({}, target);
    var oldRootRight = target[r];
    target.from = oldRootRight.from;
    target.to = oldRootRight.to;
    target[r] = oldRootRight[r];
    rootClone[r] = oldRootRight[l];
    target[l] = rootClone;
    rootClone.d = computeDepth(rootClone);
  }
  target.d = computeDepth(target);
}
function computeDepth(_a2) {
  var r = _a2.r, l = _a2.l;
  return (r ? l ? Math.max(r.d, l.d) : r.d : l ? l.d : 0) + 1;
}
function extendObservabilitySet(target, newSet) {
  keys(newSet).forEach(function(part) {
    if (target[part])
      mergeRanges(target[part], newSet[part]);
    else
      target[part] = cloneSimpleObjectTree(newSet[part]);
  });
  return target;
}
function obsSetsOverlap(os1, os2) {
  return os1.all || os2.all || Object.keys(os1).some(function(key) {
    return os2[key] && rangesOverlap(os2[key], os1[key]);
  });
}
var cache = {};
var unsignaledParts = {};
var isTaskEnqueued = false;
function signalSubscribersLazily(part, optimistic) {
  extendObservabilitySet(unsignaledParts, part);
  if (!isTaskEnqueued) {
    isTaskEnqueued = true;
    setTimeout(function() {
      isTaskEnqueued = false;
      var parts = unsignaledParts;
      unsignaledParts = {};
      signalSubscribersNow(parts, false);
    }, 0);
  }
}
function signalSubscribersNow(updatedParts, deleteAffectedCacheEntries) {
  if (deleteAffectedCacheEntries === void 0) {
    deleteAffectedCacheEntries = false;
  }
  var queriesToSignal = /* @__PURE__ */ new Set();
  if (updatedParts.all) {
    for (var _i = 0, _a2 = Object.values(cache); _i < _a2.length; _i++) {
      var tblCache = _a2[_i];
      collectTableSubscribers(tblCache, updatedParts, queriesToSignal, deleteAffectedCacheEntries);
    }
  } else {
    for (var key in updatedParts) {
      var parts = /^idb\:\/\/(.*)\/(.*)\//.exec(key);
      if (parts) {
        var dbName = parts[1], tableName = parts[2];
        var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
        if (tblCache)
          collectTableSubscribers(tblCache, updatedParts, queriesToSignal, deleteAffectedCacheEntries);
      }
    }
  }
  queriesToSignal.forEach(function(requery) {
    return requery();
  });
}
function collectTableSubscribers(tblCache, updatedParts, outQueriesToSignal, deleteAffectedCacheEntries) {
  var updatedEntryLists = [];
  for (var _i = 0, _a2 = Object.entries(tblCache.queries.query); _i < _a2.length; _i++) {
    var _b = _a2[_i], indexName = _b[0], entries = _b[1];
    var filteredEntries = [];
    for (var _c = 0, entries_1 = entries; _c < entries_1.length; _c++) {
      var entry = entries_1[_c];
      if (obsSetsOverlap(updatedParts, entry.obsSet)) {
        entry.subscribers.forEach(function(requery) {
          return outQueriesToSignal.add(requery);
        });
      } else if (deleteAffectedCacheEntries) {
        filteredEntries.push(entry);
      }
    }
    if (deleteAffectedCacheEntries)
      updatedEntryLists.push([indexName, filteredEntries]);
  }
  if (deleteAffectedCacheEntries) {
    for (var _d = 0, updatedEntryLists_1 = updatedEntryLists; _d < updatedEntryLists_1.length; _d++) {
      var _e = updatedEntryLists_1[_d], indexName = _e[0], filteredEntries = _e[1];
      tblCache.queries.query[indexName] = filteredEntries;
    }
  }
}
function dexieOpen(db2) {
  var state = db2._state;
  var indexedDB2 = db2._deps.indexedDB;
  if (state.isBeingOpened || db2.idbdb)
    return state.dbReadyPromise.then(function() {
      return state.dbOpenError ? rejection(state.dbOpenError) : db2;
    });
  state.isBeingOpened = true;
  state.dbOpenError = null;
  state.openComplete = false;
  var openCanceller = state.openCanceller;
  var nativeVerToOpen = Math.round(db2.verno * 10);
  var schemaPatchMode = false;
  function throwIfCancelled() {
    if (state.openCanceller !== openCanceller)
      throw new exceptions.DatabaseClosed("db.open() was cancelled");
  }
  var resolveDbReady = state.dbReadyResolve, upgradeTransaction = null, wasCreated = false;
  var tryOpenDB = function() {
    return new DexiePromise(function(resolve, reject) {
      throwIfCancelled();
      if (!indexedDB2)
        throw new exceptions.MissingAPI();
      var dbName = db2.name;
      var req = state.autoSchema || !nativeVerToOpen ? indexedDB2.open(dbName) : indexedDB2.open(dbName, nativeVerToOpen);
      if (!req)
        throw new exceptions.MissingAPI();
      req.onerror = eventRejectHandler(reject);
      req.onblocked = wrap(db2._fireOnBlocked);
      req.onupgradeneeded = wrap(function(e) {
        upgradeTransaction = req.transaction;
        if (state.autoSchema && !db2._options.allowEmptyDB) {
          req.onerror = preventDefault;
          upgradeTransaction.abort();
          req.result.close();
          var delreq = indexedDB2.deleteDatabase(dbName);
          delreq.onsuccess = delreq.onerror = wrap(function() {
            reject(new exceptions.NoSuchDatabase("Database ".concat(dbName, " doesnt exist")));
          });
        } else {
          upgradeTransaction.onerror = eventRejectHandler(reject);
          var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion;
          wasCreated = oldVer < 1;
          db2.idbdb = req.result;
          if (schemaPatchMode) {
            patchCurrentVersion(db2, upgradeTransaction);
          }
          runUpgraders(db2, oldVer / 10, upgradeTransaction, reject);
        }
      }, reject);
      req.onsuccess = wrap(function() {
        upgradeTransaction = null;
        var idbdb = db2.idbdb = req.result;
        var objectStoreNames = slice(idbdb.objectStoreNames);
        if (objectStoreNames.length > 0)
          try {
            var tmpTrans = idbdb.transaction(safariMultiStoreFix(objectStoreNames), "readonly");
            if (state.autoSchema)
              readGlobalSchema(db2, idbdb, tmpTrans);
            else {
              adjustToExistingIndexNames(db2, db2._dbSchema, tmpTrans);
              if (!verifyInstalledSchema(db2, tmpTrans) && !schemaPatchMode) {
                console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this.");
                idbdb.close();
                nativeVerToOpen = idbdb.version + 1;
                schemaPatchMode = true;
                return resolve(tryOpenDB());
              }
            }
            generateMiddlewareStacks(db2, tmpTrans);
          } catch (e) {
          }
        connections.push(db2);
        idbdb.onversionchange = wrap(function(ev) {
          state.vcFired = true;
          db2.on("versionchange").fire(ev);
        });
        idbdb.onclose = wrap(function() {
          db2.close({ disableAutoOpen: false });
        });
        if (wasCreated)
          _onDatabaseCreated(db2._deps, dbName);
        resolve();
      }, reject);
    }).catch(function(err) {
      switch (err === null || err === void 0 ? void 0 : err.name) {
        case "UnknownError":
          if (state.PR1398_maxLoop > 0) {
            state.PR1398_maxLoop--;
            console.warn("Dexie: Workaround for Chrome UnknownError on open()");
            return tryOpenDB();
          }
          break;
        case "VersionError":
          if (nativeVerToOpen > 0) {
            nativeVerToOpen = 0;
            return tryOpenDB();
          }
          break;
      }
      return DexiePromise.reject(err);
    });
  };
  return DexiePromise.race([
    openCanceller,
    (typeof navigator === "undefined" ? DexiePromise.resolve() : idbReady()).then(tryOpenDB)
  ]).then(function() {
    throwIfCancelled();
    state.onReadyBeingFired = [];
    return DexiePromise.resolve(vip(function() {
      return db2.on.ready.fire(db2.vip);
    })).then(function fireRemainders() {
      if (state.onReadyBeingFired.length > 0) {
        var remainders_1 = state.onReadyBeingFired.reduce(promisableChain, nop);
        state.onReadyBeingFired = [];
        return DexiePromise.resolve(vip(function() {
          return remainders_1(db2.vip);
        })).then(fireRemainders);
      }
    });
  }).finally(function() {
    if (state.openCanceller === openCanceller) {
      state.onReadyBeingFired = null;
      state.isBeingOpened = false;
    }
  }).catch(function(err) {
    state.dbOpenError = err;
    try {
      upgradeTransaction && upgradeTransaction.abort();
    } catch (_a2) {
    }
    if (openCanceller === state.openCanceller) {
      db2._close();
    }
    return rejection(err);
  }).finally(function() {
    state.openComplete = true;
    resolveDbReady();
  }).then(function() {
    if (wasCreated) {
      var everything_1 = {};
      db2.tables.forEach(function(table) {
        table.schema.indexes.forEach(function(idx) {
          if (idx.name)
            everything_1["idb://".concat(db2.name, "/").concat(table.name, "/").concat(idx.name)] = new RangeSet(-Infinity, [[[]]]);
        });
        everything_1["idb://".concat(db2.name, "/").concat(table.name, "/")] = everything_1["idb://".concat(db2.name, "/").concat(table.name, "/:dels")] = new RangeSet(-Infinity, [[[]]]);
      });
      globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME).fire(everything_1);
      signalSubscribersNow(everything_1, true);
    }
    return db2;
  });
}
function awaitIterator(iterator) {
  var callNext = function(result) {
    return iterator.next(result);
  }, doThrow = function(error) {
    return iterator.throw(error);
  }, onSuccess = step(callNext), onError = step(doThrow);
  function step(getNext) {
    return function(val) {
      var next = getNext(val), value = next.value;
      return next.done ? value : !value || typeof value.then !== "function" ? isArray(value) ? Promise.all(value).then(onSuccess, onError) : onSuccess(value) : value.then(onSuccess, onError);
    };
  }
  return step(callNext)();
}
function extractTransactionArgs(mode, _tableArgs_, scopeFunc) {
  var i = arguments.length;
  if (i < 2)
    throw new exceptions.InvalidArgument("Too few arguments");
  var args = new Array(i - 1);
  while (--i)
    args[i - 1] = arguments[i];
  scopeFunc = args.pop();
  var tables = flatten(args);
  return [mode, tables, scopeFunc];
}
function enterTransactionScope(db2, mode, storeNames, parentTransaction, scopeFunc) {
  return DexiePromise.resolve().then(function() {
    var transless = PSD.transless || PSD;
    var trans = db2._createTransaction(mode, storeNames, db2._dbSchema, parentTransaction);
    trans.explicit = true;
    var zoneProps = {
      trans,
      transless
    };
    if (parentTransaction) {
      trans.idbtrans = parentTransaction.idbtrans;
    } else {
      try {
        trans.create();
        trans.idbtrans._explicit = true;
        db2._state.PR1398_maxLoop = 3;
      } catch (ex) {
        if (ex.name === errnames.InvalidState && db2.isOpen() && --db2._state.PR1398_maxLoop > 0) {
          console.warn("Dexie: Need to reopen db");
          db2.close({ disableAutoOpen: false });
          return db2.open().then(function() {
            return enterTransactionScope(db2, mode, storeNames, null, scopeFunc);
          });
        }
        return rejection(ex);
      }
    }
    var scopeFuncIsAsync = isAsyncFunction(scopeFunc);
    if (scopeFuncIsAsync) {
      incrementExpectedAwaits();
    }
    var returnValue;
    var promiseFollowed = DexiePromise.follow(function() {
      returnValue = scopeFunc.call(trans, trans);
      if (returnValue) {
        if (scopeFuncIsAsync) {
          var decrementor = decrementExpectedAwaits.bind(null, null);
          returnValue.then(decrementor, decrementor);
        } else if (typeof returnValue.next === "function" && typeof returnValue.throw === "function") {
          returnValue = awaitIterator(returnValue);
        }
      }
    }, zoneProps);
    return (returnValue && typeof returnValue.then === "function" ? DexiePromise.resolve(returnValue).then(function(x) {
      return trans.active ? x : rejection(new exceptions.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"));
    }) : promiseFollowed.then(function() {
      return returnValue;
    })).then(function(x) {
      if (parentTransaction)
        trans._resolve();
      return trans._completion.then(function() {
        return x;
      });
    }).catch(function(e) {
      trans._reject(e);
      return rejection(e);
    });
  });
}
function pad(a, value, count) {
  var result = isArray(a) ? a.slice() : [a];
  for (var i = 0; i < count; ++i)
    result.push(value);
  return result;
}
function createVirtualIndexMiddleware(down) {
  return __assign(__assign({}, down), { table: function(tableName) {
    var table = down.table(tableName);
    var schema = table.schema;
    var indexLookup = {};
    var allVirtualIndexes = [];
    function addVirtualIndexes(keyPath, keyTail, lowLevelIndex) {
      var keyPathAlias = getKeyPathAlias(keyPath);
      var indexList = indexLookup[keyPathAlias] = indexLookup[keyPathAlias] || [];
      var keyLength = keyPath == null ? 0 : typeof keyPath === "string" ? 1 : keyPath.length;
      var isVirtual = keyTail > 0;
      var virtualIndex = __assign(__assign({}, lowLevelIndex), { name: isVirtual ? "".concat(keyPathAlias, "(virtual-from:").concat(lowLevelIndex.name, ")") : lowLevelIndex.name, lowLevelIndex, isVirtual, keyTail, keyLength, extractKey: getKeyExtractor(keyPath), unique: !isVirtual && lowLevelIndex.unique });
      indexList.push(virtualIndex);
      if (!virtualIndex.isPrimaryKey) {
        allVirtualIndexes.push(virtualIndex);
      }
      if (keyLength > 1) {
        var virtualKeyPath = keyLength === 2 ? keyPath[0] : keyPath.slice(0, keyLength - 1);
        addVirtualIndexes(virtualKeyPath, keyTail + 1, lowLevelIndex);
      }
      indexList.sort(function(a, b) {
        return a.keyTail - b.keyTail;
      });
      return virtualIndex;
    }
    var primaryKey = addVirtualIndexes(schema.primaryKey.keyPath, 0, schema.primaryKey);
    indexLookup[":id"] = [primaryKey];
    for (var _i = 0, _a2 = schema.indexes; _i < _a2.length; _i++) {
      var index = _a2[_i];
      addVirtualIndexes(index.keyPath, 0, index);
    }
    function findBestIndex(keyPath) {
      var result2 = indexLookup[getKeyPathAlias(keyPath)];
      return result2 && result2[0];
    }
    function translateRange(range, keyTail) {
      return {
        type: range.type === 1 ? 2 : range.type,
        lower: pad(range.lower, range.lowerOpen ? down.MAX_KEY : down.MIN_KEY, keyTail),
        lowerOpen: true,
        upper: pad(range.upper, range.upperOpen ? down.MIN_KEY : down.MAX_KEY, keyTail),
        upperOpen: true
      };
    }
    function translateRequest(req) {
      var index2 = req.query.index;
      return index2.isVirtual ? __assign(__assign({}, req), { query: {
        index: index2.lowLevelIndex,
        range: translateRange(req.query.range, index2.keyTail)
      } }) : req;
    }
    var result = __assign(__assign({}, table), { schema: __assign(__assign({}, schema), { primaryKey, indexes: allVirtualIndexes, getIndexByKeyPath: findBestIndex }), count: function(req) {
      return table.count(translateRequest(req));
    }, query: function(req) {
      return table.query(translateRequest(req));
    }, openCursor: function(req) {
      var _a3 = req.query.index, keyTail = _a3.keyTail, isVirtual = _a3.isVirtual, keyLength = _a3.keyLength;
      if (!isVirtual)
        return table.openCursor(req);
      function createVirtualCursor(cursor) {
        function _continue(key) {
          key != null ? cursor.continue(pad(key, req.reverse ? down.MAX_KEY : down.MIN_KEY, keyTail)) : req.unique ? cursor.continue(cursor.key.slice(0, keyLength).concat(req.reverse ? down.MIN_KEY : down.MAX_KEY, keyTail)) : cursor.continue();
        }
        var virtualCursor = Object.create(cursor, {
          continue: { value: _continue },
          continuePrimaryKey: {
            value: function(key, primaryKey2) {
              cursor.continuePrimaryKey(pad(key, down.MAX_KEY, keyTail), primaryKey2);
            }
          },
          primaryKey: {
            get: function() {
              return cursor.primaryKey;
            }
          },
          key: {
            get: function() {
              var key = cursor.key;
              return keyLength === 1 ? key[0] : key.slice(0, keyLength);
            }
          },
          value: {
            get: function() {
              return cursor.value;
            }
          }
        });
        return virtualCursor;
      }
      return table.openCursor(translateRequest(req)).then(function(cursor) {
        return cursor && createVirtualCursor(cursor);
      });
    } });
    return result;
  } });
}
var virtualIndexMiddleware = {
  stack: "dbcore",
  name: "VirtualIndexMiddleware",
  level: 1,
  create: createVirtualIndexMiddleware
};
function getObjectDiff(a, b, rv, prfx) {
  rv = rv || {};
  prfx = prfx || "";
  keys(a).forEach(function(prop) {
    if (!hasOwn(b, prop)) {
      rv[prfx + prop] = void 0;
    } else {
      var ap = a[prop], bp = b[prop];
      if (typeof ap === "object" && typeof bp === "object" && ap && bp) {
        var apTypeName = toStringTag(ap);
        var bpTypeName = toStringTag(bp);
        if (apTypeName !== bpTypeName) {
          rv[prfx + prop] = b[prop];
        } else if (apTypeName === "Object") {
          getObjectDiff(ap, bp, rv, prfx + prop + ".");
        } else if (ap !== bp) {
          rv[prfx + prop] = b[prop];
        }
      } else if (ap !== bp)
        rv[prfx + prop] = b[prop];
    }
  });
  keys(b).forEach(function(prop) {
    if (!hasOwn(a, prop)) {
      rv[prfx + prop] = b[prop];
    }
  });
  return rv;
}
function getEffectiveKeys(primaryKey, req) {
  if (req.type === "delete")
    return req.keys;
  return req.keys || req.values.map(primaryKey.extractKey);
}
var hooksMiddleware = {
  stack: "dbcore",
  name: "HooksMiddleware",
  level: 2,
  create: function(downCore) {
    return __assign(__assign({}, downCore), { table: function(tableName) {
      var downTable = downCore.table(tableName);
      var primaryKey = downTable.schema.primaryKey;
      var tableMiddleware = __assign(__assign({}, downTable), { mutate: function(req) {
        var dxTrans = PSD.trans;
        var _a2 = dxTrans.table(tableName).hook, deleting = _a2.deleting, creating = _a2.creating, updating = _a2.updating;
        switch (req.type) {
          case "add":
            if (creating.fire === nop)
              break;
            return dxTrans._promise("readwrite", function() {
              return addPutOrDelete(req);
            }, true);
          case "put":
            if (creating.fire === nop && updating.fire === nop)
              break;
            return dxTrans._promise("readwrite", function() {
              return addPutOrDelete(req);
            }, true);
          case "delete":
            if (deleting.fire === nop)
              break;
            return dxTrans._promise("readwrite", function() {
              return addPutOrDelete(req);
            }, true);
          case "deleteRange":
            if (deleting.fire === nop)
              break;
            return dxTrans._promise("readwrite", function() {
              return deleteRange(req);
            }, true);
        }
        return downTable.mutate(req);
        function addPutOrDelete(req2) {
          var dxTrans2 = PSD.trans;
          var keys2 = req2.keys || getEffectiveKeys(primaryKey, req2);
          if (!keys2)
            throw new Error("Keys missing");
          req2 = req2.type === "add" || req2.type === "put" ? __assign(__assign({}, req2), { keys: keys2 }) : __assign({}, req2);
          if (req2.type !== "delete")
            req2.values = __spreadArray([], req2.values, true);
          if (req2.keys)
            req2.keys = __spreadArray([], req2.keys, true);
          return getExistingValues(downTable, req2, keys2).then(function(existingValues) {
            var contexts = keys2.map(function(key, i) {
              var existingValue = existingValues[i];
              var ctx = { onerror: null, onsuccess: null };
              if (req2.type === "delete") {
                deleting.fire.call(ctx, key, existingValue, dxTrans2);
              } else if (req2.type === "add" || existingValue === void 0) {
                var generatedPrimaryKey = creating.fire.call(ctx, key, req2.values[i], dxTrans2);
                if (key == null && generatedPrimaryKey != null) {
                  key = generatedPrimaryKey;
                  req2.keys[i] = key;
                  if (!primaryKey.outbound) {
                    setByKeyPath(req2.values[i], primaryKey.keyPath, key);
                  }
                }
              } else {
                var objectDiff = getObjectDiff(existingValue, req2.values[i]);
                var additionalChanges_1 = updating.fire.call(ctx, objectDiff, key, existingValue, dxTrans2);
                if (additionalChanges_1) {
                  var requestedValue_1 = req2.values[i];
                  Object.keys(additionalChanges_1).forEach(function(keyPath) {
                    if (hasOwn(requestedValue_1, keyPath)) {
                      requestedValue_1[keyPath] = additionalChanges_1[keyPath];
                    } else {
                      setByKeyPath(requestedValue_1, keyPath, additionalChanges_1[keyPath]);
                    }
                  });
                }
              }
              return ctx;
            });
            return downTable.mutate(req2).then(function(_a3) {
              var failures = _a3.failures, results = _a3.results, numFailures = _a3.numFailures, lastResult = _a3.lastResult;
              for (var i = 0; i < keys2.length; ++i) {
                var primKey = results ? results[i] : keys2[i];
                var ctx = contexts[i];
                if (primKey == null) {
                  ctx.onerror && ctx.onerror(failures[i]);
                } else {
                  ctx.onsuccess && ctx.onsuccess(
                    req2.type === "put" && existingValues[i] ? req2.values[i] : primKey
                  );
                }
              }
              return { failures, results, numFailures, lastResult };
            }).catch(function(error) {
              contexts.forEach(function(ctx) {
                return ctx.onerror && ctx.onerror(error);
              });
              return Promise.reject(error);
            });
          });
        }
        function deleteRange(req2) {
          return deleteNextChunk(req2.trans, req2.range, 1e4);
        }
        function deleteNextChunk(trans, range, limit) {
          return downTable.query({ trans, values: false, query: { index: primaryKey, range }, limit }).then(function(_a3) {
            var result = _a3.result;
            return addPutOrDelete({ type: "delete", keys: result, trans }).then(function(res) {
              if (res.numFailures > 0)
                return Promise.reject(res.failures[0]);
              if (result.length < limit) {
                return { failures: [], numFailures: 0, lastResult: void 0 };
              } else {
                return deleteNextChunk(trans, __assign(__assign({}, range), { lower: result[result.length - 1], lowerOpen: true }), limit);
              }
            });
          });
        }
      } });
      return tableMiddleware;
    } });
  }
};
function getExistingValues(table, req, effectiveKeys) {
  return req.type === "add" ? Promise.resolve([]) : table.getMany({ trans: req.trans, keys: effectiveKeys, cache: "immutable" });
}
function getFromTransactionCache(keys2, cache2, clone) {
  try {
    if (!cache2)
      return null;
    if (cache2.keys.length < keys2.length)
      return null;
    var result = [];
    for (var i = 0, j = 0; i < cache2.keys.length && j < keys2.length; ++i) {
      if (cmp(cache2.keys[i], keys2[j]) !== 0)
        continue;
      result.push(clone ? deepClone(cache2.values[i]) : cache2.values[i]);
      ++j;
    }
    return result.length === keys2.length ? result : null;
  } catch (_a2) {
    return null;
  }
}
var cacheExistingValuesMiddleware = {
  stack: "dbcore",
  level: -1,
  create: function(core) {
    return {
      table: function(tableName) {
        var table = core.table(tableName);
        return __assign(__assign({}, table), { getMany: function(req) {
          if (!req.cache) {
            return table.getMany(req);
          }
          var cachedResult = getFromTransactionCache(req.keys, req.trans["_cache"], req.cache === "clone");
          if (cachedResult) {
            return DexiePromise.resolve(cachedResult);
          }
          return table.getMany(req).then(function(res) {
            req.trans["_cache"] = {
              keys: req.keys,
              values: req.cache === "clone" ? deepClone(res) : res
            };
            return res;
          });
        }, mutate: function(req) {
          if (req.type !== "add")
            req.trans["_cache"] = null;
          return table.mutate(req);
        } });
      }
    };
  }
};
function isCachableContext(ctx, table) {
  return ctx.trans.mode === "readonly" && !!ctx.subscr && !ctx.trans.explicit && ctx.trans.db._options.cache !== "disabled" && !table.schema.primaryKey.outbound;
}
function isCachableRequest(type2, req) {
  switch (type2) {
    case "query":
      return req.values && !req.unique;
    case "get":
      return false;
    case "getMany":
      return false;
    case "count":
      return false;
    case "openCursor":
      return false;
  }
}
var observabilityMiddleware = {
  stack: "dbcore",
  level: 0,
  name: "Observability",
  create: function(core) {
    var dbName = core.schema.name;
    var FULL_RANGE = new RangeSet(core.MIN_KEY, core.MAX_KEY);
    return __assign(__assign({}, core), { transaction: function(stores, mode, options) {
      if (PSD.subscr && mode !== "readonly") {
        throw new exceptions.ReadOnly("Readwrite transaction in liveQuery context. Querier source: ".concat(PSD.querier));
      }
      return core.transaction(stores, mode, options);
    }, table: function(tableName) {
      var table = core.table(tableName);
      var schema = table.schema;
      var primaryKey = schema.primaryKey, indexes = schema.indexes;
      var extractKey = primaryKey.extractKey, outbound = primaryKey.outbound;
      var indexesWithAutoIncPK = primaryKey.autoIncrement && indexes.filter(function(index) {
        return index.compound && index.keyPath.includes(primaryKey.keyPath);
      });
      var tableClone = __assign(__assign({}, table), { mutate: function(req) {
        var _a2, _b;
        var trans = req.trans;
        var mutatedParts = req.mutatedParts || (req.mutatedParts = {});
        var getRangeSet = function(indexName) {
          var part = "idb://".concat(dbName, "/").concat(tableName, "/").concat(indexName);
          return mutatedParts[part] || (mutatedParts[part] = new RangeSet());
        };
        var pkRangeSet = getRangeSet("");
        var delsRangeSet = getRangeSet(":dels");
        var type2 = req.type;
        var _c = req.type === "deleteRange" ? [req.range] : req.type === "delete" ? [req.keys] : req.values.length < 50 ? [getEffectiveKeys(primaryKey, req).filter(function(id) {
          return id;
        }), req.values] : [], keys2 = _c[0], newObjs = _c[1];
        var oldCache = req.trans["_cache"];
        if (isArray(keys2)) {
          pkRangeSet.addKeys(keys2);
          var oldObjs = type2 === "delete" || keys2.length === newObjs.length ? getFromTransactionCache(keys2, oldCache) : null;
          if (!oldObjs) {
            delsRangeSet.addKeys(keys2);
          }
          if (oldObjs || newObjs) {
            trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs);
          }
        } else if (keys2) {
          var range = {
            from: (_a2 = keys2.lower) !== null && _a2 !== void 0 ? _a2 : core.MIN_KEY,
            to: (_b = keys2.upper) !== null && _b !== void 0 ? _b : core.MAX_KEY
          };
          delsRangeSet.add(range);
          pkRangeSet.add(range);
        } else {
          pkRangeSet.add(FULL_RANGE);
          delsRangeSet.add(FULL_RANGE);
          schema.indexes.forEach(function(idx) {
            return getRangeSet(idx.name).add(FULL_RANGE);
          });
        }
        return table.mutate(req).then(function(res) {
          if (keys2 && (req.type === "add" || req.type === "put")) {
            pkRangeSet.addKeys(res.results);
            if (indexesWithAutoIncPK) {
              indexesWithAutoIncPK.forEach(function(idx) {
                var idxVals = req.values.map(function(v) {
                  return idx.extractKey(v);
                });
                var pkPos = idx.keyPath.findIndex(function(prop) {
                  return prop === primaryKey.keyPath;
                });
                for (var i = 0, len = res.results.length; i < len; ++i) {
                  idxVals[i][pkPos] = res.results[i];
                }
                getRangeSet(idx.name).addKeys(idxVals);
              });
            }
          }
          trans.mutatedParts = extendObservabilitySet(trans.mutatedParts || {}, mutatedParts);
          return res;
        });
      } });
      var getRange = function(_a2) {
        var _b, _c;
        var _d = _a2.query, index = _d.index, range = _d.range;
        return [
          index,
          new RangeSet((_b = range.lower) !== null && _b !== void 0 ? _b : core.MIN_KEY, (_c = range.upper) !== null && _c !== void 0 ? _c : core.MAX_KEY)
        ];
      };
      var readSubscribers = {
        get: function(req) {
          return [primaryKey, new RangeSet(req.key)];
        },
        getMany: function(req) {
          return [primaryKey, new RangeSet().addKeys(req.keys)];
        },
        count: getRange,
        query: getRange,
        openCursor: getRange
      };
      keys(readSubscribers).forEach(function(method) {
        tableClone[method] = function(req) {
          var subscr = PSD.subscr;
          var isLiveQuery = !!subscr;
          var cachable = isCachableContext(PSD, table) && isCachableRequest(method, req);
          var obsSet = cachable ? req.obsSet = {} : subscr;
          if (isLiveQuery) {
            var getRangeSet = function(indexName) {
              var part = "idb://".concat(dbName, "/").concat(tableName, "/").concat(indexName);
              return obsSet[part] || (obsSet[part] = new RangeSet());
            };
            var pkRangeSet_1 = getRangeSet("");
            var delsRangeSet_1 = getRangeSet(":dels");
            var _a2 = readSubscribers[method](req), queriedIndex = _a2[0], queriedRanges = _a2[1];
            if (method === "query" && queriedIndex.isPrimaryKey && !req.values) {
              delsRangeSet_1.add(queriedRanges);
            } else {
              getRangeSet(queriedIndex.name || "").add(queriedRanges);
            }
            if (!queriedIndex.isPrimaryKey) {
              if (method === "count") {
                delsRangeSet_1.add(FULL_RANGE);
              } else {
                var keysPromise_1 = method === "query" && outbound && req.values && table.query(__assign(__assign({}, req), { values: false }));
                return table[method].apply(this, arguments).then(function(res) {
                  if (method === "query") {
                    if (outbound && req.values) {
                      return keysPromise_1.then(function(_a3) {
                        var resultingKeys = _a3.result;
                        pkRangeSet_1.addKeys(resultingKeys);
                        return res;
                      });
                    }
                    var pKeys = req.values ? res.result.map(extractKey) : res.result;
                    if (req.values) {
                      pkRangeSet_1.addKeys(pKeys);
                    } else {
                      delsRangeSet_1.addKeys(pKeys);
                    }
                  } else if (method === "openCursor") {
                    var cursor_1 = res;
                    var wantValues_1 = req.values;
                    return cursor_1 && Object.create(cursor_1, {
                      key: {
                        get: function() {
                          delsRangeSet_1.addKey(cursor_1.primaryKey);
                          return cursor_1.key;
                        }
                      },
                      primaryKey: {
                        get: function() {
                          var pkey = cursor_1.primaryKey;
                          delsRangeSet_1.addKey(pkey);
                          return pkey;
                        }
                      },
                      value: {
                        get: function() {
                          wantValues_1 && pkRangeSet_1.addKey(cursor_1.primaryKey);
                          return cursor_1.value;
                        }
                      }
                    });
                  }
                  return res;
                });
              }
            }
          }
          return table[method].apply(this, arguments);
        };
      });
      return tableClone;
    } });
  }
};
function trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs) {
  function addAffectedIndex(ix) {
    var rangeSet = getRangeSet(ix.name || "");
    function extractKey(obj) {
      return obj != null ? ix.extractKey(obj) : null;
    }
    var addKeyOrKeys = function(key) {
      return ix.multiEntry && isArray(key) ? key.forEach(function(key2) {
        return rangeSet.addKey(key2);
      }) : rangeSet.addKey(key);
    };
    (oldObjs || newObjs).forEach(function(_, i) {
      var oldKey = oldObjs && extractKey(oldObjs[i]);
      var newKey = newObjs && extractKey(newObjs[i]);
      if (cmp(oldKey, newKey) !== 0) {
        if (oldKey != null)
          addKeyOrKeys(oldKey);
        if (newKey != null)
          addKeyOrKeys(newKey);
      }
    });
  }
  schema.indexes.forEach(addAffectedIndex);
}
function adjustOptimisticFromFailures(tblCache, req, res) {
  if (res.numFailures === 0)
    return req;
  if (req.type === "deleteRange") {
    return null;
  }
  var numBulkOps = req.keys ? req.keys.length : "values" in req && req.values ? req.values.length : 1;
  if (res.numFailures === numBulkOps) {
    return null;
  }
  var clone = __assign({}, req);
  if (isArray(clone.keys)) {
    clone.keys = clone.keys.filter(function(_, i) {
      return !(i in res.failures);
    });
  }
  if ("values" in clone && isArray(clone.values)) {
    clone.values = clone.values.filter(function(_, i) {
      return !(i in res.failures);
    });
  }
  return clone;
}
function isAboveLower(key, range) {
  return range.lower === void 0 ? true : range.lowerOpen ? cmp(key, range.lower) > 0 : cmp(key, range.lower) >= 0;
}
function isBelowUpper(key, range) {
  return range.upper === void 0 ? true : range.upperOpen ? cmp(key, range.upper) < 0 : cmp(key, range.upper) <= 0;
}
function isWithinRange(key, range) {
  return isAboveLower(key, range) && isBelowUpper(key, range);
}
function applyOptimisticOps(result, req, ops, table, cacheEntry, immutable) {
  if (!ops || ops.length === 0)
    return result;
  var index = req.query.index;
  var multiEntry = index.multiEntry;
  var queryRange = req.query.range;
  var primaryKey = table.schema.primaryKey;
  var extractPrimKey = primaryKey.extractKey;
  var extractIndex = index.extractKey;
  var extractLowLevelIndex = (index.lowLevelIndex || index).extractKey;
  var finalResult = ops.reduce(function(result2, op) {
    var modifedResult = result2;
    var includedValues = [];
    if (op.type === "add" || op.type === "put") {
      var includedPKs = new RangeSet();
      for (var i = op.values.length - 1; i >= 0; --i) {
        var value = op.values[i];
        var pk = extractPrimKey(value);
        if (includedPKs.hasKey(pk))
          continue;
        var key = extractIndex(value);
        if (multiEntry && isArray(key) ? key.some(function(k) {
          return isWithinRange(k, queryRange);
        }) : isWithinRange(key, queryRange)) {
          includedPKs.addKey(pk);
          includedValues.push(value);
        }
      }
    }
    switch (op.type) {
      case "add": {
        var existingKeys_1 = new RangeSet().addKeys(req.values ? result2.map(function(v) {
          return extractPrimKey(v);
        }) : result2);
        modifedResult = result2.concat(req.values ? includedValues.filter(function(v) {
          var key2 = extractPrimKey(v);
          if (existingKeys_1.hasKey(key2))
            return false;
          existingKeys_1.addKey(key2);
          return true;
        }) : includedValues.map(function(v) {
          return extractPrimKey(v);
        }).filter(function(k) {
          if (existingKeys_1.hasKey(k))
            return false;
          existingKeys_1.addKey(k);
          return true;
        }));
        break;
      }
      case "put": {
        var keySet_1 = new RangeSet().addKeys(op.values.map(function(v) {
          return extractPrimKey(v);
        }));
        modifedResult = result2.filter(
          function(item) {
            return !keySet_1.hasKey(req.values ? extractPrimKey(item) : item);
          }
        ).concat(
          req.values ? includedValues : includedValues.map(function(v) {
            return extractPrimKey(v);
          })
        );
        break;
      }
      case "delete":
        var keysToDelete_1 = new RangeSet().addKeys(op.keys);
        modifedResult = result2.filter(function(item) {
          return !keysToDelete_1.hasKey(req.values ? extractPrimKey(item) : item);
        });
        break;
      case "deleteRange":
        var range_1 = op.range;
        modifedResult = result2.filter(function(item) {
          return !isWithinRange(extractPrimKey(item), range_1);
        });
        break;
    }
    return modifedResult;
  }, result);
  if (finalResult === result)
    return result;
  finalResult.sort(function(a, b) {
    return cmp(extractLowLevelIndex(a), extractLowLevelIndex(b)) || cmp(extractPrimKey(a), extractPrimKey(b));
  });
  if (req.limit && req.limit < Infinity) {
    if (finalResult.length > req.limit) {
      finalResult.length = req.limit;
    } else if (result.length === req.limit && finalResult.length < req.limit) {
      cacheEntry.dirty = true;
    }
  }
  return immutable ? Object.freeze(finalResult) : finalResult;
}
function areRangesEqual(r1, r2) {
  return cmp(r1.lower, r2.lower) === 0 && cmp(r1.upper, r2.upper) === 0 && !!r1.lowerOpen === !!r2.lowerOpen && !!r1.upperOpen === !!r2.upperOpen;
}
function compareLowers(lower1, lower2, lowerOpen1, lowerOpen2) {
  if (lower1 === void 0)
    return lower2 !== void 0 ? -1 : 0;
  if (lower2 === void 0)
    return 1;
  var c = cmp(lower1, lower2);
  if (c === 0) {
    if (lowerOpen1 && lowerOpen2)
      return 0;
    if (lowerOpen1)
      return 1;
    if (lowerOpen2)
      return -1;
  }
  return c;
}
function compareUppers(upper1, upper2, upperOpen1, upperOpen2) {
  if (upper1 === void 0)
    return upper2 !== void 0 ? 1 : 0;
  if (upper2 === void 0)
    return -1;
  var c = cmp(upper1, upper2);
  if (c === 0) {
    if (upperOpen1 && upperOpen2)
      return 0;
    if (upperOpen1)
      return -1;
    if (upperOpen2)
      return 1;
  }
  return c;
}
function isSuperRange(r1, r2) {
  return compareLowers(r1.lower, r2.lower, r1.lowerOpen, r2.lowerOpen) <= 0 && compareUppers(r1.upper, r2.upper, r1.upperOpen, r2.upperOpen) >= 0;
}
function findCompatibleQuery(dbName, tableName, type2, req) {
  var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
  if (!tblCache)
    return [];
  var queries = tblCache.queries[type2];
  if (!queries)
    return [null, false, tblCache, null];
  var indexName = req.query ? req.query.index.name : null;
  var entries = queries[indexName || ""];
  if (!entries)
    return [null, false, tblCache, null];
  switch (type2) {
    case "query":
      var equalEntry = entries.find(function(entry) {
        return entry.req.limit === req.limit && entry.req.values === req.values && areRangesEqual(entry.req.query.range, req.query.range);
      });
      if (equalEntry)
        return [
          equalEntry,
          true,
          tblCache,
          entries
        ];
      var superEntry = entries.find(function(entry) {
        var limit = "limit" in entry.req ? entry.req.limit : Infinity;
        return limit >= req.limit && (req.values ? entry.req.values : true) && isSuperRange(entry.req.query.range, req.query.range);
      });
      return [superEntry, false, tblCache, entries];
    case "count":
      var countQuery = entries.find(function(entry) {
        return areRangesEqual(entry.req.query.range, req.query.range);
      });
      return [countQuery, !!countQuery, tblCache, entries];
  }
}
function subscribeToCacheEntry(cacheEntry, container, requery, signal) {
  cacheEntry.subscribers.add(requery);
  signal.addEventListener("abort", function() {
    cacheEntry.subscribers.delete(requery);
    if (cacheEntry.subscribers.size === 0) {
      enqueForDeletion(cacheEntry, container);
    }
  });
}
function enqueForDeletion(cacheEntry, container) {
  setTimeout(function() {
    if (cacheEntry.subscribers.size === 0) {
      delArrayItem(container, cacheEntry);
    }
  }, 3e3);
}
var cacheMiddleware = {
  stack: "dbcore",
  level: 0,
  name: "Cache",
  create: function(core) {
    var dbName = core.schema.name;
    var coreMW = __assign(__assign({}, core), { transaction: function(stores, mode, options) {
      var idbtrans = core.transaction(stores, mode, options);
      if (mode === "readwrite") {
        var ac_1 = new AbortController();
        var signal = ac_1.signal;
        var endTransaction = function(wasCommitted) {
          return function() {
            ac_1.abort();
            if (mode === "readwrite") {
              var affectedSubscribers_1 = /* @__PURE__ */ new Set();
              for (var _i = 0, stores_1 = stores; _i < stores_1.length; _i++) {
                var storeName = stores_1[_i];
                var tblCache = cache["idb://".concat(dbName, "/").concat(storeName)];
                if (tblCache) {
                  var table = core.table(storeName);
                  var ops = tblCache.optimisticOps.filter(function(op) {
                    return op.trans === idbtrans;
                  });
                  if (idbtrans._explicit && wasCommitted && idbtrans.mutatedParts) {
                    for (var _a2 = 0, _b = Object.values(tblCache.queries.query); _a2 < _b.length; _a2++) {
                      var entries = _b[_a2];
                      for (var _c = 0, _d = entries.slice(); _c < _d.length; _c++) {
                        var entry = _d[_c];
                        if (obsSetsOverlap(entry.obsSet, idbtrans.mutatedParts)) {
                          delArrayItem(entries, entry);
                          entry.subscribers.forEach(function(requery) {
                            return affectedSubscribers_1.add(requery);
                          });
                        }
                      }
                    }
                  } else if (ops.length > 0) {
                    tblCache.optimisticOps = tblCache.optimisticOps.filter(function(op) {
                      return op.trans !== idbtrans;
                    });
                    for (var _e = 0, _f = Object.values(tblCache.queries.query); _e < _f.length; _e++) {
                      var entries = _f[_e];
                      for (var _g = 0, _h = entries.slice(); _g < _h.length; _g++) {
                        var entry = _h[_g];
                        if (entry.res != null && idbtrans.mutatedParts) {
                          if (wasCommitted && !entry.dirty) {
                            var freezeResults = Object.isFrozen(entry.res);
                            var modRes = applyOptimisticOps(entry.res, entry.req, ops, table, entry, freezeResults);
                            if (entry.dirty) {
                              delArrayItem(entries, entry);
                              entry.subscribers.forEach(function(requery) {
                                return affectedSubscribers_1.add(requery);
                              });
                            } else if (modRes !== entry.res) {
                              entry.res = modRes;
                              entry.promise = DexiePromise.resolve({ result: modRes });
                            }
                          } else {
                            if (entry.dirty) {
                              delArrayItem(entries, entry);
                            }
                            entry.subscribers.forEach(function(requery) {
                              return affectedSubscribers_1.add(requery);
                            });
                          }
                        }
                      }
                    }
                  }
                }
              }
              affectedSubscribers_1.forEach(function(requery) {
                return requery();
              });
            }
          };
        };
        idbtrans.addEventListener("abort", endTransaction(false), {
          signal
        });
        idbtrans.addEventListener("error", endTransaction(false), {
          signal
        });
        idbtrans.addEventListener("complete", endTransaction(true), {
          signal
        });
      }
      return idbtrans;
    }, table: function(tableName) {
      var downTable = core.table(tableName);
      var primKey = downTable.schema.primaryKey;
      var tableMW = __assign(__assign({}, downTable), { mutate: function(req) {
        var trans = PSD.trans;
        if (primKey.outbound || trans.db._options.cache === "disabled" || trans.explicit || trans.idbtrans.mode !== "readwrite") {
          return downTable.mutate(req);
        }
        var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
        if (!tblCache)
          return downTable.mutate(req);
        var promise = downTable.mutate(req);
        if ((req.type === "add" || req.type === "put") && (req.values.length >= 50 || getEffectiveKeys(primKey, req).some(function(key) {
          return key == null;
        }))) {
          promise.then(function(res) {
            var reqWithResolvedKeys = __assign(__assign({}, req), { values: req.values.map(function(value, i) {
              var _a2;
              if (res.failures[i])
                return value;
              var valueWithKey = ((_a2 = primKey.keyPath) === null || _a2 === void 0 ? void 0 : _a2.includes(".")) ? deepClone(value) : __assign({}, value);
              setByKeyPath(valueWithKey, primKey.keyPath, res.results[i]);
              return valueWithKey;
            }) });
            var adjustedReq = adjustOptimisticFromFailures(tblCache, reqWithResolvedKeys, res);
            tblCache.optimisticOps.push(adjustedReq);
            queueMicrotask(function() {
              return req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
            });
          });
        } else {
          tblCache.optimisticOps.push(req);
          req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
          promise.then(function(res) {
            if (res.numFailures > 0) {
              delArrayItem(tblCache.optimisticOps, req);
              var adjustedReq = adjustOptimisticFromFailures(tblCache, req, res);
              if (adjustedReq) {
                tblCache.optimisticOps.push(adjustedReq);
              }
              req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
            }
          });
          promise.catch(function() {
            delArrayItem(tblCache.optimisticOps, req);
            req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
          });
        }
        return promise;
      }, query: function(req) {
        var _a2;
        if (!isCachableContext(PSD, downTable) || !isCachableRequest("query", req))
          return downTable.query(req);
        var freezeResults = ((_a2 = PSD.trans) === null || _a2 === void 0 ? void 0 : _a2.db._options.cache) === "immutable";
        var _b = PSD, requery = _b.requery, signal = _b.signal;
        var _c = findCompatibleQuery(dbName, tableName, "query", req), cacheEntry = _c[0], exactMatch = _c[1], tblCache = _c[2], container = _c[3];
        if (cacheEntry && exactMatch) {
          cacheEntry.obsSet = req.obsSet;
        } else {
          var promise = downTable.query(req).then(function(res) {
            var result = res.result;
            if (cacheEntry)
              cacheEntry.res = result;
            if (freezeResults) {
              for (var i = 0, l = result.length; i < l; ++i) {
                Object.freeze(result[i]);
              }
              Object.freeze(result);
            } else {
              res.result = deepClone(result);
            }
            return res;
          }).catch(function(error) {
            if (container && cacheEntry)
              delArrayItem(container, cacheEntry);
            return Promise.reject(error);
          });
          cacheEntry = {
            obsSet: req.obsSet,
            promise,
            subscribers: /* @__PURE__ */ new Set(),
            type: "query",
            req,
            dirty: false
          };
          if (container) {
            container.push(cacheEntry);
          } else {
            container = [cacheEntry];
            if (!tblCache) {
              tblCache = cache["idb://".concat(dbName, "/").concat(tableName)] = {
                queries: {
                  query: {},
                  count: {}
                },
                objs: /* @__PURE__ */ new Map(),
                optimisticOps: [],
                unsignaledParts: {}
              };
            }
            tblCache.queries.query[req.query.index.name || ""] = container;
          }
        }
        subscribeToCacheEntry(cacheEntry, container, requery, signal);
        return cacheEntry.promise.then(function(res) {
          return {
            result: applyOptimisticOps(res.result, req, tblCache === null || tblCache === void 0 ? void 0 : tblCache.optimisticOps, downTable, cacheEntry, freezeResults)
          };
        });
      } });
      return tableMW;
    } });
    return coreMW;
  }
};
function vipify(target, vipDb) {
  return new Proxy(target, {
    get: function(target2, prop, receiver) {
      if (prop === "db")
        return vipDb;
      return Reflect.get(target2, prop, receiver);
    }
  });
}
var Dexie$1 = (function() {
  function Dexie2(name, options) {
    var _this = this;
    this._middlewares = {};
    this.verno = 0;
    var deps = Dexie2.dependencies;
    this._options = options = __assign({
      addons: Dexie2.addons,
      autoOpen: true,
      indexedDB: deps.indexedDB,
      IDBKeyRange: deps.IDBKeyRange,
      cache: "cloned"
    }, options);
    this._deps = {
      indexedDB: options.indexedDB,
      IDBKeyRange: options.IDBKeyRange
    };
    var addons = options.addons;
    this._dbSchema = {};
    this._versions = [];
    this._storeNames = [];
    this._allTables = {};
    this.idbdb = null;
    this._novip = this;
    var state = {
      dbOpenError: null,
      isBeingOpened: false,
      onReadyBeingFired: null,
      openComplete: false,
      dbReadyResolve: nop,
      dbReadyPromise: null,
      cancelOpen: nop,
      openCanceller: null,
      autoSchema: true,
      PR1398_maxLoop: 3,
      autoOpen: options.autoOpen
    };
    state.dbReadyPromise = new DexiePromise(function(resolve) {
      state.dbReadyResolve = resolve;
    });
    state.openCanceller = new DexiePromise(function(_, reject) {
      state.cancelOpen = reject;
    });
    this._state = state;
    this.name = name;
    this.on = Events(this, "populate", "blocked", "versionchange", "close", { ready: [promisableChain, nop] });
    this.once = function(event, callback) {
      var fn = function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        _this.on(event).unsubscribe(fn);
        callback.apply(_this, args);
      };
      return _this.on(event, fn);
    };
    this.on.ready.subscribe = override(this.on.ready.subscribe, function(subscribe) {
      return function(subscriber, bSticky) {
        Dexie2.vip(function() {
          var state2 = _this._state;
          if (state2.openComplete) {
            if (!state2.dbOpenError)
              DexiePromise.resolve().then(subscriber);
            if (bSticky)
              subscribe(subscriber);
          } else if (state2.onReadyBeingFired) {
            state2.onReadyBeingFired.push(subscriber);
            if (bSticky)
              subscribe(subscriber);
          } else {
            subscribe(subscriber);
            var db_1 = _this;
            if (!bSticky)
              subscribe(function unsubscribe() {
                db_1.on.ready.unsubscribe(subscriber);
                db_1.on.ready.unsubscribe(unsubscribe);
              });
          }
        });
      };
    });
    this.Collection = createCollectionConstructor(this);
    this.Table = createTableConstructor(this);
    this.Transaction = createTransactionConstructor(this);
    this.Version = createVersionConstructor(this);
    this.WhereClause = createWhereClauseConstructor(this);
    this.on("versionchange", function(ev) {
      if (ev.newVersion > 0)
        console.warn("Another connection wants to upgrade database '".concat(_this.name, "'. Closing db now to resume the upgrade."));
      else
        console.warn("Another connection wants to delete database '".concat(_this.name, "'. Closing db now to resume the delete request."));
      _this.close({ disableAutoOpen: false });
    });
    this.on("blocked", function(ev) {
      if (!ev.newVersion || ev.newVersion < ev.oldVersion)
        console.warn("Dexie.delete('".concat(_this.name, "') was blocked"));
      else
        console.warn("Upgrade '".concat(_this.name, "' blocked by other connection holding version ").concat(ev.oldVersion / 10));
    });
    this._maxKey = getMaxKey(options.IDBKeyRange);
    this._createTransaction = function(mode, storeNames, dbschema, parentTransaction) {
      return new _this.Transaction(mode, storeNames, dbschema, _this._options.chromeTransactionDurability, parentTransaction);
    };
    this._fireOnBlocked = function(ev) {
      _this.on("blocked").fire(ev);
      connections.filter(function(c) {
        return c.name === _this.name && c !== _this && !c._state.vcFired;
      }).map(function(c) {
        return c.on("versionchange").fire(ev);
      });
    };
    this.use(cacheExistingValuesMiddleware);
    this.use(cacheMiddleware);
    this.use(observabilityMiddleware);
    this.use(virtualIndexMiddleware);
    this.use(hooksMiddleware);
    var vipDB = new Proxy(this, {
      get: function(_, prop, receiver) {
        if (prop === "_vip")
          return true;
        if (prop === "table")
          return function(tableName) {
            return vipify(_this.table(tableName), vipDB);
          };
        var rv = Reflect.get(_, prop, receiver);
        if (rv instanceof Table)
          return vipify(rv, vipDB);
        if (prop === "tables")
          return rv.map(function(t) {
            return vipify(t, vipDB);
          });
        if (prop === "_createTransaction")
          return function() {
            var tx = rv.apply(this, arguments);
            return vipify(tx, vipDB);
          };
        return rv;
      }
    });
    this.vip = vipDB;
    addons.forEach(function(addon) {
      return addon(_this);
    });
  }
  Dexie2.prototype.version = function(versionNumber) {
    if (isNaN(versionNumber) || versionNumber < 0.1)
      throw new exceptions.Type("Given version is not a positive number");
    versionNumber = Math.round(versionNumber * 10) / 10;
    if (this.idbdb || this._state.isBeingOpened)
      throw new exceptions.Schema("Cannot add version when database is open");
    this.verno = Math.max(this.verno, versionNumber);
    var versions = this._versions;
    var versionInstance = versions.filter(function(v) {
      return v._cfg.version === versionNumber;
    })[0];
    if (versionInstance)
      return versionInstance;
    versionInstance = new this.Version(versionNumber);
    versions.push(versionInstance);
    versions.sort(lowerVersionFirst);
    versionInstance.stores({});
    this._state.autoSchema = false;
    return versionInstance;
  };
  Dexie2.prototype._whenReady = function(fn) {
    var _this = this;
    return this.idbdb && (this._state.openComplete || PSD.letThrough || this._vip) ? fn() : new DexiePromise(function(resolve, reject) {
      if (_this._state.openComplete) {
        return reject(new exceptions.DatabaseClosed(_this._state.dbOpenError));
      }
      if (!_this._state.isBeingOpened) {
        if (!_this._state.autoOpen) {
          reject(new exceptions.DatabaseClosed());
          return;
        }
        _this.open().catch(nop);
      }
      _this._state.dbReadyPromise.then(resolve, reject);
    }).then(fn);
  };
  Dexie2.prototype.use = function(_a2) {
    var stack = _a2.stack, create = _a2.create, level = _a2.level, name = _a2.name;
    if (name)
      this.unuse({ stack, name });
    var middlewares = this._middlewares[stack] || (this._middlewares[stack] = []);
    middlewares.push({ stack, create, level: level == null ? 10 : level, name });
    middlewares.sort(function(a, b) {
      return a.level - b.level;
    });
    return this;
  };
  Dexie2.prototype.unuse = function(_a2) {
    var stack = _a2.stack, name = _a2.name, create = _a2.create;
    if (stack && this._middlewares[stack]) {
      this._middlewares[stack] = this._middlewares[stack].filter(function(mw) {
        return create ? mw.create !== create : name ? mw.name !== name : false;
      });
    }
    return this;
  };
  Dexie2.prototype.open = function() {
    var _this = this;
    return usePSD(
      globalPSD,
      function() {
        return dexieOpen(_this);
      }
    );
  };
  Dexie2.prototype._close = function() {
    this.on.close.fire(new CustomEvent("close"));
    var state = this._state;
    var idx = connections.indexOf(this);
    if (idx >= 0)
      connections.splice(idx, 1);
    if (this.idbdb) {
      try {
        this.idbdb.close();
      } catch (e) {
      }
      this.idbdb = null;
    }
    if (!state.isBeingOpened) {
      state.dbReadyPromise = new DexiePromise(function(resolve) {
        state.dbReadyResolve = resolve;
      });
      state.openCanceller = new DexiePromise(function(_, reject) {
        state.cancelOpen = reject;
      });
    }
  };
  Dexie2.prototype.close = function(_a2) {
    var _b = _a2 === void 0 ? { disableAutoOpen: true } : _a2, disableAutoOpen = _b.disableAutoOpen;
    var state = this._state;
    if (disableAutoOpen) {
      if (state.isBeingOpened) {
        state.cancelOpen(new exceptions.DatabaseClosed());
      }
      this._close();
      state.autoOpen = false;
      state.dbOpenError = new exceptions.DatabaseClosed();
    } else {
      this._close();
      state.autoOpen = this._options.autoOpen || state.isBeingOpened;
      state.openComplete = false;
      state.dbOpenError = null;
    }
  };
  Dexie2.prototype.delete = function(closeOptions) {
    var _this = this;
    if (closeOptions === void 0) {
      closeOptions = { disableAutoOpen: true };
    }
    var hasInvalidArguments = arguments.length > 0 && typeof arguments[0] !== "object";
    var state = this._state;
    return new DexiePromise(function(resolve, reject) {
      var doDelete = function() {
        _this.close(closeOptions);
        var req = _this._deps.indexedDB.deleteDatabase(_this.name);
        req.onsuccess = wrap(function() {
          _onDatabaseDeleted(_this._deps, _this.name);
          resolve();
        });
        req.onerror = eventRejectHandler(reject);
        req.onblocked = _this._fireOnBlocked;
      };
      if (hasInvalidArguments)
        throw new exceptions.InvalidArgument("Invalid closeOptions argument to db.delete()");
      if (state.isBeingOpened) {
        state.dbReadyPromise.then(doDelete);
      } else {
        doDelete();
      }
    });
  };
  Dexie2.prototype.backendDB = function() {
    return this.idbdb;
  };
  Dexie2.prototype.isOpen = function() {
    return this.idbdb !== null;
  };
  Dexie2.prototype.hasBeenClosed = function() {
    var dbOpenError = this._state.dbOpenError;
    return dbOpenError && dbOpenError.name === "DatabaseClosed";
  };
  Dexie2.prototype.hasFailed = function() {
    return this._state.dbOpenError !== null;
  };
  Dexie2.prototype.dynamicallyOpened = function() {
    return this._state.autoSchema;
  };
  Object.defineProperty(Dexie2.prototype, "tables", {
    get: function() {
      var _this = this;
      return keys(this._allTables).map(function(name) {
        return _this._allTables[name];
      });
    },
    enumerable: false,
    configurable: true
  });
  Dexie2.prototype.transaction = function() {
    var args = extractTransactionArgs.apply(this, arguments);
    return this._transaction.apply(this, args);
  };
  Dexie2.prototype._transaction = function(mode, tables, scopeFunc) {
    var _this = this;
    var parentTransaction = PSD.trans;
    if (!parentTransaction || parentTransaction.db !== this || mode.indexOf("!") !== -1)
      parentTransaction = null;
    var onlyIfCompatible = mode.indexOf("?") !== -1;
    mode = mode.replace("!", "").replace("?", "");
    var idbMode, storeNames;
    try {
      storeNames = tables.map(function(table) {
        var storeName = table instanceof _this.Table ? table.name : table;
        if (typeof storeName !== "string")
          throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
        return storeName;
      });
      if (mode == "r" || mode === READONLY)
        idbMode = READONLY;
      else if (mode == "rw" || mode == READWRITE)
        idbMode = READWRITE;
      else
        throw new exceptions.InvalidArgument("Invalid transaction mode: " + mode);
      if (parentTransaction) {
        if (parentTransaction.mode === READONLY && idbMode === READWRITE) {
          if (onlyIfCompatible) {
            parentTransaction = null;
          } else
            throw new exceptions.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
        }
        if (parentTransaction) {
          storeNames.forEach(function(storeName) {
            if (parentTransaction && parentTransaction.storeNames.indexOf(storeName) === -1) {
              if (onlyIfCompatible) {
                parentTransaction = null;
              } else
                throw new exceptions.SubTransaction("Table " + storeName + " not included in parent transaction.");
            }
          });
        }
        if (onlyIfCompatible && parentTransaction && !parentTransaction.active) {
          parentTransaction = null;
        }
      }
    } catch (e) {
      return parentTransaction ? parentTransaction._promise(null, function(_, reject) {
        reject(e);
      }) : rejection(e);
    }
    var enterTransaction = enterTransactionScope.bind(null, this, idbMode, storeNames, parentTransaction, scopeFunc);
    return parentTransaction ? parentTransaction._promise(idbMode, enterTransaction, "lock") : PSD.trans ? usePSD(PSD.transless, function() {
      return _this._whenReady(enterTransaction);
    }) : this._whenReady(enterTransaction);
  };
  Dexie2.prototype.table = function(tableName) {
    if (!hasOwn(this._allTables, tableName)) {
      throw new exceptions.InvalidTable("Table ".concat(tableName, " does not exist"));
    }
    return this._allTables[tableName];
  };
  return Dexie2;
})();
var symbolObservable = typeof Symbol !== "undefined" && "observable" in Symbol ? Symbol.observable : "@@observable";
var Observable = (function() {
  function Observable2(subscribe) {
    this._subscribe = subscribe;
  }
  Observable2.prototype.subscribe = function(x, error, complete) {
    return this._subscribe(!x || typeof x === "function" ? { next: x, error, complete } : x);
  };
  Observable2.prototype[symbolObservable] = function() {
    return this;
  };
  return Observable2;
})();
var domDeps;
try {
  domDeps = {
    indexedDB: _global.indexedDB || _global.mozIndexedDB || _global.webkitIndexedDB || _global.msIndexedDB,
    IDBKeyRange: _global.IDBKeyRange || _global.webkitIDBKeyRange
  };
} catch (e) {
  domDeps = { indexedDB: null, IDBKeyRange: null };
}
function liveQuery(querier) {
  var hasValue = false;
  var currentValue;
  var observable = new Observable(function(observer) {
    var scopeFuncIsAsync = isAsyncFunction(querier);
    function execute(ctx) {
      var wasRootExec = beginMicroTickScope();
      try {
        if (scopeFuncIsAsync) {
          incrementExpectedAwaits();
        }
        var rv = newScope(querier, ctx);
        if (scopeFuncIsAsync) {
          rv = rv.finally(decrementExpectedAwaits);
        }
        return rv;
      } finally {
        wasRootExec && endMicroTickScope();
      }
    }
    var closed = false;
    var abortController;
    var accumMuts = {};
    var currentObs = {};
    var subscription = {
      get closed() {
        return closed;
      },
      unsubscribe: function() {
        if (closed)
          return;
        closed = true;
        if (abortController)
          abortController.abort();
        if (startedListening)
          globalEvents.storagemutated.unsubscribe(mutationListener);
      }
    };
    observer.start && observer.start(subscription);
    var startedListening = false;
    var doQuery = function() {
      return execInGlobalContext(_doQuery);
    };
    function shouldNotify() {
      return obsSetsOverlap(currentObs, accumMuts);
    }
    var mutationListener = function(parts) {
      extendObservabilitySet(accumMuts, parts);
      if (shouldNotify()) {
        doQuery();
      }
    };
    var _doQuery = function() {
      if (closed || !domDeps.indexedDB) {
        return;
      }
      accumMuts = {};
      var subscr = {};
      if (abortController)
        abortController.abort();
      abortController = new AbortController();
      var ctx = {
        subscr,
        signal: abortController.signal,
        requery: doQuery,
        querier,
        trans: null
      };
      var ret = execute(ctx);
      Promise.resolve(ret).then(function(result) {
        hasValue = true;
        currentValue = result;
        if (closed || ctx.signal.aborted) {
          return;
        }
        accumMuts = {};
        currentObs = subscr;
        if (!objectIsEmpty(currentObs) && !startedListening) {
          globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, mutationListener);
          startedListening = true;
        }
        execInGlobalContext(function() {
          return !closed && observer.next && observer.next(result);
        });
      }, function(err) {
        hasValue = false;
        if (!["DatabaseClosedError", "AbortError"].includes(err === null || err === void 0 ? void 0 : err.name)) {
          if (!closed)
            execInGlobalContext(function() {
              if (closed)
                return;
              observer.error && observer.error(err);
            });
        }
      });
    };
    setTimeout(doQuery, 0);
    return subscription;
  });
  observable.hasValue = function() {
    return hasValue;
  };
  observable.getValue = function() {
    return currentValue;
  };
  return observable;
}
var Dexie = Dexie$1;
props(Dexie, __assign(__assign({}, fullNameExceptions), {
  delete: function(databaseName) {
    var db2 = new Dexie(databaseName, { addons: [] });
    return db2.delete();
  },
  exists: function(name) {
    return new Dexie(name, { addons: [] }).open().then(function(db2) {
      db2.close();
      return true;
    }).catch("NoSuchDatabaseError", function() {
      return false;
    });
  },
  getDatabaseNames: function(cb) {
    try {
      return getDatabaseNames(Dexie.dependencies).then(cb);
    } catch (_a2) {
      return rejection(new exceptions.MissingAPI());
    }
  },
  defineClass: function() {
    function Class(content) {
      extend(this, content);
    }
    return Class;
  },
  ignoreTransaction: function(scopeFunc) {
    return PSD.trans ? usePSD(PSD.transless, scopeFunc) : scopeFunc();
  },
  vip,
  async: function(generatorFn) {
    return function() {
      try {
        var rv = awaitIterator(generatorFn.apply(this, arguments));
        if (!rv || typeof rv.then !== "function")
          return DexiePromise.resolve(rv);
        return rv;
      } catch (e) {
        return rejection(e);
      }
    };
  },
  spawn: function(generatorFn, args, thiz) {
    try {
      var rv = awaitIterator(generatorFn.apply(thiz, args || []));
      if (!rv || typeof rv.then !== "function")
        return DexiePromise.resolve(rv);
      return rv;
    } catch (e) {
      return rejection(e);
    }
  },
  currentTransaction: {
    get: function() {
      return PSD.trans || null;
    }
  },
  waitFor: function(promiseOrFunction, optionalTimeout) {
    var promise = DexiePromise.resolve(typeof promiseOrFunction === "function" ? Dexie.ignoreTransaction(promiseOrFunction) : promiseOrFunction).timeout(optionalTimeout || 6e4);
    return PSD.trans ? PSD.trans.waitFor(promise) : promise;
  },
  Promise: DexiePromise,
  debug: {
    get: function() {
      return debug;
    },
    set: function(value) {
      setDebug(value);
    }
  },
  derive,
  extend,
  props,
  override,
  Events,
  on: globalEvents,
  liveQuery,
  extendObservabilitySet,
  getByKeyPath,
  setByKeyPath,
  delByKeyPath,
  shallowClone,
  deepClone,
  getObjectDiff,
  cmp,
  asap: asap$1,
  minKey,
  addons: [],
  connections,
  errnames,
  dependencies: domDeps,
  cache,
  semVer: DEXIE_VERSION,
  version: DEXIE_VERSION.split(".").map(function(n) {
    return parseInt(n);
  }).reduce(function(p, c, i) {
    return p + c / Math.pow(10, i * 2);
  })
}));
Dexie.maxKey = getMaxKey(Dexie.dependencies.IDBKeyRange);
if (typeof dispatchEvent !== "undefined" && typeof addEventListener !== "undefined") {
  globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, function(updatedParts) {
    if (!propagatingLocally) {
      var event_1;
      event_1 = new CustomEvent(STORAGE_MUTATED_DOM_EVENT_NAME, {
        detail: updatedParts
      });
      propagatingLocally = true;
      dispatchEvent(event_1);
      propagatingLocally = false;
    }
  });
  addEventListener(STORAGE_MUTATED_DOM_EVENT_NAME, function(_a2) {
    var detail = _a2.detail;
    if (!propagatingLocally) {
      propagateLocally(detail);
    }
  });
}
function propagateLocally(updateParts) {
  var wasMe = propagatingLocally;
  try {
    propagatingLocally = true;
    globalEvents.storagemutated.fire(updateParts);
    signalSubscribersNow(updateParts, true);
  } finally {
    propagatingLocally = wasMe;
  }
}
var propagatingLocally = false;
var bc;
var createBC = function() {
};
if (typeof BroadcastChannel !== "undefined") {
  createBC = function() {
    bc = new BroadcastChannel(STORAGE_MUTATED_DOM_EVENT_NAME);
    bc.onmessage = function(ev) {
      return ev.data && propagateLocally(ev.data);
    };
  };
  createBC();
  if (typeof bc.unref === "function") {
    bc.unref();
  }
  globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, function(changedParts) {
    if (!propagatingLocally) {
      bc.postMessage(changedParts);
    }
  });
}
if (typeof addEventListener !== "undefined") {
  addEventListener("pagehide", function(event) {
    if (!Dexie$1.disableBfCache && event.persisted) {
      if (debug)
        console.debug("Dexie: handling persisted pagehide");
      bc === null || bc === void 0 ? void 0 : bc.close();
      for (var _i = 0, connections_1 = connections; _i < connections_1.length; _i++) {
        var db2 = connections_1[_i];
        db2.close({ disableAutoOpen: false });
      }
    }
  });
  addEventListener("pageshow", function(event) {
    if (!Dexie$1.disableBfCache && event.persisted) {
      if (debug)
        console.debug("Dexie: handling persisted pageshow");
      createBC();
      propagateLocally({ all: new RangeSet(-Infinity, [[]]) });
    }
  });
}
DexiePromise.rejectionMapper = mapError;
setDebug(debug);

// src/db/database.js
var db = new Dexie$1("aIrrangeUniversal");
db.version(1).stores({
  conversations: "id, url, provider, timestamp, title",
  tags: "id, conv_id, label"
});
db.version(2).stores({
  conversations: "id, url, provider, timestamp, title",
  tags: "id, conv_id, label"
});
db.version(3).stores({
  conversations: "id, url, provider, timestamp, title, *stemmed_tags, *trigrams",
  tags: "id, conv_id, label"
});

// vendor/jszip.min.js
!(function(e) {
  if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();
  else if ("function" == typeof define && define.amd) define([], e);
  else {
    ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).JSZip = e();
  }
})(function() {
  return (function s(a, o, h) {
    function u(r, e2) {
      if (!o[r]) {
        if (!a[r]) {
          var t = "function" == typeof __require && __require;
          if (!e2 && t) return t(r, true);
          if (l) return l(r, true);
          var n = new Error("Cannot find module '" + r + "'");
          throw n.code = "MODULE_NOT_FOUND", n;
        }
        var i = o[r] = { exports: {} };
        a[r][0].call(i.exports, function(e3) {
          var t2 = a[r][1][e3];
          return u(t2 || e3);
        }, i, i.exports, s, a, o, h);
      }
      return o[r].exports;
    }
    for (var l = "function" == typeof __require && __require, e = 0; e < h.length; e++) u(h[e]);
    return u;
  })({ 1: [function(e, t, r) {
    "use strict";
    var d = e("./utils"), c = e("./support"), p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    r.encode = function(e2) {
      for (var t2, r2, n, i, s, a, o, h = [], u = 0, l = e2.length, f = l, c2 = "string" !== d.getTypeOf(e2); u < e2.length; ) f = l - u, n = c2 ? (t2 = e2[u++], r2 = u < l ? e2[u++] : 0, u < l ? e2[u++] : 0) : (t2 = e2.charCodeAt(u++), r2 = u < l ? e2.charCodeAt(u++) : 0, u < l ? e2.charCodeAt(u++) : 0), i = t2 >> 2, s = (3 & t2) << 4 | r2 >> 4, a = 1 < f ? (15 & r2) << 2 | n >> 6 : 64, o = 2 < f ? 63 & n : 64, h.push(p.charAt(i) + p.charAt(s) + p.charAt(a) + p.charAt(o));
      return h.join("");
    }, r.decode = function(e2) {
      var t2, r2, n, i, s, a, o = 0, h = 0, u = "data:";
      if (e2.substr(0, u.length) === u) throw new Error("Invalid base64 input, it looks like a data url.");
      var l, f = 3 * (e2 = e2.replace(/[^A-Za-z0-9+/=]/g, "")).length / 4;
      if (e2.charAt(e2.length - 1) === p.charAt(64) && f--, e2.charAt(e2.length - 2) === p.charAt(64) && f--, f % 1 != 0) throw new Error("Invalid base64 input, bad content length.");
      for (l = c.uint8array ? new Uint8Array(0 | f) : new Array(0 | f); o < e2.length; ) t2 = p.indexOf(e2.charAt(o++)) << 2 | (i = p.indexOf(e2.charAt(o++))) >> 4, r2 = (15 & i) << 4 | (s = p.indexOf(e2.charAt(o++))) >> 2, n = (3 & s) << 6 | (a = p.indexOf(e2.charAt(o++))), l[h++] = t2, 64 !== s && (l[h++] = r2), 64 !== a && (l[h++] = n);
      return l;
    };
  }, { "./support": 30, "./utils": 32 }], 2: [function(e, t, r) {
    "use strict";
    var n = e("./external"), i = e("./stream/DataWorker"), s = e("./stream/Crc32Probe"), a = e("./stream/DataLengthProbe");
    function o(e2, t2, r2, n2, i2) {
      this.compressedSize = e2, this.uncompressedSize = t2, this.crc32 = r2, this.compression = n2, this.compressedContent = i2;
    }
    o.prototype = { getContentWorker: function() {
      var e2 = new i(n.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")), t2 = this;
      return e2.on("end", function() {
        if (this.streamInfo.data_length !== t2.uncompressedSize) throw new Error("Bug : uncompressed data size mismatch");
      }), e2;
    }, getCompressedWorker: function() {
      return new i(n.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
    } }, o.createWorkerFrom = function(e2, t2, r2) {
      return e2.pipe(new s()).pipe(new a("uncompressedSize")).pipe(t2.compressWorker(r2)).pipe(new a("compressedSize")).withStreamInfo("compression", t2);
    }, t.exports = o;
  }, { "./external": 6, "./stream/Crc32Probe": 25, "./stream/DataLengthProbe": 26, "./stream/DataWorker": 27 }], 3: [function(e, t, r) {
    "use strict";
    var n = e("./stream/GenericWorker");
    r.STORE = { magic: "\0\0", compressWorker: function() {
      return new n("STORE compression");
    }, uncompressWorker: function() {
      return new n("STORE decompression");
    } }, r.DEFLATE = e("./flate");
  }, { "./flate": 7, "./stream/GenericWorker": 28 }], 4: [function(e, t, r) {
    "use strict";
    var n = e("./utils");
    var o = (function() {
      for (var e2, t2 = [], r2 = 0; r2 < 256; r2++) {
        e2 = r2;
        for (var n2 = 0; n2 < 8; n2++) e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
        t2[r2] = e2;
      }
      return t2;
    })();
    t.exports = function(e2, t2) {
      return void 0 !== e2 && e2.length ? "string" !== n.getTypeOf(e2) ? (function(e3, t3, r2, n2) {
        var i = o, s = n2 + r2;
        e3 ^= -1;
        for (var a = n2; a < s; a++) e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3[a])];
        return -1 ^ e3;
      })(0 | t2, e2, e2.length, 0) : (function(e3, t3, r2, n2) {
        var i = o, s = n2 + r2;
        e3 ^= -1;
        for (var a = n2; a < s; a++) e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3.charCodeAt(a))];
        return -1 ^ e3;
      })(0 | t2, e2, e2.length, 0) : 0;
    };
  }, { "./utils": 32 }], 5: [function(e, t, r) {
    "use strict";
    r.base64 = false, r.binary = false, r.dir = false, r.createFolders = true, r.date = null, r.compression = null, r.compressionOptions = null, r.comment = null, r.unixPermissions = null, r.dosPermissions = null;
  }, {}], 6: [function(e, t, r) {
    "use strict";
    var n = null;
    n = "undefined" != typeof Promise ? Promise : e("lie"), t.exports = { Promise: n };
  }, { lie: 37 }], 7: [function(e, t, r) {
    "use strict";
    var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Uint32Array, i = e("pako"), s = e("./utils"), a = e("./stream/GenericWorker"), o = n ? "uint8array" : "array";
    function h(e2, t2) {
      a.call(this, "FlateWorker/" + e2), this._pako = null, this._pakoAction = e2, this._pakoOptions = t2, this.meta = {};
    }
    r.magic = "\b\0", s.inherits(h, a), h.prototype.processChunk = function(e2) {
      this.meta = e2.meta, null === this._pako && this._createPako(), this._pako.push(s.transformTo(o, e2.data), false);
    }, h.prototype.flush = function() {
      a.prototype.flush.call(this), null === this._pako && this._createPako(), this._pako.push([], true);
    }, h.prototype.cleanUp = function() {
      a.prototype.cleanUp.call(this), this._pako = null;
    }, h.prototype._createPako = function() {
      this._pako = new i[this._pakoAction]({ raw: true, level: this._pakoOptions.level || -1 });
      var t2 = this;
      this._pako.onData = function(e2) {
        t2.push({ data: e2, meta: t2.meta });
      };
    }, r.compressWorker = function(e2) {
      return new h("Deflate", e2);
    }, r.uncompressWorker = function() {
      return new h("Inflate", {});
    };
  }, { "./stream/GenericWorker": 28, "./utils": 32, pako: 38 }], 8: [function(e, t, r) {
    "use strict";
    function A(e2, t2) {
      var r2, n2 = "";
      for (r2 = 0; r2 < t2; r2++) n2 += String.fromCharCode(255 & e2), e2 >>>= 8;
      return n2;
    }
    function n(e2, t2, r2, n2, i2, s2) {
      var a, o, h = e2.file, u = e2.compression, l = s2 !== O.utf8encode, f = I.transformTo("string", s2(h.name)), c = I.transformTo("string", O.utf8encode(h.name)), d = h.comment, p = I.transformTo("string", s2(d)), m = I.transformTo("string", O.utf8encode(d)), _ = c.length !== h.name.length, g = m.length !== d.length, b = "", v = "", y = "", w = h.dir, k = h.date, x = { crc32: 0, compressedSize: 0, uncompressedSize: 0 };
      t2 && !r2 || (x.crc32 = e2.crc32, x.compressedSize = e2.compressedSize, x.uncompressedSize = e2.uncompressedSize);
      var S = 0;
      t2 && (S |= 8), l || !_ && !g || (S |= 2048);
      var z = 0, C = 0;
      w && (z |= 16), "UNIX" === i2 ? (C = 798, z |= (function(e3, t3) {
        var r3 = e3;
        return e3 || (r3 = t3 ? 16893 : 33204), (65535 & r3) << 16;
      })(h.unixPermissions, w)) : (C = 20, z |= (function(e3) {
        return 63 & (e3 || 0);
      })(h.dosPermissions)), a = k.getUTCHours(), a <<= 6, a |= k.getUTCMinutes(), a <<= 5, a |= k.getUTCSeconds() / 2, o = k.getUTCFullYear() - 1980, o <<= 4, o |= k.getUTCMonth() + 1, o <<= 5, o |= k.getUTCDate(), _ && (v = A(1, 1) + A(B(f), 4) + c, b += "up" + A(v.length, 2) + v), g && (y = A(1, 1) + A(B(p), 4) + m, b += "uc" + A(y.length, 2) + y);
      var E = "";
      return E += "\n\0", E += A(S, 2), E += u.magic, E += A(a, 2), E += A(o, 2), E += A(x.crc32, 4), E += A(x.compressedSize, 4), E += A(x.uncompressedSize, 4), E += A(f.length, 2), E += A(b.length, 2), { fileRecord: R.LOCAL_FILE_HEADER + E + f + b, dirRecord: R.CENTRAL_FILE_HEADER + A(C, 2) + E + A(p.length, 2) + "\0\0\0\0" + A(z, 4) + A(n2, 4) + f + b + p };
    }
    var I = e("../utils"), i = e("../stream/GenericWorker"), O = e("../utf8"), B = e("../crc32"), R = e("../signature");
    function s(e2, t2, r2, n2) {
      i.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = t2, this.zipPlatform = r2, this.encodeFileName = n2, this.streamFiles = e2, this.accumulate = false, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [];
    }
    I.inherits(s, i), s.prototype.push = function(e2) {
      var t2 = e2.meta.percent || 0, r2 = this.entriesCount, n2 = this._sources.length;
      this.accumulate ? this.contentBuffer.push(e2) : (this.bytesWritten += e2.data.length, i.prototype.push.call(this, { data: e2.data, meta: { currentFile: this.currentFile, percent: r2 ? (t2 + 100 * (r2 - n2 - 1)) / r2 : 100 } }));
    }, s.prototype.openedSource = function(e2) {
      this.currentSourceOffset = this.bytesWritten, this.currentFile = e2.file.name;
      var t2 = this.streamFiles && !e2.file.dir;
      if (t2) {
        var r2 = n(e2, t2, false, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
        this.push({ data: r2.fileRecord, meta: { percent: 0 } });
      } else this.accumulate = true;
    }, s.prototype.closedSource = function(e2) {
      this.accumulate = false;
      var t2 = this.streamFiles && !e2.file.dir, r2 = n(e2, t2, true, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
      if (this.dirRecords.push(r2.dirRecord), t2) this.push({ data: (function(e3) {
        return R.DATA_DESCRIPTOR + A(e3.crc32, 4) + A(e3.compressedSize, 4) + A(e3.uncompressedSize, 4);
      })(e2), meta: { percent: 100 } });
      else for (this.push({ data: r2.fileRecord, meta: { percent: 0 } }); this.contentBuffer.length; ) this.push(this.contentBuffer.shift());
      this.currentFile = null;
    }, s.prototype.flush = function() {
      for (var e2 = this.bytesWritten, t2 = 0; t2 < this.dirRecords.length; t2++) this.push({ data: this.dirRecords[t2], meta: { percent: 100 } });
      var r2 = this.bytesWritten - e2, n2 = (function(e3, t3, r3, n3, i2) {
        var s2 = I.transformTo("string", i2(n3));
        return R.CENTRAL_DIRECTORY_END + "\0\0\0\0" + A(e3, 2) + A(e3, 2) + A(t3, 4) + A(r3, 4) + A(s2.length, 2) + s2;
      })(this.dirRecords.length, r2, e2, this.zipComment, this.encodeFileName);
      this.push({ data: n2, meta: { percent: 100 } });
    }, s.prototype.prepareNextSource = function() {
      this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume();
    }, s.prototype.registerPrevious = function(e2) {
      this._sources.push(e2);
      var t2 = this;
      return e2.on("data", function(e3) {
        t2.processChunk(e3);
      }), e2.on("end", function() {
        t2.closedSource(t2.previous.streamInfo), t2._sources.length ? t2.prepareNextSource() : t2.end();
      }), e2.on("error", function(e3) {
        t2.error(e3);
      }), this;
    }, s.prototype.resume = function() {
      return !!i.prototype.resume.call(this) && (!this.previous && this._sources.length ? (this.prepareNextSource(), true) : this.previous || this._sources.length || this.generatedError ? void 0 : (this.end(), true));
    }, s.prototype.error = function(e2) {
      var t2 = this._sources;
      if (!i.prototype.error.call(this, e2)) return false;
      for (var r2 = 0; r2 < t2.length; r2++) try {
        t2[r2].error(e2);
      } catch (e3) {
      }
      return true;
    }, s.prototype.lock = function() {
      i.prototype.lock.call(this);
      for (var e2 = this._sources, t2 = 0; t2 < e2.length; t2++) e2[t2].lock();
    }, t.exports = s;
  }, { "../crc32": 4, "../signature": 23, "../stream/GenericWorker": 28, "../utf8": 31, "../utils": 32 }], 9: [function(e, t, r) {
    "use strict";
    var u = e("../compressions"), n = e("./ZipFileWorker");
    r.generateWorker = function(e2, a, t2) {
      var o = new n(a.streamFiles, t2, a.platform, a.encodeFileName), h = 0;
      try {
        e2.forEach(function(e3, t3) {
          h++;
          var r2 = (function(e4, t4) {
            var r3 = e4 || t4, n3 = u[r3];
            if (!n3) throw new Error(r3 + " is not a valid compression method !");
            return n3;
          })(t3.options.compression, a.compression), n2 = t3.options.compressionOptions || a.compressionOptions || {}, i = t3.dir, s = t3.date;
          t3._compressWorker(r2, n2).withStreamInfo("file", { name: e3, dir: i, date: s, comment: t3.comment || "", unixPermissions: t3.unixPermissions, dosPermissions: t3.dosPermissions }).pipe(o);
        }), o.entriesCount = h;
      } catch (e3) {
        o.error(e3);
      }
      return o;
    };
  }, { "../compressions": 3, "./ZipFileWorker": 8 }], 10: [function(e, t, r) {
    "use strict";
    function n() {
      if (!(this instanceof n)) return new n();
      if (arguments.length) throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
      this.files = /* @__PURE__ */ Object.create(null), this.comment = null, this.root = "", this.clone = function() {
        var e2 = new n();
        for (var t2 in this) "function" != typeof this[t2] && (e2[t2] = this[t2]);
        return e2;
      };
    }
    (n.prototype = e("./object")).loadAsync = e("./load"), n.support = e("./support"), n.defaults = e("./defaults"), n.version = "3.10.1", n.loadAsync = function(e2, t2) {
      return new n().loadAsync(e2, t2);
    }, n.external = e("./external"), t.exports = n;
  }, { "./defaults": 5, "./external": 6, "./load": 11, "./object": 15, "./support": 30 }], 11: [function(e, t, r) {
    "use strict";
    var u = e("./utils"), i = e("./external"), n = e("./utf8"), s = e("./zipEntries"), a = e("./stream/Crc32Probe"), l = e("./nodejsUtils");
    function f(n2) {
      return new i.Promise(function(e2, t2) {
        var r2 = n2.decompressed.getContentWorker().pipe(new a());
        r2.on("error", function(e3) {
          t2(e3);
        }).on("end", function() {
          r2.streamInfo.crc32 !== n2.decompressed.crc32 ? t2(new Error("Corrupted zip : CRC32 mismatch")) : e2();
        }).resume();
      });
    }
    t.exports = function(e2, o) {
      var h = this;
      return o = u.extend(o || {}, { base64: false, checkCRC32: false, optimizedBinaryString: false, createFolders: false, decodeFileName: n.utf8decode }), l.isNode && l.isStream(e2) ? i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")) : u.prepareContent("the loaded zip file", e2, true, o.optimizedBinaryString, o.base64).then(function(e3) {
        var t2 = new s(o);
        return t2.load(e3), t2;
      }).then(function(e3) {
        var t2 = [i.Promise.resolve(e3)], r2 = e3.files;
        if (o.checkCRC32) for (var n2 = 0; n2 < r2.length; n2++) t2.push(f(r2[n2]));
        return i.Promise.all(t2);
      }).then(function(e3) {
        for (var t2 = e3.shift(), r2 = t2.files, n2 = 0; n2 < r2.length; n2++) {
          var i2 = r2[n2], s2 = i2.fileNameStr, a2 = u.resolve(i2.fileNameStr);
          h.file(a2, i2.decompressed, { binary: true, optimizedBinaryString: true, date: i2.date, dir: i2.dir, comment: i2.fileCommentStr.length ? i2.fileCommentStr : null, unixPermissions: i2.unixPermissions, dosPermissions: i2.dosPermissions, createFolders: o.createFolders }), i2.dir || (h.file(a2).unsafeOriginalName = s2);
        }
        return t2.zipComment.length && (h.comment = t2.zipComment), h;
      });
    };
  }, { "./external": 6, "./nodejsUtils": 14, "./stream/Crc32Probe": 25, "./utf8": 31, "./utils": 32, "./zipEntries": 33 }], 12: [function(e, t, r) {
    "use strict";
    var n = e("../utils"), i = e("../stream/GenericWorker");
    function s(e2, t2) {
      i.call(this, "Nodejs stream input adapter for " + e2), this._upstreamEnded = false, this._bindStream(t2);
    }
    n.inherits(s, i), s.prototype._bindStream = function(e2) {
      var t2 = this;
      (this._stream = e2).pause(), e2.on("data", function(e3) {
        t2.push({ data: e3, meta: { percent: 0 } });
      }).on("error", function(e3) {
        t2.isPaused ? this.generatedError = e3 : t2.error(e3);
      }).on("end", function() {
        t2.isPaused ? t2._upstreamEnded = true : t2.end();
      });
    }, s.prototype.pause = function() {
      return !!i.prototype.pause.call(this) && (this._stream.pause(), true);
    }, s.prototype.resume = function() {
      return !!i.prototype.resume.call(this) && (this._upstreamEnded ? this.end() : this._stream.resume(), true);
    }, t.exports = s;
  }, { "../stream/GenericWorker": 28, "../utils": 32 }], 13: [function(e, t, r) {
    "use strict";
    var i = e("readable-stream").Readable;
    function n(e2, t2, r2) {
      i.call(this, t2), this._helper = e2;
      var n2 = this;
      e2.on("data", function(e3, t3) {
        n2.push(e3) || n2._helper.pause(), r2 && r2(t3);
      }).on("error", function(e3) {
        n2.emit("error", e3);
      }).on("end", function() {
        n2.push(null);
      });
    }
    e("../utils").inherits(n, i), n.prototype._read = function() {
      this._helper.resume();
    }, t.exports = n;
  }, { "../utils": 32, "readable-stream": 16 }], 14: [function(e, t, r) {
    "use strict";
    t.exports = { isNode: "undefined" != typeof Buffer, newBufferFrom: function(e2, t2) {
      if (Buffer.from && Buffer.from !== Uint8Array.from) return Buffer.from(e2, t2);
      if ("number" == typeof e2) throw new Error('The "data" argument must not be a number');
      return new Buffer(e2, t2);
    }, allocBuffer: function(e2) {
      if (Buffer.alloc) return Buffer.alloc(e2);
      var t2 = new Buffer(e2);
      return t2.fill(0), t2;
    }, isBuffer: function(e2) {
      return Buffer.isBuffer(e2);
    }, isStream: function(e2) {
      return e2 && "function" == typeof e2.on && "function" == typeof e2.pause && "function" == typeof e2.resume;
    } };
  }, {}], 15: [function(e, t, r) {
    "use strict";
    function s(e2, t2, r2) {
      var n2, i2 = u.getTypeOf(t2), s2 = u.extend(r2 || {}, f);
      s2.date = s2.date || /* @__PURE__ */ new Date(), null !== s2.compression && (s2.compression = s2.compression.toUpperCase()), "string" == typeof s2.unixPermissions && (s2.unixPermissions = parseInt(s2.unixPermissions, 8)), s2.unixPermissions && 16384 & s2.unixPermissions && (s2.dir = true), s2.dosPermissions && 16 & s2.dosPermissions && (s2.dir = true), s2.dir && (e2 = g(e2)), s2.createFolders && (n2 = _(e2)) && b.call(this, n2, true);
      var a2 = "string" === i2 && false === s2.binary && false === s2.base64;
      r2 && void 0 !== r2.binary || (s2.binary = !a2), (t2 instanceof c && 0 === t2.uncompressedSize || s2.dir || !t2 || 0 === t2.length) && (s2.base64 = false, s2.binary = true, t2 = "", s2.compression = "STORE", i2 = "string");
      var o2 = null;
      o2 = t2 instanceof c || t2 instanceof l ? t2 : p.isNode && p.isStream(t2) ? new m(e2, t2) : u.prepareContent(e2, t2, s2.binary, s2.optimizedBinaryString, s2.base64);
      var h2 = new d(e2, o2, s2);
      this.files[e2] = h2;
    }
    var i = e("./utf8"), u = e("./utils"), l = e("./stream/GenericWorker"), a = e("./stream/StreamHelper"), f = e("./defaults"), c = e("./compressedObject"), d = e("./zipObject"), o = e("./generate"), p = e("./nodejsUtils"), m = e("./nodejs/NodejsStreamInputAdapter"), _ = function(e2) {
      "/" === e2.slice(-1) && (e2 = e2.substring(0, e2.length - 1));
      var t2 = e2.lastIndexOf("/");
      return 0 < t2 ? e2.substring(0, t2) : "";
    }, g = function(e2) {
      return "/" !== e2.slice(-1) && (e2 += "/"), e2;
    }, b = function(e2, t2) {
      return t2 = void 0 !== t2 ? t2 : f.createFolders, e2 = g(e2), this.files[e2] || s.call(this, e2, null, { dir: true, createFolders: t2 }), this.files[e2];
    };
    function h(e2) {
      return "[object RegExp]" === Object.prototype.toString.call(e2);
    }
    var n = { load: function() {
      throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
    }, forEach: function(e2) {
      var t2, r2, n2;
      for (t2 in this.files) n2 = this.files[t2], (r2 = t2.slice(this.root.length, t2.length)) && t2.slice(0, this.root.length) === this.root && e2(r2, n2);
    }, filter: function(r2) {
      var n2 = [];
      return this.forEach(function(e2, t2) {
        r2(e2, t2) && n2.push(t2);
      }), n2;
    }, file: function(e2, t2, r2) {
      if (1 !== arguments.length) return e2 = this.root + e2, s.call(this, e2, t2, r2), this;
      if (h(e2)) {
        var n2 = e2;
        return this.filter(function(e3, t3) {
          return !t3.dir && n2.test(e3);
        });
      }
      var i2 = this.files[this.root + e2];
      return i2 && !i2.dir ? i2 : null;
    }, folder: function(r2) {
      if (!r2) return this;
      if (h(r2)) return this.filter(function(e3, t3) {
        return t3.dir && r2.test(e3);
      });
      var e2 = this.root + r2, t2 = b.call(this, e2), n2 = this.clone();
      return n2.root = t2.name, n2;
    }, remove: function(r2) {
      r2 = this.root + r2;
      var e2 = this.files[r2];
      if (e2 || ("/" !== r2.slice(-1) && (r2 += "/"), e2 = this.files[r2]), e2 && !e2.dir) delete this.files[r2];
      else for (var t2 = this.filter(function(e3, t3) {
        return t3.name.slice(0, r2.length) === r2;
      }), n2 = 0; n2 < t2.length; n2++) delete this.files[t2[n2].name];
      return this;
    }, generate: function() {
      throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
    }, generateInternalStream: function(e2) {
      var t2, r2 = {};
      try {
        if ((r2 = u.extend(e2 || {}, { streamFiles: false, compression: "STORE", compressionOptions: null, type: "", platform: "DOS", comment: null, mimeType: "application/zip", encodeFileName: i.utf8encode })).type = r2.type.toLowerCase(), r2.compression = r2.compression.toUpperCase(), "binarystring" === r2.type && (r2.type = "string"), !r2.type) throw new Error("No output type specified.");
        u.checkSupport(r2.type), "darwin" !== r2.platform && "freebsd" !== r2.platform && "linux" !== r2.platform && "sunos" !== r2.platform || (r2.platform = "UNIX"), "win32" === r2.platform && (r2.platform = "DOS");
        var n2 = r2.comment || this.comment || "";
        t2 = o.generateWorker(this, r2, n2);
      } catch (e3) {
        (t2 = new l("error")).error(e3);
      }
      return new a(t2, r2.type || "string", r2.mimeType);
    }, generateAsync: function(e2, t2) {
      return this.generateInternalStream(e2).accumulate(t2);
    }, generateNodeStream: function(e2, t2) {
      return (e2 = e2 || {}).type || (e2.type = "nodebuffer"), this.generateInternalStream(e2).toNodejsStream(t2);
    } };
    t.exports = n;
  }, { "./compressedObject": 2, "./defaults": 5, "./generate": 9, "./nodejs/NodejsStreamInputAdapter": 12, "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31, "./utils": 32, "./zipObject": 35 }], 16: [function(e, t, r) {
    "use strict";
    t.exports = e("stream");
  }, { stream: void 0 }], 17: [function(e, t, r) {
    "use strict";
    var n = e("./DataReader");
    function i(e2) {
      n.call(this, e2);
      for (var t2 = 0; t2 < this.data.length; t2++) e2[t2] = 255 & e2[t2];
    }
    e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
      return this.data[this.zero + e2];
    }, i.prototype.lastIndexOfSignature = function(e2) {
      for (var t2 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.length - 4; 0 <= s; --s) if (this.data[s] === t2 && this.data[s + 1] === r2 && this.data[s + 2] === n2 && this.data[s + 3] === i2) return s - this.zero;
      return -1;
    }, i.prototype.readAndCheckSignature = function(e2) {
      var t2 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.readData(4);
      return t2 === s[0] && r2 === s[1] && n2 === s[2] && i2 === s[3];
    }, i.prototype.readData = function(e2) {
      if (this.checkOffset(e2), 0 === e2) return [];
      var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
      return this.index += e2, t2;
    }, t.exports = i;
  }, { "../utils": 32, "./DataReader": 18 }], 18: [function(e, t, r) {
    "use strict";
    var n = e("../utils");
    function i(e2) {
      this.data = e2, this.length = e2.length, this.index = 0, this.zero = 0;
    }
    i.prototype = { checkOffset: function(e2) {
      this.checkIndex(this.index + e2);
    }, checkIndex: function(e2) {
      if (this.length < this.zero + e2 || e2 < 0) throw new Error("End of data reached (data length = " + this.length + ", asked index = " + e2 + "). Corrupted zip ?");
    }, setIndex: function(e2) {
      this.checkIndex(e2), this.index = e2;
    }, skip: function(e2) {
      this.setIndex(this.index + e2);
    }, byteAt: function() {
    }, readInt: function(e2) {
      var t2, r2 = 0;
      for (this.checkOffset(e2), t2 = this.index + e2 - 1; t2 >= this.index; t2--) r2 = (r2 << 8) + this.byteAt(t2);
      return this.index += e2, r2;
    }, readString: function(e2) {
      return n.transformTo("string", this.readData(e2));
    }, readData: function() {
    }, lastIndexOfSignature: function() {
    }, readAndCheckSignature: function() {
    }, readDate: function() {
      var e2 = this.readInt(4);
      return new Date(Date.UTC(1980 + (e2 >> 25 & 127), (e2 >> 21 & 15) - 1, e2 >> 16 & 31, e2 >> 11 & 31, e2 >> 5 & 63, (31 & e2) << 1));
    } }, t.exports = i;
  }, { "../utils": 32 }], 19: [function(e, t, r) {
    "use strict";
    var n = e("./Uint8ArrayReader");
    function i(e2) {
      n.call(this, e2);
    }
    e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
      this.checkOffset(e2);
      var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
      return this.index += e2, t2;
    }, t.exports = i;
  }, { "../utils": 32, "./Uint8ArrayReader": 21 }], 20: [function(e, t, r) {
    "use strict";
    var n = e("./DataReader");
    function i(e2) {
      n.call(this, e2);
    }
    e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
      return this.data.charCodeAt(this.zero + e2);
    }, i.prototype.lastIndexOfSignature = function(e2) {
      return this.data.lastIndexOf(e2) - this.zero;
    }, i.prototype.readAndCheckSignature = function(e2) {
      return e2 === this.readData(4);
    }, i.prototype.readData = function(e2) {
      this.checkOffset(e2);
      var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
      return this.index += e2, t2;
    }, t.exports = i;
  }, { "../utils": 32, "./DataReader": 18 }], 21: [function(e, t, r) {
    "use strict";
    var n = e("./ArrayReader");
    function i(e2) {
      n.call(this, e2);
    }
    e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
      if (this.checkOffset(e2), 0 === e2) return new Uint8Array(0);
      var t2 = this.data.subarray(this.zero + this.index, this.zero + this.index + e2);
      return this.index += e2, t2;
    }, t.exports = i;
  }, { "../utils": 32, "./ArrayReader": 17 }], 22: [function(e, t, r) {
    "use strict";
    var n = e("../utils"), i = e("../support"), s = e("./ArrayReader"), a = e("./StringReader"), o = e("./NodeBufferReader"), h = e("./Uint8ArrayReader");
    t.exports = function(e2) {
      var t2 = n.getTypeOf(e2);
      return n.checkSupport(t2), "string" !== t2 || i.uint8array ? "nodebuffer" === t2 ? new o(e2) : i.uint8array ? new h(n.transformTo("uint8array", e2)) : new s(n.transformTo("array", e2)) : new a(e2);
    };
  }, { "../support": 30, "../utils": 32, "./ArrayReader": 17, "./NodeBufferReader": 19, "./StringReader": 20, "./Uint8ArrayReader": 21 }], 23: [function(e, t, r) {
    "use strict";
    r.LOCAL_FILE_HEADER = "PK", r.CENTRAL_FILE_HEADER = "PK", r.CENTRAL_DIRECTORY_END = "PK", r.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07", r.ZIP64_CENTRAL_DIRECTORY_END = "PK", r.DATA_DESCRIPTOR = "PK\x07\b";
  }, {}], 24: [function(e, t, r) {
    "use strict";
    var n = e("./GenericWorker"), i = e("../utils");
    function s(e2) {
      n.call(this, "ConvertWorker to " + e2), this.destType = e2;
    }
    i.inherits(s, n), s.prototype.processChunk = function(e2) {
      this.push({ data: i.transformTo(this.destType, e2.data), meta: e2.meta });
    }, t.exports = s;
  }, { "../utils": 32, "./GenericWorker": 28 }], 25: [function(e, t, r) {
    "use strict";
    var n = e("./GenericWorker"), i = e("../crc32");
    function s() {
      n.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
    }
    e("../utils").inherits(s, n), s.prototype.processChunk = function(e2) {
      this.streamInfo.crc32 = i(e2.data, this.streamInfo.crc32 || 0), this.push(e2);
    }, t.exports = s;
  }, { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 }], 26: [function(e, t, r) {
    "use strict";
    var n = e("../utils"), i = e("./GenericWorker");
    function s(e2) {
      i.call(this, "DataLengthProbe for " + e2), this.propName = e2, this.withStreamInfo(e2, 0);
    }
    n.inherits(s, i), s.prototype.processChunk = function(e2) {
      if (e2) {
        var t2 = this.streamInfo[this.propName] || 0;
        this.streamInfo[this.propName] = t2 + e2.data.length;
      }
      i.prototype.processChunk.call(this, e2);
    }, t.exports = s;
  }, { "../utils": 32, "./GenericWorker": 28 }], 27: [function(e, t, r) {
    "use strict";
    var n = e("../utils"), i = e("./GenericWorker");
    function s(e2) {
      i.call(this, "DataWorker");
      var t2 = this;
      this.dataIsReady = false, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = false, e2.then(function(e3) {
        t2.dataIsReady = true, t2.data = e3, t2.max = e3 && e3.length || 0, t2.type = n.getTypeOf(e3), t2.isPaused || t2._tickAndRepeat();
      }, function(e3) {
        t2.error(e3);
      });
    }
    n.inherits(s, i), s.prototype.cleanUp = function() {
      i.prototype.cleanUp.call(this), this.data = null;
    }, s.prototype.resume = function() {
      return !!i.prototype.resume.call(this) && (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = true, n.delay(this._tickAndRepeat, [], this)), true);
    }, s.prototype._tickAndRepeat = function() {
      this._tickScheduled = false, this.isPaused || this.isFinished || (this._tick(), this.isFinished || (n.delay(this._tickAndRepeat, [], this), this._tickScheduled = true));
    }, s.prototype._tick = function() {
      if (this.isPaused || this.isFinished) return false;
      var e2 = null, t2 = Math.min(this.max, this.index + 16384);
      if (this.index >= this.max) return this.end();
      switch (this.type) {
        case "string":
          e2 = this.data.substring(this.index, t2);
          break;
        case "uint8array":
          e2 = this.data.subarray(this.index, t2);
          break;
        case "array":
        case "nodebuffer":
          e2 = this.data.slice(this.index, t2);
      }
      return this.index = t2, this.push({ data: e2, meta: { percent: this.max ? this.index / this.max * 100 : 0 } });
    }, t.exports = s;
  }, { "../utils": 32, "./GenericWorker": 28 }], 28: [function(e, t, r) {
    "use strict";
    function n(e2) {
      this.name = e2 || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = true, this.isFinished = false, this.isLocked = false, this._listeners = { data: [], end: [], error: [] }, this.previous = null;
    }
    n.prototype = { push: function(e2) {
      this.emit("data", e2);
    }, end: function() {
      if (this.isFinished) return false;
      this.flush();
      try {
        this.emit("end"), this.cleanUp(), this.isFinished = true;
      } catch (e2) {
        this.emit("error", e2);
      }
      return true;
    }, error: function(e2) {
      return !this.isFinished && (this.isPaused ? this.generatedError = e2 : (this.isFinished = true, this.emit("error", e2), this.previous && this.previous.error(e2), this.cleanUp()), true);
    }, on: function(e2, t2) {
      return this._listeners[e2].push(t2), this;
    }, cleanUp: function() {
      this.streamInfo = this.generatedError = this.extraStreamInfo = null, this._listeners = [];
    }, emit: function(e2, t2) {
      if (this._listeners[e2]) for (var r2 = 0; r2 < this._listeners[e2].length; r2++) this._listeners[e2][r2].call(this, t2);
    }, pipe: function(e2) {
      return e2.registerPrevious(this);
    }, registerPrevious: function(e2) {
      if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
      this.streamInfo = e2.streamInfo, this.mergeStreamInfo(), this.previous = e2;
      var t2 = this;
      return e2.on("data", function(e3) {
        t2.processChunk(e3);
      }), e2.on("end", function() {
        t2.end();
      }), e2.on("error", function(e3) {
        t2.error(e3);
      }), this;
    }, pause: function() {
      return !this.isPaused && !this.isFinished && (this.isPaused = true, this.previous && this.previous.pause(), true);
    }, resume: function() {
      if (!this.isPaused || this.isFinished) return false;
      var e2 = this.isPaused = false;
      return this.generatedError && (this.error(this.generatedError), e2 = true), this.previous && this.previous.resume(), !e2;
    }, flush: function() {
    }, processChunk: function(e2) {
      this.push(e2);
    }, withStreamInfo: function(e2, t2) {
      return this.extraStreamInfo[e2] = t2, this.mergeStreamInfo(), this;
    }, mergeStreamInfo: function() {
      for (var e2 in this.extraStreamInfo) Object.prototype.hasOwnProperty.call(this.extraStreamInfo, e2) && (this.streamInfo[e2] = this.extraStreamInfo[e2]);
    }, lock: function() {
      if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
      this.isLocked = true, this.previous && this.previous.lock();
    }, toString: function() {
      var e2 = "Worker " + this.name;
      return this.previous ? this.previous + " -> " + e2 : e2;
    } }, t.exports = n;
  }, {}], 29: [function(e, t, r) {
    "use strict";
    var h = e("../utils"), i = e("./ConvertWorker"), s = e("./GenericWorker"), u = e("../base64"), n = e("../support"), a = e("../external"), o = null;
    if (n.nodestream) try {
      o = e("../nodejs/NodejsStreamOutputAdapter");
    } catch (e2) {
    }
    function l(e2, o2) {
      return new a.Promise(function(t2, r2) {
        var n2 = [], i2 = e2._internalType, s2 = e2._outputType, a2 = e2._mimeType;
        e2.on("data", function(e3, t3) {
          n2.push(e3), o2 && o2(t3);
        }).on("error", function(e3) {
          n2 = [], r2(e3);
        }).on("end", function() {
          try {
            var e3 = (function(e4, t3, r3) {
              switch (e4) {
                case "blob":
                  return h.newBlob(h.transformTo("arraybuffer", t3), r3);
                case "base64":
                  return u.encode(t3);
                default:
                  return h.transformTo(e4, t3);
              }
            })(s2, (function(e4, t3) {
              var r3, n3 = 0, i3 = null, s3 = 0;
              for (r3 = 0; r3 < t3.length; r3++) s3 += t3[r3].length;
              switch (e4) {
                case "string":
                  return t3.join("");
                case "array":
                  return Array.prototype.concat.apply([], t3);
                case "uint8array":
                  for (i3 = new Uint8Array(s3), r3 = 0; r3 < t3.length; r3++) i3.set(t3[r3], n3), n3 += t3[r3].length;
                  return i3;
                case "nodebuffer":
                  return Buffer.concat(t3);
                default:
                  throw new Error("concat : unsupported type '" + e4 + "'");
              }
            })(i2, n2), a2);
            t2(e3);
          } catch (e4) {
            r2(e4);
          }
          n2 = [];
        }).resume();
      });
    }
    function f(e2, t2, r2) {
      var n2 = t2;
      switch (t2) {
        case "blob":
        case "arraybuffer":
          n2 = "uint8array";
          break;
        case "base64":
          n2 = "string";
      }
      try {
        this._internalType = n2, this._outputType = t2, this._mimeType = r2, h.checkSupport(n2), this._worker = e2.pipe(new i(n2)), e2.lock();
      } catch (e3) {
        this._worker = new s("error"), this._worker.error(e3);
      }
    }
    f.prototype = { accumulate: function(e2) {
      return l(this, e2);
    }, on: function(e2, t2) {
      var r2 = this;
      return "data" === e2 ? this._worker.on(e2, function(e3) {
        t2.call(r2, e3.data, e3.meta);
      }) : this._worker.on(e2, function() {
        h.delay(t2, arguments, r2);
      }), this;
    }, resume: function() {
      return h.delay(this._worker.resume, [], this._worker), this;
    }, pause: function() {
      return this._worker.pause(), this;
    }, toNodejsStream: function(e2) {
      if (h.checkSupport("nodestream"), "nodebuffer" !== this._outputType) throw new Error(this._outputType + " is not supported by this method");
      return new o(this, { objectMode: "nodebuffer" !== this._outputType }, e2);
    } }, t.exports = f;
  }, { "../base64": 1, "../external": 6, "../nodejs/NodejsStreamOutputAdapter": 13, "../support": 30, "../utils": 32, "./ConvertWorker": 24, "./GenericWorker": 28 }], 30: [function(e, t, r) {
    "use strict";
    if (r.base64 = true, r.array = true, r.string = true, r.arraybuffer = "undefined" != typeof ArrayBuffer && "undefined" != typeof Uint8Array, r.nodebuffer = "undefined" != typeof Buffer, r.uint8array = "undefined" != typeof Uint8Array, "undefined" == typeof ArrayBuffer) r.blob = false;
    else {
      var n = new ArrayBuffer(0);
      try {
        r.blob = 0 === new Blob([n], { type: "application/zip" }).size;
      } catch (e2) {
        try {
          var i = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
          i.append(n), r.blob = 0 === i.getBlob("application/zip").size;
        } catch (e3) {
          r.blob = false;
        }
      }
    }
    try {
      r.nodestream = !!e("readable-stream").Readable;
    } catch (e2) {
      r.nodestream = false;
    }
  }, { "readable-stream": 16 }], 31: [function(e, t, s) {
    "use strict";
    for (var o = e("./utils"), h = e("./support"), r = e("./nodejsUtils"), n = e("./stream/GenericWorker"), u = new Array(256), i = 0; i < 256; i++) u[i] = 252 <= i ? 6 : 248 <= i ? 5 : 240 <= i ? 4 : 224 <= i ? 3 : 192 <= i ? 2 : 1;
    u[254] = u[254] = 1;
    function a() {
      n.call(this, "utf-8 decode"), this.leftOver = null;
    }
    function l() {
      n.call(this, "utf-8 encode");
    }
    s.utf8encode = function(e2) {
      return h.nodebuffer ? r.newBufferFrom(e2, "utf-8") : (function(e3) {
        var t2, r2, n2, i2, s2, a2 = e3.length, o2 = 0;
        for (i2 = 0; i2 < a2; i2++) 55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o2 += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
        for (t2 = h.uint8array ? new Uint8Array(o2) : new Array(o2), i2 = s2 = 0; s2 < o2; i2++) 55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t2[s2++] = r2 : (r2 < 2048 ? t2[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t2[s2++] = 224 | r2 >>> 12 : (t2[s2++] = 240 | r2 >>> 18, t2[s2++] = 128 | r2 >>> 12 & 63), t2[s2++] = 128 | r2 >>> 6 & 63), t2[s2++] = 128 | 63 & r2);
        return t2;
      })(e2);
    }, s.utf8decode = function(e2) {
      return h.nodebuffer ? o.transformTo("nodebuffer", e2).toString("utf-8") : (function(e3) {
        var t2, r2, n2, i2, s2 = e3.length, a2 = new Array(2 * s2);
        for (t2 = r2 = 0; t2 < s2; ) if ((n2 = e3[t2++]) < 128) a2[r2++] = n2;
        else if (4 < (i2 = u[n2])) a2[r2++] = 65533, t2 += i2 - 1;
        else {
          for (n2 &= 2 === i2 ? 31 : 3 === i2 ? 15 : 7; 1 < i2 && t2 < s2; ) n2 = n2 << 6 | 63 & e3[t2++], i2--;
          1 < i2 ? a2[r2++] = 65533 : n2 < 65536 ? a2[r2++] = n2 : (n2 -= 65536, a2[r2++] = 55296 | n2 >> 10 & 1023, a2[r2++] = 56320 | 1023 & n2);
        }
        return a2.length !== r2 && (a2.subarray ? a2 = a2.subarray(0, r2) : a2.length = r2), o.applyFromCharCode(a2);
      })(e2 = o.transformTo(h.uint8array ? "uint8array" : "array", e2));
    }, o.inherits(a, n), a.prototype.processChunk = function(e2) {
      var t2 = o.transformTo(h.uint8array ? "uint8array" : "array", e2.data);
      if (this.leftOver && this.leftOver.length) {
        if (h.uint8array) {
          var r2 = t2;
          (t2 = new Uint8Array(r2.length + this.leftOver.length)).set(this.leftOver, 0), t2.set(r2, this.leftOver.length);
        } else t2 = this.leftOver.concat(t2);
        this.leftOver = null;
      }
      var n2 = (function(e3, t3) {
        var r3;
        for ((t3 = t3 || e3.length) > e3.length && (t3 = e3.length), r3 = t3 - 1; 0 <= r3 && 128 == (192 & e3[r3]); ) r3--;
        return r3 < 0 ? t3 : 0 === r3 ? t3 : r3 + u[e3[r3]] > t3 ? r3 : t3;
      })(t2), i2 = t2;
      n2 !== t2.length && (h.uint8array ? (i2 = t2.subarray(0, n2), this.leftOver = t2.subarray(n2, t2.length)) : (i2 = t2.slice(0, n2), this.leftOver = t2.slice(n2, t2.length))), this.push({ data: s.utf8decode(i2), meta: e2.meta });
    }, a.prototype.flush = function() {
      this.leftOver && this.leftOver.length && (this.push({ data: s.utf8decode(this.leftOver), meta: {} }), this.leftOver = null);
    }, s.Utf8DecodeWorker = a, o.inherits(l, n), l.prototype.processChunk = function(e2) {
      this.push({ data: s.utf8encode(e2.data), meta: e2.meta });
    }, s.Utf8EncodeWorker = l;
  }, { "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./support": 30, "./utils": 32 }], 32: [function(e, t, a) {
    "use strict";
    var o = e("./support"), h = e("./base64"), r = e("./nodejsUtils"), u = e("./external");
    function n(e2) {
      return e2;
    }
    function l(e2, t2) {
      for (var r2 = 0; r2 < e2.length; ++r2) t2[r2] = 255 & e2.charCodeAt(r2);
      return t2;
    }
    e("setimmediate"), a.newBlob = function(t2, r2) {
      a.checkSupport("blob");
      try {
        return new Blob([t2], { type: r2 });
      } catch (e2) {
        try {
          var n2 = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
          return n2.append(t2), n2.getBlob(r2);
        } catch (e3) {
          throw new Error("Bug : can't construct the Blob.");
        }
      }
    };
    var i = { stringifyByChunk: function(e2, t2, r2) {
      var n2 = [], i2 = 0, s2 = e2.length;
      if (s2 <= r2) return String.fromCharCode.apply(null, e2);
      for (; i2 < s2; ) "array" === t2 || "nodebuffer" === t2 ? n2.push(String.fromCharCode.apply(null, e2.slice(i2, Math.min(i2 + r2, s2)))) : n2.push(String.fromCharCode.apply(null, e2.subarray(i2, Math.min(i2 + r2, s2)))), i2 += r2;
      return n2.join("");
    }, stringifyByChar: function(e2) {
      for (var t2 = "", r2 = 0; r2 < e2.length; r2++) t2 += String.fromCharCode(e2[r2]);
      return t2;
    }, applyCanBeUsed: { uint8array: (function() {
      try {
        return o.uint8array && 1 === String.fromCharCode.apply(null, new Uint8Array(1)).length;
      } catch (e2) {
        return false;
      }
    })(), nodebuffer: (function() {
      try {
        return o.nodebuffer && 1 === String.fromCharCode.apply(null, r.allocBuffer(1)).length;
      } catch (e2) {
        return false;
      }
    })() } };
    function s(e2) {
      var t2 = 65536, r2 = a.getTypeOf(e2), n2 = true;
      if ("uint8array" === r2 ? n2 = i.applyCanBeUsed.uint8array : "nodebuffer" === r2 && (n2 = i.applyCanBeUsed.nodebuffer), n2) for (; 1 < t2; ) try {
        return i.stringifyByChunk(e2, r2, t2);
      } catch (e3) {
        t2 = Math.floor(t2 / 2);
      }
      return i.stringifyByChar(e2);
    }
    function f(e2, t2) {
      for (var r2 = 0; r2 < e2.length; r2++) t2[r2] = e2[r2];
      return t2;
    }
    a.applyFromCharCode = s;
    var c = {};
    c.string = { string: n, array: function(e2) {
      return l(e2, new Array(e2.length));
    }, arraybuffer: function(e2) {
      return c.string.uint8array(e2).buffer;
    }, uint8array: function(e2) {
      return l(e2, new Uint8Array(e2.length));
    }, nodebuffer: function(e2) {
      return l(e2, r.allocBuffer(e2.length));
    } }, c.array = { string: s, array: n, arraybuffer: function(e2) {
      return new Uint8Array(e2).buffer;
    }, uint8array: function(e2) {
      return new Uint8Array(e2);
    }, nodebuffer: function(e2) {
      return r.newBufferFrom(e2);
    } }, c.arraybuffer = { string: function(e2) {
      return s(new Uint8Array(e2));
    }, array: function(e2) {
      return f(new Uint8Array(e2), new Array(e2.byteLength));
    }, arraybuffer: n, uint8array: function(e2) {
      return new Uint8Array(e2);
    }, nodebuffer: function(e2) {
      return r.newBufferFrom(new Uint8Array(e2));
    } }, c.uint8array = { string: s, array: function(e2) {
      return f(e2, new Array(e2.length));
    }, arraybuffer: function(e2) {
      return e2.buffer;
    }, uint8array: n, nodebuffer: function(e2) {
      return r.newBufferFrom(e2);
    } }, c.nodebuffer = { string: s, array: function(e2) {
      return f(e2, new Array(e2.length));
    }, arraybuffer: function(e2) {
      return c.nodebuffer.uint8array(e2).buffer;
    }, uint8array: function(e2) {
      return f(e2, new Uint8Array(e2.length));
    }, nodebuffer: n }, a.transformTo = function(e2, t2) {
      if (t2 = t2 || "", !e2) return t2;
      a.checkSupport(e2);
      var r2 = a.getTypeOf(t2);
      return c[r2][e2](t2);
    }, a.resolve = function(e2) {
      for (var t2 = e2.split("/"), r2 = [], n2 = 0; n2 < t2.length; n2++) {
        var i2 = t2[n2];
        "." === i2 || "" === i2 && 0 !== n2 && n2 !== t2.length - 1 || (".." === i2 ? r2.pop() : r2.push(i2));
      }
      return r2.join("/");
    }, a.getTypeOf = function(e2) {
      return "string" == typeof e2 ? "string" : "[object Array]" === Object.prototype.toString.call(e2) ? "array" : o.nodebuffer && r.isBuffer(e2) ? "nodebuffer" : o.uint8array && e2 instanceof Uint8Array ? "uint8array" : o.arraybuffer && e2 instanceof ArrayBuffer ? "arraybuffer" : void 0;
    }, a.checkSupport = function(e2) {
      if (!o[e2.toLowerCase()]) throw new Error(e2 + " is not supported by this platform");
    }, a.MAX_VALUE_16BITS = 65535, a.MAX_VALUE_32BITS = -1, a.pretty = function(e2) {
      var t2, r2, n2 = "";
      for (r2 = 0; r2 < (e2 || "").length; r2++) n2 += "\\x" + ((t2 = e2.charCodeAt(r2)) < 16 ? "0" : "") + t2.toString(16).toUpperCase();
      return n2;
    }, a.delay = function(e2, t2, r2) {
      setImmediate(function() {
        e2.apply(r2 || null, t2 || []);
      });
    }, a.inherits = function(e2, t2) {
      function r2() {
      }
      r2.prototype = t2.prototype, e2.prototype = new r2();
    }, a.extend = function() {
      var e2, t2, r2 = {};
      for (e2 = 0; e2 < arguments.length; e2++) for (t2 in arguments[e2]) Object.prototype.hasOwnProperty.call(arguments[e2], t2) && void 0 === r2[t2] && (r2[t2] = arguments[e2][t2]);
      return r2;
    }, a.prepareContent = function(r2, e2, n2, i2, s2) {
      return u.Promise.resolve(e2).then(function(n3) {
        return o.blob && (n3 instanceof Blob || -1 !== ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(n3))) && "undefined" != typeof FileReader ? new u.Promise(function(t2, r3) {
          var e3 = new FileReader();
          e3.onload = function(e4) {
            t2(e4.target.result);
          }, e3.onerror = function(e4) {
            r3(e4.target.error);
          }, e3.readAsArrayBuffer(n3);
        }) : n3;
      }).then(function(e3) {
        var t2 = a.getTypeOf(e3);
        return t2 ? ("arraybuffer" === t2 ? e3 = a.transformTo("uint8array", e3) : "string" === t2 && (s2 ? e3 = h.decode(e3) : n2 && true !== i2 && (e3 = (function(e4) {
          return l(e4, o.uint8array ? new Uint8Array(e4.length) : new Array(e4.length));
        })(e3))), e3) : u.Promise.reject(new Error("Can't read the data of '" + r2 + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"));
      });
    };
  }, { "./base64": 1, "./external": 6, "./nodejsUtils": 14, "./support": 30, setimmediate: 54 }], 33: [function(e, t, r) {
    "use strict";
    var n = e("./reader/readerFor"), i = e("./utils"), s = e("./signature"), a = e("./zipEntry"), o = e("./support");
    function h(e2) {
      this.files = [], this.loadOptions = e2;
    }
    h.prototype = { checkSignature: function(e2) {
      if (!this.reader.readAndCheckSignature(e2)) {
        this.reader.index -= 4;
        var t2 = this.reader.readString(4);
        throw new Error("Corrupted zip or bug: unexpected signature (" + i.pretty(t2) + ", expected " + i.pretty(e2) + ")");
      }
    }, isSignature: function(e2, t2) {
      var r2 = this.reader.index;
      this.reader.setIndex(e2);
      var n2 = this.reader.readString(4) === t2;
      return this.reader.setIndex(r2), n2;
    }, readBlockEndOfCentral: function() {
      this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2);
      var e2 = this.reader.readData(this.zipCommentLength), t2 = o.uint8array ? "uint8array" : "array", r2 = i.transformTo(t2, e2);
      this.zipComment = this.loadOptions.decodeFileName(r2);
    }, readBlockZip64EndOfCentral: function() {
      this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
      for (var e2, t2, r2, n2 = this.zip64EndOfCentralSize - 44; 0 < n2; ) e2 = this.reader.readInt(2), t2 = this.reader.readInt(4), r2 = this.reader.readData(t2), this.zip64ExtensibleData[e2] = { id: e2, length: t2, value: r2 };
    }, readBlockZip64EndOfCentralLocator: function() {
      if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), 1 < this.disksCount) throw new Error("Multi-volumes zip are not supported");
    }, readLocalFiles: function() {
      var e2, t2;
      for (e2 = 0; e2 < this.files.length; e2++) t2 = this.files[e2], this.reader.setIndex(t2.localHeaderOffset), this.checkSignature(s.LOCAL_FILE_HEADER), t2.readLocalPart(this.reader), t2.handleUTF8(), t2.processAttributes();
    }, readCentralDir: function() {
      var e2;
      for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER); ) (e2 = new a({ zip64: this.zip64 }, this.loadOptions)).readCentralPart(this.reader), this.files.push(e2);
      if (this.centralDirRecords !== this.files.length && 0 !== this.centralDirRecords && 0 === this.files.length) throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
    }, readEndOfCentral: function() {
      var e2 = this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);
      if (e2 < 0) throw !this.isSignature(0, s.LOCAL_FILE_HEADER) ? new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html") : new Error("Corrupted zip: can't find end of central directory");
      this.reader.setIndex(e2);
      var t2 = e2;
      if (this.checkSignature(s.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === i.MAX_VALUE_16BITS || this.diskWithCentralDirStart === i.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === i.MAX_VALUE_16BITS || this.centralDirRecords === i.MAX_VALUE_16BITS || this.centralDirSize === i.MAX_VALUE_32BITS || this.centralDirOffset === i.MAX_VALUE_32BITS) {
        if (this.zip64 = true, (e2 = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR)) < 0) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
        if (this.reader.setIndex(e2), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, s.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0)) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
        this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
      }
      var r2 = this.centralDirOffset + this.centralDirSize;
      this.zip64 && (r2 += 20, r2 += 12 + this.zip64EndOfCentralSize);
      var n2 = t2 - r2;
      if (0 < n2) this.isSignature(t2, s.CENTRAL_FILE_HEADER) || (this.reader.zero = n2);
      else if (n2 < 0) throw new Error("Corrupted zip: missing " + Math.abs(n2) + " bytes.");
    }, prepareReader: function(e2) {
      this.reader = n(e2);
    }, load: function(e2) {
      this.prepareReader(e2), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
    } }, t.exports = h;
  }, { "./reader/readerFor": 22, "./signature": 23, "./support": 30, "./utils": 32, "./zipEntry": 34 }], 34: [function(e, t, r) {
    "use strict";
    var n = e("./reader/readerFor"), s = e("./utils"), i = e("./compressedObject"), a = e("./crc32"), o = e("./utf8"), h = e("./compressions"), u = e("./support");
    function l(e2, t2) {
      this.options = e2, this.loadOptions = t2;
    }
    l.prototype = { isEncrypted: function() {
      return 1 == (1 & this.bitFlag);
    }, useUTF8: function() {
      return 2048 == (2048 & this.bitFlag);
    }, readLocalPart: function(e2) {
      var t2, r2;
      if (e2.skip(22), this.fileNameLength = e2.readInt(2), r2 = e2.readInt(2), this.fileName = e2.readData(this.fileNameLength), e2.skip(r2), -1 === this.compressedSize || -1 === this.uncompressedSize) throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
      if (null === (t2 = (function(e3) {
        for (var t3 in h) if (Object.prototype.hasOwnProperty.call(h, t3) && h[t3].magic === e3) return h[t3];
        return null;
      })(this.compressionMethod))) throw new Error("Corrupted zip : compression " + s.pretty(this.compressionMethod) + " unknown (inner file : " + s.transformTo("string", this.fileName) + ")");
      this.decompressed = new i(this.compressedSize, this.uncompressedSize, this.crc32, t2, e2.readData(this.compressedSize));
    }, readCentralPart: function(e2) {
      this.versionMadeBy = e2.readInt(2), e2.skip(2), this.bitFlag = e2.readInt(2), this.compressionMethod = e2.readString(2), this.date = e2.readDate(), this.crc32 = e2.readInt(4), this.compressedSize = e2.readInt(4), this.uncompressedSize = e2.readInt(4);
      var t2 = e2.readInt(2);
      if (this.extraFieldsLength = e2.readInt(2), this.fileCommentLength = e2.readInt(2), this.diskNumberStart = e2.readInt(2), this.internalFileAttributes = e2.readInt(2), this.externalFileAttributes = e2.readInt(4), this.localHeaderOffset = e2.readInt(4), this.isEncrypted()) throw new Error("Encrypted zip are not supported");
      e2.skip(t2), this.readExtraFields(e2), this.parseZIP64ExtraField(e2), this.fileComment = e2.readData(this.fileCommentLength);
    }, processAttributes: function() {
      this.unixPermissions = null, this.dosPermissions = null;
      var e2 = this.versionMadeBy >> 8;
      this.dir = !!(16 & this.externalFileAttributes), 0 == e2 && (this.dosPermissions = 63 & this.externalFileAttributes), 3 == e2 && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), this.dir || "/" !== this.fileNameStr.slice(-1) || (this.dir = true);
    }, parseZIP64ExtraField: function() {
      if (this.extraFields[1]) {
        var e2 = n(this.extraFields[1].value);
        this.uncompressedSize === s.MAX_VALUE_32BITS && (this.uncompressedSize = e2.readInt(8)), this.compressedSize === s.MAX_VALUE_32BITS && (this.compressedSize = e2.readInt(8)), this.localHeaderOffset === s.MAX_VALUE_32BITS && (this.localHeaderOffset = e2.readInt(8)), this.diskNumberStart === s.MAX_VALUE_32BITS && (this.diskNumberStart = e2.readInt(4));
      }
    }, readExtraFields: function(e2) {
      var t2, r2, n2, i2 = e2.index + this.extraFieldsLength;
      for (this.extraFields || (this.extraFields = {}); e2.index + 4 < i2; ) t2 = e2.readInt(2), r2 = e2.readInt(2), n2 = e2.readData(r2), this.extraFields[t2] = { id: t2, length: r2, value: n2 };
      e2.setIndex(i2);
    }, handleUTF8: function() {
      var e2 = u.uint8array ? "uint8array" : "array";
      if (this.useUTF8()) this.fileNameStr = o.utf8decode(this.fileName), this.fileCommentStr = o.utf8decode(this.fileComment);
      else {
        var t2 = this.findExtraFieldUnicodePath();
        if (null !== t2) this.fileNameStr = t2;
        else {
          var r2 = s.transformTo(e2, this.fileName);
          this.fileNameStr = this.loadOptions.decodeFileName(r2);
        }
        var n2 = this.findExtraFieldUnicodeComment();
        if (null !== n2) this.fileCommentStr = n2;
        else {
          var i2 = s.transformTo(e2, this.fileComment);
          this.fileCommentStr = this.loadOptions.decodeFileName(i2);
        }
      }
    }, findExtraFieldUnicodePath: function() {
      var e2 = this.extraFields[28789];
      if (e2) {
        var t2 = n(e2.value);
        return 1 !== t2.readInt(1) ? null : a(this.fileName) !== t2.readInt(4) ? null : o.utf8decode(t2.readData(e2.length - 5));
      }
      return null;
    }, findExtraFieldUnicodeComment: function() {
      var e2 = this.extraFields[25461];
      if (e2) {
        var t2 = n(e2.value);
        return 1 !== t2.readInt(1) ? null : a(this.fileComment) !== t2.readInt(4) ? null : o.utf8decode(t2.readData(e2.length - 5));
      }
      return null;
    } }, t.exports = l;
  }, { "./compressedObject": 2, "./compressions": 3, "./crc32": 4, "./reader/readerFor": 22, "./support": 30, "./utf8": 31, "./utils": 32 }], 35: [function(e, t, r) {
    "use strict";
    function n(e2, t2, r2) {
      this.name = e2, this.dir = r2.dir, this.date = r2.date, this.comment = r2.comment, this.unixPermissions = r2.unixPermissions, this.dosPermissions = r2.dosPermissions, this._data = t2, this._dataBinary = r2.binary, this.options = { compression: r2.compression, compressionOptions: r2.compressionOptions };
    }
    var s = e("./stream/StreamHelper"), i = e("./stream/DataWorker"), a = e("./utf8"), o = e("./compressedObject"), h = e("./stream/GenericWorker");
    n.prototype = { internalStream: function(e2) {
      var t2 = null, r2 = "string";
      try {
        if (!e2) throw new Error("No output type specified.");
        var n2 = "string" === (r2 = e2.toLowerCase()) || "text" === r2;
        "binarystring" !== r2 && "text" !== r2 || (r2 = "string"), t2 = this._decompressWorker();
        var i2 = !this._dataBinary;
        i2 && !n2 && (t2 = t2.pipe(new a.Utf8EncodeWorker())), !i2 && n2 && (t2 = t2.pipe(new a.Utf8DecodeWorker()));
      } catch (e3) {
        (t2 = new h("error")).error(e3);
      }
      return new s(t2, r2, "");
    }, async: function(e2, t2) {
      return this.internalStream(e2).accumulate(t2);
    }, nodeStream: function(e2, t2) {
      return this.internalStream(e2 || "nodebuffer").toNodejsStream(t2);
    }, _compressWorker: function(e2, t2) {
      if (this._data instanceof o && this._data.compression.magic === e2.magic) return this._data.getCompressedWorker();
      var r2 = this._decompressWorker();
      return this._dataBinary || (r2 = r2.pipe(new a.Utf8EncodeWorker())), o.createWorkerFrom(r2, e2, t2);
    }, _decompressWorker: function() {
      return this._data instanceof o ? this._data.getContentWorker() : this._data instanceof h ? this._data : new i(this._data);
    } };
    for (var u = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"], l = function() {
      throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
    }, f = 0; f < u.length; f++) n.prototype[u[f]] = l;
    t.exports = n;
  }, { "./compressedObject": 2, "./stream/DataWorker": 27, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31 }], 36: [function(e, l, t) {
    (function(t2) {
      "use strict";
      var r, n, e2 = t2.MutationObserver || t2.WebKitMutationObserver;
      if (e2) {
        var i = 0, s = new e2(u), a = t2.document.createTextNode("");
        s.observe(a, { characterData: true }), r = function() {
          a.data = i = ++i % 2;
        };
      } else if (t2.setImmediate || void 0 === t2.MessageChannel) r = "document" in t2 && "onreadystatechange" in t2.document.createElement("script") ? function() {
        var e3 = t2.document.createElement("script");
        e3.onreadystatechange = function() {
          u(), e3.onreadystatechange = null, e3.parentNode.removeChild(e3), e3 = null;
        }, t2.document.documentElement.appendChild(e3);
      } : function() {
        setTimeout(u, 0);
      };
      else {
        var o = new t2.MessageChannel();
        o.port1.onmessage = u, r = function() {
          o.port2.postMessage(0);
        };
      }
      var h = [];
      function u() {
        var e3, t3;
        n = true;
        for (var r2 = h.length; r2; ) {
          for (t3 = h, h = [], e3 = -1; ++e3 < r2; ) t3[e3]();
          r2 = h.length;
        }
        n = false;
      }
      l.exports = function(e3) {
        1 !== h.push(e3) || n || r();
      };
    }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
  }, {}], 37: [function(e, t, r) {
    "use strict";
    var i = e("immediate");
    function u() {
    }
    var l = {}, s = ["REJECTED"], a = ["FULFILLED"], n = ["PENDING"];
    function o(e2) {
      if ("function" != typeof e2) throw new TypeError("resolver must be a function");
      this.state = n, this.queue = [], this.outcome = void 0, e2 !== u && d(this, e2);
    }
    function h(e2, t2, r2) {
      this.promise = e2, "function" == typeof t2 && (this.onFulfilled = t2, this.callFulfilled = this.otherCallFulfilled), "function" == typeof r2 && (this.onRejected = r2, this.callRejected = this.otherCallRejected);
    }
    function f(t2, r2, n2) {
      i(function() {
        var e2;
        try {
          e2 = r2(n2);
        } catch (e3) {
          return l.reject(t2, e3);
        }
        e2 === t2 ? l.reject(t2, new TypeError("Cannot resolve promise with itself")) : l.resolve(t2, e2);
      });
    }
    function c(e2) {
      var t2 = e2 && e2.then;
      if (e2 && ("object" == typeof e2 || "function" == typeof e2) && "function" == typeof t2) return function() {
        t2.apply(e2, arguments);
      };
    }
    function d(t2, e2) {
      var r2 = false;
      function n2(e3) {
        r2 || (r2 = true, l.reject(t2, e3));
      }
      function i2(e3) {
        r2 || (r2 = true, l.resolve(t2, e3));
      }
      var s2 = p(function() {
        e2(i2, n2);
      });
      "error" === s2.status && n2(s2.value);
    }
    function p(e2, t2) {
      var r2 = {};
      try {
        r2.value = e2(t2), r2.status = "success";
      } catch (e3) {
        r2.status = "error", r2.value = e3;
      }
      return r2;
    }
    (t.exports = o).prototype.finally = function(t2) {
      if ("function" != typeof t2) return this;
      var r2 = this.constructor;
      return this.then(function(e2) {
        return r2.resolve(t2()).then(function() {
          return e2;
        });
      }, function(e2) {
        return r2.resolve(t2()).then(function() {
          throw e2;
        });
      });
    }, o.prototype.catch = function(e2) {
      return this.then(null, e2);
    }, o.prototype.then = function(e2, t2) {
      if ("function" != typeof e2 && this.state === a || "function" != typeof t2 && this.state === s) return this;
      var r2 = new this.constructor(u);
      this.state !== n ? f(r2, this.state === a ? e2 : t2, this.outcome) : this.queue.push(new h(r2, e2, t2));
      return r2;
    }, h.prototype.callFulfilled = function(e2) {
      l.resolve(this.promise, e2);
    }, h.prototype.otherCallFulfilled = function(e2) {
      f(this.promise, this.onFulfilled, e2);
    }, h.prototype.callRejected = function(e2) {
      l.reject(this.promise, e2);
    }, h.prototype.otherCallRejected = function(e2) {
      f(this.promise, this.onRejected, e2);
    }, l.resolve = function(e2, t2) {
      var r2 = p(c, t2);
      if ("error" === r2.status) return l.reject(e2, r2.value);
      var n2 = r2.value;
      if (n2) d(e2, n2);
      else {
        e2.state = a, e2.outcome = t2;
        for (var i2 = -1, s2 = e2.queue.length; ++i2 < s2; ) e2.queue[i2].callFulfilled(t2);
      }
      return e2;
    }, l.reject = function(e2, t2) {
      e2.state = s, e2.outcome = t2;
      for (var r2 = -1, n2 = e2.queue.length; ++r2 < n2; ) e2.queue[r2].callRejected(t2);
      return e2;
    }, o.resolve = function(e2) {
      if (e2 instanceof this) return e2;
      return l.resolve(new this(u), e2);
    }, o.reject = function(e2) {
      var t2 = new this(u);
      return l.reject(t2, e2);
    }, o.all = function(e2) {
      var r2 = this;
      if ("[object Array]" !== Object.prototype.toString.call(e2)) return this.reject(new TypeError("must be an array"));
      var n2 = e2.length, i2 = false;
      if (!n2) return this.resolve([]);
      var s2 = new Array(n2), a2 = 0, t2 = -1, o2 = new this(u);
      for (; ++t2 < n2; ) h2(e2[t2], t2);
      return o2;
      function h2(e3, t3) {
        r2.resolve(e3).then(function(e4) {
          s2[t3] = e4, ++a2 !== n2 || i2 || (i2 = true, l.resolve(o2, s2));
        }, function(e4) {
          i2 || (i2 = true, l.reject(o2, e4));
        });
      }
    }, o.race = function(e2) {
      var t2 = this;
      if ("[object Array]" !== Object.prototype.toString.call(e2)) return this.reject(new TypeError("must be an array"));
      var r2 = e2.length, n2 = false;
      if (!r2) return this.resolve([]);
      var i2 = -1, s2 = new this(u);
      for (; ++i2 < r2; ) a2 = e2[i2], t2.resolve(a2).then(function(e3) {
        n2 || (n2 = true, l.resolve(s2, e3));
      }, function(e3) {
        n2 || (n2 = true, l.reject(s2, e3));
      });
      var a2;
      return s2;
    };
  }, { immediate: 36 }], 38: [function(e, t, r) {
    "use strict";
    var n = {};
    (0, e("./lib/utils/common").assign)(n, e("./lib/deflate"), e("./lib/inflate"), e("./lib/zlib/constants")), t.exports = n;
  }, { "./lib/deflate": 39, "./lib/inflate": 40, "./lib/utils/common": 41, "./lib/zlib/constants": 44 }], 39: [function(e, t, r) {
    "use strict";
    var a = e("./zlib/deflate"), o = e("./utils/common"), h = e("./utils/strings"), i = e("./zlib/messages"), s = e("./zlib/zstream"), u = Object.prototype.toString, l = 0, f = -1, c = 0, d = 8;
    function p(e2) {
      if (!(this instanceof p)) return new p(e2);
      this.options = o.assign({ level: f, method: d, chunkSize: 16384, windowBits: 15, memLevel: 8, strategy: c, to: "" }, e2 || {});
      var t2 = this.options;
      t2.raw && 0 < t2.windowBits ? t2.windowBits = -t2.windowBits : t2.gzip && 0 < t2.windowBits && t2.windowBits < 16 && (t2.windowBits += 16), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new s(), this.strm.avail_out = 0;
      var r2 = a.deflateInit2(this.strm, t2.level, t2.method, t2.windowBits, t2.memLevel, t2.strategy);
      if (r2 !== l) throw new Error(i[r2]);
      if (t2.header && a.deflateSetHeader(this.strm, t2.header), t2.dictionary) {
        var n2;
        if (n2 = "string" == typeof t2.dictionary ? h.string2buf(t2.dictionary) : "[object ArrayBuffer]" === u.call(t2.dictionary) ? new Uint8Array(t2.dictionary) : t2.dictionary, (r2 = a.deflateSetDictionary(this.strm, n2)) !== l) throw new Error(i[r2]);
        this._dict_set = true;
      }
    }
    function n(e2, t2) {
      var r2 = new p(t2);
      if (r2.push(e2, true), r2.err) throw r2.msg || i[r2.err];
      return r2.result;
    }
    p.prototype.push = function(e2, t2) {
      var r2, n2, i2 = this.strm, s2 = this.options.chunkSize;
      if (this.ended) return false;
      n2 = t2 === ~~t2 ? t2 : true === t2 ? 4 : 0, "string" == typeof e2 ? i2.input = h.string2buf(e2) : "[object ArrayBuffer]" === u.call(e2) ? i2.input = new Uint8Array(e2) : i2.input = e2, i2.next_in = 0, i2.avail_in = i2.input.length;
      do {
        if (0 === i2.avail_out && (i2.output = new o.Buf8(s2), i2.next_out = 0, i2.avail_out = s2), 1 !== (r2 = a.deflate(i2, n2)) && r2 !== l) return this.onEnd(r2), !(this.ended = true);
        0 !== i2.avail_out && (0 !== i2.avail_in || 4 !== n2 && 2 !== n2) || ("string" === this.options.to ? this.onData(h.buf2binstring(o.shrinkBuf(i2.output, i2.next_out))) : this.onData(o.shrinkBuf(i2.output, i2.next_out)));
      } while ((0 < i2.avail_in || 0 === i2.avail_out) && 1 !== r2);
      return 4 === n2 ? (r2 = a.deflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === l) : 2 !== n2 || (this.onEnd(l), !(i2.avail_out = 0));
    }, p.prototype.onData = function(e2) {
      this.chunks.push(e2);
    }, p.prototype.onEnd = function(e2) {
      e2 === l && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = o.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
    }, r.Deflate = p, r.deflate = n, r.deflateRaw = function(e2, t2) {
      return (t2 = t2 || {}).raw = true, n(e2, t2);
    }, r.gzip = function(e2, t2) {
      return (t2 = t2 || {}).gzip = true, n(e2, t2);
    };
  }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/deflate": 46, "./zlib/messages": 51, "./zlib/zstream": 53 }], 40: [function(e, t, r) {
    "use strict";
    var c = e("./zlib/inflate"), d = e("./utils/common"), p = e("./utils/strings"), m = e("./zlib/constants"), n = e("./zlib/messages"), i = e("./zlib/zstream"), s = e("./zlib/gzheader"), _ = Object.prototype.toString;
    function a(e2) {
      if (!(this instanceof a)) return new a(e2);
      this.options = d.assign({ chunkSize: 16384, windowBits: 0, to: "" }, e2 || {});
      var t2 = this.options;
      t2.raw && 0 <= t2.windowBits && t2.windowBits < 16 && (t2.windowBits = -t2.windowBits, 0 === t2.windowBits && (t2.windowBits = -15)), !(0 <= t2.windowBits && t2.windowBits < 16) || e2 && e2.windowBits || (t2.windowBits += 32), 15 < t2.windowBits && t2.windowBits < 48 && 0 == (15 & t2.windowBits) && (t2.windowBits |= 15), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new i(), this.strm.avail_out = 0;
      var r2 = c.inflateInit2(this.strm, t2.windowBits);
      if (r2 !== m.Z_OK) throw new Error(n[r2]);
      this.header = new s(), c.inflateGetHeader(this.strm, this.header);
    }
    function o(e2, t2) {
      var r2 = new a(t2);
      if (r2.push(e2, true), r2.err) throw r2.msg || n[r2.err];
      return r2.result;
    }
    a.prototype.push = function(e2, t2) {
      var r2, n2, i2, s2, a2, o2, h = this.strm, u = this.options.chunkSize, l = this.options.dictionary, f = false;
      if (this.ended) return false;
      n2 = t2 === ~~t2 ? t2 : true === t2 ? m.Z_FINISH : m.Z_NO_FLUSH, "string" == typeof e2 ? h.input = p.binstring2buf(e2) : "[object ArrayBuffer]" === _.call(e2) ? h.input = new Uint8Array(e2) : h.input = e2, h.next_in = 0, h.avail_in = h.input.length;
      do {
        if (0 === h.avail_out && (h.output = new d.Buf8(u), h.next_out = 0, h.avail_out = u), (r2 = c.inflate(h, m.Z_NO_FLUSH)) === m.Z_NEED_DICT && l && (o2 = "string" == typeof l ? p.string2buf(l) : "[object ArrayBuffer]" === _.call(l) ? new Uint8Array(l) : l, r2 = c.inflateSetDictionary(this.strm, o2)), r2 === m.Z_BUF_ERROR && true === f && (r2 = m.Z_OK, f = false), r2 !== m.Z_STREAM_END && r2 !== m.Z_OK) return this.onEnd(r2), !(this.ended = true);
        h.next_out && (0 !== h.avail_out && r2 !== m.Z_STREAM_END && (0 !== h.avail_in || n2 !== m.Z_FINISH && n2 !== m.Z_SYNC_FLUSH) || ("string" === this.options.to ? (i2 = p.utf8border(h.output, h.next_out), s2 = h.next_out - i2, a2 = p.buf2string(h.output, i2), h.next_out = s2, h.avail_out = u - s2, s2 && d.arraySet(h.output, h.output, i2, s2, 0), this.onData(a2)) : this.onData(d.shrinkBuf(h.output, h.next_out)))), 0 === h.avail_in && 0 === h.avail_out && (f = true);
      } while ((0 < h.avail_in || 0 === h.avail_out) && r2 !== m.Z_STREAM_END);
      return r2 === m.Z_STREAM_END && (n2 = m.Z_FINISH), n2 === m.Z_FINISH ? (r2 = c.inflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === m.Z_OK) : n2 !== m.Z_SYNC_FLUSH || (this.onEnd(m.Z_OK), !(h.avail_out = 0));
    }, a.prototype.onData = function(e2) {
      this.chunks.push(e2);
    }, a.prototype.onEnd = function(e2) {
      e2 === m.Z_OK && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = d.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
    }, r.Inflate = a, r.inflate = o, r.inflateRaw = function(e2, t2) {
      return (t2 = t2 || {}).raw = true, o(e2, t2);
    }, r.ungzip = o;
  }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/constants": 44, "./zlib/gzheader": 47, "./zlib/inflate": 49, "./zlib/messages": 51, "./zlib/zstream": 53 }], 41: [function(e, t, r) {
    "use strict";
    var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Int32Array;
    r.assign = function(e2) {
      for (var t2 = Array.prototype.slice.call(arguments, 1); t2.length; ) {
        var r2 = t2.shift();
        if (r2) {
          if ("object" != typeof r2) throw new TypeError(r2 + "must be non-object");
          for (var n2 in r2) r2.hasOwnProperty(n2) && (e2[n2] = r2[n2]);
        }
      }
      return e2;
    }, r.shrinkBuf = function(e2, t2) {
      return e2.length === t2 ? e2 : e2.subarray ? e2.subarray(0, t2) : (e2.length = t2, e2);
    };
    var i = { arraySet: function(e2, t2, r2, n2, i2) {
      if (t2.subarray && e2.subarray) e2.set(t2.subarray(r2, r2 + n2), i2);
      else for (var s2 = 0; s2 < n2; s2++) e2[i2 + s2] = t2[r2 + s2];
    }, flattenChunks: function(e2) {
      var t2, r2, n2, i2, s2, a;
      for (t2 = n2 = 0, r2 = e2.length; t2 < r2; t2++) n2 += e2[t2].length;
      for (a = new Uint8Array(n2), t2 = i2 = 0, r2 = e2.length; t2 < r2; t2++) s2 = e2[t2], a.set(s2, i2), i2 += s2.length;
      return a;
    } }, s = { arraySet: function(e2, t2, r2, n2, i2) {
      for (var s2 = 0; s2 < n2; s2++) e2[i2 + s2] = t2[r2 + s2];
    }, flattenChunks: function(e2) {
      return [].concat.apply([], e2);
    } };
    r.setTyped = function(e2) {
      e2 ? (r.Buf8 = Uint8Array, r.Buf16 = Uint16Array, r.Buf32 = Int32Array, r.assign(r, i)) : (r.Buf8 = Array, r.Buf16 = Array, r.Buf32 = Array, r.assign(r, s));
    }, r.setTyped(n);
  }, {}], 42: [function(e, t, r) {
    "use strict";
    var h = e("./common"), i = true, s = true;
    try {
      String.fromCharCode.apply(null, [0]);
    } catch (e2) {
      i = false;
    }
    try {
      String.fromCharCode.apply(null, new Uint8Array(1));
    } catch (e2) {
      s = false;
    }
    for (var u = new h.Buf8(256), n = 0; n < 256; n++) u[n] = 252 <= n ? 6 : 248 <= n ? 5 : 240 <= n ? 4 : 224 <= n ? 3 : 192 <= n ? 2 : 1;
    function l(e2, t2) {
      if (t2 < 65537 && (e2.subarray && s || !e2.subarray && i)) return String.fromCharCode.apply(null, h.shrinkBuf(e2, t2));
      for (var r2 = "", n2 = 0; n2 < t2; n2++) r2 += String.fromCharCode(e2[n2]);
      return r2;
    }
    u[254] = u[254] = 1, r.string2buf = function(e2) {
      var t2, r2, n2, i2, s2, a = e2.length, o = 0;
      for (i2 = 0; i2 < a; i2++) 55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
      for (t2 = new h.Buf8(o), i2 = s2 = 0; s2 < o; i2++) 55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t2[s2++] = r2 : (r2 < 2048 ? t2[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t2[s2++] = 224 | r2 >>> 12 : (t2[s2++] = 240 | r2 >>> 18, t2[s2++] = 128 | r2 >>> 12 & 63), t2[s2++] = 128 | r2 >>> 6 & 63), t2[s2++] = 128 | 63 & r2);
      return t2;
    }, r.buf2binstring = function(e2) {
      return l(e2, e2.length);
    }, r.binstring2buf = function(e2) {
      for (var t2 = new h.Buf8(e2.length), r2 = 0, n2 = t2.length; r2 < n2; r2++) t2[r2] = e2.charCodeAt(r2);
      return t2;
    }, r.buf2string = function(e2, t2) {
      var r2, n2, i2, s2, a = t2 || e2.length, o = new Array(2 * a);
      for (r2 = n2 = 0; r2 < a; ) if ((i2 = e2[r2++]) < 128) o[n2++] = i2;
      else if (4 < (s2 = u[i2])) o[n2++] = 65533, r2 += s2 - 1;
      else {
        for (i2 &= 2 === s2 ? 31 : 3 === s2 ? 15 : 7; 1 < s2 && r2 < a; ) i2 = i2 << 6 | 63 & e2[r2++], s2--;
        1 < s2 ? o[n2++] = 65533 : i2 < 65536 ? o[n2++] = i2 : (i2 -= 65536, o[n2++] = 55296 | i2 >> 10 & 1023, o[n2++] = 56320 | 1023 & i2);
      }
      return l(o, n2);
    }, r.utf8border = function(e2, t2) {
      var r2;
      for ((t2 = t2 || e2.length) > e2.length && (t2 = e2.length), r2 = t2 - 1; 0 <= r2 && 128 == (192 & e2[r2]); ) r2--;
      return r2 < 0 ? t2 : 0 === r2 ? t2 : r2 + u[e2[r2]] > t2 ? r2 : t2;
    };
  }, { "./common": 41 }], 43: [function(e, t, r) {
    "use strict";
    t.exports = function(e2, t2, r2, n) {
      for (var i = 65535 & e2 | 0, s = e2 >>> 16 & 65535 | 0, a = 0; 0 !== r2; ) {
        for (r2 -= a = 2e3 < r2 ? 2e3 : r2; s = s + (i = i + t2[n++] | 0) | 0, --a; ) ;
        i %= 65521, s %= 65521;
      }
      return i | s << 16 | 0;
    };
  }, {}], 44: [function(e, t, r) {
    "use strict";
    t.exports = { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_TREES: 6, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_BUF_ERROR: -5, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, Z_BINARY: 0, Z_TEXT: 1, Z_UNKNOWN: 2, Z_DEFLATED: 8 };
  }, {}], 45: [function(e, t, r) {
    "use strict";
    var o = (function() {
      for (var e2, t2 = [], r2 = 0; r2 < 256; r2++) {
        e2 = r2;
        for (var n = 0; n < 8; n++) e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
        t2[r2] = e2;
      }
      return t2;
    })();
    t.exports = function(e2, t2, r2, n) {
      var i = o, s = n + r2;
      e2 ^= -1;
      for (var a = n; a < s; a++) e2 = e2 >>> 8 ^ i[255 & (e2 ^ t2[a])];
      return -1 ^ e2;
    };
  }, {}], 46: [function(e, t, r) {
    "use strict";
    var h, c = e("../utils/common"), u = e("./trees"), d = e("./adler32"), p = e("./crc32"), n = e("./messages"), l = 0, f = 4, m = 0, _ = -2, g = -1, b = 4, i = 2, v = 8, y = 9, s = 286, a = 30, o = 19, w = 2 * s + 1, k = 15, x = 3, S = 258, z = S + x + 1, C = 42, E = 113, A = 1, I = 2, O = 3, B = 4;
    function R(e2, t2) {
      return e2.msg = n[t2], t2;
    }
    function T(e2) {
      return (e2 << 1) - (4 < e2 ? 9 : 0);
    }
    function D(e2) {
      for (var t2 = e2.length; 0 <= --t2; ) e2[t2] = 0;
    }
    function F(e2) {
      var t2 = e2.state, r2 = t2.pending;
      r2 > e2.avail_out && (r2 = e2.avail_out), 0 !== r2 && (c.arraySet(e2.output, t2.pending_buf, t2.pending_out, r2, e2.next_out), e2.next_out += r2, t2.pending_out += r2, e2.total_out += r2, e2.avail_out -= r2, t2.pending -= r2, 0 === t2.pending && (t2.pending_out = 0));
    }
    function N(e2, t2) {
      u._tr_flush_block(e2, 0 <= e2.block_start ? e2.block_start : -1, e2.strstart - e2.block_start, t2), e2.block_start = e2.strstart, F(e2.strm);
    }
    function U(e2, t2) {
      e2.pending_buf[e2.pending++] = t2;
    }
    function P(e2, t2) {
      e2.pending_buf[e2.pending++] = t2 >>> 8 & 255, e2.pending_buf[e2.pending++] = 255 & t2;
    }
    function L(e2, t2) {
      var r2, n2, i2 = e2.max_chain_length, s2 = e2.strstart, a2 = e2.prev_length, o2 = e2.nice_match, h2 = e2.strstart > e2.w_size - z ? e2.strstart - (e2.w_size - z) : 0, u2 = e2.window, l2 = e2.w_mask, f2 = e2.prev, c2 = e2.strstart + S, d2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
      e2.prev_length >= e2.good_match && (i2 >>= 2), o2 > e2.lookahead && (o2 = e2.lookahead);
      do {
        if (u2[(r2 = t2) + a2] === p2 && u2[r2 + a2 - 1] === d2 && u2[r2] === u2[s2] && u2[++r2] === u2[s2 + 1]) {
          s2 += 2, r2++;
          do {
          } while (u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && s2 < c2);
          if (n2 = S - (c2 - s2), s2 = c2 - S, a2 < n2) {
            if (e2.match_start = t2, o2 <= (a2 = n2)) break;
            d2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
          }
        }
      } while ((t2 = f2[t2 & l2]) > h2 && 0 != --i2);
      return a2 <= e2.lookahead ? a2 : e2.lookahead;
    }
    function j(e2) {
      var t2, r2, n2, i2, s2, a2, o2, h2, u2, l2, f2 = e2.w_size;
      do {
        if (i2 = e2.window_size - e2.lookahead - e2.strstart, e2.strstart >= f2 + (f2 - z)) {
          for (c.arraySet(e2.window, e2.window, f2, f2, 0), e2.match_start -= f2, e2.strstart -= f2, e2.block_start -= f2, t2 = r2 = e2.hash_size; n2 = e2.head[--t2], e2.head[t2] = f2 <= n2 ? n2 - f2 : 0, --r2; ) ;
          for (t2 = r2 = f2; n2 = e2.prev[--t2], e2.prev[t2] = f2 <= n2 ? n2 - f2 : 0, --r2; ) ;
          i2 += f2;
        }
        if (0 === e2.strm.avail_in) break;
        if (a2 = e2.strm, o2 = e2.window, h2 = e2.strstart + e2.lookahead, u2 = i2, l2 = void 0, l2 = a2.avail_in, u2 < l2 && (l2 = u2), r2 = 0 === l2 ? 0 : (a2.avail_in -= l2, c.arraySet(o2, a2.input, a2.next_in, l2, h2), 1 === a2.state.wrap ? a2.adler = d(a2.adler, o2, l2, h2) : 2 === a2.state.wrap && (a2.adler = p(a2.adler, o2, l2, h2)), a2.next_in += l2, a2.total_in += l2, l2), e2.lookahead += r2, e2.lookahead + e2.insert >= x) for (s2 = e2.strstart - e2.insert, e2.ins_h = e2.window[s2], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + 1]) & e2.hash_mask; e2.insert && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + x - 1]) & e2.hash_mask, e2.prev[s2 & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = s2, s2++, e2.insert--, !(e2.lookahead + e2.insert < x)); ) ;
      } while (e2.lookahead < z && 0 !== e2.strm.avail_in);
    }
    function Z(e2, t2) {
      for (var r2, n2; ; ) {
        if (e2.lookahead < z) {
          if (j(e2), e2.lookahead < z && t2 === l) return A;
          if (0 === e2.lookahead) break;
        }
        if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 !== r2 && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2)), e2.match_length >= x) if (n2 = u._tr_tally(e2, e2.strstart - e2.match_start, e2.match_length - x), e2.lookahead -= e2.match_length, e2.match_length <= e2.max_lazy_match && e2.lookahead >= x) {
          for (e2.match_length--; e2.strstart++, e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart, 0 != --e2.match_length; ) ;
          e2.strstart++;
        } else e2.strstart += e2.match_length, e2.match_length = 0, e2.ins_h = e2.window[e2.strstart], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + 1]) & e2.hash_mask;
        else n2 = u._tr_tally(e2, 0, e2.window[e2.strstart]), e2.lookahead--, e2.strstart++;
        if (n2 && (N(e2, false), 0 === e2.strm.avail_out)) return A;
      }
      return e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
    }
    function W(e2, t2) {
      for (var r2, n2, i2; ; ) {
        if (e2.lookahead < z) {
          if (j(e2), e2.lookahead < z && t2 === l) return A;
          if (0 === e2.lookahead) break;
        }
        if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), e2.prev_length = e2.match_length, e2.prev_match = e2.match_start, e2.match_length = x - 1, 0 !== r2 && e2.prev_length < e2.max_lazy_match && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2), e2.match_length <= 5 && (1 === e2.strategy || e2.match_length === x && 4096 < e2.strstart - e2.match_start) && (e2.match_length = x - 1)), e2.prev_length >= x && e2.match_length <= e2.prev_length) {
          for (i2 = e2.strstart + e2.lookahead - x, n2 = u._tr_tally(e2, e2.strstart - 1 - e2.prev_match, e2.prev_length - x), e2.lookahead -= e2.prev_length - 1, e2.prev_length -= 2; ++e2.strstart <= i2 && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 != --e2.prev_length; ) ;
          if (e2.match_available = 0, e2.match_length = x - 1, e2.strstart++, n2 && (N(e2, false), 0 === e2.strm.avail_out)) return A;
        } else if (e2.match_available) {
          if ((n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1])) && N(e2, false), e2.strstart++, e2.lookahead--, 0 === e2.strm.avail_out) return A;
        } else e2.match_available = 1, e2.strstart++, e2.lookahead--;
      }
      return e2.match_available && (n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1]), e2.match_available = 0), e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
    }
    function M(e2, t2, r2, n2, i2) {
      this.good_length = e2, this.max_lazy = t2, this.nice_length = r2, this.max_chain = n2, this.func = i2;
    }
    function H() {
      this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = v, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new c.Buf16(2 * w), this.dyn_dtree = new c.Buf16(2 * (2 * a + 1)), this.bl_tree = new c.Buf16(2 * (2 * o + 1)), D(this.dyn_ltree), D(this.dyn_dtree), D(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new c.Buf16(k + 1), this.heap = new c.Buf16(2 * s + 1), D(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new c.Buf16(2 * s + 1), D(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
    }
    function G(e2) {
      var t2;
      return e2 && e2.state ? (e2.total_in = e2.total_out = 0, e2.data_type = i, (t2 = e2.state).pending = 0, t2.pending_out = 0, t2.wrap < 0 && (t2.wrap = -t2.wrap), t2.status = t2.wrap ? C : E, e2.adler = 2 === t2.wrap ? 0 : 1, t2.last_flush = l, u._tr_init(t2), m) : R(e2, _);
    }
    function K(e2) {
      var t2 = G(e2);
      return t2 === m && (function(e3) {
        e3.window_size = 2 * e3.w_size, D(e3.head), e3.max_lazy_match = h[e3.level].max_lazy, e3.good_match = h[e3.level].good_length, e3.nice_match = h[e3.level].nice_length, e3.max_chain_length = h[e3.level].max_chain, e3.strstart = 0, e3.block_start = 0, e3.lookahead = 0, e3.insert = 0, e3.match_length = e3.prev_length = x - 1, e3.match_available = 0, e3.ins_h = 0;
      })(e2.state), t2;
    }
    function Y(e2, t2, r2, n2, i2, s2) {
      if (!e2) return _;
      var a2 = 1;
      if (t2 === g && (t2 = 6), n2 < 0 ? (a2 = 0, n2 = -n2) : 15 < n2 && (a2 = 2, n2 -= 16), i2 < 1 || y < i2 || r2 !== v || n2 < 8 || 15 < n2 || t2 < 0 || 9 < t2 || s2 < 0 || b < s2) return R(e2, _);
      8 === n2 && (n2 = 9);
      var o2 = new H();
      return (e2.state = o2).strm = e2, o2.wrap = a2, o2.gzhead = null, o2.w_bits = n2, o2.w_size = 1 << o2.w_bits, o2.w_mask = o2.w_size - 1, o2.hash_bits = i2 + 7, o2.hash_size = 1 << o2.hash_bits, o2.hash_mask = o2.hash_size - 1, o2.hash_shift = ~~((o2.hash_bits + x - 1) / x), o2.window = new c.Buf8(2 * o2.w_size), o2.head = new c.Buf16(o2.hash_size), o2.prev = new c.Buf16(o2.w_size), o2.lit_bufsize = 1 << i2 + 6, o2.pending_buf_size = 4 * o2.lit_bufsize, o2.pending_buf = new c.Buf8(o2.pending_buf_size), o2.d_buf = 1 * o2.lit_bufsize, o2.l_buf = 3 * o2.lit_bufsize, o2.level = t2, o2.strategy = s2, o2.method = r2, K(e2);
    }
    h = [new M(0, 0, 0, 0, function(e2, t2) {
      var r2 = 65535;
      for (r2 > e2.pending_buf_size - 5 && (r2 = e2.pending_buf_size - 5); ; ) {
        if (e2.lookahead <= 1) {
          if (j(e2), 0 === e2.lookahead && t2 === l) return A;
          if (0 === e2.lookahead) break;
        }
        e2.strstart += e2.lookahead, e2.lookahead = 0;
        var n2 = e2.block_start + r2;
        if ((0 === e2.strstart || e2.strstart >= n2) && (e2.lookahead = e2.strstart - n2, e2.strstart = n2, N(e2, false), 0 === e2.strm.avail_out)) return A;
        if (e2.strstart - e2.block_start >= e2.w_size - z && (N(e2, false), 0 === e2.strm.avail_out)) return A;
      }
      return e2.insert = 0, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : (e2.strstart > e2.block_start && (N(e2, false), e2.strm.avail_out), A);
    }), new M(4, 4, 8, 4, Z), new M(4, 5, 16, 8, Z), new M(4, 6, 32, 32, Z), new M(4, 4, 16, 16, W), new M(8, 16, 32, 32, W), new M(8, 16, 128, 128, W), new M(8, 32, 128, 256, W), new M(32, 128, 258, 1024, W), new M(32, 258, 258, 4096, W)], r.deflateInit = function(e2, t2) {
      return Y(e2, t2, v, 15, 8, 0);
    }, r.deflateInit2 = Y, r.deflateReset = K, r.deflateResetKeep = G, r.deflateSetHeader = function(e2, t2) {
      return e2 && e2.state ? 2 !== e2.state.wrap ? _ : (e2.state.gzhead = t2, m) : _;
    }, r.deflate = function(e2, t2) {
      var r2, n2, i2, s2;
      if (!e2 || !e2.state || 5 < t2 || t2 < 0) return e2 ? R(e2, _) : _;
      if (n2 = e2.state, !e2.output || !e2.input && 0 !== e2.avail_in || 666 === n2.status && t2 !== f) return R(e2, 0 === e2.avail_out ? -5 : _);
      if (n2.strm = e2, r2 = n2.last_flush, n2.last_flush = t2, n2.status === C) if (2 === n2.wrap) e2.adler = 0, U(n2, 31), U(n2, 139), U(n2, 8), n2.gzhead ? (U(n2, (n2.gzhead.text ? 1 : 0) + (n2.gzhead.hcrc ? 2 : 0) + (n2.gzhead.extra ? 4 : 0) + (n2.gzhead.name ? 8 : 0) + (n2.gzhead.comment ? 16 : 0)), U(n2, 255 & n2.gzhead.time), U(n2, n2.gzhead.time >> 8 & 255), U(n2, n2.gzhead.time >> 16 & 255), U(n2, n2.gzhead.time >> 24 & 255), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 255 & n2.gzhead.os), n2.gzhead.extra && n2.gzhead.extra.length && (U(n2, 255 & n2.gzhead.extra.length), U(n2, n2.gzhead.extra.length >> 8 & 255)), n2.gzhead.hcrc && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending, 0)), n2.gzindex = 0, n2.status = 69) : (U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 3), n2.status = E);
      else {
        var a2 = v + (n2.w_bits - 8 << 4) << 8;
        a2 |= (2 <= n2.strategy || n2.level < 2 ? 0 : n2.level < 6 ? 1 : 6 === n2.level ? 2 : 3) << 6, 0 !== n2.strstart && (a2 |= 32), a2 += 31 - a2 % 31, n2.status = E, P(n2, a2), 0 !== n2.strstart && (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), e2.adler = 1;
      }
      if (69 === n2.status) if (n2.gzhead.extra) {
        for (i2 = n2.pending; n2.gzindex < (65535 & n2.gzhead.extra.length) && (n2.pending !== n2.pending_buf_size || (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending !== n2.pending_buf_size)); ) U(n2, 255 & n2.gzhead.extra[n2.gzindex]), n2.gzindex++;
        n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), n2.gzindex === n2.gzhead.extra.length && (n2.gzindex = 0, n2.status = 73);
      } else n2.status = 73;
      if (73 === n2.status) if (n2.gzhead.name) {
        i2 = n2.pending;
        do {
          if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
            s2 = 1;
            break;
          }
          s2 = n2.gzindex < n2.gzhead.name.length ? 255 & n2.gzhead.name.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
        } while (0 !== s2);
        n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.gzindex = 0, n2.status = 91);
      } else n2.status = 91;
      if (91 === n2.status) if (n2.gzhead.comment) {
        i2 = n2.pending;
        do {
          if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
            s2 = 1;
            break;
          }
          s2 = n2.gzindex < n2.gzhead.comment.length ? 255 & n2.gzhead.comment.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
        } while (0 !== s2);
        n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.status = 103);
      } else n2.status = 103;
      if (103 === n2.status && (n2.gzhead.hcrc ? (n2.pending + 2 > n2.pending_buf_size && F(e2), n2.pending + 2 <= n2.pending_buf_size && (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), e2.adler = 0, n2.status = E)) : n2.status = E), 0 !== n2.pending) {
        if (F(e2), 0 === e2.avail_out) return n2.last_flush = -1, m;
      } else if (0 === e2.avail_in && T(t2) <= T(r2) && t2 !== f) return R(e2, -5);
      if (666 === n2.status && 0 !== e2.avail_in) return R(e2, -5);
      if (0 !== e2.avail_in || 0 !== n2.lookahead || t2 !== l && 666 !== n2.status) {
        var o2 = 2 === n2.strategy ? (function(e3, t3) {
          for (var r3; ; ) {
            if (0 === e3.lookahead && (j(e3), 0 === e3.lookahead)) {
              if (t3 === l) return A;
              break;
            }
            if (e3.match_length = 0, r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++, r3 && (N(e3, false), 0 === e3.strm.avail_out)) return A;
          }
          return e3.insert = 0, t3 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
        })(n2, t2) : 3 === n2.strategy ? (function(e3, t3) {
          for (var r3, n3, i3, s3, a3 = e3.window; ; ) {
            if (e3.lookahead <= S) {
              if (j(e3), e3.lookahead <= S && t3 === l) return A;
              if (0 === e3.lookahead) break;
            }
            if (e3.match_length = 0, e3.lookahead >= x && 0 < e3.strstart && (n3 = a3[i3 = e3.strstart - 1]) === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3]) {
              s3 = e3.strstart + S;
              do {
              } while (n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && i3 < s3);
              e3.match_length = S - (s3 - i3), e3.match_length > e3.lookahead && (e3.match_length = e3.lookahead);
            }
            if (e3.match_length >= x ? (r3 = u._tr_tally(e3, 1, e3.match_length - x), e3.lookahead -= e3.match_length, e3.strstart += e3.match_length, e3.match_length = 0) : (r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++), r3 && (N(e3, false), 0 === e3.strm.avail_out)) return A;
          }
          return e3.insert = 0, t3 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
        })(n2, t2) : h[n2.level].func(n2, t2);
        if (o2 !== O && o2 !== B || (n2.status = 666), o2 === A || o2 === O) return 0 === e2.avail_out && (n2.last_flush = -1), m;
        if (o2 === I && (1 === t2 ? u._tr_align(n2) : 5 !== t2 && (u._tr_stored_block(n2, 0, 0, false), 3 === t2 && (D(n2.head), 0 === n2.lookahead && (n2.strstart = 0, n2.block_start = 0, n2.insert = 0))), F(e2), 0 === e2.avail_out)) return n2.last_flush = -1, m;
      }
      return t2 !== f ? m : n2.wrap <= 0 ? 1 : (2 === n2.wrap ? (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), U(n2, e2.adler >> 16 & 255), U(n2, e2.adler >> 24 & 255), U(n2, 255 & e2.total_in), U(n2, e2.total_in >> 8 & 255), U(n2, e2.total_in >> 16 & 255), U(n2, e2.total_in >> 24 & 255)) : (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), F(e2), 0 < n2.wrap && (n2.wrap = -n2.wrap), 0 !== n2.pending ? m : 1);
    }, r.deflateEnd = function(e2) {
      var t2;
      return e2 && e2.state ? (t2 = e2.state.status) !== C && 69 !== t2 && 73 !== t2 && 91 !== t2 && 103 !== t2 && t2 !== E && 666 !== t2 ? R(e2, _) : (e2.state = null, t2 === E ? R(e2, -3) : m) : _;
    }, r.deflateSetDictionary = function(e2, t2) {
      var r2, n2, i2, s2, a2, o2, h2, u2, l2 = t2.length;
      if (!e2 || !e2.state) return _;
      if (2 === (s2 = (r2 = e2.state).wrap) || 1 === s2 && r2.status !== C || r2.lookahead) return _;
      for (1 === s2 && (e2.adler = d(e2.adler, t2, l2, 0)), r2.wrap = 0, l2 >= r2.w_size && (0 === s2 && (D(r2.head), r2.strstart = 0, r2.block_start = 0, r2.insert = 0), u2 = new c.Buf8(r2.w_size), c.arraySet(u2, t2, l2 - r2.w_size, r2.w_size, 0), t2 = u2, l2 = r2.w_size), a2 = e2.avail_in, o2 = e2.next_in, h2 = e2.input, e2.avail_in = l2, e2.next_in = 0, e2.input = t2, j(r2); r2.lookahead >= x; ) {
        for (n2 = r2.strstart, i2 = r2.lookahead - (x - 1); r2.ins_h = (r2.ins_h << r2.hash_shift ^ r2.window[n2 + x - 1]) & r2.hash_mask, r2.prev[n2 & r2.w_mask] = r2.head[r2.ins_h], r2.head[r2.ins_h] = n2, n2++, --i2; ) ;
        r2.strstart = n2, r2.lookahead = x - 1, j(r2);
      }
      return r2.strstart += r2.lookahead, r2.block_start = r2.strstart, r2.insert = r2.lookahead, r2.lookahead = 0, r2.match_length = r2.prev_length = x - 1, r2.match_available = 0, e2.next_in = o2, e2.input = h2, e2.avail_in = a2, r2.wrap = s2, m;
    }, r.deflateInfo = "pako deflate (from Nodeca project)";
  }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./messages": 51, "./trees": 52 }], 47: [function(e, t, r) {
    "use strict";
    t.exports = function() {
      this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = false;
    };
  }, {}], 48: [function(e, t, r) {
    "use strict";
    t.exports = function(e2, t2) {
      var r2, n, i, s, a, o, h, u, l, f, c, d, p, m, _, g, b, v, y, w, k, x, S, z, C;
      r2 = e2.state, n = e2.next_in, z = e2.input, i = n + (e2.avail_in - 5), s = e2.next_out, C = e2.output, a = s - (t2 - e2.avail_out), o = s + (e2.avail_out - 257), h = r2.dmax, u = r2.wsize, l = r2.whave, f = r2.wnext, c = r2.window, d = r2.hold, p = r2.bits, m = r2.lencode, _ = r2.distcode, g = (1 << r2.lenbits) - 1, b = (1 << r2.distbits) - 1;
      e: do {
        p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = m[d & g];
        t: for (; ; ) {
          if (d >>>= y = v >>> 24, p -= y, 0 === (y = v >>> 16 & 255)) C[s++] = 65535 & v;
          else {
            if (!(16 & y)) {
              if (0 == (64 & y)) {
                v = m[(65535 & v) + (d & (1 << y) - 1)];
                continue t;
              }
              if (32 & y) {
                r2.mode = 12;
                break e;
              }
              e2.msg = "invalid literal/length code", r2.mode = 30;
              break e;
            }
            w = 65535 & v, (y &= 15) && (p < y && (d += z[n++] << p, p += 8), w += d & (1 << y) - 1, d >>>= y, p -= y), p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = _[d & b];
            r: for (; ; ) {
              if (d >>>= y = v >>> 24, p -= y, !(16 & (y = v >>> 16 & 255))) {
                if (0 == (64 & y)) {
                  v = _[(65535 & v) + (d & (1 << y) - 1)];
                  continue r;
                }
                e2.msg = "invalid distance code", r2.mode = 30;
                break e;
              }
              if (k = 65535 & v, p < (y &= 15) && (d += z[n++] << p, (p += 8) < y && (d += z[n++] << p, p += 8)), h < (k += d & (1 << y) - 1)) {
                e2.msg = "invalid distance too far back", r2.mode = 30;
                break e;
              }
              if (d >>>= y, p -= y, (y = s - a) < k) {
                if (l < (y = k - y) && r2.sane) {
                  e2.msg = "invalid distance too far back", r2.mode = 30;
                  break e;
                }
                if (S = c, (x = 0) === f) {
                  if (x += u - y, y < w) {
                    for (w -= y; C[s++] = c[x++], --y; ) ;
                    x = s - k, S = C;
                  }
                } else if (f < y) {
                  if (x += u + f - y, (y -= f) < w) {
                    for (w -= y; C[s++] = c[x++], --y; ) ;
                    if (x = 0, f < w) {
                      for (w -= y = f; C[s++] = c[x++], --y; ) ;
                      x = s - k, S = C;
                    }
                  }
                } else if (x += f - y, y < w) {
                  for (w -= y; C[s++] = c[x++], --y; ) ;
                  x = s - k, S = C;
                }
                for (; 2 < w; ) C[s++] = S[x++], C[s++] = S[x++], C[s++] = S[x++], w -= 3;
                w && (C[s++] = S[x++], 1 < w && (C[s++] = S[x++]));
              } else {
                for (x = s - k; C[s++] = C[x++], C[s++] = C[x++], C[s++] = C[x++], 2 < (w -= 3); ) ;
                w && (C[s++] = C[x++], 1 < w && (C[s++] = C[x++]));
              }
              break;
            }
          }
          break;
        }
      } while (n < i && s < o);
      n -= w = p >> 3, d &= (1 << (p -= w << 3)) - 1, e2.next_in = n, e2.next_out = s, e2.avail_in = n < i ? i - n + 5 : 5 - (n - i), e2.avail_out = s < o ? o - s + 257 : 257 - (s - o), r2.hold = d, r2.bits = p;
    };
  }, {}], 49: [function(e, t, r) {
    "use strict";
    var I = e("../utils/common"), O = e("./adler32"), B = e("./crc32"), R = e("./inffast"), T = e("./inftrees"), D = 1, F = 2, N = 0, U = -2, P = 1, n = 852, i = 592;
    function L(e2) {
      return (e2 >>> 24 & 255) + (e2 >>> 8 & 65280) + ((65280 & e2) << 8) + ((255 & e2) << 24);
    }
    function s() {
      this.mode = 0, this.last = false, this.wrap = 0, this.havedict = false, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new I.Buf16(320), this.work = new I.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
    }
    function a(e2) {
      var t2;
      return e2 && e2.state ? (t2 = e2.state, e2.total_in = e2.total_out = t2.total = 0, e2.msg = "", t2.wrap && (e2.adler = 1 & t2.wrap), t2.mode = P, t2.last = 0, t2.havedict = 0, t2.dmax = 32768, t2.head = null, t2.hold = 0, t2.bits = 0, t2.lencode = t2.lendyn = new I.Buf32(n), t2.distcode = t2.distdyn = new I.Buf32(i), t2.sane = 1, t2.back = -1, N) : U;
    }
    function o(e2) {
      var t2;
      return e2 && e2.state ? ((t2 = e2.state).wsize = 0, t2.whave = 0, t2.wnext = 0, a(e2)) : U;
    }
    function h(e2, t2) {
      var r2, n2;
      return e2 && e2.state ? (n2 = e2.state, t2 < 0 ? (r2 = 0, t2 = -t2) : (r2 = 1 + (t2 >> 4), t2 < 48 && (t2 &= 15)), t2 && (t2 < 8 || 15 < t2) ? U : (null !== n2.window && n2.wbits !== t2 && (n2.window = null), n2.wrap = r2, n2.wbits = t2, o(e2))) : U;
    }
    function u(e2, t2) {
      var r2, n2;
      return e2 ? (n2 = new s(), (e2.state = n2).window = null, (r2 = h(e2, t2)) !== N && (e2.state = null), r2) : U;
    }
    var l, f, c = true;
    function j(e2) {
      if (c) {
        var t2;
        for (l = new I.Buf32(512), f = new I.Buf32(32), t2 = 0; t2 < 144; ) e2.lens[t2++] = 8;
        for (; t2 < 256; ) e2.lens[t2++] = 9;
        for (; t2 < 280; ) e2.lens[t2++] = 7;
        for (; t2 < 288; ) e2.lens[t2++] = 8;
        for (T(D, e2.lens, 0, 288, l, 0, e2.work, { bits: 9 }), t2 = 0; t2 < 32; ) e2.lens[t2++] = 5;
        T(F, e2.lens, 0, 32, f, 0, e2.work, { bits: 5 }), c = false;
      }
      e2.lencode = l, e2.lenbits = 9, e2.distcode = f, e2.distbits = 5;
    }
    function Z(e2, t2, r2, n2) {
      var i2, s2 = e2.state;
      return null === s2.window && (s2.wsize = 1 << s2.wbits, s2.wnext = 0, s2.whave = 0, s2.window = new I.Buf8(s2.wsize)), n2 >= s2.wsize ? (I.arraySet(s2.window, t2, r2 - s2.wsize, s2.wsize, 0), s2.wnext = 0, s2.whave = s2.wsize) : (n2 < (i2 = s2.wsize - s2.wnext) && (i2 = n2), I.arraySet(s2.window, t2, r2 - n2, i2, s2.wnext), (n2 -= i2) ? (I.arraySet(s2.window, t2, r2 - n2, n2, 0), s2.wnext = n2, s2.whave = s2.wsize) : (s2.wnext += i2, s2.wnext === s2.wsize && (s2.wnext = 0), s2.whave < s2.wsize && (s2.whave += i2))), 0;
    }
    r.inflateReset = o, r.inflateReset2 = h, r.inflateResetKeep = a, r.inflateInit = function(e2) {
      return u(e2, 15);
    }, r.inflateInit2 = u, r.inflate = function(e2, t2) {
      var r2, n2, i2, s2, a2, o2, h2, u2, l2, f2, c2, d, p, m, _, g, b, v, y, w, k, x, S, z, C = 0, E = new I.Buf8(4), A = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
      if (!e2 || !e2.state || !e2.output || !e2.input && 0 !== e2.avail_in) return U;
      12 === (r2 = e2.state).mode && (r2.mode = 13), a2 = e2.next_out, i2 = e2.output, h2 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, f2 = o2, c2 = h2, x = N;
      e: for (; ; ) switch (r2.mode) {
        case P:
          if (0 === r2.wrap) {
            r2.mode = 13;
            break;
          }
          for (; l2 < 16; ) {
            if (0 === o2) break e;
            o2--, u2 += n2[s2++] << l2, l2 += 8;
          }
          if (2 & r2.wrap && 35615 === u2) {
            E[r2.check = 0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0), l2 = u2 = 0, r2.mode = 2;
            break;
          }
          if (r2.flags = 0, r2.head && (r2.head.done = false), !(1 & r2.wrap) || (((255 & u2) << 8) + (u2 >> 8)) % 31) {
            e2.msg = "incorrect header check", r2.mode = 30;
            break;
          }
          if (8 != (15 & u2)) {
            e2.msg = "unknown compression method", r2.mode = 30;
            break;
          }
          if (l2 -= 4, k = 8 + (15 & (u2 >>>= 4)), 0 === r2.wbits) r2.wbits = k;
          else if (k > r2.wbits) {
            e2.msg = "invalid window size", r2.mode = 30;
            break;
          }
          r2.dmax = 1 << k, e2.adler = r2.check = 1, r2.mode = 512 & u2 ? 10 : 12, l2 = u2 = 0;
          break;
        case 2:
          for (; l2 < 16; ) {
            if (0 === o2) break e;
            o2--, u2 += n2[s2++] << l2, l2 += 8;
          }
          if (r2.flags = u2, 8 != (255 & r2.flags)) {
            e2.msg = "unknown compression method", r2.mode = 30;
            break;
          }
          if (57344 & r2.flags) {
            e2.msg = "unknown header flags set", r2.mode = 30;
            break;
          }
          r2.head && (r2.head.text = u2 >> 8 & 1), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 3;
        case 3:
          for (; l2 < 32; ) {
            if (0 === o2) break e;
            o2--, u2 += n2[s2++] << l2, l2 += 8;
          }
          r2.head && (r2.head.time = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, E[2] = u2 >>> 16 & 255, E[3] = u2 >>> 24 & 255, r2.check = B(r2.check, E, 4, 0)), l2 = u2 = 0, r2.mode = 4;
        case 4:
          for (; l2 < 16; ) {
            if (0 === o2) break e;
            o2--, u2 += n2[s2++] << l2, l2 += 8;
          }
          r2.head && (r2.head.xflags = 255 & u2, r2.head.os = u2 >> 8), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 5;
        case 5:
          if (1024 & r2.flags) {
            for (; l2 < 16; ) {
              if (0 === o2) break e;
              o2--, u2 += n2[s2++] << l2, l2 += 8;
            }
            r2.length = u2, r2.head && (r2.head.extra_len = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0;
          } else r2.head && (r2.head.extra = null);
          r2.mode = 6;
        case 6:
          if (1024 & r2.flags && (o2 < (d = r2.length) && (d = o2), d && (r2.head && (k = r2.head.extra_len - r2.length, r2.head.extra || (r2.head.extra = new Array(r2.head.extra_len)), I.arraySet(r2.head.extra, n2, s2, d, k)), 512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, r2.length -= d), r2.length)) break e;
          r2.length = 0, r2.mode = 7;
        case 7:
          if (2048 & r2.flags) {
            if (0 === o2) break e;
            for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.name += String.fromCharCode(k)), k && d < o2; ) ;
            if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k) break e;
          } else r2.head && (r2.head.name = null);
          r2.length = 0, r2.mode = 8;
        case 8:
          if (4096 & r2.flags) {
            if (0 === o2) break e;
            for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.comment += String.fromCharCode(k)), k && d < o2; ) ;
            if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k) break e;
          } else r2.head && (r2.head.comment = null);
          r2.mode = 9;
        case 9:
          if (512 & r2.flags) {
            for (; l2 < 16; ) {
              if (0 === o2) break e;
              o2--, u2 += n2[s2++] << l2, l2 += 8;
            }
            if (u2 !== (65535 & r2.check)) {
              e2.msg = "header crc mismatch", r2.mode = 30;
              break;
            }
            l2 = u2 = 0;
          }
          r2.head && (r2.head.hcrc = r2.flags >> 9 & 1, r2.head.done = true), e2.adler = r2.check = 0, r2.mode = 12;
          break;
        case 10:
          for (; l2 < 32; ) {
            if (0 === o2) break e;
            o2--, u2 += n2[s2++] << l2, l2 += 8;
          }
          e2.adler = r2.check = L(u2), l2 = u2 = 0, r2.mode = 11;
        case 11:
          if (0 === r2.havedict) return e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, 2;
          e2.adler = r2.check = 1, r2.mode = 12;
        case 12:
          if (5 === t2 || 6 === t2) break e;
        case 13:
          if (r2.last) {
            u2 >>>= 7 & l2, l2 -= 7 & l2, r2.mode = 27;
            break;
          }
          for (; l2 < 3; ) {
            if (0 === o2) break e;
            o2--, u2 += n2[s2++] << l2, l2 += 8;
          }
          switch (r2.last = 1 & u2, l2 -= 1, 3 & (u2 >>>= 1)) {
            case 0:
              r2.mode = 14;
              break;
            case 1:
              if (j(r2), r2.mode = 20, 6 !== t2) break;
              u2 >>>= 2, l2 -= 2;
              break e;
            case 2:
              r2.mode = 17;
              break;
            case 3:
              e2.msg = "invalid block type", r2.mode = 30;
          }
          u2 >>>= 2, l2 -= 2;
          break;
        case 14:
          for (u2 >>>= 7 & l2, l2 -= 7 & l2; l2 < 32; ) {
            if (0 === o2) break e;
            o2--, u2 += n2[s2++] << l2, l2 += 8;
          }
          if ((65535 & u2) != (u2 >>> 16 ^ 65535)) {
            e2.msg = "invalid stored block lengths", r2.mode = 30;
            break;
          }
          if (r2.length = 65535 & u2, l2 = u2 = 0, r2.mode = 15, 6 === t2) break e;
        case 15:
          r2.mode = 16;
        case 16:
          if (d = r2.length) {
            if (o2 < d && (d = o2), h2 < d && (d = h2), 0 === d) break e;
            I.arraySet(i2, n2, s2, d, a2), o2 -= d, s2 += d, h2 -= d, a2 += d, r2.length -= d;
            break;
          }
          r2.mode = 12;
          break;
        case 17:
          for (; l2 < 14; ) {
            if (0 === o2) break e;
            o2--, u2 += n2[s2++] << l2, l2 += 8;
          }
          if (r2.nlen = 257 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ndist = 1 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ncode = 4 + (15 & u2), u2 >>>= 4, l2 -= 4, 286 < r2.nlen || 30 < r2.ndist) {
            e2.msg = "too many length or distance symbols", r2.mode = 30;
            break;
          }
          r2.have = 0, r2.mode = 18;
        case 18:
          for (; r2.have < r2.ncode; ) {
            for (; l2 < 3; ) {
              if (0 === o2) break e;
              o2--, u2 += n2[s2++] << l2, l2 += 8;
            }
            r2.lens[A[r2.have++]] = 7 & u2, u2 >>>= 3, l2 -= 3;
          }
          for (; r2.have < 19; ) r2.lens[A[r2.have++]] = 0;
          if (r2.lencode = r2.lendyn, r2.lenbits = 7, S = { bits: r2.lenbits }, x = T(0, r2.lens, 0, 19, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
            e2.msg = "invalid code lengths set", r2.mode = 30;
            break;
          }
          r2.have = 0, r2.mode = 19;
        case 19:
          for (; r2.have < r2.nlen + r2.ndist; ) {
            for (; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
              if (0 === o2) break e;
              o2--, u2 += n2[s2++] << l2, l2 += 8;
            }
            if (b < 16) u2 >>>= _, l2 -= _, r2.lens[r2.have++] = b;
            else {
              if (16 === b) {
                for (z = _ + 2; l2 < z; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (u2 >>>= _, l2 -= _, 0 === r2.have) {
                  e2.msg = "invalid bit length repeat", r2.mode = 30;
                  break;
                }
                k = r2.lens[r2.have - 1], d = 3 + (3 & u2), u2 >>>= 2, l2 -= 2;
              } else if (17 === b) {
                for (z = _ + 3; l2 < z; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                l2 -= _, k = 0, d = 3 + (7 & (u2 >>>= _)), u2 >>>= 3, l2 -= 3;
              } else {
                for (z = _ + 7; l2 < z; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                l2 -= _, k = 0, d = 11 + (127 & (u2 >>>= _)), u2 >>>= 7, l2 -= 7;
              }
              if (r2.have + d > r2.nlen + r2.ndist) {
                e2.msg = "invalid bit length repeat", r2.mode = 30;
                break;
              }
              for (; d--; ) r2.lens[r2.have++] = k;
            }
          }
          if (30 === r2.mode) break;
          if (0 === r2.lens[256]) {
            e2.msg = "invalid code -- missing end-of-block", r2.mode = 30;
            break;
          }
          if (r2.lenbits = 9, S = { bits: r2.lenbits }, x = T(D, r2.lens, 0, r2.nlen, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
            e2.msg = "invalid literal/lengths set", r2.mode = 30;
            break;
          }
          if (r2.distbits = 6, r2.distcode = r2.distdyn, S = { bits: r2.distbits }, x = T(F, r2.lens, r2.nlen, r2.ndist, r2.distcode, 0, r2.work, S), r2.distbits = S.bits, x) {
            e2.msg = "invalid distances set", r2.mode = 30;
            break;
          }
          if (r2.mode = 20, 6 === t2) break e;
        case 20:
          r2.mode = 21;
        case 21:
          if (6 <= o2 && 258 <= h2) {
            e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, R(e2, c2), a2 = e2.next_out, i2 = e2.output, h2 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, 12 === r2.mode && (r2.back = -1);
            break;
          }
          for (r2.back = 0; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
            if (0 === o2) break e;
            o2--, u2 += n2[s2++] << l2, l2 += 8;
          }
          if (g && 0 == (240 & g)) {
            for (v = _, y = g, w = b; g = (C = r2.lencode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
              if (0 === o2) break e;
              o2--, u2 += n2[s2++] << l2, l2 += 8;
            }
            u2 >>>= v, l2 -= v, r2.back += v;
          }
          if (u2 >>>= _, l2 -= _, r2.back += _, r2.length = b, 0 === g) {
            r2.mode = 26;
            break;
          }
          if (32 & g) {
            r2.back = -1, r2.mode = 12;
            break;
          }
          if (64 & g) {
            e2.msg = "invalid literal/length code", r2.mode = 30;
            break;
          }
          r2.extra = 15 & g, r2.mode = 22;
        case 22:
          if (r2.extra) {
            for (z = r2.extra; l2 < z; ) {
              if (0 === o2) break e;
              o2--, u2 += n2[s2++] << l2, l2 += 8;
            }
            r2.length += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
          }
          r2.was = r2.length, r2.mode = 23;
        case 23:
          for (; g = (C = r2.distcode[u2 & (1 << r2.distbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
            if (0 === o2) break e;
            o2--, u2 += n2[s2++] << l2, l2 += 8;
          }
          if (0 == (240 & g)) {
            for (v = _, y = g, w = b; g = (C = r2.distcode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
              if (0 === o2) break e;
              o2--, u2 += n2[s2++] << l2, l2 += 8;
            }
            u2 >>>= v, l2 -= v, r2.back += v;
          }
          if (u2 >>>= _, l2 -= _, r2.back += _, 64 & g) {
            e2.msg = "invalid distance code", r2.mode = 30;
            break;
          }
          r2.offset = b, r2.extra = 15 & g, r2.mode = 24;
        case 24:
          if (r2.extra) {
            for (z = r2.extra; l2 < z; ) {
              if (0 === o2) break e;
              o2--, u2 += n2[s2++] << l2, l2 += 8;
            }
            r2.offset += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
          }
          if (r2.offset > r2.dmax) {
            e2.msg = "invalid distance too far back", r2.mode = 30;
            break;
          }
          r2.mode = 25;
        case 25:
          if (0 === h2) break e;
          if (d = c2 - h2, r2.offset > d) {
            if ((d = r2.offset - d) > r2.whave && r2.sane) {
              e2.msg = "invalid distance too far back", r2.mode = 30;
              break;
            }
            p = d > r2.wnext ? (d -= r2.wnext, r2.wsize - d) : r2.wnext - d, d > r2.length && (d = r2.length), m = r2.window;
          } else m = i2, p = a2 - r2.offset, d = r2.length;
          for (h2 < d && (d = h2), h2 -= d, r2.length -= d; i2[a2++] = m[p++], --d; ) ;
          0 === r2.length && (r2.mode = 21);
          break;
        case 26:
          if (0 === h2) break e;
          i2[a2++] = r2.length, h2--, r2.mode = 21;
          break;
        case 27:
          if (r2.wrap) {
            for (; l2 < 32; ) {
              if (0 === o2) break e;
              o2--, u2 |= n2[s2++] << l2, l2 += 8;
            }
            if (c2 -= h2, e2.total_out += c2, r2.total += c2, c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, a2 - c2) : O(r2.check, i2, c2, a2 - c2)), c2 = h2, (r2.flags ? u2 : L(u2)) !== r2.check) {
              e2.msg = "incorrect data check", r2.mode = 30;
              break;
            }
            l2 = u2 = 0;
          }
          r2.mode = 28;
        case 28:
          if (r2.wrap && r2.flags) {
            for (; l2 < 32; ) {
              if (0 === o2) break e;
              o2--, u2 += n2[s2++] << l2, l2 += 8;
            }
            if (u2 !== (4294967295 & r2.total)) {
              e2.msg = "incorrect length check", r2.mode = 30;
              break;
            }
            l2 = u2 = 0;
          }
          r2.mode = 29;
        case 29:
          x = 1;
          break e;
        case 30:
          x = -3;
          break e;
        case 31:
          return -4;
        case 32:
        default:
          return U;
      }
      return e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, (r2.wsize || c2 !== e2.avail_out && r2.mode < 30 && (r2.mode < 27 || 4 !== t2)) && Z(e2, e2.output, e2.next_out, c2 - e2.avail_out) ? (r2.mode = 31, -4) : (f2 -= e2.avail_in, c2 -= e2.avail_out, e2.total_in += f2, e2.total_out += c2, r2.total += c2, r2.wrap && c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, e2.next_out - c2) : O(r2.check, i2, c2, e2.next_out - c2)), e2.data_type = r2.bits + (r2.last ? 64 : 0) + (12 === r2.mode ? 128 : 0) + (20 === r2.mode || 15 === r2.mode ? 256 : 0), (0 == f2 && 0 === c2 || 4 === t2) && x === N && (x = -5), x);
    }, r.inflateEnd = function(e2) {
      if (!e2 || !e2.state) return U;
      var t2 = e2.state;
      return t2.window && (t2.window = null), e2.state = null, N;
    }, r.inflateGetHeader = function(e2, t2) {
      var r2;
      return e2 && e2.state ? 0 == (2 & (r2 = e2.state).wrap) ? U : ((r2.head = t2).done = false, N) : U;
    }, r.inflateSetDictionary = function(e2, t2) {
      var r2, n2 = t2.length;
      return e2 && e2.state ? 0 !== (r2 = e2.state).wrap && 11 !== r2.mode ? U : 11 === r2.mode && O(1, t2, n2, 0) !== r2.check ? -3 : Z(e2, t2, n2, n2) ? (r2.mode = 31, -4) : (r2.havedict = 1, N) : U;
    }, r.inflateInfo = "pako inflate (from Nodeca project)";
  }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./inffast": 48, "./inftrees": 50 }], 50: [function(e, t, r) {
    "use strict";
    var D = e("../utils/common"), F = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0], N = [16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78], U = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0], P = [16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64];
    t.exports = function(e2, t2, r2, n, i, s, a, o) {
      var h, u, l, f, c, d, p, m, _, g = o.bits, b = 0, v = 0, y = 0, w = 0, k = 0, x = 0, S = 0, z = 0, C = 0, E = 0, A = null, I = 0, O = new D.Buf16(16), B = new D.Buf16(16), R = null, T = 0;
      for (b = 0; b <= 15; b++) O[b] = 0;
      for (v = 0; v < n; v++) O[t2[r2 + v]]++;
      for (k = g, w = 15; 1 <= w && 0 === O[w]; w--) ;
      if (w < k && (k = w), 0 === w) return i[s++] = 20971520, i[s++] = 20971520, o.bits = 1, 0;
      for (y = 1; y < w && 0 === O[y]; y++) ;
      for (k < y && (k = y), b = z = 1; b <= 15; b++) if (z <<= 1, (z -= O[b]) < 0) return -1;
      if (0 < z && (0 === e2 || 1 !== w)) return -1;
      for (B[1] = 0, b = 1; b < 15; b++) B[b + 1] = B[b] + O[b];
      for (v = 0; v < n; v++) 0 !== t2[r2 + v] && (a[B[t2[r2 + v]]++] = v);
      if (d = 0 === e2 ? (A = R = a, 19) : 1 === e2 ? (A = F, I -= 257, R = N, T -= 257, 256) : (A = U, R = P, -1), b = y, c = s, S = v = E = 0, l = -1, f = (C = 1 << (x = k)) - 1, 1 === e2 && 852 < C || 2 === e2 && 592 < C) return 1;
      for (; ; ) {
        for (p = b - S, _ = a[v] < d ? (m = 0, a[v]) : a[v] > d ? (m = R[T + a[v]], A[I + a[v]]) : (m = 96, 0), h = 1 << b - S, y = u = 1 << x; i[c + (E >> S) + (u -= h)] = p << 24 | m << 16 | _ | 0, 0 !== u; ) ;
        for (h = 1 << b - 1; E & h; ) h >>= 1;
        if (0 !== h ? (E &= h - 1, E += h) : E = 0, v++, 0 == --O[b]) {
          if (b === w) break;
          b = t2[r2 + a[v]];
        }
        if (k < b && (E & f) !== l) {
          for (0 === S && (S = k), c += y, z = 1 << (x = b - S); x + S < w && !((z -= O[x + S]) <= 0); ) x++, z <<= 1;
          if (C += 1 << x, 1 === e2 && 852 < C || 2 === e2 && 592 < C) return 1;
          i[l = E & f] = k << 24 | x << 16 | c - s | 0;
        }
      }
      return 0 !== E && (i[c + E] = b - S << 24 | 64 << 16 | 0), o.bits = k, 0;
    };
  }, { "../utils/common": 41 }], 51: [function(e, t, r) {
    "use strict";
    t.exports = { 2: "need dictionary", 1: "stream end", 0: "", "-1": "file error", "-2": "stream error", "-3": "data error", "-4": "insufficient memory", "-5": "buffer error", "-6": "incompatible version" };
  }, {}], 52: [function(e, t, r) {
    "use strict";
    var i = e("../utils/common"), o = 0, h = 1;
    function n(e2) {
      for (var t2 = e2.length; 0 <= --t2; ) e2[t2] = 0;
    }
    var s = 0, a = 29, u = 256, l = u + 1 + a, f = 30, c = 19, _ = 2 * l + 1, g = 15, d = 16, p = 7, m = 256, b = 16, v = 17, y = 18, w = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0], k = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7], S = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], z = new Array(2 * (l + 2));
    n(z);
    var C = new Array(2 * f);
    n(C);
    var E = new Array(512);
    n(E);
    var A = new Array(256);
    n(A);
    var I = new Array(a);
    n(I);
    var O, B, R, T = new Array(f);
    function D(e2, t2, r2, n2, i2) {
      this.static_tree = e2, this.extra_bits = t2, this.extra_base = r2, this.elems = n2, this.max_length = i2, this.has_stree = e2 && e2.length;
    }
    function F(e2, t2) {
      this.dyn_tree = e2, this.max_code = 0, this.stat_desc = t2;
    }
    function N(e2) {
      return e2 < 256 ? E[e2] : E[256 + (e2 >>> 7)];
    }
    function U(e2, t2) {
      e2.pending_buf[e2.pending++] = 255 & t2, e2.pending_buf[e2.pending++] = t2 >>> 8 & 255;
    }
    function P(e2, t2, r2) {
      e2.bi_valid > d - r2 ? (e2.bi_buf |= t2 << e2.bi_valid & 65535, U(e2, e2.bi_buf), e2.bi_buf = t2 >> d - e2.bi_valid, e2.bi_valid += r2 - d) : (e2.bi_buf |= t2 << e2.bi_valid & 65535, e2.bi_valid += r2);
    }
    function L(e2, t2, r2) {
      P(e2, r2[2 * t2], r2[2 * t2 + 1]);
    }
    function j(e2, t2) {
      for (var r2 = 0; r2 |= 1 & e2, e2 >>>= 1, r2 <<= 1, 0 < --t2; ) ;
      return r2 >>> 1;
    }
    function Z(e2, t2, r2) {
      var n2, i2, s2 = new Array(g + 1), a2 = 0;
      for (n2 = 1; n2 <= g; n2++) s2[n2] = a2 = a2 + r2[n2 - 1] << 1;
      for (i2 = 0; i2 <= t2; i2++) {
        var o2 = e2[2 * i2 + 1];
        0 !== o2 && (e2[2 * i2] = j(s2[o2]++, o2));
      }
    }
    function W(e2) {
      var t2;
      for (t2 = 0; t2 < l; t2++) e2.dyn_ltree[2 * t2] = 0;
      for (t2 = 0; t2 < f; t2++) e2.dyn_dtree[2 * t2] = 0;
      for (t2 = 0; t2 < c; t2++) e2.bl_tree[2 * t2] = 0;
      e2.dyn_ltree[2 * m] = 1, e2.opt_len = e2.static_len = 0, e2.last_lit = e2.matches = 0;
    }
    function M(e2) {
      8 < e2.bi_valid ? U(e2, e2.bi_buf) : 0 < e2.bi_valid && (e2.pending_buf[e2.pending++] = e2.bi_buf), e2.bi_buf = 0, e2.bi_valid = 0;
    }
    function H(e2, t2, r2, n2) {
      var i2 = 2 * t2, s2 = 2 * r2;
      return e2[i2] < e2[s2] || e2[i2] === e2[s2] && n2[t2] <= n2[r2];
    }
    function G(e2, t2, r2) {
      for (var n2 = e2.heap[r2], i2 = r2 << 1; i2 <= e2.heap_len && (i2 < e2.heap_len && H(t2, e2.heap[i2 + 1], e2.heap[i2], e2.depth) && i2++, !H(t2, n2, e2.heap[i2], e2.depth)); ) e2.heap[r2] = e2.heap[i2], r2 = i2, i2 <<= 1;
      e2.heap[r2] = n2;
    }
    function K(e2, t2, r2) {
      var n2, i2, s2, a2, o2 = 0;
      if (0 !== e2.last_lit) for (; n2 = e2.pending_buf[e2.d_buf + 2 * o2] << 8 | e2.pending_buf[e2.d_buf + 2 * o2 + 1], i2 = e2.pending_buf[e2.l_buf + o2], o2++, 0 === n2 ? L(e2, i2, t2) : (L(e2, (s2 = A[i2]) + u + 1, t2), 0 !== (a2 = w[s2]) && P(e2, i2 -= I[s2], a2), L(e2, s2 = N(--n2), r2), 0 !== (a2 = k[s2]) && P(e2, n2 -= T[s2], a2)), o2 < e2.last_lit; ) ;
      L(e2, m, t2);
    }
    function Y(e2, t2) {
      var r2, n2, i2, s2 = t2.dyn_tree, a2 = t2.stat_desc.static_tree, o2 = t2.stat_desc.has_stree, h2 = t2.stat_desc.elems, u2 = -1;
      for (e2.heap_len = 0, e2.heap_max = _, r2 = 0; r2 < h2; r2++) 0 !== s2[2 * r2] ? (e2.heap[++e2.heap_len] = u2 = r2, e2.depth[r2] = 0) : s2[2 * r2 + 1] = 0;
      for (; e2.heap_len < 2; ) s2[2 * (i2 = e2.heap[++e2.heap_len] = u2 < 2 ? ++u2 : 0)] = 1, e2.depth[i2] = 0, e2.opt_len--, o2 && (e2.static_len -= a2[2 * i2 + 1]);
      for (t2.max_code = u2, r2 = e2.heap_len >> 1; 1 <= r2; r2--) G(e2, s2, r2);
      for (i2 = h2; r2 = e2.heap[1], e2.heap[1] = e2.heap[e2.heap_len--], G(e2, s2, 1), n2 = e2.heap[1], e2.heap[--e2.heap_max] = r2, e2.heap[--e2.heap_max] = n2, s2[2 * i2] = s2[2 * r2] + s2[2 * n2], e2.depth[i2] = (e2.depth[r2] >= e2.depth[n2] ? e2.depth[r2] : e2.depth[n2]) + 1, s2[2 * r2 + 1] = s2[2 * n2 + 1] = i2, e2.heap[1] = i2++, G(e2, s2, 1), 2 <= e2.heap_len; ) ;
      e2.heap[--e2.heap_max] = e2.heap[1], (function(e3, t3) {
        var r3, n3, i3, s3, a3, o3, h3 = t3.dyn_tree, u3 = t3.max_code, l2 = t3.stat_desc.static_tree, f2 = t3.stat_desc.has_stree, c2 = t3.stat_desc.extra_bits, d2 = t3.stat_desc.extra_base, p2 = t3.stat_desc.max_length, m2 = 0;
        for (s3 = 0; s3 <= g; s3++) e3.bl_count[s3] = 0;
        for (h3[2 * e3.heap[e3.heap_max] + 1] = 0, r3 = e3.heap_max + 1; r3 < _; r3++) p2 < (s3 = h3[2 * h3[2 * (n3 = e3.heap[r3]) + 1] + 1] + 1) && (s3 = p2, m2++), h3[2 * n3 + 1] = s3, u3 < n3 || (e3.bl_count[s3]++, a3 = 0, d2 <= n3 && (a3 = c2[n3 - d2]), o3 = h3[2 * n3], e3.opt_len += o3 * (s3 + a3), f2 && (e3.static_len += o3 * (l2[2 * n3 + 1] + a3)));
        if (0 !== m2) {
          do {
            for (s3 = p2 - 1; 0 === e3.bl_count[s3]; ) s3--;
            e3.bl_count[s3]--, e3.bl_count[s3 + 1] += 2, e3.bl_count[p2]--, m2 -= 2;
          } while (0 < m2);
          for (s3 = p2; 0 !== s3; s3--) for (n3 = e3.bl_count[s3]; 0 !== n3; ) u3 < (i3 = e3.heap[--r3]) || (h3[2 * i3 + 1] !== s3 && (e3.opt_len += (s3 - h3[2 * i3 + 1]) * h3[2 * i3], h3[2 * i3 + 1] = s3), n3--);
        }
      })(e2, t2), Z(s2, u2, e2.bl_count);
    }
    function X(e2, t2, r2) {
      var n2, i2, s2 = -1, a2 = t2[1], o2 = 0, h2 = 7, u2 = 4;
      for (0 === a2 && (h2 = 138, u2 = 3), t2[2 * (r2 + 1) + 1] = 65535, n2 = 0; n2 <= r2; n2++) i2 = a2, a2 = t2[2 * (n2 + 1) + 1], ++o2 < h2 && i2 === a2 || (o2 < u2 ? e2.bl_tree[2 * i2] += o2 : 0 !== i2 ? (i2 !== s2 && e2.bl_tree[2 * i2]++, e2.bl_tree[2 * b]++) : o2 <= 10 ? e2.bl_tree[2 * v]++ : e2.bl_tree[2 * y]++, s2 = i2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : i2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4));
    }
    function V(e2, t2, r2) {
      var n2, i2, s2 = -1, a2 = t2[1], o2 = 0, h2 = 7, u2 = 4;
      for (0 === a2 && (h2 = 138, u2 = 3), n2 = 0; n2 <= r2; n2++) if (i2 = a2, a2 = t2[2 * (n2 + 1) + 1], !(++o2 < h2 && i2 === a2)) {
        if (o2 < u2) for (; L(e2, i2, e2.bl_tree), 0 != --o2; ) ;
        else 0 !== i2 ? (i2 !== s2 && (L(e2, i2, e2.bl_tree), o2--), L(e2, b, e2.bl_tree), P(e2, o2 - 3, 2)) : o2 <= 10 ? (L(e2, v, e2.bl_tree), P(e2, o2 - 3, 3)) : (L(e2, y, e2.bl_tree), P(e2, o2 - 11, 7));
        s2 = i2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : i2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4);
      }
    }
    n(T);
    var q = false;
    function J(e2, t2, r2, n2) {
      P(e2, (s << 1) + (n2 ? 1 : 0), 3), (function(e3, t3, r3, n3) {
        M(e3), n3 && (U(e3, r3), U(e3, ~r3)), i.arraySet(e3.pending_buf, e3.window, t3, r3, e3.pending), e3.pending += r3;
      })(e2, t2, r2, true);
    }
    r._tr_init = function(e2) {
      q || ((function() {
        var e3, t2, r2, n2, i2, s2 = new Array(g + 1);
        for (n2 = r2 = 0; n2 < a - 1; n2++) for (I[n2] = r2, e3 = 0; e3 < 1 << w[n2]; e3++) A[r2++] = n2;
        for (A[r2 - 1] = n2, n2 = i2 = 0; n2 < 16; n2++) for (T[n2] = i2, e3 = 0; e3 < 1 << k[n2]; e3++) E[i2++] = n2;
        for (i2 >>= 7; n2 < f; n2++) for (T[n2] = i2 << 7, e3 = 0; e3 < 1 << k[n2] - 7; e3++) E[256 + i2++] = n2;
        for (t2 = 0; t2 <= g; t2++) s2[t2] = 0;
        for (e3 = 0; e3 <= 143; ) z[2 * e3 + 1] = 8, e3++, s2[8]++;
        for (; e3 <= 255; ) z[2 * e3 + 1] = 9, e3++, s2[9]++;
        for (; e3 <= 279; ) z[2 * e3 + 1] = 7, e3++, s2[7]++;
        for (; e3 <= 287; ) z[2 * e3 + 1] = 8, e3++, s2[8]++;
        for (Z(z, l + 1, s2), e3 = 0; e3 < f; e3++) C[2 * e3 + 1] = 5, C[2 * e3] = j(e3, 5);
        O = new D(z, w, u + 1, l, g), B = new D(C, k, 0, f, g), R = new D(new Array(0), x, 0, c, p);
      })(), q = true), e2.l_desc = new F(e2.dyn_ltree, O), e2.d_desc = new F(e2.dyn_dtree, B), e2.bl_desc = new F(e2.bl_tree, R), e2.bi_buf = 0, e2.bi_valid = 0, W(e2);
    }, r._tr_stored_block = J, r._tr_flush_block = function(e2, t2, r2, n2) {
      var i2, s2, a2 = 0;
      0 < e2.level ? (2 === e2.strm.data_type && (e2.strm.data_type = (function(e3) {
        var t3, r3 = 4093624447;
        for (t3 = 0; t3 <= 31; t3++, r3 >>>= 1) if (1 & r3 && 0 !== e3.dyn_ltree[2 * t3]) return o;
        if (0 !== e3.dyn_ltree[18] || 0 !== e3.dyn_ltree[20] || 0 !== e3.dyn_ltree[26]) return h;
        for (t3 = 32; t3 < u; t3++) if (0 !== e3.dyn_ltree[2 * t3]) return h;
        return o;
      })(e2)), Y(e2, e2.l_desc), Y(e2, e2.d_desc), a2 = (function(e3) {
        var t3;
        for (X(e3, e3.dyn_ltree, e3.l_desc.max_code), X(e3, e3.dyn_dtree, e3.d_desc.max_code), Y(e3, e3.bl_desc), t3 = c - 1; 3 <= t3 && 0 === e3.bl_tree[2 * S[t3] + 1]; t3--) ;
        return e3.opt_len += 3 * (t3 + 1) + 5 + 5 + 4, t3;
      })(e2), i2 = e2.opt_len + 3 + 7 >>> 3, (s2 = e2.static_len + 3 + 7 >>> 3) <= i2 && (i2 = s2)) : i2 = s2 = r2 + 5, r2 + 4 <= i2 && -1 !== t2 ? J(e2, t2, r2, n2) : 4 === e2.strategy || s2 === i2 ? (P(e2, 2 + (n2 ? 1 : 0), 3), K(e2, z, C)) : (P(e2, 4 + (n2 ? 1 : 0), 3), (function(e3, t3, r3, n3) {
        var i3;
        for (P(e3, t3 - 257, 5), P(e3, r3 - 1, 5), P(e3, n3 - 4, 4), i3 = 0; i3 < n3; i3++) P(e3, e3.bl_tree[2 * S[i3] + 1], 3);
        V(e3, e3.dyn_ltree, t3 - 1), V(e3, e3.dyn_dtree, r3 - 1);
      })(e2, e2.l_desc.max_code + 1, e2.d_desc.max_code + 1, a2 + 1), K(e2, e2.dyn_ltree, e2.dyn_dtree)), W(e2), n2 && M(e2);
    }, r._tr_tally = function(e2, t2, r2) {
      return e2.pending_buf[e2.d_buf + 2 * e2.last_lit] = t2 >>> 8 & 255, e2.pending_buf[e2.d_buf + 2 * e2.last_lit + 1] = 255 & t2, e2.pending_buf[e2.l_buf + e2.last_lit] = 255 & r2, e2.last_lit++, 0 === t2 ? e2.dyn_ltree[2 * r2]++ : (e2.matches++, t2--, e2.dyn_ltree[2 * (A[r2] + u + 1)]++, e2.dyn_dtree[2 * N(t2)]++), e2.last_lit === e2.lit_bufsize - 1;
    }, r._tr_align = function(e2) {
      P(e2, 2, 3), L(e2, m, z), (function(e3) {
        16 === e3.bi_valid ? (U(e3, e3.bi_buf), e3.bi_buf = 0, e3.bi_valid = 0) : 8 <= e3.bi_valid && (e3.pending_buf[e3.pending++] = 255 & e3.bi_buf, e3.bi_buf >>= 8, e3.bi_valid -= 8);
      })(e2);
    };
  }, { "../utils/common": 41 }], 53: [function(e, t, r) {
    "use strict";
    t.exports = function() {
      this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
    };
  }, {}], 54: [function(e, t, r) {
    (function(e2) {
      !(function(r2, n) {
        "use strict";
        if (!r2.setImmediate) {
          var i, s, t2, a, o = 1, h = {}, u = false, l = r2.document, e3 = Object.getPrototypeOf && Object.getPrototypeOf(r2);
          e3 = e3 && e3.setTimeout ? e3 : r2, i = "[object process]" === {}.toString.call(r2.process) ? function(e4) {
            process.nextTick(function() {
              c(e4);
            });
          } : (function() {
            if (r2.postMessage && !r2.importScripts) {
              var e4 = true, t3 = r2.onmessage;
              return r2.onmessage = function() {
                e4 = false;
              }, r2.postMessage("", "*"), r2.onmessage = t3, e4;
            }
          })() ? (a = "setImmediate$" + Math.random() + "$", r2.addEventListener ? r2.addEventListener("message", d, false) : r2.attachEvent("onmessage", d), function(e4) {
            r2.postMessage(a + e4, "*");
          }) : r2.MessageChannel ? ((t2 = new MessageChannel()).port1.onmessage = function(e4) {
            c(e4.data);
          }, function(e4) {
            t2.port2.postMessage(e4);
          }) : l && "onreadystatechange" in l.createElement("script") ? (s = l.documentElement, function(e4) {
            var t3 = l.createElement("script");
            t3.onreadystatechange = function() {
              c(e4), t3.onreadystatechange = null, s.removeChild(t3), t3 = null;
            }, s.appendChild(t3);
          }) : function(e4) {
            setTimeout(c, 0, e4);
          }, e3.setImmediate = function(e4) {
            "function" != typeof e4 && (e4 = new Function("" + e4));
            for (var t3 = new Array(arguments.length - 1), r3 = 0; r3 < t3.length; r3++) t3[r3] = arguments[r3 + 1];
            var n2 = { callback: e4, args: t3 };
            return h[o] = n2, i(o), o++;
          }, e3.clearImmediate = f;
        }
        function f(e4) {
          delete h[e4];
        }
        function c(e4) {
          if (u) setTimeout(c, 0, e4);
          else {
            var t3 = h[e4];
            if (t3) {
              u = true;
              try {
                !(function(e5) {
                  var t4 = e5.callback, r3 = e5.args;
                  switch (r3.length) {
                    case 0:
                      t4();
                      break;
                    case 1:
                      t4(r3[0]);
                      break;
                    case 2:
                      t4(r3[0], r3[1]);
                      break;
                    case 3:
                      t4(r3[0], r3[1], r3[2]);
                      break;
                    default:
                      t4.apply(n, r3);
                  }
                })(t3);
              } finally {
                f(e4), u = false;
              }
            }
          }
        }
        function d(e4) {
          e4.source === r2 && "string" == typeof e4.data && 0 === e4.data.indexOf(a) && c(+e4.data.slice(a.length));
        }
      })("undefined" == typeof self ? void 0 === e2 ? this : e2 : self);
    }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
  }, {}] }, {}, [10])(10);
});

// src/utils/exportUtils.js
function convertToMarkdown(conversation) {
  const title = conversation?.title || "Untitled";
  const provider = conversation?.provider || "unknown";
  const timestamp = conversation?.timestamp ? new Date(Number(conversation.timestamp)).toISOString() : "";
  const keywords = Array.isArray(conversation?.keywords) ? conversation.keywords : [];
  const summary = conversation?.summary || "";
  const url = conversation?.url || "";
  const singleLine = (v) => String(v ?? "").replace(/\r?\n/g, " ").trim();
  const safeTitle = singleLine(title);
  const safeSummary = singleLine(summary);
  const yamlQuote = (v) => {
    const s = singleLine(v);
    const escaped = s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return `"${escaped}"`;
  };
  const yamlArray = (arr) => {
    const items = (Array.isArray(arr) ? arr : []).map((x) => String(x ?? "").trim()).filter(Boolean).map((x) => yamlQuote(x));
    return `[${items.join(", ")}]`;
  };
  return `---
title: ${yamlQuote(safeTitle)}
provider: ${yamlQuote(provider)}
date: ${yamlQuote(timestamp)}
tags: ${yamlArray(keywords)}
summary: ${yamlQuote(safeSummary)}
url: ${yamlQuote(url)}
---
# ${safeTitle}
> **AI Summary:** ${safeSummary}

[View Original Chat](${singleLine(url)})
`;
}
function conversationsToNotionCsv(conversations) {
  const header = ["Title", "URL", "Summary", "Keywords", "Provider", "Created Time"];
  const rows = (conversations || []).map((c) => {
    const title = c?.title || "Untitled";
    const url = c?.url || "";
    const summary = c?.summary || "";
    const keywords = Array.isArray(c?.keywords) ? c.keywords.join(", ") : "";
    const provider = c?.provider || "";
    const created = c?.timestamp ? new Date(Number(c.timestamp)).toISOString() : "";
    return [title, url, summary, keywords, provider, created];
  });
  const csvBody = [header, ...rows].map((r) => r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  return `\uFEFF${csvBody}`;
}

// node_modules/stemmer/index.js
var step2list = {
  ational: "ate",
  tional: "tion",
  enci: "ence",
  anci: "ance",
  izer: "ize",
  bli: "ble",
  alli: "al",
  entli: "ent",
  eli: "e",
  ousli: "ous",
  ization: "ize",
  ation: "ate",
  ator: "ate",
  alism: "al",
  iveness: "ive",
  fulness: "ful",
  ousness: "ous",
  aliti: "al",
  iviti: "ive",
  biliti: "ble",
  logi: "log"
};
var step3list = {
  icate: "ic",
  ative: "",
  alize: "al",
  iciti: "ic",
  ical: "ic",
  ful: "",
  ness: ""
};
var consonant = "[^aeiou]";
var vowel = "[aeiouy]";
var consonants = "(" + consonant + "[^aeiouy]*)";
var vowels = "(" + vowel + "[aeiou]*)";
var gt0 = new RegExp("^" + consonants + "?" + vowels + consonants);
var eq1 = new RegExp(
  "^" + consonants + "?" + vowels + consonants + vowels + "?$"
);
var gt1 = new RegExp("^" + consonants + "?(" + vowels + consonants + "){2,}");
var vowelInStem = new RegExp("^" + consonants + "?" + vowel);
var consonantLike = new RegExp("^" + consonants + vowel + "[^aeiouwxy]$");
var sfxLl = /ll$/;
var sfxE = /^(.+?)e$/;
var sfxY = /^(.+?)y$/;
var sfxIon = /^(.+?(s|t))(ion)$/;
var sfxEdOrIng = /^(.+?)(ed|ing)$/;
var sfxAtOrBlOrIz = /(at|bl|iz)$/;
var sfxEED = /^(.+?)eed$/;
var sfxS = /^.+?[^s]s$/;
var sfxSsesOrIes = /^.+?(ss|i)es$/;
var sfxMultiConsonantLike = /([^aeiouylsz])\1$/;
var step2 = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
var step3 = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
var step4 = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
function stemmer(value) {
  let result = String(value).toLowerCase();
  if (result.length < 3) {
    return result;
  }
  let firstCharacterWasLowerCaseY = false;
  if (result.codePointAt(0) === 121) {
    firstCharacterWasLowerCaseY = true;
    result = "Y" + result.slice(1);
  }
  if (sfxSsesOrIes.test(result)) {
    result = result.slice(0, -2);
  } else if (sfxS.test(result)) {
    result = result.slice(0, -1);
  }
  let match;
  if (match = sfxEED.exec(result)) {
    if (gt0.test(match[1])) {
      result = result.slice(0, -1);
    }
  } else if ((match = sfxEdOrIng.exec(result)) && vowelInStem.test(match[1])) {
    result = match[1];
    if (sfxAtOrBlOrIz.test(result)) {
      result += "e";
    } else if (sfxMultiConsonantLike.test(result)) {
      result = result.slice(0, -1);
    } else if (consonantLike.test(result)) {
      result += "e";
    }
  }
  if ((match = sfxY.exec(result)) && vowelInStem.test(match[1])) {
    result = match[1] + "i";
  }
  if ((match = step2.exec(result)) && gt0.test(match[1])) {
    result = match[1] + step2list[match[2]];
  }
  if ((match = step3.exec(result)) && gt0.test(match[1])) {
    result = match[1] + step3list[match[2]];
  }
  if (match = step4.exec(result)) {
    if (gt1.test(match[1])) {
      result = match[1];
    }
  } else if ((match = sfxIon.exec(result)) && gt1.test(match[1])) {
    result = match[1];
  }
  if ((match = sfxE.exec(result)) && (gt1.test(match[1]) || eq1.test(match[1]) && !consonantLike.test(match[1]))) {
    result = match[1];
  }
  if (sfxLl.test(result) && gt1.test(result)) {
    result = result.slice(0, -1);
  }
  if (firstCharacterWasLowerCaseY) {
    result = "y" + result.slice(1);
  }
  return result;
}

// src/utils/searchUtils.js
var STOP_WORDS = /* @__PURE__ */ new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "is",
  "are",
  "was",
  "were",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "as",
  "at",
  "by",
  "from"
]);
function normalizeAndStem(text) {
  if (!text || typeof text !== "string") return [];
  const raw = String(text ?? "");
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9\s]+/g, " ");
  return cleaned.split(/\s+/).map((w) => w.trim()).filter(Boolean).filter((w) => !STOP_WORDS.has(w)).map((w) => stemmer(w)).filter(Boolean);
}
function generateTrigrams(token) {
  if (!token || typeof token !== "string") return [];
  const t = String(token ?? "");
  if (t.length < 3) return t ? [t] : [];
  const grams = [];
  for (let i = 0; i <= t.length - 3; i++) {
    grams.push(t.slice(i, i + 3));
  }
  return grams;
}

// src/utils/llmClient.js
var VAULT_KEY = "aIrrange_api_vault";
async function readVault() {
  const result = await chrome.storage.local.get(VAULT_KEY);
  const vault = result[VAULT_KEY];
  return vault ?? {
    selected: "gemini",
    keys: {}
  };
}
function defaultModelForProvider(provider) {
  switch (provider) {
    case "gemini":
      return "gemini-1.5-flash";
    case "openai":
      return "gpt-4o-mini";
    case "anthropic":
      return "claude-3-haiku-20240307";
    default:
      return "gpt-4o-mini";
  }
}
var LLMClient = class {
  /** @returns {Promise<{provider: Provider, apiKey: string | null, model: string}>} */
  async getActiveProviderAndKey() {
    const vault = await readVault();
    const provider = vault.selected || "gemini";
    const apiKey = vault.keys && vault.keys[provider] ? String(vault.keys[provider]).trim() : "";
    const model = defaultModelForProvider(provider);
    return { provider, apiKey: apiKey || null, model };
  }
  /**
   * Fetch available model IDs for a provider.
   * @param {Provider} provider
   * @param {string} apiKey
   * @returns {Promise<string[]>}
   */
  async getAvailableModels(provider, apiKey) {
    if (!apiKey) return [];
    if (provider === "gemini") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) throw new Error(`gemini models failed: ${res.status} ${await res.text()}`);
      const data = await res.json();
      const models = Array.isArray(data?.models) ? data.models : [];
      return models.map((m) => String(m?.name || "").replace(/^models\//, "").trim()).filter(Boolean).filter((name) => !/\b(veo|imagen)\b/i.test(name));
    }
    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      if (!res.ok) throw new Error(`openai models failed: ${res.status} ${await res.text()}`);
      const data = await res.json();
      const models = Array.isArray(data?.data) ? data.data : [];
      return models.map((m) => String(m?.id || "").trim()).filter(Boolean).filter((id) => /^gpt-/i.test(id));
    }
    if (provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/models", {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerously-allow-browser": "true"
        }
      });
      if (!res.ok) throw new Error(`anthropic models failed: ${res.status} ${await res.text()}`);
      const data = await res.json();
      const models = Array.isArray(data?.data) ? data.data : Array.isArray(data?.models) ? data.models : [];
      return models.map((m) => String(m?.id || m?.name || "").trim()).filter(Boolean);
    }
    return [];
  }
  /**
   * Reads the saved model for the given provider from chrome.storage.local.
   * @param {Provider} provider
   * @returns {Promise<string | null>}
   */
  async getSavedModel(provider) {
    const key = `aIrrange_model_${provider}`;
    const result = await chrome.storage.local.get(key);
    const v = String(result?.[key] || "").trim();
    return v || null;
  }
  /**
   * @param {string} promptText
   * @returns {Promise<{summary: string, keywords: string[], stemmed_tags: string[], trigrams: string[]}>}
   */
  async generateKeywords(promptText) {
    const { provider, apiKey } = await this.getActiveProviderAndKey();
    if (!apiKey) throw new Error("No API key available");
    const savedModel = await this.getSavedModel(provider);
    const system = 'You are a metadata assistant. Summarize the following user intent in one short sentence and extract 3-5 keywords. Return ONLY a JSON object: {"summary": "...", "keywords": ["...", "..."]}';
    const content = await callProvider({ provider, apiKey, model: savedModel, system, user: promptText });
    const parsed = parseJsonOnly(content);
    let stemmed_tags = [];
    let trigrams = [];
    try {
      const keywords = parsed?.keywords;
      const safeKeywords = Array.isArray(keywords) ? keywords : [];
      stemmed_tags = [...new Set(safeKeywords.map((k) => normalizeAndStem(k)).flat())];
      trigrams = [...new Set(stemmed_tags.map((t) => generateTrigrams(t)).flat())];
    } catch (error) {
      console.error("[aIrrange] Failed to generate stems/trigrams:", error);
    }
    return { ...parsed, stemmed_tags, trigrams };
  }
  /**
   * Connection test for the currently selected provider.
   * @returns {Promise<{ok: true} | {ok:false, error:string}>}
   */
  async testConnection() {
    const { provider, apiKey } = await this.getActiveProviderAndKey();
    if (!apiKey) return { ok: false, error: "No API key set for selected provider" };
    try {
      if (provider === "openai") {
        const res = await fetch("https://api.openai.com/v1/models", {
          method: "GET",
          headers: { Authorization: `Bearer ${apiKey}` }
        });
        if (!res.ok) return { ok: false, error: `openai auth failed: ${res.status} ${await res.text()}` };
        return { ok: true };
      }
      if (provider === "anthropic") {
        const res = await fetch("https://api.anthropic.com/v1/models", {
          method: "GET",
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerously-allow-browser": "true"
          }
        });
        if (!res.ok) return { ok: false, error: `anthropic auth failed: ${res.status} ${await res.text()}` };
        return { ok: true };
      }
      if (provider === "gemini") {
        await callGeminiNative({ apiKey, system: "Return only the word OK.", user: "" });
        return { ok: true };
      }
      return { ok: false, error: `Unknown provider: ${provider}` };
    } catch (e) {
      return { ok: false, error: String(e?.message || e) };
    }
  }
  /**
   * Cheap structured check to decide if a prompt deviates from a conversation summary.
   * Returns ONLY: { deviated: boolean }
   *
   * @param {{ summary: string, currentPrompt: string }} args
   * @returns {Promise<{deviated: boolean}>}
   */
  async checkDeviation({ summary, currentPrompt }) {
    const { provider, apiKey } = await this.getActiveProviderAndKey();
    if (!apiKey) throw new Error("No API key available");
    const savedModel = await this.getSavedModel(provider);
    const system = `You are a context guardrail. The current conversation summary is: '${String(summary || "")}'. The user is typing a new prompt: '${String(currentPrompt || "")}'. Does this new prompt represent a completely unrelated topic (e.g., jumping from cars to ice cream)? Respond strictly with JSON: {"deviated": true/false }.`;
    const content = await callProvider({ provider, apiKey, model: savedModel, system, user: currentPrompt });
    const raw = String(content || "").trim();
    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    const jsonCandidate = (cleaned.match(/\{[\s\S]*\}/) || [])[0] || cleaned;
    try {
      const obj = JSON.parse(jsonCandidate);
      return { deviated: Boolean(obj?.deviated) };
    } catch (e) {
      console.error("[DEVIATION DEBUG] Failed to parse LLM JSON. Raw:", raw);
      console.error("[DEVIATION DEBUG] Failed to parse LLM JSON. Cleaned:", cleaned);
      console.error("[DEVIATION DEBUG] Failed to parse LLM JSON. Candidate:", jsonCandidate);
      throw e;
    }
  }
};
async function callProvider({ provider, apiKey, model, system, user }) {
  const p = provider;
  switch (p) {
    case "gemini":
      return callGeminiNative({ apiKey, model, system, user });
    case "openai":
      return callOpenAI({ apiKey, model, system, user });
    case "anthropic":
      return callAnthropic({ apiKey, model, system, user });
    default:
      throw new Error(`Unsupported provider: ${String(provider)}`);
  }
}
function getDefaultModel(provider, models) {
  const list = Array.isArray(models) ? models.filter(Boolean) : [];
  if (list.length === 0) return null;
  const lower = list.map((m) => String(m).toLowerCase());
  if (provider === "gemini") {
    const preferred = ["2.5-flash", "2.0-flash", "flash"];
    for (const key of preferred) {
      const idx = lower.findIndex((m) => m.includes(key));
      if (idx >= 0) return list[idx];
    }
  }
  if (provider === "openai") {
    const idx = lower.findIndex((m) => m.includes("mini"));
    if (idx >= 0) return list[idx];
  }
  if (provider === "anthropic") {
    const idx = lower.findIndex((m) => m.includes("haiku"));
    if (idx >= 0) return list[idx];
  }
  return list[0];
}
async function callGeminiNative({ apiKey, model, system, user }) {
  const modelId = String(model || "").trim() || defaultModelForProvider("gemini");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelId)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: `${String(system || "")}

${String(user || "")}`.trim() }]
        }
      ]
    })
  });
  if (!res.ok) {
    throw new Error(`gemini request failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return String(data?.candidates?.[0]?.content?.parts?.[0]?.text || "");
}
async function callAnthropic({ apiKey, model, system, user }) {
  const modelId = String(model || "").trim() || defaultModelForProvider("anthropic");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerously-allow-browser": "true"
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: 1024,
      system: String(system || ""),
      messages: [{ role: "user", content: String(user || "") }]
    })
  });
  if (!res.ok) {
    throw new Error(`anthropic request failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return String(data?.content?.[0]?.text || "");
}
async function callOpenAI({ apiKey, model, system, user }) {
  const modelId = String(model || "").trim() || defaultModelForProvider("openai");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: "system", content: String(system || "") },
        { role: "user", content: String(user || "") }
      ]
    })
  });
  if (!res.ok) {
    throw new Error(`openai request failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return String(data?.choices?.[0]?.message?.content || "");
}
function parseJsonOnly(text) {
  const raw = String(text || "").trim();
  try {
    const obj = JSON.parse(raw);
    return normalizeKeywordResult(obj);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("LLM did not return JSON");
    const obj = JSON.parse(match[0]);
    return normalizeKeywordResult(obj);
  }
}
function normalizeKeywordResult(obj) {
  const summary = typeof obj?.summary === "string" ? obj.summary.trim() : "";
  const keywordsRaw = Array.isArray(obj?.keywords) ? obj.keywords : [];
  const keywords = keywordsRaw.map((k) => String(k).trim()).filter(Boolean).slice(0, 8);
  if (!summary && keywords.length === 0) {
    throw new Error("LLM returned empty metadata");
  }
  return { summary, keywords };
}

// all.js
document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("all-conversations-list");
  const searchBar = document.getElementById("search-bar");
  const providerSelect = document.getElementById("api-provider-select");
  const apiKeyInput = document.getElementById("api-key-input");
  const modelSelector = document.getElementById("model-selector");
  const saveApiKeyButton = document.getElementById("save-api-key");
  const testApiKeyButton = document.getElementById("test-api-key");
  const apiKeyStatus = document.getElementById("api-key-status");
  const exportMdZipBtn = document.getElementById("export-md-zip");
  const exportCsvBtn = document.getElementById("export-csv");
  const tagSidebar = document.getElementById("tag-sidebar");
  const clearHistoryBtn = document.getElementById("clear-history");
  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "CONVERSATION_UPDATED") {
      loadConversations().then(loadTagsSidebar);
    }
  });
  const apiVaultKey = "aIrrange_api_vault";
  const defaultVault = {
    selected: "gemini",
    keys: { gemini: "", openai: "", anthropic: "" }
  };
  const readVault2 = async () => {
    const result = await chrome.storage.local.get(apiVaultKey);
    const vault = result[apiVaultKey] || defaultVault;
    vault.keys = vault.keys || {};
    return {
      selected: vault.selected || "gemini",
      keys: {
        gemini: vault.keys.gemini || "",
        openai: vault.keys.openai || "",
        anthropic: vault.keys.anthropic || ""
      }
    };
  };
  const writeVault = async (vault) => {
    await chrome.storage.local.set({ [apiVaultKey]: vault });
  };
  const setStatus = (text, color) => {
    apiKeyStatus.textContent = text;
    apiKeyStatus.style.color = color;
  };
  const refreshVaultUi = async () => {
    const vault = await readVault2();
    providerSelect.value = vault.selected;
    apiKeyInput.value = vault.keys[vault.selected] || "";
    setStatus(apiKeyInput.value.trim() ? "Key stored for this provider." : "No key for this provider.", apiKeyInput.value.trim() ? "green" : "orange");
  };
  let allConversations = [];
  let filtered = [];
  let debounceTimer = null;
  providerSelect.addEventListener("change", async () => {
    const vault = await readVault2();
    vault.selected = providerSelect.value;
    await writeVault(vault);
    await refreshVaultUi();
  });
  saveApiKeyButton.addEventListener("click", async () => {
    const key = apiKeyInput.value.trim();
    const provider = providerSelect.value;
    const vault = await readVault2();
    vault.selected = provider;
    vault.keys[provider] = key;
    await writeVault(vault);
    setStatus("Saved!", "green");
    await refreshVaultUi();
  });
  testApiKeyButton.addEventListener("click", async () => {
    const provider = providerSelect.value;
    const key = apiKeyInput.value.trim();
    if (!key) {
      setStatus("Paste an API key first.", "orange");
      return;
    }
    setStatus("Testing...", "#3D5A80");
    try {
      const llm = new LLMClient();
      const models = await llm.getAvailableModels(provider, key);
      if (!Array.isArray(models) || models.length === 0) {
        setStatus("Connected, but no models returned.", "orange");
        modelSelector.hidden = true;
        modelSelector.disabled = true;
        return;
      }
      modelSelector.innerHTML = "";
      models.forEach((m) => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.textContent = m;
        modelSelector.appendChild(opt);
      });
      const defaultModel = getDefaultModel(provider, models) || models[0];
      modelSelector.value = defaultModel;
      await chrome.storage.local.set({ [`aIrrange_model_${provider}`]: defaultModel });
      modelSelector.hidden = false;
      modelSelector.disabled = false;
      setStatus("\u2705 Success! Models loaded + default selected.", "green");
    } catch (e) {
      setStatus(`Test failed: ${String(e?.message || e)}`, "red");
    }
  });
  modelSelector?.addEventListener("change", async () => {
    const provider = providerSelect.value;
    const v = String(modelSelector.value || "").trim();
    if (!v) return;
    await chrome.storage.local.set({ [`aIrrange_model_${provider}`]: v });
    setStatus("Model saved.", "green");
  });
  refreshVaultUi();
  const providerLabel = (provider) => {
    if (!provider) return { label: "Unknown", cls: "unknown" };
    if (provider === "chatgpt") return { label: "ChatGPT", cls: "chatgpt" };
    if (provider === "claude") return { label: "Claude", cls: "claude" };
    if (provider === "openai") return { label: "OpenAI", cls: "openai" };
    return { label: provider, cls: "unknown" };
  };
  const escapeHtml = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const formatRelativeTime = (ts) => {
    const t = Number(ts || 0);
    if (!t) return "";
    const diff = Date.now() - t;
    const sec = Math.floor(diff / 1e3);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    if (sec < 60) return `${sec}s ago`;
    if (min < 60) return `${min}m ago`;
    if (hr < 24) return `${hr}h ago`;
    if (day < 7) return `${day}d ago`;
    return new Date(t).toLocaleString();
  };
  const renderList = (conversations) => {
    list.innerHTML = "";
    if (!conversations || conversations.length === 0) {
      list.innerHTML = '<li class="empty">No conversations yet.</li>';
      return;
    }
    const fragment = document.createDocumentFragment();
    conversations.forEach((convo) => {
      const { label, cls } = providerLabel(convo.provider);
      const title = convo.title || convo.url || "Untitled";
      const summary = convo.summary || "";
      const keywords = Array.isArray(convo.keywords) ? convo.keywords : [];
      const li = document.createElement("li");
      li.className = "card";
      li.id = convo.id;
      li.innerHTML = `
        <div class="cardHeader">
          <h3 class="cardTitle"><a href="${escapeHtml(convo.url)}" target="_blank" rel="noreferrer">${escapeHtml(title)}</a></h3>
          <div class="cardActions">
            <span class="badge ${escapeHtml(cls)}">${escapeHtml(label)}</span>
            <button class="iconBtn danger" data-action="delete" data-id="${escapeHtml(convo.id)}" title="Delete">Delete</button>
          </div>
        </div>
        <p class="summary">${escapeHtml(summary || "No summary yet.")}</p>
        <div class="chips">
          ${keywords.slice(0, 10).map((k) => `<span class="chip">${escapeHtml(k)}</span>`).join("")}
        </div>
        <div class="meta">
          <span>${escapeHtml(formatRelativeTime(convo.timestamp))}</span>
          <span>${escapeHtml(convo.provider || "")}</span>
        </div>
      `;
      fragment.appendChild(li);
    });
    list.appendChild(fragment);
  };
  list.addEventListener("click", async (e) => {
    const btn = e.target?.closest?.('button[data-action="delete"]');
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    if (!id) return;
    const confirmText = prompt("Type DELETE to permanently remove this conversation.");
    if (confirmText !== "DELETE") return;
    await db.conversations.delete(id);
    await cleanupOrphanTags();
    await loadConversations();
    await loadTagsSidebar();
  });
  const resetSearchBar = () => {
    searchBar.disabled = false;
    searchBar.value = "";
    searchBar.placeholder = "Let the AI find your conversation...";
  };
  const loadConversations = async () => {
    allConversations = await db.conversations.orderBy("timestamp").reverse().toArray();
    filtered = allConversations;
    renderList(filtered);
  };
  loadConversations();
  const loadTagsSidebar = async () => {
    if (!tagSidebar) return;
    tagSidebar.innerHTML = "";
    const tags = await db.tags.toArray();
    const labels = Array.from(new Set(tags.map((t) => String(t.label || "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
    if (labels.length === 0) {
      tagSidebar.innerHTML = '<div style="color: rgba(255,255,255,0.65); font-size: 12px;">No tags yet.</div>';
      return;
    }
    const frag = document.createDocumentFragment();
    labels.forEach((label) => {
      const btn = document.createElement("button");
      btn.className = "tagChip";
      btn.type = "button";
      btn.textContent = label;
      btn.addEventListener("click", () => {
        searchBar.value = label;
        filtered = filterHistory(label);
        renderList(filtered);
      });
      frag.appendChild(btn);
    });
    tagSidebar.appendChild(frag);
  };
  loadTagsSidebar();
  const migrateTagsIfEmpty = async () => {
    const tagCount = await db.tags.count();
    if (tagCount > 0) return;
    const records = await db.conversations.toArray();
    const labels = /* @__PURE__ */ new Set();
    records.forEach((c) => {
      const kws = Array.isArray(c.keywords) ? c.keywords : [];
      kws.forEach((k) => {
        const label = String(k || "").trim();
        if (label) labels.add(label);
      });
    });
    if (labels.size === 0) return;
    await db.tags.bulkPut(Array.from(labels).map((label) => ({ id: label.toLowerCase(), label })));
  };
  migrateTagsIfEmpty().then(loadTagsSidebar);
  const filterHistory = (query) => {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return allConversations;
    return allConversations.filter((c) => {
      const title = String(c.title || "").toLowerCase();
      const summary = String(c.summary || "").toLowerCase();
      const keywords = Array.isArray(c.keywords) ? c.keywords.map((k) => String(k).toLowerCase()) : [];
      return title.includes(q) || summary.includes(q) || keywords.some((k) => k.includes(q));
    });
  };
  searchBar.addEventListener("input", () => {
    const doFilter = () => {
      filtered = filterHistory(searchBar.value);
      renderList(filtered);
    };
    if (allConversations.length > 500) {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(doFilter, 300);
    } else {
      doFilter();
    }
  });
  searchBar.addEventListener("keydown", (event) => {
    if (event.key === "Enter") event.preventDefault();
  });
  const params = new URLSearchParams(location.search);
  const qParam = params.get("q");
  if (qParam) {
    searchBar.value = qParam;
    Promise.resolve(loadConversations()).then(() => {
      filtered = filterHistory(qParam);
      renderList(filtered);
    });
  }
  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  const safeFileName = (s) => String(s || "Untitled").replace(/[\\/:*?"<>|]+/g, "_").slice(0, 80).trim() || "Untitled";
  exportMdZipBtn?.addEventListener("click", async () => {
    const records = await db.conversations.orderBy("timestamp").reverse().toArray();
    if (records.length === 0) {
      setStatus("Nothing to export yet.", "orange");
      return;
    }
    setStatus("Building ZIP\u2026", "#3D5A80");
    const zip = new window.JSZip();
    records.forEach((c) => {
      const md = convertToMarkdown(c);
      const ts = c.timestamp ? new Date(Number(c.timestamp)).toISOString().slice(0, 10) : "unknown-date";
      const fname = `${ts}__${safeFileName(c.title)}__${safeFileName(c.provider)}.md`;
      zip.file(fname, md);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, "airrange-export-markdown.zip");
    setStatus("ZIP downloaded.", "green");
  });
  exportCsvBtn?.addEventListener("click", async () => {
    const records = await db.conversations.orderBy("timestamp").reverse().toArray();
    if (records.length === 0) {
      setStatus("Nothing to export yet.", "orange");
      return;
    }
    const csv = conversationsToNotionCsv(records);
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "airrange-export-notion.csv");
    setStatus("CSV downloaded.", "green");
  });
  clearHistoryBtn?.addEventListener("click", async () => {
    const confirmText = prompt("This will delete ALL history. Type DELETE ALL to confirm.");
    if (confirmText !== "DELETE ALL") return;
    await db.transaction("rw", db.conversations, db.tags, async () => {
      await db.conversations.clear();
      await db.tags.clear();
    });
    await loadConversations();
    await loadTagsSidebar();
    setStatus("History cleared.", "orange");
  });
  async function cleanupOrphanTags() {
    const records = await db.conversations.toArray();
    const labels = /* @__PURE__ */ new Set();
    records.forEach((c) => {
      const kws = Array.isArray(c.keywords) ? c.keywords : [];
      kws.forEach((k) => {
        const label = String(k || "").trim();
        if (label) labels.add(label);
      });
    });
    await db.tags.clear();
    if (labels.size > 0) {
      await db.tags.bulkPut(Array.from(labels).map((label) => ({ id: label.toLowerCase(), label })));
    }
  }
});
/*!

JSZip v3.10.1 - A JavaScript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/main/LICENSE
*/
