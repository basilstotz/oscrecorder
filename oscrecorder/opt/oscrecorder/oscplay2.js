#!/usr/bin/env node

const lineByLine = require('n-readlines');
const Utils = require('./common.js');


function help(){
    console.log(`
usage:   oscplay [options] filename
       
options: --help,-h                   : show this message
         --info,-i                   : prints info of <filename> and exits 
         --speed,-s <speed>          : set replay speed to <speed> (default: 1.0)
         --loop,-l                   : loop forever 

         Read osc-bundles from <filename> and dump them, using the relative time 
         information, to stdout as osc messages.`);
}

let file='';
let speed=1.0;
let timeOffset;
let loop=false;
let info=false;

const Args = process.argv.slice(2);
for(let i=0;i<Args.length;i++){
    switch(Args[i]){
     case '-h':
     case '--help':
	 help();
	 process.exit();
	 break;
     case '--speed':
     case '-s':
	 speed=1.0/Args[++i];
	 break;
     case '-l':
     case '--loop':
	loop=true;
	 break;
     case '-i':
     case '--info':
	info=true;
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

function laenge(duration){
    let r;
    let h=Math.floor(duration/3600000);
    r=duration-h*3600000;
    let m=Math.floor(r/60000);
    r=r-m*60000;
    let s=Math.floor(r/1000);
    r=r-s*1000;
    return h+'h '+m+'m '+s+'.'+r+'s';
}

function  out(item){
    let timetag;
    if(loop)setTimeout( out, Math.round(speed*duration), item);
    if(item.bundle.timetag.value){
	timetag=item.bundle.timetag.value;
    }else{
	timetag=item.bundle.timetag;
    }
    Utils.timestamp(timetag,new Date().getTime());
    process.stdout.write(JSON.stringify(item.bundle)+'\n')
}

let minTime=99999999999999999999;
let maxTime=0;
let duration;

let bundles=[];

let start=new Date().getTime();

while(line = liner.next()){
    bundle=JSON.parse(line.toString('ascii'));
    let timetag;
    if(bundle.timetag.value){
	timetag=bundle.timetag.value;
    }else{
	timetag=bundle.timetag;
    }
    let timestamp=Utils.timestamp(timetag);
    if(timestamp<minTime)minTime=timestamp;
    if(timestamp>maxTime)maxTime=timestamp;
    bundles.push( { time: timestamp, bundle: bundle } );
}
duration=maxTime-minTime;

if(info){
    console.log('---------------------------------------------------------');
    console.log('|     File: '+file);
    console.log('---------------------------------------------------------');
    console.log('|    Start: '+new Date(minTime).toString());
    console.log('|     Ende: '+new Date(maxTime).toString());
    console.log('|    Länge: '+laenge(duration));
    console.log('| Messages: '+bundles.length);
    console.log('---------------------------------------------------------\n');
    process.exit();
}

if(!timeOffset)timeOffset=new Date().getTime()-start;

bundles.forEach( (item) => {
    item.elapsed=item.time-minTime;
    let sceduled=Math.round(speed*item.elapsed)+timeOffset;
    setTimeout( out, sceduled, item );
});
