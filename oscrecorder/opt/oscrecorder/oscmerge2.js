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
         information, to stdout.`);
}

let files=[];

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
	files.push( Args[i] );
	 break;
     }
}


if(files.length==0){
    help();
    process.exit();
}else{
    files.forEach( (file) => {
	if(!Utils.exists(file)){
	    console.log("error: could not find "+file);
	    process.exit(1);
	}
    })
}

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

function showInfo(){
    console.log('---------------------------------------------------------');
    console.log('|     File: '+files[0]);
    console.log('---------------------------------------------------------');
    console.log('|    Start: '+new Date(globalMinTime).toString());
    console.log('|     Ende: '+new Date(globalMaxTime).toString());
    console.log('|    Länge: '+laenge(globalMaxTime-globalMinTime));
    console.log('| Messages: '+all.length);
    console.log('---------------------------------------------------------');
    process.exit();
}


function  out(item){
    if(loop)setTimeout( out, Math.round(speed*duration), item);
    Utils.bundleTimestamp(bundle,new Date().getTime());    
    process.stdout.write(JSON.stringify(item.bundle)+'\n')
}

let all=[];

let globalMinTime=9999999999999999999999999;
let globalMaxTime=-9999999999999999999999999;
let lastMaxTime=new Date().getTime();



let start=new Date().getTime();

files.forEach( (file) => {
    let liner = new lineByLine(file);

    let minTime=9999999999999999999999999;
    let maxTime=-9999999999999999999999999;
    let bundles=[];

    while(line = liner.next()){
	bundle=JSON.parse(line.toString('ascii'));

	let timestamp=Utils.bundleTimestamp(bundle);
	
	if(timestamp<minTime)minTime=timestamp;
	if(timestamp>maxTime)maxTime=timestamp;
    
	bundles.push( { time: timestamp, bundle: bundle } );
    }
    bundles.forEach( (item) => {
	item.elapsed=item.timestamp-minTime;
	let timestamp=lastMaxTime + item.elapsed;

	if(timestamp<globalMinTime)globalMinTime=timestamp;
	if(timestamp>globalMaxTime)globalMaxTime=timestamp;

	Utils.bundleTimestamp(item.bundle,timestamp);
	all.push(item);
    });
    let duration = maxTime-minTime;

    lastMaxTime+=duration;
});

duration=globalMaxTime-globalMinTime;

if(info)showInfo();


all.forEach( (item) => {
    process.stdout.write(Utils.serializePacket(item.bundle)+'\n');
});
