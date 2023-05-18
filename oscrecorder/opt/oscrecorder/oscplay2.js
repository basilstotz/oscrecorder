#!/usr/bin/env node

const lineByLine = require('n-readlines');

function help(){
    console.log(`
usage:   oscplay [options] filename
       
options: --help,-h                : show this message
         --speed,-s <speed>       : set replay speed to <speed> (default: 1.0)

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

let timeOffset=1000;
let minTime=99999999999999999999;
let bundles=[];

//console.log(new Date().getTime());
while(line = liner.next()){
    bundle=JSON.parse(line.toString('ascii'));
    let time=getTime(bundle);
    if(time<minTime)minTime=time;
    bundles.push( { time: time, bundle: bundle } );
}
//console.log(new Date().getTime());
bundles.forEach( (item) => {
    let elapsed=Math.round(speed*(item.time-minTime))+timeOffset;
    setTimeout( (bundle) => { process.stdout.write(JSON.stringify(bundle)+'\n')} ,elapsed,item.bundle);
});
//console.log(new Date().getTime());
