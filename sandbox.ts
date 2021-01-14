import Observe from "./Observe.ts";

let obs = new Observe("initial value", "123");

obs.bind((x)=>{
  console.log(x);
})

obs.setValue("test");


var t = Observe.getGlobalObservable<string>("123")


t.setValue("jsjsjsjdsjfhwjdhjn")
