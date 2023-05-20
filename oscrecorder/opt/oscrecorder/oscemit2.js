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


const utils = require('./common.js');

//console.log(JSON.stringify(common));

function help(){
    console.log(`
usage: orcroute [options] /route1@path1 host1:port1 [[ /route2@path2 host2:port2 ] ... ]

options: --help,-h                    : displays this help message
         --verbose,-v                 : prints diagnostics
         --timeoffset,-t <timeoffset> : scedules osc-bundles <timeoffset> ms it the future [defalult=100]
         --messages,-m                : emit osc-messages not osc-bundles

         Reads osc messages form stdin and sends the messages matching /route/path, 
         discarding the /route part, to host:port.
       
         The options are always saved in ~/.oscroute.json and are applied, when oscroute
         is called without arguments. It is possible to directly edit ~/.oscroute.json .

         The /route part or the @path part can be empty. Use a single / for a catch all 
         route.`);
}

let table=[];
const path=process.env.HOME+'/.oscroute.json';

let verbose=false;
let timeOffset=100;
let sendMessages=false;

const Args = process.argv.slice(2);
for(i=0;i<Args.length;i++){
    switch(Args[i]){
      case '-h':
      case '--help':
 	 help();
	 process.exit();
	 break;
      case '-v':
      case '--verbose':
	 verbose=true;
	 break;
      case '-m':
      case '--messages':
	 sendMessages=true;
	 break;
      case '-t':
      case '--timeOffset':
	timeOffset=Math.round(Args[++i]); 
	 break;
    default:
	if(Args[i].startsWith('/')||Args[i].startsWith('@')){
	    let route=Args[i].split('@');
	    if((route[0]!='/')&&(route[0].endsWith('/')))route[0]=route[0].substr(0,route[0].length-1);
	    if(!route[1]){route[1]='';}else{route[1]='/'+route[1];}
	    i++;
	    let dest=Args[i].split(":");
	    let host=dest[0];
	    let port=dest[1]

	    table.push( { route: route[0], path: route[1], host: host, port: port  } );
	}else{
	    help();
	    process.exit(1);
	}
	break;
    }
}

if(table[0]){
    write(path,JSON.stringify(table,null,2));    
}else{
    if(fs.existsSync(path)){
	table=JSON.parse(read(path));
    }else{
	help();
	process.exit(1);
    }    
}
if(verbose)console.log(JSON.stringify(table,null,2));



const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

function out(table, message, timestamp){
    table.find( (item) => {
	if(message.address.indexOf(item.route+item.path)==0){

	    let response = new OSC.Message(message.address.substring(item.route.length));
	    message.args.forEach((arg)=>{response.add(arg)});
	    
	    if(sendMessages){
		osc.send(response,{ host: item.host, port: item.port });
	    }else{
		let bundle = new OSC.Bundle(timestamp);
		bundle.add(response);
		osc.send(bundle,{ host: item.host, port: item.port });
	    }
	    
	    if(verbose){
		delete bundle.offset;
		if(bundle.timetag){
		    delete bundle.bundleElements[0].offset;
	            bundle.timetag=bundle.timetag.value;
		}
		console.log(JSON.stringify(bundle)+" --> "+item.host+":"+item.port);
	    }
	    return true;
	}
	return false;	
    });
}

rl.on('line', (line) => {
    utils.forEachMessage(JSON.parse(line), (message,timestamp) => {
	out(table, message, timestamp+timeOffset);
    });
});

rl.once('close', () => {
    process.exit();
 });

