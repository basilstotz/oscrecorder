#!/usr/bin/env node

//https://github.com/adzialocha/osc-js

const OSC = require('osc-js');
const readline = require('readline');
const Utils = require('./common.js');

let name;


function help(){
    console.log(`
  usage: oscrecord2 [options] port [filename]

options: --help,-h : show this message

         Reads osc messages on stdin and copy them to stdout.

         The messages are appended to <filename>.
         as an OSC bundle, using the current time as timetag.

         This file can be replayed with the same timing with oscplay2.`);
}


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
	    if(!name){
		name=Args[i];
	    }else{
		help();
		process.exit(1);
	    }
            break;
        }
    }
}else{
    help();
    process.exit();
}

if(!name){
    help();
    process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

rl.on('line', (line) => {
    //let message=JSON.parse(line);
    process.stdout.write(line+'\n');
    Utils.append(name,line+'\n');
});

rl.once('close', () => {
    process.exit();
});
