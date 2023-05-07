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


const lineByLine = require('n-readlines');

//const config=JSON.parse(read('replay-conf.json'));
//const file=config.file;
//const hosts=config.hosts;
//const port=config.port;

const Args = process.argv.slice(2);
if(Args[0]){
    file=Args[0];
}else{
    console.log("usage: oscreplay filename");
    process.exit();
}


const liner = new lineByLine(file);
let line;

let bundle={ time: -1 };


/*
{"time":39,"message":{"offset":24,"address":"/beamer/4/video","types":",i","args":[32]}}
{"time":41,"message":{"offset":24,"address":"/beamer/3/video","types":",i","args":[13]}}
{"time":2424,"message":{"offset":24,"address":"/beamer/1/video","types":",i","args":[41]}}
{"time":1575,"message":{"offset":24,"address":"/beamer/4/video","types":",i","args":[32]}}
{"time":1050,"message":{"offset":24,"address":"/beamer/1/video","types":",i","args":[43]}}
{"time":1750,"message":{"offset":24,"address":"/beamer/2/video","types":",i","args":[21]}}
*/


function play(){

    if(bundle.time>=0){
	process.stdout.write(JSON.stringify(bundle.message)+'\n');
    }
    
    if(line = liner.next()){
        bundle=JSON.parse(line.toString('ascii'));
	setTimeout(play,bundle.time);
    }else{
	//console.log('end of file reached');
    }
}

play();    
