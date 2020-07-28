import Observe from "../Observe.ts";

let obs = new Observe<number>(100);

obs.bind((data: number) => {
  console.log(`updated with: ${data}`);
});

obs.setValue(100);
obs.setValue(50);
