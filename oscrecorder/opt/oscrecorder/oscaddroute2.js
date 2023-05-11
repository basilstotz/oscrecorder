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
usage: orcroute [options] /route1@path1 host1:port1 [[ /route2@path2 host2:port2 ] ... ]

options: --help,-h    : displays this help message
         --verbose,-v : prints diagnostics

         Reads osc-messages form stdin and sends the messages matching /route/path, 
         discarding the /route part, to host:port.
       
         The options are always saved in ~/.oscroute.json and are applied, when oscroute
         is called without arguments. It is possible to directly edit ~/.oscroute.json .

         The /route part or the @path part can be empty. Use a single / for a catch all 
         route.`);
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
