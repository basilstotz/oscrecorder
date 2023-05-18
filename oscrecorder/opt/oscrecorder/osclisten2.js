#!/usr/bin/env node


//https://github.com/adzialocha/osc-js

const dgram = require('dgram');


const OSC = require('osc-js');


const fs = require('fs');
const { execSync } = require('child_process');

const common = require('./common.js');

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

function dataView(obj) {
  if (obj.buffer) {
    return new DataView(obj.buffer)
  } else if (obj instanceof ArrayBuffer) {
    return new DataView(obj)
  }
  return new DataView(new Uint8Array(obj))
}

const Utils = require('./common.js');

// utility functions

function help(){
    console.log(`
usage: osclisten [options] port1[:/route1] [[ port2[:/route2] ] ... ]

options: --help,-h     : displays this help message
         --verbose,-v  : prints diagnostics
         --delay,-d    : do delay bundles

         Listen for osc messages on all given ports, adds the proper /route to the 
         address of the message and writes the message to stdout.
       
         The options are always saved in ~/.osclisten.json and are applied, when 
         oscaddroute is called without arguments. It is possible to directly 
         edit ~/.osclisten.json .`);
}

let table=[];

let verbose=false;
let port;
let route;
let delay=false;

const Args = process.argv.slice(2);
for(i=0;i<Args.length;i++){
    let arg=Args[i];
    switch(arg){
      case '-h':
      case '--help':
 	help();
	process.exit();
	break;
      case '-v':
      case '--verbose':
	verbose=true;
	break;
      case '-d':
      case '--dispatch':
	dispatch=true;
	break;
    default:
	//console.log(arg.indexOf(':'));
	if(arg.indexOf(':')!=-1){
	    let item=arg.split(':');
	    port=item[0];
	    route=item[1];

	}else{
	    port=arg;
	    route='';
	}
	if(route.endsWith('/')){route=route.substring(0,route.length-1)};
	table.push( {  port: port , route: route } );
	break;
    }    
}

const path=process.env.HOME+'/.osclisten.json';
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


/* table example

[
  { "port": "8008", "route": "/ardour" },
  { "port": "8009", "route": "/jadeo" }
]

*/

function out(route, message,timestamp){
    // make bundle
    let bundle = new OSC.Bundle(timestamp);
    bundle.add(message);
    // add route
    bundle.bundleElements[0].address = route + bundle.bundleElements[0].address;
    // beautify
    delete bundle.bundleElements[0].offset;
    delete bundle.offset;
    bundle.timetag=bundle.timetag.value;
    // write
    process.stdout.write(JSON.stringify(bundle)+'\n');
}

if(false){
   table.forEach( (item) => {
       item.osc = new OSC({ plugin: new OSC.DatagramPlugin() });
       item.osc.on('open', () => {
	   item.osc.on('*', (message) => {
	       out(item.route, message,new Date().getTime());
	   })
       })
       item.osc.open( { host: '0.0.0.0', port: item.port });
   });
}else{
   table.forEach( (item) => {
       item.socket=dgram.createSocket('udp4');
       item.socket.on('message', data => {
	   var bundle = new OSC.Bundle();

	   if(data.toString().startsWith('#bundle')){
	       bundle.unpack(dataView(data));
	   }else{
	       const msg= new OSC.Message();
	       msg.unpack(dataView(data));
	       bundle.add(msg);
	       //console.log(JSON.stringify(bundle));
	   }
	   Utils.forEachMessage(bundle, (message, timestamp) => {
	       out(item.route, message, timestamp)
	   });
       })
       item.socket.bind(item.port);
   });
}
