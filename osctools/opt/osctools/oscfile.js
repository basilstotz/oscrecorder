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

function help(){
    console.log(`
usage:   oscfile [options] filename
       
options: --help,-h                : show this message
         --speed,-s <speed>       : replay speed (default: 1.0)

         Read osc-messages from <filename> and dump them, using the relative time 
         information, to stdout.`);
}

let file='';
let speed=1.0;

const Args = process.argv.slice(2);
if(Args[0]){
    for(let i=0;i<Args.length;i++){
	switch(Args[i]){
	case '--speed':
	case '-s':
	    speed=1.0/Args[++i];
	    break;
	case '-h':
	case '--help':
	    help();
	    process.exit();
	    break;
	default:
	    file=Args[i];
	    break;
	}
    }
}else{
    help();
    process.exit();
}

const lineByLine = require('n-readlines');
const liner = new lineByLine(file);
let line;

let bundle={ time: -1 };


/*
{"time":39,"message":{"offset":24,"address":"/beamer/4/video","types":",i","args":[32]}}
*/


function play(){
    if(bundle.time>=0){
	process.stdout.write(JSON.stringify(bundle.message)+'\n');
    }
    if(line = liner.next()){
        bundle=JSON.parse(line.toString('ascii'));
	setTimeout(play,Math.round( speed*bundle.time + 0.5 ));
    }
}

play();    
