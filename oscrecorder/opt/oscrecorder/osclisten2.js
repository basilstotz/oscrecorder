#!/usr/bin/env node


//https://github.com/adzialocha/osc-js

const dgram = require('dgram');
const OSC = require('osc-js');
const Utils = require('./common.js');


function dataView(obj) {
  if (obj.buffer) {
    return new DataView(obj.buffer)
  } else if (obj instanceof ArrayBuffer) {
    return new DataView(obj)
  }
  return new DataView(new Uint8Array(obj))
}



function help(){
    console.log(`
usage: osclisten [options] port1[:/route1] [[ port2[:/route2] ] ... ]

options: --help,-h     : displays this help message
         --verbose,-v  : prints diagnostics
         --nodelay,-n    : do not delay bundles, pass them tru

         Listen for messages or arbitraly nested bundles on all given ports 
         and writes all found messages as bundles to stdout.

         When a </route> is given, </route/> is prependend to each message.
 
         When a message is received, the current time will be used as timetag.

         As default bundles are delayed, when the timetag lyes in the future,
         but when the option --nodelay is given the output is instantly.

         The options are always saved in ~/.osclisten.json and are applied, when 
         oscaddroute is called without arguments. It is possible to directly 
         edit ~/.osclisten.json .`);
}

let table=[];

let verbose=false;
let port;
let route;
let delay=true;

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
      case '-n':
      case '--nodelay':
	delay=false;
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
    Utils.write(path,JSON.stringify(table,null,2));    
}else{
    if(Utils.exists(path)){
	table=JSON.parse(Utils.read(path));
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
    // write
    let res=Utils.serializePacket(bundle);
    process.stdout.write(res+'\n');
}

if(delay){
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
	   }
	   Utils.forEachMessage(bundle, (message, timestamp) => {
	       out(item.route, message, timestamp)
	   });
       })
       item.socket.bind(item.port);
   });
}
