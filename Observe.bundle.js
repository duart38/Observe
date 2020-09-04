// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

"use strict";

// @ts-nocheck
/* eslint-disable */
let System, __instantiate;
(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };
  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      v = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(v)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }
  __instantiate = (m, a) => {
    System = __instantiate = undefined;
    rF(m);
    return a ? gExpA(m) : gExp(m);
  };
})();

System.register("Observe", [], function (exports_1, context_1) {
    "use strict";
    var Observe;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            Observe = class Observe {
                constructor(defaultValue) {
                    this.history = [];
                    this.currentEvent = new CustomEvent("");
                    this.maxHistorySize = 1000;
                    this.lastNestedBound = () => { };
                    this.boundCallbacks = [];
                    this.eventID = "Observed_" +
                        crypto.getRandomValues(new Uint32Array(2)).toString().replace(",", "_");
                    this.history.push(defaultValue);
                    if (defaultValue instanceof Observe) {
                        this.lastNestedBound = defaultValue.bind((d) => this.emit(defaultValue));
                    }
                }
                getValue() {
                    return this.history[this.history.length - 1];
                }
                getHistory() {
                    return this.history;
                }
                bind(callback, once = false) {
                    let func = (e) => callback(e.detail);
                    addEventListener(this.eventID, func, { once });
                    this.boundCallbacks.push(func);
                    return func;
                }
                unBind(callback) {
                    removeEventListener(this.eventID, callback);
                    this.boundCallbacks.splice(this.boundCallbacks.findIndex((x) => x === callback));
                    return this;
                }
                unBindAll() {
                    this.boundCallbacks.forEach(cb => {
                        removeEventListener(this.eventID, cb);
                    });
                    this.boundCallbacks = [];
                    return this;
                }
                setValue(...value) {
                    for (let val of value) {
                        if (val !== this.getValue() && !(val instanceof Observe)) {
                            this.updateHistory(val);
                            this.emit(val);
                        }
                        else if (val instanceof Observe) {
                            let lh = this
                                .getHistory()[this.history.length - 1];
                            lh.unBind(this.lastNestedBound);
                            this.lastNestedBound = val.bind((d) => this.emit(val));
                            this.updateHistory(val);
                            this.emit(val);
                        }
                    }
                    return value[value.length - 1];
                }
                updateHistory(value) {
                    this.history.push(value);
                    if (this.history.length > this.maxHistorySize) {
                        this.history.splice(1, 1);
                    }
                }
                reset() {
                    this.setValue(this.getHistory()[0]);
                    return this;
                }
                emit(value) {
                    this.currentEvent = new CustomEvent(this.eventID, { detail: value });
                    const success = dispatchEvent(this.currentEvent);
                }
                getEventID() {
                    return this.eventID;
                }
                stop() {
                    this.currentEvent.stopImmediatePropagation();
                    return this;
                }
            };
            exports_1("default", Observe);
        }
    };
});

const __exp = __instantiate("Observe", false);
export default __exp["default"];
