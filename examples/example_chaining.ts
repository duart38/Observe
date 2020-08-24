import Observe from "../Observe.ts";

let obs = new Observe(1);

obs.bind((data) => {
  console.log("update received");
  console.log(data);
});

obs.setValue(1);
obs.setValue(
    obs.setValue(
        obs.reset().setValue(1,2,3,4,5,6) + 100
    ) + 200
)


