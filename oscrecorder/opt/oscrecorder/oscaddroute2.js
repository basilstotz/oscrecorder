#!/usr/bin/env node


//https://github.com/adzialocha/osc-js                                                                                                      
const OSC = require('osc-js');

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
usage: oscaddroute [options] /route1:port1 [[ /route2:port2 ] ... ]

options: --help,-h    : displays this help message
         --verbose,-v : prints diagnostics

         Listen for osc messages on all given ports, adds the proper /route to the 
         address of the message and writes the message to stdout.
       
         The options are always saved in ~/.oscaddroute.json and are applied, when 
         oscaddroute is called without arguments. It is possible to directly 
         edit ~/.oscaddroute.json .

         The /route can be empty. Use  :port , when no route sould be added.`);
}

let table=[];
let verbose=false;


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
      default:
	let item=Args[i].split(':');
	let port=item[1];
	let route=item[0];
	table.push( {  port: port , route: route } );
	break;
    }    
}

const path=process.env.HOME+'/.oscaddroute.json';
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

function addroute(message,route){
    let response= new OSC.Message(route+message.address);
    message.args.forEach( (arg) => { response.add(arg); })
    process.stdout.write(JSON.stringify(response)+'\n');
}

table.forEach( (item) => {
    item.osc = new OSC({ plugin: new OSC.DatagramPlugin() });
    item.osc.open( { host: '0.0.0.0', port: item.port });
    item.osc.on('open', () => {
	item.osc.on('*', (message) => {
	    addroute(message,item.route);
	})
    })
});
