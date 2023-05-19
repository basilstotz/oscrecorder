#!/usr/bin/env node

const lineByLine = require('n-readlines');
const Utils = require('./common.js');


function help(){
    console.log(`
usage:   oscplay [options] filename
       
options: --help,-h                   : show this message
         --speed,-s <speed>          : set replay speed to <speed> (default: 1.0)
         --timeOffset,t <timeOffset> : set timeOffset to <timeOffset> ms.
                                       default is measured file readtime
 
         Read osc-bundles from <filename> and dump them, using the relative time 
         information, to stdout as osc messages.`);
}

let file='';
let speed=1.0;
let timeOffset;
let loop=false;

const Args = process.argv.slice(2);
for(let i=0;i<Args.length;i++){
    switch(Args[i]){
     case '--timeoffset':
     case '-t':	
	timeOffset=Math.round(Args[++i]);
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
     case '-l':
     case '--loop':
	loop=true;
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
    if(!Utils.exists(file)){
	console.log("error: could not find "+file);
	process.exit(1);
    }
}

const liner = new lineByLine(file);
let line;

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

function  out(item){
    if(loop)setTimeout( out, Math.round(speed*duration), item);
    process.stdout.write(JSON.stringify(item.bundle)+'\n')
}

let minTime=99999999999999999999;
let maxTime=0;
let duration;

let bundles=[];

let start=new Date().getTime();

while(line = liner.next()){
    bundle=JSON.parse(line.toString('ascii'));
    let time=getTime(bundle);
    if(bundle.offset)delete bundle.offset;
    if(bundle.bundleElements) delete bundle.bundleElements[0].offset;
    if(time<minTime)minTime=time;
    if(time>maxTime)maxTime=time;
    bundles.push( { time: time, bundle: bundle } );
}
duration=maxTime-minTime;

bundles.forEach( (item) => {
    item.elapsed=item.time-minTime;
});



if(!timeOffset)timeOffset=new Date().getTime()-start;

bundles.forEach( (item) => {
    let sceduled=Math.round(speed*item.elapsed)+timeOffset;
    setTimeout( out, sceduled, item );
});

