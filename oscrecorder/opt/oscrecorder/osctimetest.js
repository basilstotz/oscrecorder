#!/usr/bin/env node


//https://github.com/adzialocha/osc-js                                                                                                      
const OSC = require('osc-js');
const osc = new OSC({ plugin: new OSC.DatagramPlugin() });



let m= new OSC.Message("/uhu", 1000);
let b= new OSC.Bundle([m],new Date().getTime()+1000);

//let t= new OSC.Timetag(new Date().getTime());



console.log(JSON.stringify(b));

let t=b.timetag;
console.log(JSON.stringify(t));
timestamp=t.timestamp();
console.log(timestamp);

