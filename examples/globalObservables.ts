import Observe from "../Observe.ts";

let obs = new Observe("initial value", "123", true);

obs.bind((x)=>{
  console.log(x);
})


let fromWindow = Observe.getGlobalObservable("123");

fromWindow.setValue("Another file");