#!/usr/bin/env node


//https://github.com/adzialocha/osc-js                                                                                                      
const OSC = require('osc-js');
const osc = new OSC({ plugin: new OSC.DatagramPlugin() });

const fs = require('fs');
const { execSync } = require('child_process');

// utilty functions
function read(name){
    return fs.readFileSync(name,{encoding:'utf8', flag:'r'});
}

function write(name,data){
    fs.writeFileSync(name,data,{encoding:'utf8', flag:'w'});
}

function shell(command){
    //console.log(args);
    let opts= { encoding: 'utf8' };
    return execSync(command,[], opts);
}
// utility functions

console.log(new Date());

let m1= new OSC.Message("/gaga", 0);
let m2= new OSC.Message("/uhu", 1000);
let m3= new OSC.Message("/gaga", 5000);

let b1= new OSC.Bundle([m2],new Date().getTime()+1000);
//b1.add(m1);
//b1.add(m2);

let b2= new OSC.Bundle([m3], new Date().getTime()+5000);
//b2.add(m3);

let b3=new OSC.Bundle([m1,m1,m1,m1,m1]);
//b3.add(m3);

let options={host: "localhost", port: 8008 }

console.log(JSON.stringify(b1)+'\n');
console.log(JSON.stringify(b2)+'\n');
console.log(JSON.stringify(b3)+'\n');


osc.send(b1,options );
osc.send(b2, options);
osc.send(b3, options);
