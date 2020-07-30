interface ObservedCallback<T> {
  (data: T): void;
}
export default class Observe<T> {
  private history: Array<T> = [];
  private eventID: string;
  private currentEvent: CustomEvent<T> = new CustomEvent("");
  public maxHistorySize = 1000;
  /**
   * Observes a value for changes and updates all the listeners. also keeps a track of the change history.
   * @param defaultValue
   */
  constructor(defaultValue: T) {
    this.eventID = "Observed_" +
      crypto.getRandomValues(new Uint32Array(2)).toString().replace(",", "_");
    this.history.push(defaultValue);
  }

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
   * @returns the function used in the listener (can be used to unbind)
   */
  public bind(callback: ObservedCallback<T>): (e: Event) => void {
    let func = (e: Event) => callback((<CustomEvent> e).detail);
    addEventListener(this.eventID, func);
    return func;
  }
  /**
   * Unbinds a previously bound EventListener or EventListenerObject. The callback returned by bind() should be provided
   * @param callback the original callback to be unbound
   */
  public unBind(callback: EventListener | EventListenerObject) {
    removeEventListener(this.eventID, callback);
  }

  /**
   * Updates the value, notifying any bound listeners.. setting the next value equals to the last will fail
   * @see bind() method
   * @param value T
   */
  public setValue(value: T) {
    if (value !== this.getValue()) {
      this.history.push(value);
      if (this.history.length > this.maxHistorySize) { // ensures we don't
        this.history.splice(1, 1);
      }
      this.emit(value);
    }
  }

  /**
   * Restore the value to it's initial value
   */
  public reset() {
    this.setValue(this.getHistory()[0]);
  }

  private emit(value: T) {
    this.currentEvent = new CustomEvent<T>(this.eventID, { detail: value });
    const success = dispatchEvent(this.currentEvent);
  }

  /**
   * Stops the current event.
   * Invoking this method prevents event from reaching any registered event listeners after the current one finishes running and, when dispatched in a tree, also prevents event from reaching any other objects.
   */
  public stop() {
    this.currentEvent.stopImmediatePropagation();
  }
}
