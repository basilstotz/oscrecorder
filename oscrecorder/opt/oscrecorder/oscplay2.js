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
usage:   oscplay [options] filename
       
options: --help,-h                : show this message
         --speed,-s <speed>       : set replay speed to <speed> (default: 1.0)
         --maxskip,-m  <time>     : retime when skip is less then -1 sec or more then <time> sec  

         Read osc-bundles from <filename> and dump them, using the relative time 
         information, to stdout as osc messages.`);
}

let file='';
let speed=1.0;
let maxSkip;

const Args = process.argv.slice(2);
for(let i=0;i<Args.length;i++){
    switch(Args[i]){
     case '--maxskip':
     case '-m':	
	maxskip=Math.round(1000*Args[++i]);
	break;
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
 	 if(!file){
	    file=Args[i];
	 }else{
	    help();
	    process.exit(1);
	 }
	 break;
     }
}


if(file.length==0){
    help();
    process.exit();
}else{
    if(!fs.existsSync(file)){
	console.log("error: could not find "+file);
	process.exit(1);
    }
}

const lineByLine = require('n-readlines');
const liner = new lineByLine(file);
let line;

let waitTime;
let firstTime;
let startTime;

/*
{"offset":0,"timetag":{"value":{"seconds":3892649641,"fractions":38654976},"offset":0},"bundleElements":[{"offset":36,"address":"/uhu","types":",i","args":[43]}]}
*/

function getTime(bundle){
    const SECONDS_70_YEARS = 2208988800;
    const TWO_POWER_32 = 4294967296;
    
    if(bundle.timetag.value)bundle.timetag=bundle.timetag.value;

    let timetag=bundle.timetag;
    let seconds = timetag.seconds - SECONDS_70_YEARS;
    return (seconds + Math.round(timetag.fractions / TWO_POWER_32)) * 1000;
}
    

function play(){
    if(waitTime){
	bundle.bundleElements.forEach( (message) => {
	    if(!message.timetag){
		process.stdout.write(JSON.stringify(message)+'\n');
	    }
	});
    }
    
    if(line = liner.next()){
        bundle=JSON.parse(line.toString('ascii'));

	let bundleTime=getTime(bundle);
        //let bundleTime=bundle.timestamp();
	
	if(!firstTime){
	    firstTime=bundleTime;
	    startTime= new Date().getTime();
	}
	
	let elapsed=Math.round(speed*(bundleTime-firstTime));
	let sendTime=startTime+elapsed;	
	waitTime=sendTime-new Date().getTime();
	
	if(maxSkip){
	    if( (waitTime>maxSkip) || (waitTime<100) ){
		firstTime=false;
		waitTime=1000;
	    }
	}
	if(waitTime<1)waitTime=1;
	
	setTimeout(play,waitTime);
    }
}

play();    
