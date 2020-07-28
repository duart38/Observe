import Observe from "../Observe.ts";

let obs = new Observe("initial value");

obs.bind((data) => {
  console.log("update received");
  console.log(data);
});

obs.setValue("another value");
