#!/usr/bin/env node

//https://github.com/adzialocha/osc-js

let port;
let name="";

let last=-1;

const Args = process.argv.slice(2);
if(Args[0]){
    port=Args[0];
}else{
    console.log("usage: oscreceive port [filename]");
    process.exit();
}
if(Args[1]){
    name=Args[1];
}
    
const fs = require('fs');
function write(name,data){
    fs.writeFileSync(name,data,{encoding:'utf8', flag:'a'});
}

//########################################################

const OSC = require('osc-js');
const options = { open: { host: '0.0.0.0', port: port }};
const osc = new OSC({ plugin: new OSC.DatagramPlugin(options) });

osc.open();

osc.on('*', message => {
    process.stdout.write(JSON.stringify(message)+'\n');
    if(name.length>0){record(message);}
});


function  record(message){

    let diff,now,bundle;

    now = new Date().getTime();
    if(last>0){
        diff = now - last;
    }else{
        diff = 0
    }
    last = now;

    bundle= { clock: now, time: diff, message: message };
    write(name,JSON.stringify(bundle)+'\n');

};


