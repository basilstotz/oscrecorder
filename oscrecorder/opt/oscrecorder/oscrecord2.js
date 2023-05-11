#!/usr/bin/env node

//https://github.com/adzialocha/osc-js

const OSC = require('osc-js');
const readline = require('readline');
const fs = require('fs');

let name;

function append(name,data){
    fs.writeFileSync(name,data,{encoding:'utf8', flag:'a'});
}

function help(){
    console.log(`
usage:   oscrecord [options] port [filename]

options: --help,-h : show this message

         Listen at <port> for osc-messages and dump them to stdout.

         When <filename> is given the messages appended to <filename>.
         as an OSC-bundle, using the current time as timetag.

         This file can be replayed with the same timing with oscplay.`);
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

function record(message){
    process.stdout.write(JSON.stringify(message)+'\n');
    if(name){
	let response = new OSC.Message(message.address);
	message.args.forEach( (arg) => { response.add(arg) });
	append(name,JSON.stringify(new OSC.Bundle(response))+'\n');
    }
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

rl.on('line', (line) => {
    record(JSON.parse(line));
});

rl.once('close', () => {
    process.exit();
});