import Observe from "../Observe.ts";

let nested = new Observe(100);
let obs = new Observe(nested);

obs.bind((data) => {
  console.log("update received");
  console.log(data);
});

let temp = new Observe(1);

nested.setValue(10);
obs.setValue(temp); // should UNBIND the prev value here (nested should be unbound)
nested.setValue(98); // should not be reached (unbound)
nested.setValue(99); // should not be reached (unbound)
temp.setValue(2); // reached
temp.setValue(20); // reached
temp.setValue(200); // reached
