interface ObservedCallback<T> {
  (data: T): void;
}
export default class Observe<T> {
  private history: Array<T> = [];
  private eventID: string;
  private currentEvent: CustomEvent<T> = new CustomEvent("");
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
    // todo .. make sure this does not remove other event listeners with the same type but different callbacks......
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
      this.emit(value);
    }
  }

  public goBack() {
    // todo
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

//TODO: stress test the history array with value and observe heap memory usage.. i believe we might need to limit the array
//.. Can we have multiple listeners with the same key ?... TEST THIS!!!
