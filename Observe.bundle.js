export default class Observe {
    history = [];
    currentEvent = new CustomEvent("");
    maxHistorySize = 1000;
    lastNestedBound = ()=>{
    };
    boundCallbacks = [];
    constructor(defaultValue, id1 = "", global = true){
        id1 == "" || id1 == undefined || id1 == null ? this.eventID = "Observed_" + crypto.getRandomValues(new Uint32Array(2)).toString().replace(",", "_") : this.eventID = id1;
        this.history.push(defaultValue);
        if (defaultValue instanceof Observe) {
            this.lastNestedBound = defaultValue.bind((d)=>this.emit(defaultValue)
            );
        }
        if (global == true) this.registerObservable(this.eventID);
    }
    registerObservable(id) {
        Observe.registerGlobalNamespace();
        window.observables[id] = this;
    }
    static getGlobalObservable(id) {
        this.registerGlobalNamespace();
        return window.observables[id];
    }
    static registerGlobalNamespace() {
        if (!window.observables) window.observables = {
        };
    }
    getValue() {
        return this.history[this.history.length - 1];
    }
    getHistory() {
        return this.history;
    }
    bind(callback, once = false) {
        let func = (e)=>callback(e.detail)
        ;
        addEventListener(this.eventID, func, {
            once
        });
        this.boundCallbacks.push(func);
        return func;
    }
    unBind(callback) {
        removeEventListener(this.eventID, callback);
        this.boundCallbacks.splice(this.boundCallbacks.findIndex((x)=>x === callback
        ));
        return this;
    }
    unBindAll() {
        this.boundCallbacks.forEach((cb)=>{
            removeEventListener(this.eventID, cb);
        });
        this.boundCallbacks = [];
        return this;
    }
    setValue(...value) {
        for (let val of value){
            if (val !== this.getValue() && !(val instanceof Observe)) {
                this.updateHistory(val);
                this.emit(val);
            } else if (val instanceof Observe) {
                let lh = this.getHistory()[this.history.length - 1];
                lh.unBind(this.lastNestedBound);
                this.lastNestedBound = val.bind((d)=>this.emit(val)
                );
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
        this.currentEvent = new CustomEvent(this.eventID, {
            detail: value
        });
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
