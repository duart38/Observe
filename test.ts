import {
  fail,
  assertEquals,
} from "https://deno.land/std/testing/asserts.ts";
import Observe from "./Observe.ts";

Deno.test("Initial value populated", (): void => {
  let val = new Observe("initial value");
  assertEquals(val.getValue(), "initial value");
});

Deno.test("Value change is reflected", (): void => {
  let val = new Observe("initial value");
  val.setValue("new value");
  assertEquals(val.getValue(), "new value");
});

Deno.test("History is populated", (): void => {
  let val = new Observe("initial value");
  val.setValue("new value");
  assertEquals(val.getHistory().length, 2);
});

Deno.test("Callback is invoked (binding)", (): void => {
  let val = new Observe("initial value");
  val.bind((data) => {
    assertEquals(data, "new value");
  });
  val.setValue("new value");
});

Deno.test("Unbind removes listener", (): void => {
  let val = new Observe("initial value");
  let temp = "init";
  let func = val.bind(() => temp = "changed!!"); // attempt to change the temp variable
  val.unBind(func); // removing the listener.. func variable should not trigger
  val.setValue("new value");
  assertEquals(temp, "init");
});

Deno.test("Stopping prevents continue", (): void => {
  let val = new Observe("initial value");
  let temp = "init";
  val.bind(() => val.stop()); // halt the observer
  val.bind(() => temp = "changed!!"); // should not get here (see above)

  val.setValue("new value");
  assertEquals(temp, "init");
});

Deno.test("Type is reflected", (): void => {
    let val = new Observe(2);
    val.bind((data)=>{
        assertEquals(typeof data, "number")
    })
  
    val.setValue(10);
  });
