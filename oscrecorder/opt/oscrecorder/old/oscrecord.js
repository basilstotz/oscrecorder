#!/usr/bin/env node

//https://github.com/adzialocha/osc-js


let port;
let name="";
const Args = process.argv.slice(2);
if(Args[0]){
    for(let i=0;i<Args.length;i++){
        switch(Args[i]){
        case '-h':
        case '--help':
            help();
            process.exit();
            break;
        default:
            if(!port){
		port=Args[i];
	    }else{
		name=Args[i];
	    }
            break;
        }
    }
}else{
    help();
    process.exit();
}


    
const fs = require('fs');
function write(name,data){
    fs.writeFileSync(name,data,{encoding:'utf8', flag:'a'});
}

function help(){
    console.log(`
usage:   oscrecord [options] port [filename]

options: --help,-h : show this message

         Listen at <port> for osc-messages and dump them to stdout.

         When <filename> is given the messages, augmented with ablolute 
         and relative time information, are appended to <filename>.
       
         This file can be replayed with the same timing witch oscfile.`);
}


//########################################################

const OSC = require('osc-js');
const options = { open: { host: '0.0.0.0', port: port }};
const osc = new OSC({ plugin: new OSC.DatagramPlugin(options) });

let last=-1;

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


