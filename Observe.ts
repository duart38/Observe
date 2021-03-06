interface ObservedCallback<T> {
  (data: T): void;
}

export default class Observe<T> {
  private history: Array<T> = [];
  private eventID: string;
  private currentEvent: CustomEvent<T> = new CustomEvent("");
  /**
   * Used to control how far back you can track updates.
   * Lower this value to reduce memory footprint
   */
  public maxHistorySize = 1000;
  private lastNestedBound: EventListener | EventListenerObject = () => {};
  public boundCallbacks: Array<(e: Event) =>void> = [];
  /**
   * Observes a value for changes and updates all the listeners. also keeps a track of the change history.
   * @param defaultValue
   * @param id (can be undefined, null) Give this observable a unique ID to help when you need to listen for events from the global scope
   * @param global indicates wether you want to exclude the registering of this Observe instance on the window or not (opting out will still allow you to listen for global events.)
   */
  constructor(defaultValue: T, id:string = "", global = true) {
    id == "" || id == undefined || id == null
    ? this.eventID = "Observed_" + crypto.getRandomValues(new Uint32Array(2)).toString().replace(",", "_")
    : this.eventID = id;
    this.history.push(defaultValue);
    if (defaultValue instanceof Observe) {
      this.lastNestedBound = defaultValue.bind((d: T) =>
        this.emit(defaultValue)
      );
    }

    if(global == true) this.registerObservable(this.eventID);
  }

  /**
   * Register an observable globally (window) to allow access from anywhere.
   * @param id the ID of the observable to register
   */
  private registerObservable(id: string){
    Observe.registerGlobalNamespace();
    (window as any).observables[id] = this;
  }

  /**
   * Retrieves a previously attached observable from the JS window
   * @param id the ID of the observable to fetch
   */
  static getGlobalObservable <E> (id: string): Observe<E> {
    this.registerGlobalNamespace();
    return (window as any).observables[id];
  }

  /**
   * Register namespace in window if it has not already been done.
   */
  private static registerGlobalNamespace(){
    if(!(window as any).observables) (window as any).observables = {}
  }

  /**
   * Gets the last added value
   */
  public getValue(): T {
    return this.history[this.history.length - 1];
  }

  /**
   * Every time a value is updated it is pushed to an array.. this will allow you to see the history
   */
  public getHistory(): Array<T> {
    return this.history;
  }

  /**
   * Binds a callback to receive updates when the value of this instance changes. 
   * The callback receives the changed data T
   * @example new Observe("test").bind((data)=>console.log(data))
   * @param callback
   * @param once Specify wether the bound callback will only be called once (this causes the listeners to be removed thus increasing performance)
   * @returns the function used in the listener (can be used to unbind)
   */
  public bind(
    callback: ObservedCallback<T>,
    once: boolean = false,
  ): (e: Event) => void {
    let func = (e: Event) => callback((<CustomEvent> e).detail);
    addEventListener(this.eventID, func, { once });
    this.boundCallbacks.push(func);
    return func;
  }
  /**
   * Unbinds a previously bound EventListener or EventListenerObject. The callback returned by bind() should be provided
   * @param callback the original callback to be unbound
   */
  public unBind(callback: EventListener | EventListenerObject): this {
    removeEventListener(this.eventID, callback);
    this.boundCallbacks.splice(this.boundCallbacks.findIndex((x)=>x === callback));
    return this;
  }

  /**
   * Unbinds ALL previously bound EventListener or EventListenerObject.
   */
  public unBindAll(): this{
    this.boundCallbacks.forEach(cb => {
      removeEventListener(this.eventID, cb);
    });
    this.boundCallbacks = [];
    return this;
  }

  /**
   * Updates the value, notifying any bound listeners.. setting the next value equals to the last will not do anything.
   * In the case you are nesting Observes this method will unbound the last pushed Observe
   * if multiple values is used the last value will be the active value, the previous values will only be emitted
   * @see bind() method
   * @param value T
   */
  public setValue(...value: T[]): T {
    for (let val of value) {
      if (val !== this.getValue() && !(val instanceof Observe)) {
        this.updateHistory(val);
        this.emit(val);
      } else if (val instanceof Observe) {
        let lh = this
          .getHistory()[this.history.length - 1] as unknown as Observe<
            any
          >;
        lh.unBind(this.lastNestedBound); // unbind the last bound to
        this.lastNestedBound = val.bind((d: T) => this.emit(val)); // bind to new value and store its cb
        this.updateHistory(val);
        this.emit(val);
      }
    }

    return value[value.length - 1];
  }

  private updateHistory(value: T) {
    this.history.push(value);
    if (this.history.length > this.maxHistorySize) {
      this.history.splice(1, 1);
    }
  }

  /**
   * Restore the value to it's initial value
   */
  public reset(): this {
    this.setValue(this.getHistory()[0]);
    return this;
  }

  /**
   * Dispatches events to listeners
   * @param value The value to dispatch
   */
  private emit(value: T) {
    this.currentEvent = new CustomEvent<T>(this.eventID, { detail: value });
    const success = dispatchEvent(this.currentEvent);
  }

  /**
   * Returns the event ID or type used when dispatching an event.. This can be used if you want to create your own listeners
   */
  public getEventID(): string {
    return this.eventID;
  }

  /**
   * Stops the current event.
   * Invoking this method prevents event from reaching any registered event listeners after the current one finishes running and, when dispatched in a tree, also prevents event from reaching any other objects.
   */
  public stop(): this {
    this.currentEvent.stopImmediatePropagation();
    return this;
  }
}
