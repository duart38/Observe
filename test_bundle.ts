import {
  assertEquals,
} from "https://deno.land/std/testing/asserts.ts";
import Observe from "./Observe.bundle.js";
export function testBundled() {
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
    val.bind((data: unknown) => {
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
    val.bind((data: any) => {
      assertEquals(typeof data, "number");
    });

    val.setValue(10);
  });

  Deno.test("Same value does nothing", (): void => {
    let val = new Observe(100);
    let temp = 100;
    val.bind((data: any) => temp = data); // should not be called

    val.setValue(100);
    assertEquals(temp, 100);
  });

  Deno.test("History is limited on large change count", (): void => {
    let val = new Observe("init");
    val.maxHistorySize = 4;
    val.setValue("SHOULD_BE_REMOVED");
    for (let i = 0; i < val.maxHistorySize + 1; i++) {
      val.setValue(
        `str ${val.setValue(((Math.random() * 10) + 1).toString())}`,
      );
    }
    assertEquals(val.getHistory().includes("SHOULD_BE_REMOVED"), false);
  });

  Deno.test("Reset restores the original value", (): void => {
    let val = new Observe("init");
    val.maxHistorySize = 4;
    val.setValue("lorem");
    val.setValue("ipsum");
    val.setValue("some stuff");
    val.reset();
    assertEquals(val.getValue(), "init");
  });

  Deno.test("Nesting observables should un-sub in case setValue is called", (): void => {
    let nested = new Observe(100);
    let obs = new Observe(nested);
    let temp = 0;

    obs.bind((data: any) => {
      temp = data.getValue();
    });

    let new_nest = new Observe(1);

    obs.setValue(new_nest); // should UNBIND the prev value here (nested should be unbound)
    nested.setValue(98); // should not be reached (unbound)
    new_nest.setValue(200); // reached

    assertEquals(temp, 200);
  });

  Deno.test("setValue returns the value that was set", (): void => {
    let val = new Observe("init");
    val.maxHistorySize = 2;
    assertEquals(val.setValue("lorem"), "lorem");
  });
  Deno.test("setValue emits all var-args", (): void => {
    let val = new Observe("init");
    let saw: string[] = [];
    val.bind((str: any) => {
      saw.push(str);
    });
    val.setValue("lorem", "ipsum", "dolor");
    assertEquals(saw, ["lorem", "ipsum", "dolor"]);
  });
  Deno.test("Reset returns the instance", (): void => {
    let val = new Observe("init");
    val.setValue("lorem");
    assertEquals(val.reset(), val);
  });
  Deno.test("Stop returns the instance", (): void => {
    let val = new Observe("init");
    val.setValue("lorem");
    assertEquals(val.stop(), val);
  });
  console.log("\n[+] -- DONE: Testing Bundled version -- \n");
}
