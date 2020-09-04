import Observe from "./Observe.ts";

let obs = new Observe("initial value");

function test(d: any) {
  console.log("hello " + d);
}

let first = obs.bind(test);
let second = obs.bind((x)=>console.log("----------"))
obs.unBind(first);

obs.setValue("test");
