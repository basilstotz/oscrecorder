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

function end(){
    console.log("usage: oscroute /pfad port [/pfad2 port2]...[/pfadn portn]  ip1 [ip2 ... ipn]");
    process.exit();
}

//const lineByLine = require('n-readlines');

let table=[];

const Args = process.argv.slice(2);

const path=process.env.HOME+'/.oscroute.rc';
//console.log(path);


if(Args[1]){
    for(i=0;i<Args.length;i++){
//	if(Args[i].startsWith('/')){

	    let route=Args[i].split('@');
	    
//            if(!route[0]){route[0]='';}
	    if((route[0]!='/')&&(route[0].endsWith('/')))route[0]=route[0].substr(0,route[0].length-1);

	    if(!route[1]){route[1]='';}else{route[1]='/'+route[1];}

	    i++;
	    let dest=Args[i].split(":");
	    let host=dest[0];
	    let port=dest[1]

	    table.push( { route: route[0], path: route[1], host: host, port: port  } )
//	}
    }
    write(path,JSON.stringify(table,null,2));    
}else{
    if(fs.existsSync(path)){
	table=JSON.parse(read(path));
    }else{
	process.exit(1);
    }    
}


console.log(JSON.stringify(table,null,2));

/*
{"clock":1682961843314,"time":3405,"message":{"offset":32,"address":"/beamer/2/video","types":",is","args":[25,"sdfsdaf"]}}

*/

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})


rl.on('line', (line) => {
    route(table,JSON.parse(line));
});

rl.once('close', () => {
    process.exit();
 });


function route(table,message){ 
    table.find((item) => { 
	if(message.address.indexOf(item.route+item.path)==0){
	    let response = new OSC.Message(message.address.substring(item.route.length));
            message.args.forEach((arg)=>{response.add(arg)});
	    osc.send(response,{ host: item.host, port: item.port })
	    console.log(JSON.stringify(response)+" --> "+item.host+":"+item.port);	
	    return true;
	}
	return false;
    });
}
